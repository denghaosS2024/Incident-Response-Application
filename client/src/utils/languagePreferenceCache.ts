import {
  ILanguagePreference,
  defaultLanguagePreference,
} from "../models/Profile";
import request from "./request";

class LanguagePreferenceCache {
  private static instance: LanguagePreferenceCache;
  private cache: Map<string, ILanguagePreference>;

  private constructor() {
    this.cache = new Map<string, ILanguagePreference>();
  }

  public static getInstance(): LanguagePreferenceCache {
    if (!LanguagePreferenceCache.instance) {
      LanguagePreferenceCache.instance = new LanguagePreferenceCache();
    }
    return LanguagePreferenceCache.instance;
  }

  public async fetchLanguagePreference(
    userId: string,
  ): Promise<ILanguagePreference> {
    // Check if in the cache
    const cachedPreference = this.cache.get(userId);
    if (cachedPreference) {
      // console.log("[fetchLanguagePreference] Cached, User:", userId, cachedPreference);
      return cachedPreference;
    }

    // If not in cache, fetch from API
    const { languagePreference } = await request<{
      languagePreference?: ILanguagePreference;
    }>(`/api/profiles/${userId}`);

    const preference = languagePreference || defaultLanguagePreference;
    // Store in cache
    this.cache.set(userId, preference);
    // console.log("[fetchLanguagePreference] Newly Fetched, User:", userId, preference);
    return preference;
  }

  // public clearCache(): void {
  //   this.cache.clear();
  // }
}

// Export a single instance
export const languagePreferenceCache = LanguagePreferenceCache.getInstance();

export const fetchLanguagePreferenceWithCache = async (userId: string) => {
  return languagePreferenceCache.fetchLanguagePreference(userId);
};
