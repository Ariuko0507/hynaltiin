import { supabase } from "@/lib/supabase";

interface UploadMeetingRecordingResponse {
  success: boolean;
  filePath: string;
  publicUrl: string;
  recordId?: number;
}

interface UploadMeetingRecordingError {
  message: string;
}

export async function uploadMeetingRecording(
  meetingId: string,
  audioBlob: Blob,
  userId: number,
  duration: number = 0
): Promise<UploadMeetingRecordingResponse> {
  try {
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `meeting_${meetingId}_${timestamp}.webm`;
    const filePath = `user_${userId}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meeting-recordings')
      .upload(filePath, audioBlob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('meeting-recordings')
      .getPublicUrl(filePath);

    // Save metadata to database via API route (bypasses RLS)
    const response = await fetch('/api/recordings/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingId,
        userId,
        filePath,
        publicUrl,
        fileSize: audioBlob.size,
        duration,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save recording metadata');
    }

    const result = await response.json();

    return {
      success: true,
      filePath,
      publicUrl,
      recordId: result.data?.id,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error');
    }
  }
}

export async function getMeetingRecordings(meetingId: string) {
  try {
    const response = await fetch(`/api/recordings/list?meetingId=${meetingId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recordings');
    }
    const data = await response.json();
    return data.recordings || [];
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }
}

export async function deleteMeetingRecording(filePath: string, recordId: number) {
  try {
    const response = await fetch('/api/recordings/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, recordId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete recording');
    }

    return { success: true };
  } catch (error) {
    console.error('Delete recording error:', error);
    return { success: false };
  }
}

export async function transcribeRecording(recordId: number, audioUrl: string) {
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, audioUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe recording');
    }

    const result = await response.json();
    return result.transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    return null;
  }
}
