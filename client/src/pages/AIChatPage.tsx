import { Alert, Snackbar } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MicrophoneButton from "../components/MicrophoneButton";
import request from "../utils/request";

// Define the interface for the report response
interface ReportResponse {
  sessionId: string;
  questions: string[];
  answers: string[];
  primarySymptom: string;
  onsetTime: string;
  severity: string;
  additionalSymptoms: string;
  remediesTaken: string;
  status: string;
  _id: string;
  reportId: string;
  createdAt: string;
  __v: number;
}

const AIChatPage: React.FC = () => {
  const navigate = useNavigate(); 
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [targetChannel, setTargetChannel] = useState<string | null>(null);

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
      // Use the actual API endpoint
      const response = await request("/api/first-aid/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: answers,
          questions: questions,
        }),
      });

      if (response.status !== "generated") {
        throw new Error("Failed to generate report");
      }

      setReport(response);
      setShowReport(true);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to redirect to nurse support and send the report
  // This function is called when the user clicks the "Nurse Support" button
  // It generates a PDF of the report and sends it to the Medic channel
  // It also navigates to the messages page for the Medic channel
  const redirectToNurseSupport = async () => {
    if (!report?.sessionId) {
      console.error("No report data available");
      return;
    }
    setIsLoading(true);
    try {
      // 1) PDF
      const pdfResponse = await request(
        `/api/first-aid/generate-pdf/${report.sessionId}`
      );
      if (!pdfResponse?.pdfDataUrl) {
        throw new Error("Failed to generate PDF");
      }

      // 2) Find Medic
      const channels: { name: string; _id: string }[] = await request(
        "/api/channels"
      );
      const medic = channels.find((c) => c.name === "Medic");
      if (!medic) throw new Error("Medic channel not found");

      // 3) Video conference
      const vcMsg = await request(
        `/api/channels/${medic._id}/video-conference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-application-uid": localStorage.getItem("uid") || "",
          },
          body: JSON.stringify({}),
        }
      );

      // 4) Combined content
      const combined = 
        `This is the patient report: ${pdfResponse.pdfDataUrl}`;

      // 5) Send message
      await request(`/api/channels/${medic._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: combined, isAlert: false }),
      });

      setTargetChannel(medic._id);
      setNotifOpen(true);
    } catch (e) {
      console.error("Error redirecting to nurse support:", e);
      alert("Failed to connect with Nurse Support. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  // If all questions are answered and we're on the last question, show the submit button
  const showSubmitButton = allQuestionsAnswered && isLastQuestion;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

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

  // Function to handle printing functionality
  const handlePrintReport = () => {
    window.print();
  };

  // Render report screen when report is generated
  if (showReport && report) {
    return (
      <>
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
          
          .report-container {
            padding: 24px 16px;
            flex-grow: 1;
            overflow-y: auto;
          }
          
          .top-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
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
          
          .download-button {
            background-color: #4285F4;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
          }
          
          .download-button svg {
            margin-right: 6px;
          }
          
          .metadata-box {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            font-size: 14px;
            color: #5f6368;
          }
          
          .metadata-item {
            margin-bottom: 8px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #202124;
          }
          
          .assessment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          
          .assessment-table tr {
            border-bottom: 1px solid #e0e0e0;
          }
          
          .assessment-table td {
            padding: 12px 8px;
          }
          
          .assessment-table td:first-child {
            font-weight: 500;
            color: #5f6368;
            width: 40%;
          }
          
          .qa-record {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
          }
          
          .qa-item {
            margin-bottom: 16px;
          }
          
          .question-text {
            font-weight: 500;
            margin-bottom: 4px;
            color: #202124;
          }
          
          .answer-text {
            padding-left: 16px;
            border-left: 2px solid #e0e0e0;
            color: #5f6368;
          }
          
          .action-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 24px;
          }
          
          .action-button {
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 160px;
          }
          
          .action-button svg {
            margin-right: 8px;
          }
          
          .action-button.ai-support {
            background-color: #34A853;
            color: white;
          }
          
          .action-button.nurse-support {
            background-color: #EA4335;
            color: white;
          }
          
          @media print {
            .top-navigation,
            .action-buttons {
              display: none;
            }
            
            .report-container {
              padding: 0;
            }
            
            .report-page {
              height: auto;
            }
          }
        `}</style>

        <div className="report-container">
          <div className="top-navigation">
            <button
              className="back-button"
              onClick={() => setShowReport(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back to Questions
            </button>

            <button className="download-button" onClick={handlePrintReport}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              Download PDF
            </button>
          </div>

          <div className="section-title">First Aid Report</div>

          <div className="metadata-box">
            <div className="metadata-item">Report ID: {report.reportId}</div>
            <div className="metadata-item">Session ID: {report.sessionId}</div>
            <div className="metadata-item">
              Generated: {formatDate(report.createdAt)}
            </div>
          </div>

          <div className="section-title">Patient Assessment</div>
          <table className="assessment-table">
            <tbody>
              <tr>
                <td>Primary Symptoms</td>
                <td>{report.primarySymptom}</td>
              </tr>
              <tr>
                <td>Onset Time</td>
                <td>{report.onsetTime}</td>
              </tr>
              <tr>
                <td>Severity</td>
                <td>{report.severity}</td>
              </tr>
              <tr>
                <td>Additional Symptoms</td>
                <td>{report.additionalSymptoms}</td>
              </tr>
              <tr>
                <td>Remedies Taken</td>
                <td>{report.remediesTaken}</td>
              </tr>
            </tbody>
          </table>

          <div className="section-title">Question and Answer Record</div>
          <div className="qa-record">
            {report.questions.map((question, index) => (
              <div key={index} className="qa-item">
                <div className="question-text">{question}</div>
                <div className="answer-text">{report.answers[index]}</div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button className="action-button ai-support">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              AI Support
            </button>

            <button className="action-button nurse-support" onClick={redirectToNurseSupport}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z" />
              </svg>
              Nurse Support
            </button>
          </div>
        </div>
        <Snackbar
          open={notifOpen}
          autoHideDuration={4000}
          onClose={() => {
            setNotifOpen(false);
            if (targetChannel) navigate(`/messages/${targetChannel}`);
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => {
              setNotifOpen(false);
              if (targetChannel) navigate(`/messages/${targetChannel}`);
            }}
            severity="success"
            sx={{ width: "100%" }}
          >
            Report and conference link sent to Medic group! Close this to go to chatroom.
          </Alert>
        </Snackbar>
      </div>
      </>
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