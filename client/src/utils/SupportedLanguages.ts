export interface ISupportedLanguage {
  displayName: string; // Displayed in UI
  languageCode: string; // Two-letter language code
  savedName: string; // Saved name in DB
}

// List of common languages - can be updated based on actual supported languages
export const SUPPORTED_LANGUAGES: ISupportedLanguage[] = [
  { displayName: "English", languageCode: "en", savedName: "en" },
  { displayName: "Chinese", languageCode: "zh", savedName: "zh" },
  { displayName: "Japanese", languageCode: "ja", savedName: "ja" },
  { displayName: "Korean", languageCode: "ko", savedName: "ko" },
  { displayName: "French", languageCode: "fr", savedName: "fr" },
  { displayName: "German", languageCode: "de", savedName: "de" },
  { displayName: "Spanish", languageCode: "es", savedName: "es" },
  { displayName: "Arabic", languageCode: "ar", savedName: "ar" },
  { displayName: "Russian", languageCode: "ru", savedName: "ru" },
  { displayName: "Portuguese", languageCode: "pt", savedName: "pt" },
  { displayName: "Italian", languageCode: "it", savedName: "it" },
  { displayName: "Hindi", languageCode: "hi", savedName: "hi" },
];

const SAVED_NAMED_TO_DISPLAY_NAME: Map<string, string> = new Map(
  SUPPORTED_LANGUAGES.map((lang) => [lang.savedName, lang.displayName]),
);

export function convertSavedNamesToDisplayNames(
  savedNames: string[],
): string[] {
  return savedNames.map((savedName) => {
    const displayName = SAVED_NAMED_TO_DISPLAY_NAME.get(savedName);
    return displayName || savedName;
  });
}
