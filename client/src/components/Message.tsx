import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LanguageIcon from "@mui/icons-material/Language";
import TranslateIcon from "@mui/icons-material/Translate";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import moment from "moment";
import { FunctionComponent, useEffect, useState } from "react";
import Linkify from "react-linkify";
import IMessage from "../models/Message";
import {
  defaultLanguagePreference,
  ILanguagePreference,
} from "../models/Profile.ts";
import IUser from "../models/User";
import styles from "../styles/Message.module.css";
import { fetchLanguagePreferenceWithCache, fetchPrimaryLangCode, fetchAutotranslate } from "../utils/languagePreferenceCache";
import request from "../utils/request";
import { convertSavedNamesToDisplayNames } from "../utils/SupportedLanguages.ts";
import getRoleIcon from "./common/RoleIcon";
import NurseAlertMessage from "./NurseAlertMessage";

export interface IMessageProps {
  /**
   * The message to display
   */
  message: IMessage;
}

const Message: FunctionComponent<IMessageProps> = ({ message }) => {
  const currentUserId = localStorage.getItem("uid");
  const [languagePreference, setLanguagePreference] =
    useState<ILanguagePreference>(defaultLanguagePreference);
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  const [currentUserPrimaryLangCode, setCurrentUserPrimaryLangCode] = useState("");
  const [primaryMessage, setPrimaryMessage] = useState("");
  const [secondaryMessage, setSecondaryMessage] = useState("");
  const [isAutoTranslated, setIsAutoTranslated] = useState(false);

  // Check if the message content looks like a video url from bucket
  const videoUrlPrefix =
    "https://storage.googleapis.com/sem-video-bucket/videos/";
  const isVideo = message.content.startsWith(videoUrlPrefix);

  const imageUrlPrefix =
    "https://storage.googleapis.com/sem-video-bucket/images/";
  const isImage = message.content.startsWith(imageUrlPrefix);

  const fileUrlPrefix =
    "https://storage.googleapis.com/sem-video-bucket/uploads/";
  const isFile = message.content.startsWith(fileUrlPrefix);

  const audioUrlPrefix =
    "https://storage.googleapis.com/sem-video-bucket/voice_messages";
  const isAudio = message.content.startsWith(audioUrlPrefix);

  const isAlert = message.isAlert;
  const senderId = message.sender._id;

  // Check if this is a nurse alert by looking at the content format
  const isNurseAlert =
    isAlert &&
    message.content.includes("HELP") &&
    (message.content.includes("Patient:") ||
      message.content.startsWith("E HELP") ||
      message.content.startsWith("U HELP"));

  // For regular alerts
  const [text, bgColor, textColor] = !isNurseAlert
    ? message.content.split("-")
    : ["", "", ""];

  // If the message has responders, acknowledgedBy, and acknowledgedAt:
  const responders = message.responders || [];
  const acknowledgedBy = message.acknowledgedBy || [];
  const acknowledgedAt = message.acknowledgedAt || [];

  // Figure out who is still not acknowledged
  // (assuming each element in responders and acknowledgedBy are IUser objects)
  const unacknowledged = responders.filter(
    (res) => !acknowledgedBy.some((ackUser) => ackUser._id === res._id),
  );

  const latestAckTime =
    acknowledgedBy.length === 0
      ? message.timestamp
      : acknowledgedAt[acknowledgedAt.length - 1];

  // For nurse alerts, render using the specialized component
  if (isNurseAlert) {
    return <NurseAlertMessage message={message} />;
  }


  const getAllDisplayedLang = (langPref: ILanguagePreference) => {
    let languages = [...langPref.languages];
    const { translateTarget } = langPref;
    // Combine translateTarget and languages
    if (translateTarget.trim()) {
      languages = languages.filter((lang) => lang !== translateTarget); // Remove redundant
      languages = [translateTarget, ...languages]; // Place at the front
    }
    return convertSavedNamesToDisplayNames(languages);
  };
  
  const requestTranslate = async (langCode: string) => {
    // Check if content_translation exists and has the requested language
    if (message.content_translation && message.content_translation.get && message.content_translation.get(langCode)) {
      return message.content_translation.get(langCode);
    }
  
    // If not found in translations or translations don't exist, request from API
    try {
      const result = await request("/api/channels/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: message._id,
          text: message.content,
          targetLang: langCode, // Server expects 'targetLang' not 'langCode'
        }),
      });      
      return result.translation;
    } catch (error) {
      console.error("Error translating message:", error);
      console.error("LangCode:", langCode);
      console.error("Message:", message.content);
      return message.content; // Return original content if translation fails
    }
  }

  const revealSecondaryMessage = async () => {
    // If no primary language is set, show an alert
    if (!currentUserPrimaryLangCode) {
      alert("Please set your primary language in Profile settings");
      return;
    }

    // Get the current user's auto-translate preference
    const userId = localStorage.getItem("uid");
    const isAutoTranslate = userId ? await fetchAutotranslate(userId) : false;
    
    if (isAutoTranslate) {
      setSecondaryMessage(message.content);
    }
    else {
      const translatedMessage = await requestTranslate(currentUserPrimaryLangCode);
      setSecondaryMessage(translatedMessage);
    }
  }

  useEffect(() => {
    const load = async () => {
      // Get sender's language preference (for the language button display)
      const senderPreference = await fetchLanguagePreferenceWithCache(message.sender._id);
      setLanguagePreference(senderPreference);
      
      // Get current user's language preference (for translation)
      const userId = localStorage.getItem("uid");
      if (!userId) {
        console.warn("[Message] No userId found in localStorage");
        return;
      }
      
      // Use centralized utility functions to get language preferences
      const primaryLangCode = await fetchPrimaryLangCode(userId);
      setCurrentUserPrimaryLangCode(primaryLangCode);
      
      // Check if auto-translation is enabled for the current user
      const autoTranslateEnabled = await fetchAutotranslate(userId);
  
      // Use the current user's preference to decide if auto-translation should happen
      if (autoTranslateEnabled && primaryLangCode) {
        const translatedMessage = await requestTranslate(primaryLangCode);
        setPrimaryMessage(translatedMessage);
        setIsAutoTranslated(true);
      } else {
        setPrimaryMessage(message.content);
        setIsAutoTranslated(false);
      }
    };
    load().catch(console.error);
  }, [message.sender._id]);

  return (
    <Box className={styles.root}>
      <Box display="flex" alignItems="center">
        {getRoleIcon(message.sender.role)}
        <Typography variant="body1" className={styles.name}>
          {message.sender.username}
        </Typography>
        <Typography variant="caption" className={styles.timestamp}>
          {message.timestamp}
        </Typography>

        <Box ml="auto" display="flex" alignItems="center" gap={0.5}>
          <Button
            size="small"
            startIcon={<TranslateIcon />}
            onClick={revealSecondaryMessage}
            sx={{ minWidth: "auto", p: 0.5 }}
          ></Button>
          {languagePreference.translateTarget && (
            <Button
              size="small"
              startIcon={<LanguageIcon />}
              onClick={() => setShowLanguagesModal(true)}
              sx={{ minWidth: "auto", p: 0.5 }}
            >
              {languagePreference.translateTarget || (languagePreference.languages.length > 0 ? languagePreference.languages[0] : "")}
            </Button>
          )}
        </Box>
      </Box>

      {/* Model to display all preference languages of sender */}
      <Modal
        open={showLanguagesModal}
        onClose={() => setShowLanguagesModal(false)}
        aria-labelledby="languages-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <Typography
            id="languages-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            {message.sender.username}'s Known Languages
          </Typography>
          <List>
            {getAllDisplayedLang(languagePreference).map((language, index) => (
              <ListItem key={index}>
                <ListItemText primary={language} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>

      {isVideo ? (
        <video controls width="300" style={{ maxWidth: "100%" }}>
          <source src={message.content} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      ) : isImage ? (
        <img
          src={message.content}
          alt="Sent message"
          style={{
            maxWidth: "30%",
            height: "auto",
            borderRadius: "8px",
            marginTop: "8px",
          }}
        />
      ) : isAudio ? (
        <audio controls style={{ width: "100%", marginTop: "8px" }}>
          <source src={message.content} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      ) : isFile ? (
        <a
          href={message.content}
          download
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Box
            display="inline-flex"
            alignItems="center"
            bgcolor="#F5F5F5"
            borderRadius={1}
            mt={2}
            mb={2}
            px={2}
          >
            <InsertDriveFileIcon
              sx={{ fontSize: 40, color: "#FFA726", mr: 1 }}
            />
            <Box
              sx={{
                display: "inline-flex",
                minWidth: "fit-content",
                maxWidth: "100%",
                wordBreak: "break-word",
              }}
            >
              <Typography variant="body1">
                {message.content
                  ?.split("/")
                  .pop()
                  ?.replace(/\.[^.]+\./, ".") ?? "Unknown"}
              </Typography>
            </Box>
          </Box>
        </a>
      ) : isAlert ? (
        <Box>
          <Typography variant="body2" className={styles.content}>
            <Box
              sx={{
                backgroundColor: bgColor || "black",
                color: textColor || "white",
                padding: "8px 12px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              {" "}
              {text}
            </Box>
          </Typography>

          {/* Only show dynamic acknowledgment status to the Commander */}
          {currentUserId === senderId && (
            <>
              {unacknowledged.length > 0 ? (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ fontWeight: "bold", mt: 1 }}
                >
                  Not acknowledged by:{" "}
                  {unacknowledged.map((u: IUser) => u.username).join(", ")}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{ fontWeight: "bold", mt: 1 }}
                >
                  Acknowledged by all
                </Typography>
              )}
              {/* Optionally, show who has acknowledged along with their acknowledgment times */}
              {acknowledgedBy.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" display="block">
                    Acknowledged at{" "}
                    {latestAckTime && moment(latestAckTime).isValid()
                      ? moment(latestAckTime).format("MM/DD/YY HH:mm")
                      : "Invalid date"}
                  </Typography>
                  {/* {acknowledgedBy.map((ackUser: any, index: number) => {
                    const ackTime = acknowledgedAt[index]
                    return (
                      <Typography key={ackUser} variant="caption" display="block">
                        acknowledged at {ackTime && moment(ackTime).isValid() ? moment(ackTime).format('MM/DD/YY HH:mm') : 'Invalid date'}
                      </Typography>
                    )
                  })} */}
                </Box>
              )}
              {acknowledgedBy.length === 0 && (
                <Typography variant="caption" display="block">
                  Acknowledged at{" "}
                  {message.timestamp && moment(message.timestamp).isValid()
                    ? moment(message.timestamp).format("MM/DD/YY HH:mm")
                    : "Invalid date"}
                </Typography>
              )}
            </>
          )}
        </Box>
      ) : (
        <Typography 
          variant="body2" 
          className={styles.content}
          sx={isAutoTranslated ? { bgcolor: '#e8f5e9', p: 1, borderRadius: 1 } : {}}
        >
          <Linkify>{primaryMessage}</Linkify>
        </Typography>
      )}
      
      {secondaryMessage !== "" && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="primary" className={styles.content}>
            <Linkify>{secondaryMessage}</Linkify>
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Message;
