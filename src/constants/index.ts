import { EducationLevel, AppSettings } from '../types';

// Supabase credentials should be provided via environment variables (.env file)
// or through the Settings UI. No default credentials for security.
export const DEFAULT_SUPABASE_URL = "";
export const DEFAULT_SUPABASE_KEY = "";

export const INITIAL_SETTINGS: AppSettings = {
    agencyName: "Career Job Solution",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
    commissionPercent: 30,
    address: "Pokhara, Nepal",
    contact: "+977 9800000000"
};

export const EDUCATION_LEVEL_ORDER: Record<EducationLevel, number> = {
    "Masters": 4, "Bachelors": 3, "Plus2": 2, "SEE": 1, "Other": 0
};
