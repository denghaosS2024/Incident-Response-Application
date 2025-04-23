import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MicrophoneButton from "../components/MicrophoneButton";
import request from "../utils/request";

// Define interface for guidance items
interface GuidanceItem {
  id: number;
  text: string;
}

// Define interface for conversation
interface Conversation {
  userMessage: string;
  aiResponse: string;
}

const AISupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [guidance, setGuidance] = useState<GuidanceItem[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGuidance, setShowGuidance] = useState<boolean>(true);
  const [aiResponse, setAiResponse] = useState<string>("");

  // Fetch guidance on component mount
  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        // Get session ID from URL params or local storage
        const reportSessionId = sessionId || localStorage.getItem("reportSessionId");
        
        if (!reportSessionId) {
          console.error("No session ID found");
          return;
        }

        // Store session ID in local storage for persistence
        if (!localStorage.getItem("reportSessionId")) {
          localStorage.setItem("reportSessionId", reportSessionId);
        }

        const guidanceData = await request(`/api/first-aid/guidance/${reportSessionId}`);
        setGuidance(guidanceData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching guidance:", error);
        setIsLoading(false);
      }
    };

    fetchGuidance();
    
    // When the component unmounts, don't clear localStorage as we want the report to persist
    // when navigating back to the report page
  }, [sessionId]);

  // Handle sending message to AI
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setUserInput("");
    setIsLoading(true);

    try {
      const response = await request("/api/first-aid/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          sessionId: sessionId || localStorage.getItem("reportSessionId"),
        }),
      });

      // Add conversation to the list
      setConversations([
        ...conversations,
        {
          userMessage: text,
          aiResponse: response.response,
        },
      ]);

      // Set the latest AI response
      setAiResponse(response.response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setAiResponse("Sorry, there was an error processing your request. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle transcription complete from MicrophoneButton
  const handleTranscriptionComplete = (text: string) => {
    setUserInput(text);
  };

  // Handle navigation between guidance steps
  const handleNextStep = () => {
    if (currentStep < guidance.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If we're at the last step, switch to chat mode
      setShowGuidance(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle switching between guidance and chat
  const toggleView = () => {
    setShowGuidance(!showGuidance);
  };

  // Calculate progress percentage
  const progressPercentage = guidance.length > 0 
    ? ((currentStep + 1) / guidance.length) * 100
    : 0;

  // Render loading screen
  if (isLoading && guidance.length === 0) {
    return (
      <div className="loading-screen">
        <style>{`
          .loading-screen {
            font-family: Arial, sans-serif;
            max-width: 768px;
            margin: 0 auto;
            padding: 0;
            background-color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          
          .loading-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
          }
          
          .loading-circle {
            width: 24px;
            height: 24px;
            margin: 0 8px;
            background-color: #4285F4;
            border-radius: 50%;
            display: inline-block;
            animation: loading-bounce 1.4s infinite ease-in-out both;
          }
          
          .loading-circle:nth-child(1) {
            animation-delay: -0.32s;
          }
          
          .loading-circle:nth-child(2) {
            animation-delay: -0.16s;
          }
          
          @keyframes loading-bounce {
            0%, 80%, 100% {
              transform: scale(0);
            } 
            40% {
              transform: scale(1.0);
            }
          }
          
          .loading-title {
            font-size: 24px;
            font-weight: 500;
            color: #202124;
            margin-bottom: 8px;
          }
          
          .loading-text {
            color: #5f6368;
            font-size: 16px;
          }
        `}</style>

        <div className="loading-icon">
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
        </div>
        <h2 className="loading-title">Loading Medical Guidance</h2>
        <p className="loading-text">
          Please wait while we prepare your personalized first aid support...
        </p>
      </div>
    );
  }

  return (
    <div className="ai-support-page">
      <style>{`
        .ai-support-page {
          font-family: Arial, sans-serif;
          max-width: 768px;
          margin: 0 auto;
          padding: 0;
          background-color: white;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .back-button {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          color: #4285F4;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }
        
        .toggle-button {
          background-color: #f1f3f4;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          color: #5f6368;
          font-weight: 500;
          cursor: pointer;
        }
        
        .toggle-button.active {
          background-color: #4285F4;
          color: white;
        }
        
        .progress-container {
          padding: 16px;
          background-color: white;
        }
        
        .progress-bar {
          height: 4px;
          background-color: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #4285F4;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #5f6368;
        }
        
        .content-container {
          padding: 24px 16px;
          background-color: white;
          flex-grow: 1;
          overflow-y: auto;
        }
        
        .guidance-container {
          margin-bottom: 24px;
        }
        
        .guidance-title {
          font-size: 18px;
          font-weight: 500;
          color: #202124;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }
        
        .guidance-title svg {
          margin-right: 8px;
        }
        
        .guidance-card {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          color: #202124;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 24px;
          border-left: 4px solid #34A853;
        }
        
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background-color: white;
          border-top: 1px solid #e0e0e0;
        }
        
        .nav-button {
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        
        .nav-button.previous {
          background-color: #f1f3f4;
          color: #5f6368;
        }
        
        .nav-button.next {
          background-color: #4285F4;
          color: white;
        }
        
        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .chat-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 120px);
            overflow: hidden;
        }
          
        
        .messages-container {
            flex-grow: 1;
            overflow-y: auto;
            padding: 16px;
            padding-bottom: 120px; 
        }
        
        .message {
          margin-bottom: 16px;
          max-width: 80%;
        }
        
        .message.user {
          margin-left: auto;
          background-color: #4285F4;
          color: white;
          padding: 12px 16px;
          border-radius: 18px 18px 0 18px;
        }
        
        .message.ai {
          margin-right: auto;
          background-color: #f1f3f4;
          color: #202124;
          padding: 12px 16px;
          border-radius: 18px 18px 18px 0;
        }
        
        .message-label {
          font-size: 12px;
          color: #5f6368;
          margin-bottom: 4px;
        }
        
        .chat-input-container {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          background-color: white;
        }
        
        .chat-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 24px;
          border: 1px solid #e0e0e0;
          outline: none;
          font-size: 14px;
        }
        
        .chat-input:focus {
          border-color: #4285F4;
        }
        
        .chat-prompt {
          text-align: center;
          color: #5f6368;
          margin-bottom: 24px;
          font-style: italic;
        }
      `}</style>

      <div className="header">
        <button className="back-button" onClick={() => navigate("/ai-chat")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Report
        </button>

        <div>
          <button 
            className={`toggle-button ${showGuidance ? 'active' : ''}`} 
            onClick={() => setShowGuidance(true)}
          >
            Guidance
          </button>
          <button 
            className={`toggle-button ${!showGuidance ? 'active' : ''}`} 
            onClick={() => setShowGuidance(false)}
            style={{ marginLeft: '8px' }}
          >
            Chat
          </button>
        </div>
      </div>

      {showGuidance ? (
        <>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>
                Step {currentStep + 1} of {guidance.length}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>

          <div className="content-container">
            <div className="guidance-container">
              <div className="guidance-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#34A853">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                First Aid Guidance
              </div>

              {guidance.length > 0 && (
                <div className="guidance-card">
                  {guidance[currentStep].text}
                </div>
              )}
            </div>
          </div>

          <div className="navigation-buttons">
            <button
              className="nav-button previous"
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
            >
              Previous
            </button>
            <button
              className="nav-button next"
              onClick={handleNextStep}
              disabled={guidance.length === 0}
            >
              {currentStep < guidance.length - 1 ? "Next" : "Start Chat"}
            </button>
          </div>
        </>
      ) : (
        <div className="chat-container">
          <div className="messages-container">
            {conversations.length === 0 ? (
              <div className="chat-prompt">
                Ask any questions about the first aid guidance or the patient's condition
              </div>
            ) : (
              conversations.map((conv, index) => (
                <div key={index}>
                  <div className="message-label">You</div>
                  <div className="message user">
                    {conv.userMessage}
                  </div>
                  <div className="message-label">AI Assistant</div>
                  <div className="message ai">
                    {conv.aiResponse}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="message ai">
                Thinking...
              </div>
            )}
          </div>

          <MicrophoneButton
            onTranscriptionComplete={handleTranscriptionComplete}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
};

export default AISupportPage;