// components/AppointmentSlotSelector.tsx

import { Box, Button, Typography } from "@mui/material";
import React from "react";

export interface Slot {
  nurseId: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

interface Props {
  slots: Slot[];
  selected: Slot | null;
  disabled?: boolean;
  onSelect: (slot: Slot) => void;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const now = new Date();
const today = now.getDay(); // 0 (Sun) - 6 (Sat)

const formatDay = (slotDay: number): string => {
  const diff = (slotDay - 1 - today + 7) % 7;
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (slotDay < today) return `next ${dayNames[slotDay]}`;
  return dayNames[slotDay];
};

const slotKey = (slot: Slot) =>
  `${slot.dayOfWeek}-${slot.startHour}-${slot.nurseId}`;

const AppointmentSlotSelector: React.FC<Props> = ({
  slots,
  selected,
  disabled = false,
  onSelect,
}) => {
  return (
    <Box mt={2}>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        Open slots
      </Typography>
      {slots.map((slot, i) => {
        const currentKey = slotKey(slot);
        const isSelected = selected && slotKey(selected) === currentKey;

        return (
          <Box
            key={currentKey}
            mb={2}
            sx={{ pointerEvents: disabled ? "none" : "auto" }}
          >
            <Button
              fullWidth
              variant={isSelected ? "contained" : "outlined"}
              color={isSelected ? "primary" : "inherit"}
              onClick={() => onSelect(slot)}
              sx={{
                backgroundColor: isSelected ? "#2166d2" : "#eee",
                color: isSelected ? "white" : "black",
                fontWeight: isSelected ? "bold" : "normal",
                textTransform: "none",
              }}
            >
              {`${slot.startHour.toString().padStart(2, "0")}:00 on ${formatDay(slot.dayOfWeek)}`}
            </Button>
          </Box>
        );
      })}
    </Box>
  );
};

export default AppointmentSlotSelector;
