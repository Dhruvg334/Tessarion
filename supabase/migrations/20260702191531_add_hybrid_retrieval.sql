-- Hybrid retrieval functions

-- Keep extension operators and types resolvable regardless of the caller role.
-- All table references remain schema-qualified and functions run as SECURITY INVOKER.

alter table public.source_chunks
  add column if not exists search_vector tsvector
  generated always as (to_tsvector('english', content)) stored;

create index if not exists source_chunks_search_idx
  on public.source_chunks using gin (search_vector);

-- Dense match
create or replace function public.match_source_chunks_dense(
  query_embedding extensions.vector(768),
  match_workspace_id uuid,
  match_threshold double precision,
  match_count integer
)
returns table (
  id uuid,
  source_document_id uuid,
  workspace_id uuid,
  content text,
  chunk_index integer,
  token_count integer,
  section_hint text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions, pg_catalog
as $$
  select
    c.id,
    c.source_document_id,
    c.workspace_id,
    c.content,
    c.chunk_index,
    c.token_count,
    c.section_hint,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.source_chunks as c
  where c.workspace_id = match_workspace_id
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit greatest(1, least(coalesce(match_count, 10), 100));
$$;

-- Sparse match
create or replace function public.match_source_chunks_sparse(
  query_text text,
  match_workspace_id uuid,
  match_count integer
)
returns table (
  id uuid,
  source_document_id uuid,
  workspace_id uuid,
  content text,
  chunk_index integer,
  token_count integer,
  section_hint text,
  rank double precision
)
language sql
stable
security invoker
set search_path = public, extensions, pg_catalog
as $$
  select
    c.id,
    c.source_document_id,
    c.workspace_id,
    c.content,
    c.chunk_index,
    c.token_count,
    c.section_hint,
    ts_rank(c.search_vector, websearch_to_tsquery('english', query_text))::double precision as rank
  from public.source_chunks as c
  where c.workspace_id = match_workspace_id
    and nullif(btrim(query_text), '') is not null
    and c.search_vector @@ websearch_to_tsquery('english', query_text)
  order by rank desc
  limit greatest(1, least(coalesce(match_count, 10), 100));
$$;

-- Hybrid match using reciprocal-rank fusion. Candidate lists are bounded before fusion.
create or replace function public.match_source_chunks_hybrid(
  query_text text,
  query_embedding extensions.vector(768),
  match_workspace_id uuid,
  match_count integer,
  rrf_k integer default 60
)
returns table (
  id uuid,
  source_document_id uuid,
  workspace_id uuid,
  content text,
  chunk_index integer,
  token_count integer,
  section_hint text,
  dense_rank bigint,
  sparse_rank bigint,
  rrf_score double precision
)
language sql
stable
security invoker
set search_path = public, extensions, pg_catalog
as $$
  with limits as (
    select
      greatest(1, least(coalesce(match_count, 10), 100)) as result_limit,
      greatest(1, least(coalesce(match_count, 10) * 4, 400)) as candidate_limit,
      greatest(1, coalesce(rrf_k, 60)) as fusion_k
  ),
  dense as (
    select
      c.id,
      row_number() over (order by c.embedding <=> query_embedding) as rank
    from public.source_chunks as c
    cross join limits as l
    where c.workspace_id = match_workspace_id
      and c.embedding is not null
    order by c.embedding <=> query_embedding
    limit (select candidate_limit from limits)
  ),
  sparse as (
    select
      c.id,
      row_number() over (
        order by ts_rank(c.search_vector, websearch_to_tsquery('english', query_text)) desc
      ) as rank
    from public.source_chunks as c
    cross join limits as l
    where c.workspace_id = match_workspace_id
      and nullif(btrim(query_text), '') is not null
      and c.search_vector @@ websearch_to_tsquery('english', query_text)
    order by ts_rank(c.search_vector, websearch_to_tsquery('english', query_text)) desc
    limit (select candidate_limit from limits)
  ),
  combined as (
    select
      coalesce(d.id, s.id) as id,
      d.rank as dense_rank,
      s.rank as sparse_rank,
      (
        coalesce(1.0 / ((select fusion_k from limits) + d.rank), 0.0)
        + coalesce(1.0 / ((select fusion_k from limits) + s.rank), 0.0)
      )::double precision as rrf_score
    from dense as d
    full outer join sparse as s on d.id = s.id
  )
  select
    c.id,
    c.source_document_id,
    c.workspace_id,
    c.content,
    c.chunk_index,
    c.token_count,
    c.section_hint,
    cb.dense_rank,
    cb.sparse_rank,
    cb.rrf_score
  from combined as cb
  join public.source_chunks as c on c.id = cb.id
  order by cb.rrf_score desc
  limit (select result_limit from limits);
$$;

revoke all on function public.match_source_chunks_dense(extensions.vector, uuid, double precision, integer) from public;
revoke all on function public.match_source_chunks_sparse(text, uuid, integer) from public;
revoke all on function public.match_source_chunks_hybrid(text, extensions.vector, uuid, integer, integer) from public;

grant execute on function public.match_source_chunks_dense(extensions.vector, uuid, double precision, integer) to authenticated, service_role;
grant execute on function public.match_source_chunks_sparse(text, uuid, integer) to authenticated, service_role;
grant execute on function public.match_source_chunks_hybrid(text, extensions.vector, uuid, integer, integer) to authenticated, service_role;
