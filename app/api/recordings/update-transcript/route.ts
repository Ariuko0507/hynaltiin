import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { recordId, transcription } = await request.json();

    if (!recordId || typeof recordId !== 'number') {
      return NextResponse.json({ error: 'recordId is required' }, { status: 400 });
    }

    if (typeof transcription !== 'string') {
      return NextResponse.json({ error: 'transcription must be a string' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('meeting_recordings')
      .update({ transcription })
      .eq('id', recordId)
      .select('id, meeting_id, transcription')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update transcript error:', error);
    return NextResponse.json(
      { error: 'Failed to update transcript' },
      { status: 500 }
    );
  }
}
