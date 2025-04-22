import React, { useState, useRef, useEffect } from "react";

interface MicrophoneButtonProps {
  onTranscriptionComplete: (text: string) => void;
  onSendMessage?: (text: string) => void;
  onTextChange?: (text: string) => void;
  isListening?: boolean;
  apiKey?: string; // AssemblyAI API key
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onTranscriptionComplete,
  onSendMessage,
  onTextChange,
  isListening = false,
  apiKey, // You can pass this as a prop or use an environment variable
}) => {
  const [listening, setListening] = useState(isListening);
  const [error, setError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [showTextbox, setShowTextbox] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Get API key from environment variable if not provided as prop
  const assemblyAIKey = apiKey || "29b41848f2f54540ac089822ef8e1230";

  useEffect(() => {
    // Clean up resources when component unmounts
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create a new MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop event
      mediaRecorder.onstop = handleRecordingStop;

      // Start recording
      mediaRecorder.start();
      setListening(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "Could not access the microphone. Please check your permissions.",
      );
      setListening(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();

      // Stop all audio tracks to release the microphone
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
    setListening(false);
    setIsProcessing(true);
  };

  const handleRecordingStop = async () => {
    try {
      // Convert recorded audio chunks to a single blob
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

      // Send the audio to AssemblyAI
      await transcribeWithAssemblyAI(audioBlob);
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("An error occurred while processing your speech.");
      setIsProcessing(false);
    }
  };

  const transcribeWithAssemblyAI = async (audioBlob: Blob) => {
    try {
      if (!assemblyAIKey) {
        throw new Error("AssemblyAI API key is missing");
      }

      // Step 1: Upload the audio file to AssemblyAI
      const uploadResponse = await fetch(
        "https://api.assemblyai.com/v2/upload",
        {
          method: "POST",
          headers: {
            Authorization: assemblyAIKey,
          },
          body: audioBlob,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      const audioUrl = uploadResult.upload_url;

      // Step 2: Submit the transcription request
      const transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            Authorization: assemblyAIKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_url: audioUrl,
            language_code: "en", // You can make this configurable
          }),
        },
      );

      if (!transcriptResponse.ok) {
        throw new Error(
          `Transcription request failed with status: ${transcriptResponse.status}`,
        );
      }

      const transcriptResult = await transcriptResponse.json();
      const transcriptId = transcriptResult.id;

      // Step 3: Poll for the transcription result
      let result = null;
      let status = "processing";

      while (status === "processing" || status === "queued") {
        // Wait for a second before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const pollingResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            method: "GET",
            headers: {
              Authorization: assemblyAIKey,
            },
          },
        );

        if (!pollingResponse.ok) {
          throw new Error(
            `Polling failed with status: ${pollingResponse.status}`,
          );
        }

        result = await pollingResponse.json();
        status = result.status;

        if (status === "completed") {
          handleTranscriptionSuccess(result.text);
          break;
        } else if (status === "error") {
          throw new Error(`Transcription failed: ${result.error}`);
        }
      }
    } catch (err) {
      console.error("AssemblyAI Error:", err);
      setIsProcessing(false);
    }
  };

  const handleTranscriptionSuccess = (text: string) => {
    setTranscribedText(text);
    setIsProcessing(false);
    setShowTextbox(true);
    onTranscriptionComplete(text);

    // Focus on the textarea after it appears
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 100);
  };

  const handleSend = () => {
    if (onSendMessage && transcribedText.trim()) {
      // This is the key fix - ensure we call the onSendMessage prop with the current text
      onSendMessage(transcribedText);
    }
    setShowTextbox(false);
    setTranscribedText("");
  };

  const handleCancel = () => {
    setShowTextbox(false);
    setTranscribedText("");
  };

  const toggleListening = () => {
    if (listening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="microphone-container">
      <style>{`
        .microphone-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          position: absolute;
          bottom: 36px;
          left: 0;
          z-index: 1000;
          pointer-events: none; /* Make container transparent to mouse events */
        }
        
        .microphone-button-wrapper {
          position: relative;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .microphone-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: ${listening ? "#EA4335" : isProcessing ? "#34A853" : "#4285F4"};
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          pointer-events: auto; /* Enable pointer events on the button */
        }
        
        .microphone-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        
        .microphone-button.listening {
          animation: pulse 1.5s infinite;
          border-radius: 16px; /* Square with rounded corners when recording */
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 12px rgba(234, 67, 53, 0.4);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        }
        
        .microphone-icon {
          width: 48px;
          height: 48px;
        }
        
        .error-message {
          color: #EA4335;
          font-size: 12px;
          margin-top: 8px;
          text-align: center;
          max-width: 200px;
          pointer-events: auto; /* Enable pointer events */
          position: absolute;
          top: 85px;
          background-color: white;
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .recording-indicator {
          display: ${listening ? "block" : "none"};
          font-size: 12px;
          color: #EA4335;
          font-weight: 500;
          animation: blink 1s infinite;
          pointer-events: auto; /* Enable pointer events */
          background-color: rgba(255, 255, 255, 0.8);
          padding: 4px 8px;
          border-radius: 4px;
          position: absolute;
          top: 85px;
        }
        
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .loading-spinner {
          position: absolute;
          display: ${isProcessing ? "block" : "none"};
          width: 48px;
          height: 48px;
          pointer-events: none;
        }
        
        .loading-spinner:after {
          content: " ";
          display: block;
          width: 32px;
          height: 32px;
          margin: 8px;
          border-radius: 50%;
          border: 4px solid #fff;
          border-color: #fff transparent #fff transparent;
          animation: spinner 1.2s linear infinite;
        }
        
        @keyframes spinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .textbox-container {
          width: 90%;
          max-width: 600px;
          margin-top: 16px;
          display: ${showTextbox ? "block" : "none"};
          pointer-events: auto; /* Enable pointer events */
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 12px;
        }
        
        .transcription-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 12px;
          resize: none;
        }
        
        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .send-button, .cancel-button {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        
        .send-button {
          background-color: #4285F4;
          color: white;
        }
        
        .cancel-button {
          background-color: #f1f3f4;
          color: #5f6368;
        }
        
        /* Add padding to the parent page content to prevent button overlap */
        .first-aid-page {
          padding-bottom: 120px !important;
          background-color: white !important;
        }
        
        /* Make content background white to remove gray area */
        .content {
          background-color: white !important;
        }
      `}</style>

      <div className="microphone-button-wrapper">
        {!showTextbox && (
          <button
            className={`microphone-button ${listening ? "listening" : ""}`}
            onClick={toggleListening}
            aria-label={listening ? "Stop recording" : "Start recording"}
            disabled={isProcessing}
          >
            {!isProcessing && (
              <svg
                className="microphone-icon"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                  fill="#FFFFFF"
                />
                <path
                  d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                  fill="#FFFFFF"
                />
              </svg>
            )}
            <div className="loading-spinner"></div>
          </button>
        )}

        {listening && <div className="recording-indicator">Recording...</div>}

        {error && <div className="error-message">{error}</div>}
      </div>

      {showTextbox && (
        <div className="textbox-container">
          <textarea
            ref={textAreaRef}
            className="transcription-textarea"
            value={transcribedText}
            onChange={(e) => {
              setTranscribedText(e.target.value);
              if (onTextChange) {
                onTextChange(e.target.value);
              }
            }}
            placeholder="Edit your transcribed text here..."
          />
          <div className="button-container">
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="send-button" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrophoneButton;
