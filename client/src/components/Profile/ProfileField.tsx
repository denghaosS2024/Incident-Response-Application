import React from "react";
import { TextField } from "@mui/material";

interface ProfileFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string; 
}

export default function ProfileField({ label, value, onChange, error = false, helperText = "" }: ProfileFieldProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      variant="outlined"
      fullWidth
      margin="normal"
      error={error} 
      helperText={helperText} 
    />
  );
}