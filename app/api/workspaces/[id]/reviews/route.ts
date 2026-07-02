import { NextResponse } from 'next/server';
// import { createServerSupabaseClient } from '@/lib/supabase/server';
// import { toErrorResponse } from '@/lib/errors/api-error';

export async function GET() {
  try {
    // TODO: Verify auth session
    // const supabase = await createServerSupabaseClient();
    
    // TODO: Validate params and handle business logic for reviews
    return NextResponse.json({ data: [], message: 'Scaffolded reviews GET endpoint' });
  } catch (_error) {
    // return toErrorResponse(error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Not implemented' } }, { status: 500 });
  }
}

export async function POST() {
  try {
    // TODO: Verify auth session
    // TODO: Validate request body via Zod
    // TODO: Handle business logic for reviews
    return NextResponse.json({ data: null, message: 'Scaffolded reviews POST endpoint' });
  } catch (_error) {
    // return toErrorResponse(error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Not implemented' } }, { status: 500 });
  }
}