import {
  ILanguagePreference,
  defaultLanguagePreference,
} from "../models/Profile";
import request from "./request";

// Cache map to store language preferences (will be automatically cleared after each refresh)
const languagePreferenceCache = new Map<string, ILanguagePreference>();

/**
 * Fetches language preference for a user, using cache when available
 * @param userId The ID of the user whose language preference to fetch
 * @returns The language preference for the user
 */
export const fetchLanguagePreferenceWithCache = async (userId: string) => {
  // Check if in the cache
  const cachedPreference = languagePreferenceCache.get(userId);
  if (cachedPreference) {
    // console.log("[fetchLanguagePreference] Cached, User:", userId, cachedPreference);  // debug
    return cachedPreference;
  }

  // If not in cache, fetch from API
  const { languagePreference } = await request<{
    languagePreference?: ILanguagePreference;
  }>(`/api/profiles/${userId}`);

  const preference = languagePreference || defaultLanguagePreference;
  // Store in cache
  languagePreferenceCache.set(userId, preference);
  // console.log("[fetchLanguagePreference] Newly Fetched, User:", userId, preference);
  return preference;
};

// /**
//  * Clears the language preference cache
//  */
// export const clearLanguagePreferenceCache = (): void => {
//     languagePreferenceCache.clear();
// };
