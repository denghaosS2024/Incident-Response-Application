import React from "react";
import { useNavigate } from "react-router";

const RedirectMicButton: React.FC = () => {
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate("/ai-chat");
  };

  return (
    <div className="microphone-container">
      <style>{`
        .microphone-container {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 36px;
          left: 0;
          width: 100%;
          z-index: 1000;
          pointer-events: none;
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
          background-color: #4285F4;
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          pointer-events: auto;
        }

        .microphone-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .microphone-icon {
          width: 48px;
          height: 48px;
        }
      `}</style>

      <div className="microphone-button-wrapper">
        <button
          className="microphone-button"
          onClick={handleRedirect}
          aria-label="Start"
        >
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
        </button>
      </div>
    </div>
  );
};

export default RedirectMicButton;
