import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Monitor, Loader2 } from 'lucide-react';

interface LiveAudioSessionProps {
  onSessionComplete?: (sessionId: string, startTime: string, endTime: string) => void;
}

export const LiveAudioSession: React.FC<LiveAudioSessionProps> = ({ onSessionComplete }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'recording'>('idle');
  const [useSystemAudio, setUseSystemAudio] = useState(true);
  
  // Refs for audio handling
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const sysStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const startTimeRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // --- Audio Utils ---
  const float32ToInt16Base64 = (data: Float32Array): string => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 0x7FFF;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const cleanup = () => {
    // Stop streams
    if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
    }
    if (sysStreamRef.current) {
        sysStreamRef.current.getTracks().forEach(t => t.stop());
        sysStreamRef.current = null;
    }
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    
    // Close Socket
    if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
    }

    setStatus('idle');
  };

  const startSession = async () => {
    setStatus('connecting');
    startTimeRef.current = new Date().toISOString();

    try {
      // 1. Get Session ID from Backend
      // We assume your backend has an endpoint to initiate a session token/id
      let sessionId = `sess-${Date.now()}`; 
      try {
        const res = await fetch('http://localhost:8080/api/session/start', { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            sessionId = data.sessionId || sessionId;
        }
      } catch (e) {
        console.warn("Backend start endpoint failed, using client-gen ID", e);
      }
      sessionIdRef.current = sessionId;

      // 2. Connect WebSocket
      const socket = new WebSocket(`ws://localhost:8080/ws?sessionId=${sessionId}`);
      socketRef.current = socket;

      socket.onopen = async () => {
        // 3. Setup Audio Context
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = ctx;

        // 4. Get Audio Sources
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }});
        micStreamRef.current = micStream;

        let sysStream: MediaStream | null = null;
        if (useSystemAudio) {
            try {
                // User must select the tab/window/screen to share audio from
                sysStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                sysStreamRef.current = sysStream;
            } catch (err) {
                console.warn("System audio access denied or cancelled", err);
            }
        }

        // 5. Mixing Logic
        const micSource = ctx.createMediaStreamSource(micStream);
        const dest = ctx.createMediaStreamDestination();
        
        // Connect Mic
        micSource.connect(dest);

        // Connect System Audio if available
        if (sysStream) {
            // Note: System audio tracks might be on the video stream object
            if (sysStream.getAudioTracks().length > 0) {
                const sysSource = ctx.createMediaStreamSource(sysStream);
                sysSource.connect(dest);
            }
        }

        // 6. Processing & Sending
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        const mixedSource = ctx.createMediaStreamSource(dest.stream);
        mixedSource.connect(processor);
        processor.connect(ctx.destination);

        processor.onaudioprocess = (e) => {
            if (socket.readyState === WebSocket.OPEN) {
                const inputData = e.inputBuffer.getChannelData(0);
                const base64Data = float32ToInt16Base64(inputData);
                socket.send(JSON.stringify({ type: 'audio_input', data: base64Data }));
            }
        };

        setStatus('recording');
      };

      socket.onclose = () => {
          handleStop(); // Ensure cleanup if socket closes unexpectedly
      };

      socket.onerror = (e) => {
          console.error("WebSocket error", e);
          cleanup();
          alert("Connection to backend failed.");
      };

    } catch (error) {
      console.error("Connection failed", error);
      setStatus('idle');
      alert("Failed to start session.");
    }
  };

  const handleStop = async () => {
    if (status === 'idle') return;

    const endTime = new Date().toISOString();
    const sid = sessionIdRef.current || 'unknown';
    const start = startTimeRef.current || new Date().toISOString();

    // Notify Backend of clean stop
    try {
        await fetch('http://localhost:8080/api/session/end', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid })
        });
    } catch (e) {
        console.warn("Backend end endpoint failed", e);
    }

    cleanup();
    
    // Notify Parent to update UI (Add to meeting table)
    if (onSessionComplete) {
        onSessionComplete(sid, start, endTime);
    }
  };

  const handleToggle = () => {
    if (status === 'recording' || status === 'connecting') {
      handleStop();
    } else {
      startSession();
    }
  };

  return (
    <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end gap-2">
        {/* Toggle Controls (Only show when idle to keep it clean) */}
        {status === 'idle' && (
             <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 text-xs transition-opacity hover:opacity-100 opacity-0 group-hover:opacity-100">
                <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-indigo-600">
                    <input 
                        type="checkbox" 
                        checked={useSystemAudio} 
                        onChange={(e) => setUseSystemAudio(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                    />
                    <span>Mix System Audio</span>
                </label>
             </div>
        )}

        <div className="group relative">
            <button
                onClick={handleToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    status === 'recording' 
                    ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-100 animate-pulse' 
                    : status === 'connecting'
                    ? 'bg-red-400 cursor-wait'
                    : 'bg-red-500 hover:bg-red-600 hover:scale-105 shadow-red-200'
                }`}
            >
                {status === 'recording' ? (
                    <Square size={20} className="text-white fill-current" />
                ) : status === 'connecting' ? (
                    <Loader2 size={24} className="text-white animate-spin" />
                ) : (
                    <Mic size={24} className="text-white" />
                )}
            </button>
            
            {/* Status Tooltip */}
            {status === 'recording' && (
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Recording...
                </div>
            )}
        </div>
    </div>
  );
};