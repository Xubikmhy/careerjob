import { EducationLevel, AppSettings } from '../types';

// Supabase credentials should be provided via environment variables (.env file)
// or through the Settings UI. No default credentials for security.
export const DEFAULT_SUPABASE_URL = "";
export const DEFAULT_SUPABASE_KEY = "";

// Fallback Key as per user request
export const OPENROUTER_API_KEY = "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";

export const INITIAL_SETTINGS: AppSettings = {
    agencyName: "Career Job Solution",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",

    address: "Pokhara, Nepal",
    contact: "+977 9800000000"
};

export const EDUCATION_LEVEL_ORDER: Record<EducationLevel, number> = {
    "Masters": 4, "Bachelors": 3, "Plus2": 2, "SEE": 1, "Other": 0
};
