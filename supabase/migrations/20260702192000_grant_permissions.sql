-- Revoke existing broad permissions if any were applied
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated, service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM authenticated, service_role;

-- Grant broad privileges back to service_role, as it is a trusted server-side actor
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant safe CRUD privileges to authenticated.
-- Note: Row-Level Security (RLS) is still required to isolate tenant data.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
