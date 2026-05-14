"use client";

import { useState, useRef, useEffect } from "react";

interface VoiceRecorderTranscriptProps {
  meetingId: string;
  userId?: number;
  onTranscriptComplete?: (transcript: string) => void;
  onTranscriptUpdate?: (meetingId: string, transcript: string) => void;
}

export function VoiceRecorderTranscript({ meetingId, userId, onTranscriptComplete, onTranscriptUpdate }: VoiceRecorderTranscriptProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  console.log('Transcript state:', transcript);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Auto-start transcription
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Микрофонд хандах боломжгүй байна. Браузерын тохиргоог шалгана уу.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setIsProcessing(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('meetingId', meetingId);
      if (userId) {
        formData.append('userId', userId.toString());
      }

      // Send to transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const transcriptText = data.transcript || '';
        setTranscript(transcriptText);
        
        if (onTranscriptComplete) {
          onTranscriptComplete(transcriptText);
        }
        if (onTranscriptUpdate) {
          onTranscriptUpdate(meetingId, transcriptText);
        }
        
        // Only save transcript if it has meaningful content
        if (transcriptText.trim().length > 0) {
          await saveTranscript(transcriptText, audioBlob);
        } else {
          console.log('Transcript is empty, not saving to database');
        }
      } else {
        throw new Error('Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscript('Тайлбар хийхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setIsTranscribing(false);
      setIsProcessing(false);
    }
  };

  const saveTranscript = async (transcriptText: string, blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('meetingId', meetingId);
      formData.append('transcript', transcriptText);
      formData.append('audioBlob', blob, 'recording.wav');
      if (userId) {
        formData.append('userId', userId.toString());
      }

      await fetch('/api/meeting-transcripts', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error saving transcript:', error);
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meetingId}-recording.wav`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyTranscript = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      alert('Тайлбар хуулагдлаа!');
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setTranscript('');
    setRecordingTime(0);
    setIsProcessing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-lg overflow-hidden">
      {/* Status Indicator */}
      <div className="px-6 py-3 border-b border-slate-200/30">
        <div className="flex items-center justify-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-xs font-medium text-slate-700">
                {isPaused ? 'Түр зогсоосон' : 'Бичиж байна'}
              </span>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
          {isTranscribing && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-700">Тайлбар хийж байна...</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div className="px-6 py-4 border-b border-slate-200/30">
        <div className="flex items-center justify-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
            >
              <div className="w-4 h-4 rounded-full bg-white group-hover:scale-110 transition-transform" />
              Бичлэг эхлүүлэх
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  type="button"
                  onClick={pauseRecording}
                  className="group bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
                >
                  <div className="w-4 h-4 bg-white group-hover:scale-110 transition-transform" />
                  Түр зогсоох
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRecording}
                  className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
                >
                  <div className="w-4 h-4 rounded-full bg-white animate-pulse group-hover:scale-110 transition-transform" />
                  Үргэлжлүүлэх
                </button>
              )}
              <button
                type="button"
                onClick={stopRecording}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Зогсоох
              </button>
            </>
          )}

          {audioBlob && !isProcessing && (
            <>
              <button
                type="button"
                onClick={downloadAudio}
                className="group bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Дуу
              </button>
              <button
                type="button"
                onClick={clearRecording}
                className="group bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Цэвэрлэх
              </button>
            </>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Тайлбар</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Дуу бичлэгийн автомат тайлбар</p>
                </div>
              </div>
              <button
                type="button"
                onClick={copyTranscript}
                className="group bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8v8z" />
                </svg>
                Хуулах
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200/40">
              <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="px-6 py-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 p-5 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-blue-700">
                {isTranscribing ? 'Дуу бичлэгийг тайлбарлаж байна...' : 'Боловсруулж байна...'}
              </p>
            </div>
          </div>
        </div>
      )}

          </div>
  );
}
