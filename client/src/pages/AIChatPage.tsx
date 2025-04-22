import React, { useState, useEffect } from "react";
import MicrophoneButton from "../components/MicrophoneButton";

// Define the interface for the report response
interface ReportResponse {
  report: string;
}

const AIChatPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<string>("");
  const [showReport, setShowReport] = useState<boolean>(false);

  // Calculate how many questions have been answered
  const answeredQuestions = answers.filter(
    (answer) => answer.trim() !== "",
  ).length;

  // Calculate progress percentage based on answered questions instead of current step
  const progressPercentage = (answeredQuestions / answers.length) * 100;

  // Check if all questions are answered
  const allQuestionsAnswered = answers.every((answer) => answer.trim() !== "");

  // Questionnaire data
  const questions = [
    "Can you describe your patient's primary symptoms?",
    "When did your patient first start showing these symptoms?",
    "On a scale from 1 to 10, how severe would you say your patient's symptoms are?",
    "Is your patient experiencing any other symptoms, such as fever, cough, difficulty breathing, or additional discomfort like nausea or headache?",
    "Has your patient taken any measures to alleviate these symptoms, such as medication or home remedies?",
  ];

  // Check if we're on the last question
  const isLastQuestion = currentStep === questions.length - 1;

  // Sample responses - these would be actual user responses in production
  const sampleResponses = [
    "My patient is experiencing a severe headache along with nausea and occasional dizziness.",
    "The symptoms began about three hours ago, shortly after the patient had lunch.",
    "I would rate the symptoms as a 7 out of 10, as they are quite painful and seem to be affecting the patient's daily functioning.",
    "Yes, aside from the headache, my patient also has a slight fever and a persistent dry cough.",
    "Yes, I have given the patient some over-the-counter painkillers and advised them to rest, but there hasn't been much improvement yet.",
  ];

  const handleTranscriptionComplete = (text: string) => {
    // Update the current answer
    const newAnswers = [...answers];
    newAnswers[currentStep] = text;
    setAnswers(newAnswers);
  };

  const handleSendMessage = (text: string) => {
    // This function is called when the user clicks send in the MicrophoneButton component
    console.log("Message sent:", text);

    // Make sure the current answer is updated with the latest text
    const newAnswers = [...answers];
    newAnswers[currentStep] = text;
    setAnswers(newAnswers);

    // Move to the next question after sending the message
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Only proceed if all questions are answered
    if (!allQuestionsAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch("https://api.example.com/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: answers,
          questions: questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const data: ReportResponse = await response.json();
      setReport(data.report);
      setShowReport(true);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("There was an error generating the report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If all questions are answered and we're on the last question, show the submit button
  const showSubmitButton = allQuestionsAnswered && isLastQuestion;

  // Render loading screen when generating report
  if (isLoading) {
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
        <h2 className="loading-title">Report Generating</h2>
        <p className="loading-text">
          Please wait while we analyze your responses...
        </p>
      </div>
    );
  }

  // Render report screen when report is generated
  if (showReport) {
    return (
      <div className="report-page">
        <style>{`
          .report-page {
            font-family: Arial, sans-serif;
            max-width: 768px;
            margin: 0 auto;
            padding: 0;
            background-color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .report-header {
            background-color: #4285F4;
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
          }
          
          .back-button {
            background: none;
            border: none;
            color: white;
            margin-right: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
          }
          
          .header-title {
            font-size: 20px;
            font-weight: 500;
          }
          
          .header-menu {
            margin-left: auto;
            cursor: pointer;
          }
          
          .navigation-tabs {
            display: flex;
            justify-content: space-around;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .tab {
            padding: 16px 0;
            flex: 1;
            text-align: center;
            color: #5f6368;
            cursor: pointer;
          }
          
          .tab.active {
            color: #4285F4;
            border-bottom: 2px solid #4285F4;
          }
          
          .report-container {
            padding: 24px 16px;
            flex-grow: 1;
            overflow-y: auto;
          }
          
          .report-title {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
          }
          
          .report-icon {
            margin-right: 12px;
          }
          
          .report-content {
            white-space: pre-wrap;
            line-height: 1.5;
            color: #202124;
          }
        `}</style>

        <div className="report-header">
          <button className="back-button" onClick={() => setShowReport(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div className="header-title">First-Aid Assistance</div>
          <div className="header-menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
        </div>

        <div className="navigation-tabs">
          <div className="tab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H7V5h10v14z" />
            </svg>
          </div>
          <div className="tab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </div>
          <div className="tab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="tab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div className="tab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <div className="tab active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
            </svg>
          </div>
        </div>

        <div className="report-container">
          <div className="report-title">
            <div className="report-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
                <path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z" />
              </svg>
            </div>
            <h2>Report</h2>
          </div>

          <div className="report-content">{report}</div>
        </div>
      </div>
    );
  }

  // Render questionnaire
  return (
    <div className="questionnaire-page">
      <style>{`
        .questionnaire-page {
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
        
        .question-container {
          padding: 24px 16px;
          background-color: white;
          flex-grow: 1;
          overflow-y: auto;
        }
        
        .question {
          margin-bottom: 24px;
        }
        
        .question-title {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .question-icon {
          margin-right: 12px;
          width: 24px;
          height: 24px;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .question-text {
          font-size: 16px;
          font-weight: 500;
          color: #202124;
        }
        
        .answer-container {
          margin-left: 36px;
        }
        
        .answer-text {
          background-color: #f8f9fa;
          padding: 12px 16px;
          border-radius: 8px;
          color: #5f6368;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background-color: white;
          z-index: 900;
        }
        
        .navigation-buttons.top-nav {
          margin-top: 16px;
          padding: 0;
        }
        
        .nav-button {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background-color: #f1f3f4;
          color: #5f6368;
        }
        
        .nav-button.primary {
          background-color: #4285F4;
          color: white;
        }
        
        .nav-button.submit {
          background-color: #34A853;
          color: white;
        }
        
        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .symptoms-prompt {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
          padding: 16px;
          background-color: #f8f9fa;
          border-radius: 8px;
          color: #4285F4;
        }
        
        .symptoms-icon {
          margin-right: 12px;
        }
        
        .symptoms-text {
          font-weight: 500;
        }
        
        .voice-interface-container {
          margin-top: 16px;
          text-align: center;
          color: #5f6368;
          font-size: 12px;
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
        }
        
        .response-container {
          margin-top: 16px;
        }
        
        .response-preview {
          font-style: italic;
          color: #5f6368;
        }
      `}</style>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          <span>
            Question {currentStep + 1} of {questions.length}
          </span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>

        <div className="navigation-buttons top-nav">
          <button
            className="nav-button"
            onClick={handlePreviousQuestion}
            disabled={currentStep === 0}
          >
            Previous
          </button>

          {showSubmitButton ? (
            <button className="nav-button submit" onClick={handleSubmit}>
              Submit
            </button>
          ) : (
            <button
              className="nav-button primary"
              onClick={handleNextQuestion}
              disabled={currentStep === questions.length - 1}
            >
              Next
            </button>
          )}
        </div>
      </div>

      <div className="question-container">
        <div className="question">
          <div className="question-title">
            <div className="question-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                  fill="#5f6368"
                />
              </svg>
            </div>
            <div className="question-text">First-Aid Support</div>
          </div>

          <div className="answer-container">
            <div className="question-text" style={{ marginBottom: "8px" }}>
              {questions[currentStep]}
            </div>

            {answers[currentStep] && (
              <div className="answer-text">{answers[currentStep]}</div>
            )}

            {!answers[currentStep] && (
              <div className="voice-interface-container">
                Use the microphone button below to record your answer
              </div>
            )}

            {!answers[currentStep] && currentStep < sampleResponses.length && (
              <div className="response-container">
                <div className="response-preview">
                  Sample response: "{sampleResponses[currentStep]}"
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MicrophoneButton
        onTranscriptionComplete={handleTranscriptionComplete}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default AIChatPage;
