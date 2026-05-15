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
    console.log('uploadMeetingRecording called with:', { meetingId, userId, duration, meetingIdType: typeof meetingId });

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
    const payload = {
      meetingId,
      userId,
      filePath,
      publicUrl,
      fileSize: audioBlob.size,
      duration,
    };
    console.log('Sending to API:', payload);

    const response = await fetch('/api/recordings/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

export async function getMeetingRecordings(meetingId: string, userId?: number) {
  try {
    const query = new URLSearchParams({ meetingId });
    if (typeof userId === 'number') {
      query.set('userId', String(userId));
    }
    const response = await fetch(`/api/recordings/list?${query.toString()}`);
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

export async function transcribeRecording(recordId: number, audioUrl: string, meetingId: string, userId: number) {
  try {
    // Fetch the audio file from the public URL
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio file');
    }
    const audioBlob = await audioResponse.blob();
    const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('meetingId', meetingId);
    formData.append('userId', String(userId));

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to transcribe recording';
      try {
        const errorBody = await response.json();
        if (typeof errorBody?.error === 'string' && errorBody.error.trim()) {
          errorMessage = errorBody.error;
        }
      } catch {
        // ignore JSON parsing errors
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transcription error',
    };
  }
}

export async function updateRecordingTranscription(recordId: number, transcription: string) {
  try {
    const response = await fetch('/api/recordings/update-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, transcription }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to update transcription');
    }

    return { success: true };
  } catch (error) {
    console.error('Update transcription error:', error);
    return { success: false };
  }
}
