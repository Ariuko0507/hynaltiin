import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

const supabaseAdmin = createClient(
  supabaseUrl ?? '',
  serviceRoleKey ?? '',
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

const groq = new Groq({
  apiKey: groqApiKey ?? '',
});

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      );
    }
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      );
    }
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'Missing GROQ_API_KEY' },
        { status: 500 }
      );
    }

    const { recordId, audioUrl } = await request.json();

    if (!recordId) {
      return NextResponse.json(
        { error: 'recordId is required' },
        { status: 400 }
      );
    }

    // Prefer downloading the audio via service-role Storage access to avoid public URL / RLS issues.
    const { data: rec, error: recError } = await supabaseAdmin
      .from('meeting_recordings')
      .select('file_path, public_url')
      .eq('id', recordId)
      .single();

    if (recError) {
      return NextResponse.json(
        { error: `Failed to load recording metadata: ${recError.message}` },
        { status: 500 }
      );
    }

    let audioBlob: Blob;
    if (rec?.file_path) {
      const { data: fileData, error: dlError } = await supabaseAdmin.storage
        .from('meeting-recordings')
        .download(rec.file_path);

      if (dlError || !fileData) {
        return NextResponse.json(
          { error: `Failed to download audio from storage: ${dlError?.message ?? 'Unknown error'}` },
          { status: 500 }
        );
      }

      audioBlob = fileData;
    } else {
      // Fallback to audioUrl/public_url fetch if file_path is missing
      const urlToFetch = audioUrl || rec?.public_url;
      if (!urlToFetch) {
        return NextResponse.json(
          { error: 'No file_path or audioUrl available for download' },
          { status: 500 }
        );
      }
      const audioResponse = await fetch(urlToFetch);
      if (!audioResponse.ok) {
        return NextResponse.json(
          { error: `Failed to download audio file (status ${audioResponse.status})` },
          { status: 500 }
        );
      }
      const audioBuffer = await audioResponse.arrayBuffer();
      audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    }

    // Convert to File for Groq API
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

    console.log('Sending to Groq Whisper API...');
    let transcription: { text: string };
    try {
      transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3',
        language: 'mn', // Mongolian
      });
    } catch (err) {
      console.error('Groq transcription error:', err);

      const anyErr = err as any;
      const status =
        anyErr?.status ??
        anyErr?.response?.status ??
        anyErr?.error?.status;
      const message =
        anyErr?.error?.message ??
        anyErr?.message ??
        anyErr?.response?.data?.error?.message;

      const details = {
        status: typeof status === 'number' ? status : undefined,
        message: typeof message === 'string' ? message : undefined,
      };

      return NextResponse.json(
        {
          error: 'Groq transcription request failed',
          details,
        },
        { status: 500 }
      );
    }

    console.log('Transcription result:', transcription.text);

    // Update database with transcription
    const { error: updateError } = await supabaseAdmin
      .from('meeting_recordings')
      .update({ transcription: transcription.text })
      .eq('id', recordId);

    if (updateError) {
      console.error('Error updating transcription:', updateError);
      return NextResponse.json(
        { error: `Failed to save transcription: ${updateError.message}` },
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
      { error: error instanceof Error ? error.message : 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
