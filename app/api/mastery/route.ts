import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGlobalMasterySummary } from '@/lib/services/mastery';
import { AppError } from '@/lib/errors/app-error';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getGlobalMasterySummary(user.id);
    return NextResponse.json({ data: summary });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
