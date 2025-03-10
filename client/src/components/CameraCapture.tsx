import React, { useRef, useState } from 'react';
import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addMessage } from '../features/messageSlice';
import request from '../utils/request';

interface CameraCaptureProps {
  channelId: string;
  currentUserId: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ channelId, currentUserId }) => {
  const [capturing, setCapturing] = useState<boolean>(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dispatch = useDispatch();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setCapturing(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const capturePhoto = async () => {
    if (!videoPreviewRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoPreviewRef.current.videoWidth;
    canvas.height = videoPreviewRef.current.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      context.drawImage(videoPreviewRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          // The signed URL for uploading
          const { uploadUrl, fileUrl } = await request(`/api/channels/${channelId}/image-upload-url`, {
            method: 'GET',
          });

          console.log('Uploading image to:', uploadUrl);

          // Upload images to Google Cloud Storage
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'image/png',
            },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }

          // Create a message through the fileUrl
          const message = await request(`/api/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: fileUrl,
            }),
          });

          dispatch(addMessage(message));
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }, 'image/png');
    }
  };

  const stopCamera = () => {
    setCapturing(false);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  return (
    <div>
      <video ref={videoPreviewRef} autoPlay style={{ width: '100%', background: '#000' }} />
      {!capturing ? (
        <Button variant="contained" color="primary" onClick={startCamera}>
          Open Camera
        </Button>
      ) : (
        <>
          <Button variant="contained" color="secondary" onClick={capturePhoto}>
            Capture Photo
          </Button>
          <Button variant="outlined" color="error" onClick={stopCamera}>
            Close Camera
          </Button>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
