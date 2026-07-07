import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGlobalMasterySummary } from '@/lib/services/mastery';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getGlobalMasterySummary(user.id);
    return NextResponse.json({ data: summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
