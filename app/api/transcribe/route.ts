import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

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

    // Convert to File for Groq API
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

    console.log('Sending to Groq Whisper API...');
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'mn', // Mongolian
    });

    console.log('Transcription result:', transcription.text);

    // Update database with transcription
    const { error: updateError } = await supabaseAdmin
      .from('meeting_recordings')
      .update({ transcription: transcription.text })
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
      transcription: transcription.text 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
