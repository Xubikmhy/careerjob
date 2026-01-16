import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import {
    Candidate, Vacancy, Placement, AppSettings,
    CandidateStatus, VacancyStatus, CVFormState
} from '../types';
import { INITIAL_SETTINGS, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, OPENROUTER_API_KEY } from '../constants';
import { getSupabaseClient, transformers } from '../services/supabase';

export const useApp = () => {
    const [activeView, setActiveView] = useState('dashboard');

    // Data State
    const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [placements, setPlacements] = useState<Placement[]>([]);

    // App State
    const [isLoading, setIsLoading] = useState(true);
    const [supabase, setSupabase] = useState<SupabaseClient | null>(getSupabaseClient());
    const [connectionError, setConnectionError] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [fetchErrorMessage, setFetchErrorMessage] = useState<string>("");

    // Selection & Modals
    const [matchingVacancyId, setMatchingVacancyId] = useState<string | null>(null);
    const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);

    // CV Studio
    const [studioCandidateId, setStudioCandidateId] = useState<string>("");
    const [showPreview, setShowPreview] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [cvForm, setCvForm] = useState<CVFormState>({
        fullName: '', mobile: '', address: '', summaryType: 'Fresher', summary: '', educations: [], experiences: [], skills: ''
    });

    // Mobile State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // UX State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('month');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return { candidates: [], vacancies: [], placements: [] };

        const lowerQuery = searchQuery.toLowerCase();

        return {
            candidates: candidates.filter(c =>
                c.fullName.toLowerCase().includes(lowerQuery) ||
                c.skills.toLowerCase().includes(lowerQuery) ||
                c.mobile.includes(lowerQuery) ||
                (c.status && c.status.toLowerCase().includes(lowerQuery))
            ),
            vacancies: vacancies.filter(v =>
                v.role.toLowerCase().includes(lowerQuery) ||
                v.companyName.toLowerCase().includes(lowerQuery) ||
                v.requiredSkills.toLowerCase().includes(lowerQuery)
            ),
            placements: placements.filter(p =>
                p.candidateId.toLowerCase().includes(lowerQuery) || // Ideally map to name, but ID search is useful
                p.companyName.toLowerCase().includes(lowerQuery) ||
                p.jobRole.toLowerCase().includes(lowerQuery)
                // Note: We can't easily search candidate Name here unless we join, 
                // but global search is usually separate sections.
                // We'll rely on candidates section for name search.
            )
        };
    }, [searchQuery, candidates, vacancies, placements]);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => setToast({ message, type }), []);

    // --- Data Fetching ---

    const fetchData = async () => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setConnectionError(false);
        setFetchErrorMessage("");

        try {
            const [candRes, vacRes, placeRes, setRes] = await Promise.all([
                supabase.from('candidates').select('*').order('created_at', { ascending: false }),
                supabase.from('vacancies').select('*').order('created_at', { ascending: false }),
                supabase.from('placements').select('*').order('joining_date', { ascending: false }),
                supabase.from('settings').select('*').maybeSingle()
            ]);

            if (candRes.error) throw new Error(`Candidates: ${candRes.error.message}`);
            if (vacRes.error) throw new Error(`Vacancies: ${vacRes.error.message}`);
            if (placeRes.error) throw new Error(`Placements: ${placeRes.error.message}`);
            if (setRes.error) throw new Error(`Settings: ${setRes.error.message}`);

            setCandidates(candRes.data ? candRes.data.map(transformers.candidate.fromDB) : []);
            setVacancies(vacRes.data ? vacRes.data.map(transformers.vacancy.fromDB) : []);
            setPlacements(placeRes.data ? placeRes.data.map(transformers.placement.fromDB) : []);

            if (setRes.data) {
                setSettings(transformers.settings.fromDB(setRes.data));
            } else {
                const { data: newSettings, error: insertError } = await supabase.from('settings').insert(transformers.settings.toDB(INITIAL_SETTINGS)).select().single();
                if (insertError) {
                    console.warn("Could not auto-create settings row. Using defaults.", insertError);
                } else if (newSettings) {
                    setSettings(transformers.settings.fromDB(newSettings));
                }
            }

        } catch (error: any) {
            console.error("Supabase Fetch Error:", error);
            setFetchErrorMessage(typeof error.message === 'string' ? error.message : "Unknown error occurred");
            setConnectionError(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Real-time Subscription for Finances/Placements
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase.channel('public:placements')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'placements' }, (payload) => {
                console.log('Real-time update received:', payload);
                // Optimally we'd just update state, but fetching fresh data is safer for relations
                // We'll re-fetch just Placements to be efficient
                supabase.from('placements').select('*').order('joining_date', { ascending: false })
                    .then(({ data }) => {
                        if (data) {
                            setPlacements(data.map(transformers.placement.fromDB));
                            showToast('Finances updated in real-time!', 'success');
                        }
                    });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [supabase]);

    // Derived Data
    const getCandidateName = useCallback((id: string) => candidates.find(c => c.id === id)?.fullName || 'Unknown', [candidates]);


    const dashboardStats = useMemo(() => {
        const filterByTime = (dateStr: string) => {
            const date = new Date(dateStr);
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (timeFilter === 'today') return date >= startOfToday;
            if (timeFilter === 'week') {
                const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= lastWeek;
            }
            if (timeFilter === 'month') {
                const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return date >= lastMonth;
            }
            return true;
        };

        return {
            newCandidates: candidates.filter(c => filterByTime(c.createdAt)).length,
            newVacancies: vacancies.filter(v => filterByTime(v.createdAt)).length,
            placementsCount: placements.filter(p => filterByTime(p.joiningDate)).length
        };
    }, [candidates, vacancies, placements, timeFilter]);

    // --- Effects ---

    useEffect(() => {
        if (studioCandidateId) {
            const candidate = candidates.find(c => c.id === studioCandidateId);
            if (candidate) {
                if (candidate.cvData) {
                    setCvForm({ ...candidate.cvData, fullName: candidate.fullName, mobile: candidate.mobile, address: candidate.address });
                } else {
                    setCvForm({
                        fullName: candidate.fullName,
                        mobile: candidate.mobile,
                        address: candidate.address,
                        email: "",
                        summaryType: candidate.experience.toLowerCase().includes('fresher') ? 'Fresher' : 'Experienced',
                        summary: "",
                        skills: candidate.skills,
                        educations: [],
                        experiences: [],
                    });
                }
            }
        }
    }, [studioCandidateId, candidates]);

    // --- CRUD Actions (Supabase) ---

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
            let error;
            if (existing) {
                const { error: updateError } = await supabase.from('settings').update(transformers.settings.toDB(settings)).eq('id', existing.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('settings').insert(transformers.settings.toDB(settings));
                error = insertError;
            }

            if (!error) {
                showToast("Settings saved successfully!");
            } else {
                throw error;
            }
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Failed to save settings", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || isSubmitting) return;
        setIsSubmitting(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const rawCandidate = {
            fullName: formData.get('fullName') as string,
            mobile: formData.get('mobile') as string,
            address: formData.get('address') as string,
            skills: formData.get('skills') as string,
            education: formData.get('education') as string,
            experience: formData.get('experience') as string,

            status: 'ACTIVE' as CandidateStatus,
            cvData: null,
            isAiEnhanced: false
        };

        try {
            const { data, error } = await supabase.from('candidates').insert(transformers.candidate.toDB(rawCandidate)).select().single();
            if (data && !error) {
                setCandidates([transformers.candidate.fromDB(data), ...candidates]);
                setIsCandidateModalOpen(false);
                showToast("Candidate added successfully!");
            } else {
                throw error;
            }
        } catch (err: any) {
            showToast(err.message || "Error adding candidate", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddVacancy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || isSubmitting) return;
        setIsSubmitting(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const rawVacancy = {
            companyName: formData.get('companyName') as string,
            contactPerson: formData.get('contactPerson') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            role: formData.get('role') as string,
            count: parseInt(formData.get('count') as string) || 1,
            timing: formData.get('timing') as string,
            requiredSkills: formData.get('requiredSkills') as string,
            salary: formData.get('salary') as string,
            remarks: formData.get('remarks') as string,
            status: 'OPEN' as VacancyStatus
        };

        try {
            const { data, error } = await supabase.from('vacancies').insert(transformers.vacancy.toDB(rawVacancy)).select().single();
            if (data && !error) {
                setVacancies([transformers.vacancy.fromDB(data), ...vacancies]);
                setIsVacancyModalOpen(false);
                showToast("Vacancy posted!");
            } else {
                throw error;
            }
        } catch (err: any) {
            showToast(err.message || "Error adding vacancy", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleVacancyStatus = async (id: string) => {
        if (!supabase) return;
        const vac = vacancies.find(v => v.id === id);
        if (!vac) return;
        const newStatus = vac.status === 'OPEN' ? 'FILLED' : 'OPEN';

        const { error } = await supabase.from('vacancies').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setVacancies(vacancies.map(v => v.id === id ? { ...v, status: newStatus } : v));
        }
    };

    const handleAddPlacement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || isSubmitting) return;
        const formData = new FormData(e.target as HTMLFormElement);
        const salary = parseFloat(formData.get('salary') as string);
        if (salary <= 0) {
            showToast("Salary must be a positive number", "error");
            return;
        }
        setIsSubmitting(true);
        const joiningDate = new Date(formData.get('joiningDate') as string);
        const rawPlacement = {
            candidateId: formData.get('candidateId') as string,
            companyName: formData.get('companyName') as string,
            jobRole: formData.get('jobRole') as string,
            salary: salary,
            joiningDate: joiningDate.toISOString()
        };

        try {
            const { data, error } = await supabase.from('placements').insert(transformers.placement.toDB(rawPlacement)).select().single();
            if (data && !error) {
                setPlacements([transformers.placement.fromDB(data), ...placements]);
                await supabase.from('candidates').update({ status: 'PLACED' }).eq('id', rawPlacement.candidateId);
                setCandidates(candidates.map(c => c.id === rawPlacement.candidateId ? { ...c, status: 'PLACED' } : c));
                setIsPlacementModalOpen(false);
                showToast("Placement recorded!");
            } else {
                throw error;
            }
        } catch (err: any) {
            showToast(err.message || "Error creating placement", "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    const saveCvData = async () => {
        if (!cvForm.fullName || !cvForm.mobile) {
            showToast("Full Name and Mobile are required", "error");
            return;
        }
        if (!supabase || isSubmitting) return;
        setIsSubmitting(true);

        try {
            if (studioCandidateId) {
                const dbData = transformers.candidate.toDB({
                    ...candidates.find(c => c.id === studioCandidateId),
                    fullName: cvForm.fullName,
                    mobile: cvForm.mobile,
                    address: cvForm.address,
                    skills: cvForm.skills,
                    cvData: cvForm
                });
                const { error } = await supabase.from('candidates').update(dbData).eq('id', studioCandidateId);
                if (!error) {
                    setCandidates(candidates.map(c => c.id === studioCandidateId ? { ...c, fullName: cvForm.fullName, mobile: cvForm.mobile, address: cvForm.address, skills: cvForm.skills, cvData: cvForm } : c));
                    showToast("Saved successfully!");
                } else {
                    throw error;
                }
            } else {
                const rawCandidate = {
                    fullName: cvForm.fullName,
                    mobile: cvForm.mobile,
                    address: cvForm.address,
                    skills: cvForm.skills,
                    experience: cvForm.experiences.map(e => `${e.role} at ${e.company}`).join(', ') || 'Fresher',
                    education: cvForm.educations.map(e => e.degree).join(', ') || 'Not Specified',

                    status: 'ACTIVE' as CandidateStatus,
                    cvData: cvForm,
                    isAiEnhanced: false
                };
                const { data, error } = await supabase.from('candidates').insert(transformers.candidate.toDB(rawCandidate)).select().single();
                if (data && !error) {
                    const newCand = transformers.candidate.fromDB(data);
                    setCandidates([newCand, ...candidates]);
                    setStudioCandidateId(newCand.id);
                    showToast("New Candidate Created & CV Saved!");
                } else {
                    throw error;
                }
            }
        } catch (err: any) {
            showToast(err.message || "Error saving CV", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- AI ---

    const handleAIEnhance = async (candidateId: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (!candidate) return;
        setGeneratingId(candidateId);
        try {
            const apiKey = (import.meta.env.VITE_OPENROUTER_API_KEY || OPENROUTER_API_KEY || "").trim();
            console.log("AI Request Key:", apiKey.substring(0, 8) + "...");
            if (!apiKey) {
                showToast("Missing OpenRouter API Key in .env", "error");
                return;
            }

            const prompt = `
                You are a world-class executive recruiter and career coach. 
                Rewrite the following candidate profile to be extremely professional, impactful, and tailored for high-end job opportunities.
                
                Candidate Name: ${candidate.fullName}
                Current Skills: ${candidate.skills}
                Current Experience: ${candidate.experience}
                
                Instructions:
                - Create a compelling, results-oriented professional headline.
                - Write a powerful 3-4 sentence professional summary focusing on value proposition.
                - Categorize and polish the skills into a clean, comma-separated list.
                - Return strictly valid JSON.

                JSON Output Format:
                {
                    "headline": "Strategic [Job Title] with [X] years of experience in [Industry]",
                    "summary": "Proven track record of...",
                    "skills": "Skill 1, Skill 2, Skill 3"
                }
            `;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin, // Required by OpenRouter
                    "X-Title": "Career Job Solution"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-exp:free",
                    "messages": [
                        { "role": "user", "content": prompt }
                    ],
                    "response_format": { "type": "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "OpenRouter API request failed");
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;

            if (text) {
                const enhanced = JSON.parse(text);
                if (supabase) {
                    await supabase.from('candidates').update({
                        is_ai_enhanced: true,
                        skills: enhanced.skills
                    }).eq('id', candidateId);
                    setCandidates(candidates.map(c => c.id === candidateId ? {
                        ...c,
                        isAiEnhanced: true,
                        skills: enhanced.skills
                    } : c));
                    showToast("Profile Enhanced with OpenRouter AI!");
                }
            }
        } catch (e: any) {
            console.error(e);
            showToast(`AI Error: ${e.message}`, "error");
        } finally {
            setGeneratingId(null);
        }
    };

    const generateCVContentWithAI = async () => {
        setIsAiGenerating(true);
        try {
            const apiKey = (import.meta.env.VITE_OPENROUTER_API_KEY || OPENROUTER_API_KEY || "").trim();
            console.log("AI Request Key:", apiKey.substring(0, 8) + "...");
            if (!apiKey) {
                showToast("Missing OpenRouter API Key in .env", "error");
                return;
            }

            const prompt = `
                You are a professional CV writer. Create an exceptional, modern, and professional CV based on the following data:
                ${JSON.stringify(cvForm)}

                Requirements:
                1. Summary: Professional, engaging, and highlighting key strengths.
                2. Experiences: Expand on responsibilities using action verbs (e.g., Led, Developed, Optimized). Focus on achievements.
                3. Skills: Organize logically and ensure technical terms are correct.
                4. Dates: Ensure YYYY-MM format.

                Return strictly valid JSON matching this schema:
                {
                    "summary": "...",
                    "experiences": [
                        {
                            "company": "...", 
                            "role": "...", 
                            "startDate": "YYYY-MM", 
                            "endDate": "YYYY-MM", 
                            "isCurrent": false, 
                            "responsibilities": "Bullet points or professional paragraph..."
                        }
                    ],
                    "skills": "Skill 1, Skill 2..."
                }
            `;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Career Job Solution"
                },
                body: JSON.stringify({
                    "model": "meta-llama/llama-3.3-70b-instruct",
                    "messages": [
                        { "role": "user", "content": prompt }
                    ],
                    "response_format": { "type": "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "OpenRouter API request failed");
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;

            if (text) {
                const res = JSON.parse(text);
                if (res.skills && typeof res.skills !== 'string') {
                    res.skills = Array.isArray(res.skills) ? res.skills.join(', ') : JSON.stringify(res.skills);
                }
                setCvForm(prev => ({ ...prev, ...res }));
                showToast("CV Polished by OpenRouter AI!");
            }
        } catch (e: any) {
            console.error(e);
            showToast(`AI Error: ${e.message}`, "error");
        } finally {
            setIsAiGenerating(false);
        }
    };

    // --- Helpers ---
    const addEducation = () => setCvForm({ ...cvForm, educations: [...cvForm.educations, { id: crypto.randomUUID(), level: 'Plus2', degree: '', board: '', year: '', marks: '', isEquivalent: false }] });
    const removeEducation = (id: string) => setCvForm({ ...cvForm, educations: cvForm.educations.filter(e => e.id !== id) });
    const updateEducation = (id: string, field: any, value: any) => setCvForm({ ...cvForm, educations: cvForm.educations.map(e => e.id === id ? { ...e, [field]: value } : e) });

    const addExperience = () => setCvForm({ ...cvForm, experiences: [...cvForm.experiences, { id: crypto.randomUUID(), company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '' }] });
    const removeExperience = (id: string) => setCvForm({ ...cvForm, experiences: cvForm.experiences.filter(e => e.id !== id) });
    const updateExperience = (id: string, field: any, value: any) => setCvForm({ ...cvForm, experiences: cvForm.experiences.map(e => e.id === id ? { ...e, [field]: value } : e) });

    const connectSupabase = (url: string, key: string) => {
        if (key && (key.startsWith('sb_secret') || key.includes('service_role'))) {
            alert("SECURITY WARNING: You entered a Secret Key. Please use the Anon Public Key.");
            return;
        }
        if (url && key) {
            localStorage.setItem('sb_url', url);
            localStorage.setItem('sb_key', key);
            setSupabase(createClient(url, key));
        }
    };

    const disconnectSupabase = () => {
        localStorage.removeItem('sb_key');
        setSupabase(null);
    };

    return {
        activeView, setActiveView,
        settings, setSettings,
        candidates, setCandidates,
        vacancies, setVacancies,
        placements, setPlacements,
        isLoading,
        supabase,
        connectionError,
        generatingId,
        fetchErrorMessage,
        matchingVacancyId, setMatchingVacancyId,
        isCandidateModalOpen, setIsCandidateModalOpen,
        isVacancyModalOpen, setIsVacancyModalOpen,
        isPlacementModalOpen, setIsPlacementModalOpen,
        studioCandidateId, setStudioCandidateId,
        showPreview, setShowPreview,
        isAiGenerating,
        cvForm, setCvForm,
        isSidebarOpen, setIsSidebarOpen,
        isSubmitting,
        timeFilter, setTimeFilter,
        toast, setToast,
        fetchData,
        getCandidateName,
        dashboardStats,
        handleUpdateSettings,
        handleAddCandidate,
        handleAddVacancy,
        toggleVacancyStatus,
        handleAddPlacement,
        saveCvData,
        handleAIEnhance,
        generateCVContentWithAI,
        addEducation, removeEducation, updateEducation,
        addExperience, removeExperience, updateExperience,
        connectSupabase, disconnectSupabase,
        searchQuery, setSearchQuery, searchResults
    };
};
