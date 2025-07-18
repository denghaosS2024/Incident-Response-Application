import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import request from "../utils/request";
import IFundingHistory from "@/models/FundingHistory";
import FundingHistoryList from "@/components/FundingCenter/FundingHistoryList";
import SocketClient from "../utils/Socket";
import AlertSnackbar from "../components/common/AlertSnackbar";

const DirectorChatPage: React.FC = () => {
  const { city, role } = useParams<{ city: string; role: string }>();
  const [history, setHistory] = useState<IFundingHistory[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const currentRole = localStorage.getItem("role");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (role == "Fire Chief" || role == "Police Chief") {
        const res = await request(
          `/api/cities/funding-history/${city}/${role}`,
          {
            method: "GET",
          },
        );
        console.log(res);
        setHistory(res);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (amount <= 0) {
      setOpenSnackbar(true);
      setSnackbarMessage("Please Enter Postive Number");
      return;
    }
    const res = await request(`/api/cities/funding-history/${city}/${role}`, {
      method: "POST",
      body: JSON.stringify({
        amount: amount,
        reason: reason,
        type: currentRole == "City Director" ? "Assign" : "Request",
      }),
    });

    // Emit socket event when funding is assigned
    if (currentRole === "City Director") {
      SocketClient.emit("funding-assigned", {
        department: role,
        amount: amount,
      });
    }

    //console.log(res)
    if (role == "Fire Chief" && res.fireFundingHistory) {
      const updatedHistory: IFundingHistory[] = await res.fireFundingHistory;
      setHistory(updatedHistory);
    } else if (role == "Police Chief" && res.policeFundingHistory) {
      const updatedHistory: IFundingHistory[] = await res.policeFundingHistory;
      setHistory(updatedHistory);
    }
    setOpen(false);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <Box p={2} height="100vh" display="flex" flexDirection="column">
      <Box
        display={"flex"}
        sx={{ mb: 2 }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5" gutterBottom>
          Funding History
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ ml: 1 }}
          onClick={() => setOpen(true)}
        >
          {currentRole == "City Director" ? "Assign" : "Request"}
        </Button>
      </Box>
      <Box flex={1} overflow="auto" sx={{ pr: 1 }} ref={scrollRef}>
        <FundingHistoryList fundingHistory={history} />
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          New {currentRole == "City Director" ? "Assignment" : "Request"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              autoFocus
              name="amount"
              label="Amount"
              type="number"
              variant="outlined"
              fullWidth
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAmount(Number(e.target.value))
              }
              inputProps={{ min: 0 }}
            />
            <TextField
              name="reason"
              label="Reason"
              variant="outlined"
              fullWidth
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReason(e.target.value)
              }
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            sx={{
              color: "#4285F4",
              borderColor: "#e0e0e0",
              minWidth: "100px",
              borderRadius: 1,
              fontWeight: "normal",
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: "#4285F4",
              color: "white",
              minWidth: "100px",
              borderRadius: 1,
              fontWeight: "normal",
              "&:hover": {
                bgcolor: "#3367d6",
              },
            }}
          >
            SUBMIT
          </Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        severity="error"
      />
    </Box>
  );
};

export default DirectorChatPage;
