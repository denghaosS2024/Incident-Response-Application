import { Button } from "@mui/material";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import request from "../utils/request";

interface MessageVideoRecorderProps {
  channelId: string;
  currentUserId: string;
}

const MessageVideoRecorder: React.FC<MessageVideoRecorderProps> = ({
  channelId,
  currentUserId,
}) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  // const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  // Instead of state, use a ref to store chunks
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dispatch = useDispatch();

  // Start recording using the webcam
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      // Display the live stream in the video preview element
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      // Setup the MediaRecorder
      const options = { mimeType: "video/webm; codecs=vp9" };
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (event: BlobEvent) => {
        console.log("ondataavailable event data size:", event.data.size);
        if (event.data && event.data.size > 0) {
          // setRecordedChunks((prev) => [...prev, event.data])
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Combine all recorded chunks into a single Blob
        // const blob = new Blob(recordedChunks, { type: 'video/webm' })
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        console.log("Recording stopped. Blob size:", blob.size);
        try {
          // Step 1: Request a signed URL from your backend.
          const { uploadUrl, fileUrl } = await request(
            `/api/channels/${channelId}/video-upload-url`,
            { method: "GET" },
          );

          console.log("Uploading video to:", uploadUrl);

          // Step 2: Upload the video blob directly to Google Cloud Storage using the signed URL.
          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "video/webm",
            },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error("Upload failed");
          }

          // Step 3: Use the fileUrl (which points to the stored video) to create a new message.
          const message = await request(`/api/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: fileUrl, // Save the video URL in the message
              isAlert: false,
              // type: 'video'      // Optionally mark this message as a video type
            }),
          });
          dispatch(addMessage(message));
        } catch (error) {
          console.error("Error uploading video:", error);
        }
        // Reset recorded chunks for next recording
        // setRecordedChunks([])
        recordedChunksRef.current = [];
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // Stop recording and finalize the video
  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      // Stop all tracks to turn off the webcam
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div>
      <video
        ref={videoPreviewRef}
        autoPlay
        muted
        style={{ width: "100%", maxHeight: "300px", background: "#000" }}
      />
      {!recording ? (
        <Button variant="contained" color="primary" onClick={startRecording}>
          Start Recording
        </Button>
      ) : (
        <Button variant="contained" color="secondary" onClick={stopRecording}>
          Stop Recording
        </Button>
      )}
    </div>
  );
};

export default MessageVideoRecorder;
