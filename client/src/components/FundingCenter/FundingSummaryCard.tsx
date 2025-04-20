import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface Props {
  totalFunds: number;
}

const FundingSummaryCard: React.FC<Props> = ({ totalFunds }) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6">Total Remaining Funds</Typography>
      <Typography variant="h4" color="primary">
        ${totalFunds.toLocaleString()}
      </Typography>
    </CardContent>
  </Card>
);

export default FundingSummaryCard;
