import React, { useState, useRef } from "react";
import { IconButton } from "@mui/material";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import request from '../utils/request'

interface VoiceRecorderProps {
  channelId: string;
  currentUserId: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ channelId, currentUserId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    console.log("Start recording...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
      await uploadAudio(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    console.log("Stop recording...");
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const uploadAudio = async (blob: Blob) => {
    console.log("Uploading audio...");
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");

    try {
      const response = await request(`/api/channels/${channelId}/voice-message`, {
        method: "POST",
        headers: {
          "x-application-uid": currentUserId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }
      console.log("Audio uploaded successfully");
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  return (
    <IconButton onClick={isRecording ? stopRecording : startRecording} color="primary">
      <KeyboardVoiceIcon />
    </IconButton>

    // Test purpose playback
    // <audio ref={audioRef} controls style={{ display: 'none' }} />
  );
};

export default VoiceRecorder;
