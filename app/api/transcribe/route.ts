import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { recordId, audioUrl } = await request.json();

    if (!recordId || !audioUrl) {
      return NextResponse.json(
        { error: 'recordId and audioUrl are required' },
        { status: 400 }
      );
    }

    // Download audio file from Supabase Storage
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file');
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

    // Send to local Whisper server
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    const whisperResponse = await fetch('http://localhost:8001/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!whisperResponse.ok) {
      throw new Error('Whisper server error');
    }

    const whisperResult = await whisperResponse.json();

    if (!whisperResult.success) {
      throw new Error(whisperResult.error || 'Transcription failed');
    }

    // Update database with transcription
    const { error: updateError } = await supabaseAdmin
      .from('meeting_recordings')
      .update({ transcription: whisperResult.transcription })
      .eq('id', recordId);

    if (updateError) {
      console.error('Error updating transcription:', updateError);
      return NextResponse.json(
        { error: 'Failed to save transcription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      transcription: whisperResult.transcription 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
