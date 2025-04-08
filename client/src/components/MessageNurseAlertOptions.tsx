import WarningIcon from "@mui/icons-material/Warning";
import { IconButton, Popover } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import NurseAlertPanel from "./NurseAlertPanel";

interface MessageNurseAlertOptionsProps {
  channelId: string;
  currentUserId: string;
  preSelectedPatient?: string;
}

const MessageNurseAlertOptions: React.FC<MessageNurseAlertOptionsProps> = ({
  channelId,
  currentUserId,
  preSelectedPatient,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>(
    preSelectedPatient,
  );

  // Reference to the button element for auto-opening
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check URL for showAlert parameter and patient parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldShowAlert = urlParams.get("showAlert") === "true";
      const patientFromUrl = urlParams.get("patient");

      // Set patient from URL if available
      if (patientFromUrl) {
        console.log("Found patient in URL:", patientFromUrl);
        setSelectedPatient(patientFromUrl);
      }

      // Auto-open the panel if showAlert is true and we have a button reference
      if (shouldShowAlert && buttonRef.current && !open) {
        // Create a fake click event to pass to handleClick
        const fakeEvent = {
          currentTarget: buttonRef.current,
        } as React.MouseEvent<HTMLButtonElement>;

        // Use setTimeout to ensure this happens after component is fully mounted
        setTimeout(() => {
          handleClick(fakeEvent);

          // Remove the showAlert parameter from URL to prevent reopening on refresh
          // but keep the patient parameter
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("showAlert");
          window.history.replaceState({}, document.title, newUrl.toString());
        }, 500);
      }
    }
  }, [open]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        color="warning"
        onClick={handleClick}
        aria-label="Nurse Alert"
        title="Send Alert to Other Nurses"
      >
        <WarningIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <NurseAlertPanel
          channelId={channelId}
          onClose={handleClose}
          preSelectedPatient={selectedPatient}
        />
      </Popover>
    </>
  );
};

export default MessageNurseAlertOptions;
