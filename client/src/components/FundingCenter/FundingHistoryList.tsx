import React from "react";
import { Stack, Typography, Box, Paper, useTheme, Chip } from "@mui/material";
import IFundingHistory from "@/models/FundingHistory";
import getRoleIcon from "../common/RoleIcon";
import styles from "../../styles/Message.module.css";

interface Props {
  fundingHistory: IFundingHistory[];
}

const FundingHistoryList: React.FC<Props> = ({ fundingHistory }) => {
  const theme = useTheme();
  const getCardStyle = (type: string) => {
    const borderClr =
      type === "Request" ? theme.palette.grey[600] : theme.palette.primary.main;

    return {
      backgroundColor: "transparent",
      borderTop: `1px solid ${borderClr}`,
    };
  };
  return (
    <Stack spacing={2}>
      {fundingHistory.map((record, idx) => (
        <Paper
          key={idx}
          elevation={0}
          sx={{
            ...getCardStyle(record.type),
            borderRadius: 1,
            p: 1,
            mb: 1,
          }}
        >
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            {getRoleIcon(record.sender.role)}
            <Typography variant="body1" className={styles.name} sx={{ ml: 1 }}>
              {record.sender.username}
            </Typography>
            <Typography
              variant="caption"
              className={styles.timestamp}
              sx={{ ml: 1 }}
            >
              {record.timestamp}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={record.type}
              size="small"
              color={record.type === "Assign" ? "primary" : "default"}
              sx={{ fontWeight: 600 }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color:
                  record.type === "Assign" ? "primary.main" : "default.main",
              }}
            >
              {record.type === "Assign"
                ? `+$${Math.abs(record.amount).toLocaleString()}`
                : `-$${Math.abs(record.amount).toLocaleString()}`}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {record.reason}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};

export default FundingHistoryList;
