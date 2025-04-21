import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import React from "react";
import { ILanguagePreference } from "../../models/Profile.ts";
import { SUPPORTED_LANGUAGES } from "../../utils/SupportedLanguages.ts";

interface LanguagePreferenceFieldProps {
  languagePreference: ILanguagePreference;
  onLanguagePreferenceChange: (newData: ILanguagePreference) => void;
  isReadOnly?: boolean;
}

export default function LanguagePreferenceField({
  languagePreference,
  onLanguagePreferenceChange,
  isReadOnly = false,
}: LanguagePreferenceFieldProps) {
  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selectedLanguages =
      typeof value === "string" ? value.split(",") : value;
    onLanguagePreferenceChange({
      ...languagePreference,
      languages: selectedLanguages,
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
            <MenuItem key={language.languageCode} value={language.savedName}>
              {language.displayName}
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
            <MenuItem key={language.languageCode} value={language.savedName}>
              {language.displayName}
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
