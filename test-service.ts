import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:55321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  
  // Try querying workspaces table directly with service role
  const { data: wsData, error: wsError } = await supabase.from('workspaces').select('*').limit(1);
  if (wsError) {
    console.error('Service role select failed:', wsError);
  } else {
    console.log('Service role select succeeded, workspaces count:', wsData.length);
  }

  // Use the postgres role via raw SQL if possible? supabase-js doesn't support raw SQL easily unless we use an RPC.
  // We can just create a test RPC.
}

main();
