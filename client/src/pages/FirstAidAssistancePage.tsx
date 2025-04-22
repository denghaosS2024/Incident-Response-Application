import React, { useState } from "react";
import MicrophoneButton from "../components/MicrophoneButton";

const FirstAidAssistancePage: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");

  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
    // Handle transitioning to the next page or updating UI based on transcription
    console.log("Transcribed text:", text);
  };

  return (
    <div className="first-aid-page">
      <style>{`
        .first-aid-page {
          font-family: Arial, sans-serif;
          max-width: 768px;
          margin: 0 auto;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .header {
          background-color: #4285F4;
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }
        .icon-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
        }
        .navigation {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-bottom: 1px solid #e0e0e0;
          background-color: white;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #5f6368;
        }
        .nav-item.active {
          color: #4285F4;
        }
        .nav-item.active:after {
          content: '';
          display: block;
          width: 24px;
          height: 3px;
          margin-top: 4px;
          background-color: #4285F4;
        }
        .content {
          flex: 1;
          height: auto;
          max-height: calc(100vh - 120px);
          padding: 24px 16px;
          background-color: white;
          overflow: hidden;
        }
        .step {
          display: flex;
          margin-bottom: 32px;
          align-items: flex-start;
        }
        .step-icon {
          margin-right: 16px;
          min-width: 30px;
        }
        .step-content h2 {
          font-size: 18px;
          font-weight: 500;
          margin-top: 0;
          margin-bottom: 8px;
          color: #202124;
        }
        .step-content p {
          color: #5f6368;
          margin: 0;
          line-height: 1.5;
        }
        .microphone-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px 0;
          margin-top: auto;
        }
      `}</style>
      <div className="content">
        <div className="step">
          <div className="step-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                fill="#4285F4"
              />
              <path
                d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                fill="#4285F4"
              />
            </svg>
          </div>
          <div className="step-content">
            <h2>Tell Me The Symptoms</h2>
            <p>
              Please describe all the symptoms the patient is experiencing,
              including severity, duration, and any recent changes in condition.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                fill="#5f6368"
              />
            </svg>
          </div>
          <div className="step-content">
            <h2>Report Generation</h2>
            <p>
              Based on the provided symptoms, we will automatically generate a
              structured preliminary medical report to guide the next steps in
              care.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                fill="#5f6368"
              />
            </svg>
          </div>
          <div className="step-content">
            <h2>AI Support</h2>
            <p>
              Use the AI-powered live support tool to receive guidance for
              immediate, non-invasive aid procedures tailored to the patient's
              condition.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3.3c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7S9.3 9.49 9.3 8s1.21-2.7 2.7-2.7zM18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9z"
                fill="#5f6368"
              />
            </svg>
          </div>
          <div className="step-content">
            <h2>Nurse Support</h2>
            <p>
              If the situation requires further assistance, you will be
              connected to a licensed nurse for real-time consultation and care
              direction.
            </p>
          </div>
        </div>
      </div>
      <MicrophoneButton onTranscriptionComplete={handleTranscriptionComplete} />
    </div>
  );
};

export default FirstAidAssistancePage;
