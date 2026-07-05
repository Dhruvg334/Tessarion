import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:55321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const email = `test-${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });

  if (error) {
    console.error('Signup error:', error);
    return;
  }

  const userId = data.user?.id;
  if (!userId) return;

  console.log('Created user:', userId);

  try {
    const { data: wsData, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        user_id: userId,
        name: 'Direct Insert Test',
      })
      .select()
      .single();

    if (wsError) {
      console.error('Workspace insert failed:', { code: wsError.code, message: wsError.message, details: wsError.details });
    } else {
      console.log('Workspace insert succeeded', wsData);
    }

  } catch (e) {
    console.error('Caught error:', e);
  }
}

main();
