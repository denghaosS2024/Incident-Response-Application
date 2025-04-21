import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import request from "../../utils/request";

interface Props {
  totalFunds: number;
  role: string;
  cityName: string;
}

const FundingSummaryCard: React.FC<Props> = ({
  totalFunds,
  role,
  cityName,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [fund, setFunds] = useState<number>(totalFunds);
  console.log(totalFunds);

  useEffect(() => {
    setFunds(totalFunds);
  }, [totalFunds]);

  const handleSubmit = async () => {
    const res = await request(`/api/cities/remaining-funding/${cityName}`, {
      method: "POST",
      body: JSON.stringify({
        amount: amount,
      }),
    });
    if (res.remainingFunding) {
      setFunds(res.remainingFunding);
    }
    setOpen(false);
  };
  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display={"flex"}
            sx={{ mb: 2 }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Total Remaining Funds</Typography>
            {role == "City Director" && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpen(true)}
                sx={{ ml: 1 }}
              >
                Edit
              </Button>
            )}
          </Box>
          <Typography variant="h4" color="primary">
            ${fund.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Update Remaining Funding</DialogTitle>
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
    </Box>
  );
};

export default FundingSummaryCard;
