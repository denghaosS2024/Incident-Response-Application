import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { IconButton } from "@mui/material";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import request from "../utils/request";

interface VoiceRecorderProps {
  channelId: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ channelId }) => {
  const dispatch = useDispatch();
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
      console.log(blob);
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
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const uploadAudio = async (blob: Blob) => {
    console.log("Uploading audio...");
    try {
      const { uploadUrl, fileUrl } = await request(
        `/api/channels/${channelId}/voice-upload-url`,
        {
          method: "POST",
          body: JSON.stringify({ fileName: "recording" }),
        },
      );

      console.log("Uploading voice message to:", uploadUrl);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "audio/webm",
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const message = await request(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: fileUrl,
          isAlert: false,
        }),
      });

      dispatch(addMessage(message));
      console.log("Voice message uploaded successfully:", fileUrl);
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  return (
    <IconButton
      onClick={isRecording ? stopRecording : startRecording}
      color="primary"
    >
      <KeyboardVoiceIcon />
    </IconButton>
  );
};

export default VoiceRecorder;
