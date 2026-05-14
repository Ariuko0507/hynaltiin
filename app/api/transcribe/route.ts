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

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const meetingId = formData.get('meetingId') as string;
    const userId = formData.get('userId') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Create a temporary record in database for this transcription
    const { data: record, error: insertError } = await supabaseAdmin
      .from('meeting_recordings')
      .insert({
        meeting_id: meetingId,
        user_id: userId ? parseInt(userId) : null,
        file_path: `meeting-recordings/${meetingId}-${Date.now()}.wav`,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to create recording record: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Use the uploaded audio file directly
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
      .eq('id', record.id);

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
