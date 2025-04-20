import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";
import IMissingPerson from "../../../models/MissingPersonReport";

export interface MissingPersonCardProps {
  person: IMissingPerson;
  /** show or hide the right‐arrow action button */
  showAction?: boolean;
  /** called when the action button is clicked */
  onActionClick?: () => void;
}

const MissingPersonCard: React.FC<MissingPersonCardProps> = ({
  person,
  showAction = true,
  onActionClick,
}) => {
  const {
    name,
    gender,
    eyeColor,
    race,
    height,
    weight,
    dateLastSeen,
    photo,
  } = person;

  // Format MM/DD/YYYY
  const formattedDate = new Date(dateLastSeen).toLocaleDateString("en-US");

  // Determine status
  // Prioritize reportStatus - if it's "closed", the person is found regardless of personStatus
  const isMissing = person.reportStatus?.toLowerCase() === "open";
  const statusLabel = isMissing ? "MISSING" : "FOUND";
  const statusColor = isMissing ? "error" : "success";

  return (
    <Card sx={{ mb: 2 }}>
      {/* Header with blue background */}
      <CardHeader
        title={name}
        titleTypographyProps={{ variant: "h6", color: "#fff" }}
        sx={{ backgroundColor: "primary.main", py: 1 }}
      />

      <CardContent sx={{ display: "flex", alignItems: "center" }}>
        {/* Avatar + status chip */}
        <Box sx={{ mr: 2, textAlign: "center" }}>
          <Avatar
            src={photo || "/images/placeholder.png"}
            sx={{ width: 64, height: 64, mb: 1 }}
          />
          <Chip
            label={statusLabel}
            size="small"
            color={statusColor}
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        {/* Details */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2">Gender: {gender}</Typography>
          <Typography variant="body2">Eye Color: {eyeColor}</Typography>
          <Typography variant="body2">Race: {race}</Typography>
          <Typography variant="body2">Height: {height}</Typography>
          <Typography variant="body2">Weight: {weight}</Typography>
          <Typography variant="body2">
            Date Last Seen: {formattedDate}
          </Typography>
        </Box>

        {/* Optional action arrow */}
        {showAction && (
          <IconButton edge="end" onClick={onActionClick}>
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
};

export default MissingPersonCard;
