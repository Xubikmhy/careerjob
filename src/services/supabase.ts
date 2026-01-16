import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from "../constants";
import { Candidate, Vacancy, Placement, AppSettings } from "../types";

export const getSupabaseClient = (customUrl?: string, customKey?: string) => {
    const url = customUrl || import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('sb_url') || DEFAULT_SUPABASE_URL;
    let key = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sb_key') || DEFAULT_SUPABASE_KEY;

    if (key) {
        key = key.trim();
    }

    if (key && (key.startsWith('sb_secret') || key.includes('service_role'))) {
        console.warn("Blocked attempt to use Secret Key in browser. Please use the Anon Public Key.");
        key = "";
    }

    if (url && key) {
        try {
            return createClient(url, key);
        } catch (e) {
            console.error("Invalid Supabase URL/Key configuration");
            return null;
        }
    }
    return null;
};

export const transformers = {
    candidate: {
        fromDB: (data: any): Candidate => ({
            id: data.id,
            fullName: data.full_name,
            mobile: data.mobile,
            address: data.address,
            skills: typeof data.skills === 'string' ? data.skills : JSON.stringify(data.skills || ''),
            experience: typeof data.experience === 'string' ? data.experience : JSON.stringify(data.experience || ''),
            education: typeof data.education === 'string' ? data.education : JSON.stringify(data.education || ''),
            status: data.status,
            createdAt: data.created_at,
            cvData: data.cv_data,
            isAiEnhanced: data.is_ai_enhanced
        }),
        toDB: (data: Partial<Candidate>) => ({
            full_name: data.fullName,
            mobile: data.mobile,
            address: data.address,
            skills: data.skills,
            experience: data.experience,
            education: data.education,
            status: data.status,
            cv_data: data.cvData,
            is_ai_enhanced: data.isAiEnhanced
        })
    },
    vacancy: {
        fromDB: (data: any): Vacancy => ({
            id: data.id,
            companyName: data.company_name,
            contactPerson: data.contact_person || '',
            phone: data.phone_number || data.phone || '',
            address: data.address,
            role: data.role,
            count: data.count || data.candidates_needed || 1,
            timing: data.timing || '',
            requiredSkills: data.required_skills || '',
            salary: data.salary,
            remarks: data.remarks,
            status: data.status || (data.is_open ? 'OPEN' : 'FILLED'),
            createdAt: data.created_at
        }),
        toDB: (data: Partial<Vacancy>) => ({
            company_name: data.companyName,
            contact_person: data.contactPerson,
            phone_number: data.phone,
            address: data.address,
            role: data.role,
            count: data.count,
            timing: data.timing,
            required_skills: data.requiredSkills,
            salary: data.salary,
            remarks: data.remarks,
            status: data.status
        })
    },
    placement: {
        fromDB: (data: any): Placement => ({
            id: data.id,
            candidateId: data.candidate_id,
            companyName: data.company_name,
            jobRole: data.job_role,
            salary: data.salary,
            joiningDate: data.joining_date
        }),
        toDB: (data: Partial<Placement>) => ({
            candidate_id: data.candidateId,
            company_name: data.companyName,
            job_role: data.jobRole,
            salary: data.salary,
            joining_date: data.joiningDate
        })
    },
    settings: {
        fromDB: (data: any): AppSettings => ({
            agencyName: data.agency_name || "Career Job Solution",
            logoUrl: data.logo_url || "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
            address: data.address || "Pokhara, Nepal",
            contact: data.contact || ""
        }),
        toDB: (data: AppSettings) => ({
            agency_name: data.agencyName,
            logo_url: data.logoUrl,
            address: data.address,
            contact: data.contact
        })
    }
};
