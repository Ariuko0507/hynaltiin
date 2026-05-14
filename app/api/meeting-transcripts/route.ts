import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // Fetch all transcripts for a specific meeting
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transcripts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transcripts: data || []
    });

  } catch (error) {
    console.error('Error in GET /api/meeting-transcripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transcriptId = searchParams.get('id');

    if (!transcriptId) {
      return NextResponse.json({ error: 'Transcript ID is required' }, { status: 400 });
    }

    // Delete transcript from database
    const { error } = await supabase
      .from('meeting_transcripts')
      .delete()
      .eq('id', transcriptId);

    if (error) {
      console.error('Error deleting transcript:', error);
      return NextResponse.json(
        { error: 'Failed to delete transcript' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transcript deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/meeting-transcripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const meetingId = formData.get('meetingId') as string;
    const transcript = formData.get('transcript') as string;
    const audioBlob = formData.get('audioBlob') as File;
    const userId = formData.get('userId') as string;

    console.log('Received data:', { 
        meetingId, 
        transcript: transcript ? transcript.substring(0, 50) + '...' : 'NULL', 
        transcriptLength: transcript?.length || 0,
        audioBlob: !!audioBlob, 
        userId 
    });
    
    if (!meetingId || !transcript || transcript.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Meeting ID and transcript are required',
        details: { meetingId: !!meetingId, transcript: !!transcript, transcriptLength: transcript?.length }
      }, { status: 400 });
    }

    // Save transcript to database
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .insert({
        meeting_id: meetingId,
        transcript: transcript,
        user_id: userId ? parseInt(userId) : null,
        audio_file_path: audioBlob ? `meeting-recordings/${meetingId}-${Date.now()}.wav` : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: `Failed to save transcript: ${error.message}` },
        { status: 500 }
      );
    }

    // If audio blob exists, upload to storage (in production, you'd use a proper file storage service)
    if (audioBlob) {
      // For now, just log the file info
      console.log(`Audio file received for meeting ${meetingId}:`, {
        size: audioBlob.size,
        type: audioBlob.type,
        name: audioBlob.name,
      });
    }

    return NextResponse.json({ 
      success: true, 
      transcript: data 
    });

  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // Get transcripts for the meeting
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transcripts: data || [],
    });

  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
