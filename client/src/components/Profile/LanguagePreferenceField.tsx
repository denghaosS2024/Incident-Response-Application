import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { ILanguagePreference } from "../../models/Profile.ts";
import React from "react";

interface LanguagePreferenceFieldProps {
  languagePreference: ILanguagePreference;
  onLanguagePreferenceChange: (newData: ILanguagePreference) => void;
  isReadOnly?: boolean;
}

// List of common languages - can be updated based on actual supported languages
const SUPPORTED_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Portuguese",
  "Italian",
  "Hindi",
];

export default function LanguagePreferenceField({
  languagePreference,
  onLanguagePreferenceChange,
  isReadOnly = false,
}: LanguagePreferenceFieldProps) {
  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onLanguagePreferenceChange({
      ...languagePreference,
      languages: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleTranslateTargetChange = (event: SelectChangeEvent) => {
    onLanguagePreferenceChange({
      ...languagePreference,
      translateTarget: event.target.value,
    });
  };

  const handleAutoTranslateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onLanguagePreferenceChange({
      ...languagePreference,
      autoTranslate: event.target.checked,
    });
  };

  return (
    <>
      <h2>Language Preferences</h2>

      {/* Translate To (Single Select) */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="translate-target-label">
          Primary Language (Translate To This Language)
        </InputLabel>
        <Select
          labelId="translate-target-label"
          value={languagePreference.translateTarget}
          onChange={handleTranslateTargetChange}
          label="Primary Language (Translate To This Language)"
          disabled={isReadOnly}
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <MenuItem key={language} value={language}>
              {language}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Languages (Multiple Select) */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="languages-label">Languages You Know</InputLabel>
        <Select
          labelId="languages-label"
          multiple
          value={languagePreference.languages}
          onChange={handleLanguagesChange}
          label="Languages You Know"
          disabled={isReadOnly}
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <MenuItem key={language} value={language}>
              {language}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Auto Translate Switch */}
      <FormControlLabel
        control={
          <Switch
            checked={languagePreference.autoTranslate}
            onChange={handleAutoTranslateChange}
            disabled={isReadOnly}
          />
        }
        label="Auto-translate in Chat"
      />
    </>
  );
}
