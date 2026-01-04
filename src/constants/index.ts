import { EducationLevel, AppSettings } from '../types';

export const DEFAULT_SUPABASE_URL = "https://ehzjqyprwnklavufqkbs.supabase.co";
export const DEFAULT_SUPABASE_KEY = "sb_publishable_6yXjiaHvbQWBABMqQNkg1g_qSkjZS8q";

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
