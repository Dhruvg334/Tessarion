-- Hybrid Retrieval Functions

-- Add search vector for full text search
alter table public.source_chunks add column if not exists search_vector tsvector generated always as (to_tsvector('english', content)) stored;
create index if not exists source_chunks_search_idx on public.source_chunks using gin(search_vector);

-- Dense match
create or replace function match_source_chunks_dense(
  query_embedding vector(768),
  match_workspace_id uuid,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  source_document_id uuid,
  workspace_id uuid,
  content text,
  chunk_index int,
  token_count int,
  section_hint text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    c.id, c.source_document_id, c.workspace_id, c.content, c.chunk_index, c.token_count, c.section_hint,
    1 - (c.embedding <=> query_embedding) as similarity
  from source_chunks c
  where c.workspace_id = match_workspace_id
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Sparse match
create or replace function match_source_chunks_sparse(
  query_text text,
  match_workspace_id uuid,
  match_count int
)
returns table (
  id uuid,
  source_document_id uuid,
  workspace_id uuid,
  content text,
  chunk_index int,
  token_count int,
  section_hint text,
  rank float
)
language plpgsql
as $$
begin
  return query
  select
    c.id, c.source_document_id, c.workspace_id, c.content, c.chunk_index, c.token_count, c.section_hint,
    ts_rank(c.search_vector, websearch_to_tsquery('english', query_text)) as rank
  from source_chunks c
  where c.workspace_id = match_workspace_id
    and c.search_vector @@ websearch_to_tsquery('english', query_text)
  order by rank desc
  limit match_count;
end;
$$;

-- Hybrid match
create or replace function match_source_chunks_hybrid(
  query_text text,
  query_embedding vector(768),
  match_workspace_id uuid,
  match_count int,
  rrf_k int default 60
)
returns table (
  id uuid,
  source_document_id uuid,
  workspace_id uuid,
  content text,
  chunk_index int,
  token_count int,
  section_hint text,
  dense_rank bigint,
  sparse_rank bigint,
  rrf_score float
)
language plpgsql
as $$
begin
  return query
  with dense as (
    select c.id, row_number() over (order by c.embedding <=> query_embedding) as rank
    from source_chunks c
    where c.workspace_id = match_workspace_id and c.embedding is not null
  ),
  sparse as (
    select c.id, row_number() over (order by ts_rank(c.search_vector, websearch_to_tsquery('english', query_text)) desc) as rank
    from source_chunks c
    where c.workspace_id = match_workspace_id and c.search_vector @@ websearch_to_tsquery('english', query_text)
  ),
  combined as (
    select
      coalesce(d.id, s.id) as id,
      d.rank as dense_rank,
      s.rank as sparse_rank,
      (coalesce(1.0 / (rrf_k + d.rank), 0.0) + coalesce(1.0 / (rrf_k + s.rank), 0.0)) as rrf_score
    from dense d
    full outer join sparse s on d.id = s.id
  )
  select
    c.id, c.source_document_id, c.workspace_id, c.content, c.chunk_index, c.token_count, c.section_hint,
    cb.dense_rank, cb.sparse_rank, cb.rrf_score
  from combined cb
  join source_chunks c on c.id = cb.id
  order by cb.rrf_score desc
  limit match_count;
end;
$$;
