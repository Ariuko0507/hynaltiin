"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { uploadMeetingRecording, getMeetingRecordings, deleteMeetingRecording, transcribeRecording } from "@/app/_lib/upload-recording";

interface VoiceRecorderProps {
  meetingId: string;
  userId: number;
  onRecordingSaved?: () => void;
  maxDuration?: number;
}

export function VoiceRecorder({ 
  meetingId, 
  userId, 
  onRecordingSaved, 
  maxDuration = 600 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordings, setRecordings] = useState<any[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setAudioUrl(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Микрофон руу хандахад алдаа гарлаа. Зөвшөөрөл өгсөн эсэхээ шалгана уу.");
    }
  }, [maxDuration]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setIsPaused(false);
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setError("");
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  const saveRecording = useCallback(async () => {
    if (!audioBlob) return;
    
    setIsUploading(true);
    setError("");
    
    try {
      const result = await uploadMeetingRecording(meetingId, audioBlob, userId, duration);
      alert("Бичлэг амжилттай хадгалагдлаа!");
      resetRecording();
      onRecordingSaved?.();
      
      // Trigger transcription if recordId is available
      if (result.recordId && result.publicUrl) {
        console.log("Starting transcription...");
        await transcribeRecording(result.recordId, result.publicUrl);
      }
      
      // Refresh recordings list
      const updatedRecordings = await getMeetingRecordings(meetingId);
      setRecordings(updatedRecordings);
    } catch (err) {
      console.error("Error saving recording:", err);
      setError("Бичлэг хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsUploading(false);
    }
  }, [audioBlob, meetingId, userId, duration, onRecordingSaved, resetRecording]);

  const handleDeleteRecording = async (filePath: string, recordId: number) => {
    try {
      await deleteMeetingRecording(filePath, recordId);
      const updatedRecordings = await getMeetingRecordings(meetingId);
      setRecordings(updatedRecordings);
    } catch (err) {
      console.error("Error deleting recording:", err);
    }
  };

  // Fetch recordings on mount and when meetingId changes
  useEffect(() => {
    if (meetingId) {
      getMeetingRecordings(meetingId).then(setRecordings);
    }
  }, [meetingId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-950">Дуу бичлэг</h3>
        {isRecording && (
          <span className="text-sm text-slate-500 font-mono">
            {formatTime(duration)}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Playback when done */}
      {audioUrl && !isRecording && (
        <div className="mb-4">
          <audio src={audioUrl} controls className="w-full h-8" />
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-2">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Бичих
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {isPaused ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Үргэлжлүүлэх
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Зогсоох
                </>
              )}
            </button>

            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Дуусгах
            </button>
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            <button
              onClick={resetRecording}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Дахин
            </button>

            <button
              onClick={saveRecording}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Хадгалах
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Saved Recordings List */}
      {recordings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="font-medium text-slate-950 mb-3 text-sm">Хадгалсан бичлэгүүд ({recordings.length})</h4>
          <div className="space-y-2">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <audio src={recording.public_url} controls className="w-full h-8" />
                  </div>
                  <button
                    onClick={() => handleDeleteRecording(recording.file_path, recording.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition shrink-0"
                    title="Устгах"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{new Date(recording.created_at).toLocaleDateString('mn-MN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    <span className="text-slate-500">{(recording.file_size / 1024).toFixed(1)} KB</span>
                  </div>
                  {recording.transcription && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-sm text-slate-700 bg-white p-2 rounded">{recording.transcription}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
