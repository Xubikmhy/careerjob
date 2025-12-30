import React, { useState, useMemo, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings as SettingsIcon,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Building2,
  DollarSign,
  Calendar,
  Lock,
  Sparkles,
  Loader2,
  ClipboardList,
  MapPin,
  Clock,
  Phone,
  PenTool,
  Trash2,
  ChevronDown,
  Download,
  GraduationCap,
  Save,
  Eye,
  ArrowLeft,
  Database,
  RefreshCw,
  CloudOff,
  Cloud,
  Menu,
  X
} from "lucide-react";

// --- Constants ---
const DEFAULT_SUPABASE_URL = "https://ehzjqyprwnklavufqkbs.supabase.co";
// Updated with the provided Public/Anon key.
const DEFAULT_SUPABASE_KEY = "sb_publishable_6yXjiaHvbQWBABMqQNkg1g_qSkjZS8q";

// --- Types & Interfaces ---

type CandidateStatus = 'ACTIVE' | 'PLACED' | 'ARCHIVED';
type PaymentStatus = 'PENDING' | 'OVERDUE' | 'PAID';
type VacancyStatus = 'OPEN' | 'FILLED';

interface AppSettings {
  agencyName: string;
  logoUrl: string;
  commissionPercent: number;
  address: string;
  contact: string;
}

// CV Studio Types
type EducationLevel = 'Masters' | 'Bachelors' | 'Plus2' | 'SEE' | 'Other';

interface EducationEntry {
  id: string;
  level: EducationLevel;
  degree: string;
  board: string;
  year: string;
  marks: string;
  isEquivalent: boolean;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
}

interface CVData {
  email?: string;
  linkedin?: string;
  github?: string;
  summaryType: 'Fresher' | 'Experienced';
  summary: string;
  educations: EducationEntry[];
  experiences: ExperienceEntry[];
  skills: string;
  languages?: string;
  certifications?: string;
  projects?: string;
  awards?: string;
}

interface Candidate {
  id: string;
  fullName: string;
  mobile: string;
  address: string;
  skills: string;
  experience: string;
  education: string;
  isRegFeePaid: boolean;
  status: CandidateStatus;
  createdAt: string;
  isAiEnhanced?: boolean;
  cvData?: CVData;
}

interface Vacancy {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  role: string;
  count: number;
  timing: string;
  requiredSkills: string;
  salary: string;
  remarks: string;
  status: VacancyStatus;
  createdAt: string;
}

interface Placement {
  id: string;
  candidateId: string;
  companyName: string;
  jobRole: string;
  salary: number;
  joiningDate: string;
  commissionAmount: number;
  commissionDueDate: string;
  paymentStatus: PaymentStatus;
}

// Extended form state
interface CVFormState extends CVData {
  fullName: string;
  mobile: string;
  address: string;
}

// --- Supabase Helpers ---

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || localStorage.getItem('sb_url') || DEFAULT_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || localStorage.getItem('sb_key') || DEFAULT_SUPABASE_KEY;

  if (key) {
    key = key.trim(); // Ensure no leading/trailing whitespace from copy-paste
  }

  // SECURITY CHECK: Strictly prevent usage of 'sb_secret' or 'service_role' keys in the browser.
  // This fixes the "Forbidden use of secret API key" error by invalidating the bad key immediately.
  if (key && (key.startsWith('sb_secret') || key.includes('service_role'))) {
    console.warn("Blocked attempt to use Secret Key in browser. Please use the Anon Public Key.");
    key = ""; // Reset to empty to trigger the connection form
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

// Transformers: DB (snake_case) <-> App (camelCase)
const transformers = {
  candidate: {
    fromDB: (data: any): Candidate => ({
      id: data.id,
      fullName: data.full_name,
      mobile: data.mobile,
      address: data.address,
      skills: typeof data.skills === 'string' ? data.skills : JSON.stringify(data.skills || ''),
      experience: data.experience || '',
      education: data.education || '',
      isRegFeePaid: data.is_reg_fee_paid,
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
      is_reg_fee_paid: data.isRegFeePaid,
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
      phone: data.phone_number || data.phone || '', // Handle both potential field names
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
      joiningDate: data.joining_date,
      commissionAmount: data.commission_amount,
      commissionDueDate: data.commission_due_date,
      paymentStatus: data.payment_status
    }),
    toDB: (data: Partial<Placement>) => ({
      candidate_id: data.candidateId,
      company_name: data.companyName,
      job_role: data.jobRole,
      salary: data.salary,
      joining_date: data.joiningDate,
      commission_amount: data.commissionAmount,
      commission_due_date: data.commissionDueDate,
      payment_status: data.paymentStatus
    })
  },
  settings: {
    fromDB: (data: any): AppSettings => ({
      agencyName: data.agency_name || "Career Job Solution",
      logoUrl: data.logo_url || "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
      commissionPercent: data.commission_percent || 30,
      address: data.address || "Pokhara, Nepal",
      contact: data.contact || ""
    }),
    toDB: (data: AppSettings) => ({
      agency_name: data.agencyName,
      logo_url: data.logoUrl,
      commission_percent: data.commissionPercent,
      address: data.address,
      contact: data.contact
    })
  }
};

// --- Initial Data Fallbacks ---
const INITIAL_SETTINGS: AppSettings = {
  agencyName: "Career Job Solution",
  logoUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
  commissionPercent: 30,
  address: "Pokhara, Nepal",
  contact: "+977 9800000000"
};

const EDUCATION_LEVEL_ORDER: Record<EducationLevel, number> = {
  "Masters": 4, "Bachelors": 3, "Plus2": 2, "SEE": 1, "Other": 0
};

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded"><X size={16} /></button>
    </div>
  );
};

const Button = ({ children, variant = 'primary', className = '', isLoading = false, ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[40px]";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    ai: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm"
  };
  return (
    <button
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Input = ({ label, className = "", ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input
      className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 ${className}`}
      {...props}
    />
  </div>
);

const TextArea = ({ label, className = "", ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <textarea
      className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      rows={4}
      {...props}
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <select
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      {...props}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Badge = ({ children, color = 'blue' }: any) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-slate-100 text-slate-800",
    purple: "bg-purple-100 text-purple-800"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color as keyof typeof colors]}`}>
      {children}
    </span>
  );
};

// --- Main Application ---

const App = () => {
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

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
      // Parallel Fetch
      // using maybeSingle() for settings prevents error if table is empty (first run)
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
        // Create default settings row if missing (first run logic)
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

  useEffect(() => {
    fetchData();
  }, [supabase]);

  // Derived Data
  const getCandidateName = (id: string) => candidates.find(c => c.id === id)?.fullName || 'Unknown';

  const upcomingCommissions = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return placements.filter(p => {
      const dueDate = new Date(p.commissionDueDate);
      return p.paymentStatus === 'PENDING' && (dueDate <= nextWeek);
    }).sort((a, b) => new Date(a.commissionDueDate).getTime() - new Date(b.commissionDueDate).getTime());
  }, [placements]);

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
      placementsCount: placements.filter(p => filterByTime(p.joiningDate)).length,
      revenue: placements.filter(p => filterByTime(p.joiningDate)).reduce((acc, p) => acc + p.commissionAmount, 0)
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
      isRegFeePaid: formData.get('isRegFeePaid') === 'on',
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
    const commissionAmount = salary * (settings.commissionPercent / 100);
    const dueDate = new Date(joiningDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const rawPlacement = {
      candidateId: formData.get('candidateId') as string,
      companyName: formData.get('companyName') as string,
      jobRole: formData.get('jobRole') as string,
      salary: salary,
      joiningDate: joiningDate.toISOString(),
      commissionAmount: commissionAmount,
      commissionDueDate: dueDate.toISOString(),
      paymentStatus: 'PENDING' as PaymentStatus
    };

    try {
      const { data, error } = await supabase.from('placements').insert(transformers.placement.toDB(rawPlacement)).select().single();
      if (data && !error) {
        setPlacements([transformers.placement.fromDB(data), ...placements]);
        // Update Candidate Status
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

  const markCommissionPaid = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('placements').update({ payment_status: 'PAID' }).eq('id', id);
    if (!error) {
      setPlacements(placements.map(p => p.id === id ? { ...p, paymentStatus: 'PAID' } : p));
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
        // Update
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
        // Create New from Studio
        const rawCandidate = {
          fullName: cvForm.fullName,
          mobile: cvForm.mobile,
          address: cvForm.address,
          skills: cvForm.skills,
          experience: cvForm.experiences.map(e => `${e.role} at ${e.company}`).join(', ') || 'Fresher',
          education: cvForm.educations.map(e => e.degree).join(', ') || 'Not Specified',
          isRegFeePaid: false,
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Rewrite candidate profile. Name: ${candidate.fullName}, Skills: ${candidate.skills}. JSON Output: { "headline": "", "summary": "", "skills": "" }`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        const enhanced = JSON.parse(response.text);
        if (supabase) {
          await supabase.from('candidates').update({ is_ai_enhanced: true }).eq('id', candidateId);
          setCandidates(candidates.map(c => c.id === candidateId ? { ...c, isAiEnhanced: true } : c));
        }
      }
    } catch (e) { console.error(e); } finally { setGeneratingId(null); }
  };

  const generateCVContentWithAI = async () => {
    setIsAiGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Professional CV Structure for: ${JSON.stringify(cvForm)}. Return valid JSON matching schema: { "summary": "", "experiences": [{"company": "", "role": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "isCurrent": false, "responsibilities": ""}], "skills": "" }`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        const res = JSON.parse(response.text);
        // Ensure skills is a string if AI returns an array or object
        if (res.skills && typeof res.skills !== 'string') {
          res.skills = Array.isArray(res.skills) ? res.skills.join(', ') : JSON.stringify(res.skills);
        }
        setCvForm(prev => ({ ...prev, ...res }));
        alert("Polished!");
      }
    } catch (e) { alert("AI Error"); } finally { setIsAiGenerating(false); }
  };

  // --- Helpers ---
  const addEducation = () => setCvForm({ ...cvForm, educations: [...cvForm.educations, { id: crypto.randomUUID(), level: 'Plus2', degree: '', board: '', year: '', marks: '', isEquivalent: false }] });
  const removeEducation = (id: string) => setCvForm({ ...cvForm, educations: cvForm.educations.filter(e => e.id !== id) });
  const updateEducation = (id: string, field: any, value: any) => setCvForm({ ...cvForm, educations: cvForm.educations.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const addExperience = () => setCvForm({ ...cvForm, experiences: [...cvForm.experiences, { id: crypto.randomUUID(), company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '' }] });
  const removeExperience = (id: string) => setCvForm({ ...cvForm, experiences: cvForm.experiences.filter(e => e.id !== id) });
  const updateExperience = (id: string, field: any, value: any) => setCvForm({ ...cvForm, experiences: cvForm.experiences.map(e => e.id === id ? { ...e, [field]: value } : e) });

  // --- Sub-Renderers ---

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Connect to Database</h1>
          <p className="text-slate-500 mb-6">To use the Production Backend, please provide your Supabase Project details.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const url = formData.get('url') as string;
            const key = formData.get('key') as string;

            // VALIDATION: Prevent user from entering secret key manually
            if (key && (key.startsWith('sb_secret') || key.includes('service_role'))) {
              alert("SECURITY WARNING: You entered a Secret Key (starts with sb_secret). This is forbidden in the browser. Please use the Anon Public Key (starts with ey...) from Supabase Settings > API.");
              return;
            }

            if (url && key) {
              localStorage.setItem('sb_url', url);
              localStorage.setItem('sb_key', key);
              setSupabase(createClient(url, key));
            }
          }}>
            <Input name="url" placeholder="Project URL (https://xyz.supabase.co)" required defaultValue={DEFAULT_SUPABASE_URL} />
            <Input name="key" placeholder="Anon Public Key (starts with ey...)" required />
            <Button type="submit" className="w-full">Connect Supabase</Button>
          </form>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading Agency Data...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 max-w-md text-center">
          <CloudOff size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Failed</h2>
          <p className="text-slate-600 mb-6">Could not fetch data from Supabase.</p>
          {fetchErrorMessage && <p className="text-xs text-red-500 bg-red-50 p-2 rounded mb-4 font-mono break-all">{fetchErrorMessage}</p>}
          {fetchErrorMessage.includes("secret API key") && (
            <p className="text-sm text-red-600 font-bold mb-4 bg-red-50 p-2 rounded">
              You are using a Secret/Service_Role key. <br />Please use the public 'Anon' key found in Supabase Settings {'>'} API.
            </p>
          )}
          <p className="text-sm text-slate-500 mb-6">Common reasons: Tables not created (run SQL), invalid API key, or network issue.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => fetchData()}>Retry</Button>
            <Button variant="secondary" onClick={() => { localStorage.removeItem('sb_key'); setSupabase(null); }}>Change Key</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Reuse previous render logic with updated state hooks...

  const renderDashboard = () => {
    // Advanced Calculations
    const totalRevenue = placements
      .filter(p => p.paymentStatus === 'PAID')
      .reduce((acc, p) => acc + p.commissionAmount, 0);

    const pendingRevenue = placements
      .filter(p => p.paymentStatus === 'PENDING')
      .reduce((acc, p) => acc + p.commissionAmount, 0);

    const placementSuccessRate = candidates.length > 0
      ? Math.round((candidates.filter(c => c.status === 'PLACED').length / candidates.length) * 100)
      : 0;

    const recentActivity = [
      ...candidates.slice(0, 3).map(c => ({ type: 'candidate', title: `New Candidate: ${c.fullName}`, date: c.createdAt })),
      ...placements.slice(0, 3).map(p => ({ type: 'placement', title: `Placement: ${getCandidateName(p.candidateId)} at ${p.companyName}`, date: p.joiningDate })),
      ...vacancies.slice(0, 3).map(v => ({ type: 'vacancy', title: `New Vacancy: ${v.role} at ${v.companyName}`, date: v.createdAt }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-sm text-slate-500">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => fetchData()}><RefreshCw size={16} /> Refresh</Button>
            <Button onClick={() => setIsCandidateModalOpen(true)}><Plus size={16} /> Quick Add</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-xl shadow-sm"><Users size={24} /></div>
              <div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Talent</div>
                <div className="text-2xl font-bold text-slate-900">{candidates.length}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-green-600 font-bold">{placementSuccessRate}%</span> placement rate
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-white border-orange-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 text-white rounded-xl shadow-sm"><Briefcase size={24} /></div>
              <div>
                <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Open Roles</div>
                <div className="text-2xl font-bold text-slate-900">{vacancies.filter(v => v.status === 'OPEN').length}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              Across <span className="font-bold">{new Set(vacancies.map(v => v.companyName)).size}</span> companies
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 text-white rounded-xl shadow-sm"><DollarSign size={24} /></div>
              <div>
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Revenue</div>
                <div className="text-2xl font-bold text-slate-900">NPR {totalRevenue.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              From <span className="font-bold">{placements.filter(p => p.paymentStatus === 'PAID').length}</span> collections
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-white border-yellow-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500 text-white rounded-xl shadow-sm"><Clock size={24} /></div>
              <div>
                <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Pending</div>
                <div className="text-2xl font-bold text-slate-900">NPR {pendingRevenue.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-yellow-600 font-bold">{upcomingCommissions.length}</span> reaching due date soon
            </div>
          </Card>
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Performance Visualization Section */}
            <Card className="p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Performance Insights</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(['today', 'week', 'month'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${timeFilter === f ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {f === 'today' ? 'Today' : f === 'week' ? 'Weekly' : 'Monthly'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  {[
                    { label: 'Talent Acquisition', value: dashboardStats.newCandidates, total: candidates.length, color: 'blue' },
                    { label: 'Market Demand', value: dashboardStats.newVacancies, total: vacancies.length, color: 'orange' },
                    { label: 'Success Closures', value: dashboardStats.placementsCount, total: placements.length, color: 'green' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-tight text-slate-500">
                        <span>{item.label}</span>
                        <span className={`text-${item.color}-600`}>{item.value} / {item.total}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${item.color}-500 transition-all duration-1000 ease-out`}
                          style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 relative overflow-hidden group">
                  <div className="absolute top-[-20px] right-[-20px] p-10 bg-blue-200/20 rounded-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="relative z-10 text-center">
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Period Revenue</div>
                    <div className="text-3xl font-black text-blue-900 mb-2">NPR {dashboardStats.revenue.toLocaleString()}</div>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm">
                      <Sparkles size={12} />
                      Target Optimized
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Briefcase className="text-blue-500" size={20} /> Latest Vacancies</h3>
                  <Button variant="secondary" className="text-xs h-8" onClick={() => setActiveView('vacancies')}>View All</Button>
                </div>
                <div className="space-y-3 flex-1">
                  {vacancies.slice(0, 5).map(v => (
                    <div key={v.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                      <div>
                        <div className="font-bold text-sm">{v.role}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{v.companyName}</div>
                      </div>
                      <Badge color={v.status === 'OPEN' ? 'green' : 'gray'}>{v.status}</Badge>
                    </div>
                  ))}
                  {vacancies.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No vacancies posted yet</div>}
                </div>
              </Card>

              <Card className="p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><AlertCircle className="text-yellow-500" size={20} /> Due Payments</h3>
                  <Button variant="secondary" className="text-xs h-8" onClick={() => setActiveView('placements')}>History</Button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase border-b font-bold tracking-wider">
                      <tr><th className="py-2 px-3">Company</th><th className="py-2 px-3 text-right">Amount</th><th className="py-2 px-3 text-right">Due Date</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {upcomingCommissions.slice(0, 5).map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-700">{p.companyName}</div>
                            <div className="text-[10px] text-slate-400">{getCandidateName(p.candidateId)}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">NPR {p.commissionAmount.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-xs">
                            <span className={new Date(p.commissionDueDate) < new Date() ? 'text-red-500 font-bold' : 'text-slate-500'}>
                              {new Date(p.commissionDueDate).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {upcomingCommissions.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-8 text-slate-400 text-sm">No pending payments</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <Card className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 border-b pb-4">
                <Sparkles className="text-indigo-500" size={20} /> Recent Activity
              </h3>
              <div className="relative flex-1">
                <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-slate-100"></div>
                <div className="space-y-6 relative">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0 ${activity.type === 'candidate' ? 'bg-blue-500' :
                        activity.type === 'placement' ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                        {activity.type === 'candidate' ? <Users size={12} className="text-white" /> :
                          activity.type === 'placement' ? <CheckCircle2 size={12} className="text-white" /> : <Briefcase size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <div className="text-sm font-medium text-slate-800 leading-tight">{activity.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono uppercase">
                          <Clock size={10} /> {new Date(activity.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                      <LayoutDashboard size={40} className="mb-4 opacity-20" />
                      <span className="text-sm">No activity recorded</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    );
  };

  const renderCandidates = () => (
    <div className="space-y-6">
      <div className="flex justify-between"><h2 className="text-2xl font-bold">Candidates</h2><Button onClick={() => setIsCandidateModalOpen(true)}><Plus size={16} /> Add Candidate</Button></div>
      <Card><div className="overflow-x-auto w-full"><table className="w-full text-sm text-left min-w-[600px]"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Mobile</th><th className="p-4">Skills</th><th className="p-4">Fee</th><th className="p-4">Action</th></tr></thead>
        <tbody className="divide-y">{candidates.map(c => (<tr key={c.id}><td className="p-4 font-medium">{c.fullName}</td><td className="p-4 text-slate-600">{c.mobile}</td><td className="p-4 max-w-xs truncate text-slate-600">{c.skills}</td><td className="p-4"><Badge color={c.isRegFeePaid ? 'green' : 'red'}>{c.isRegFeePaid ? 'Paid' : 'Unpaid'}</Badge></td>
          <td className="p-4 whitespace-nowrap"><Button variant="secondary" className="text-xs py-1" onClick={() => { setStudioCandidateId(c.id); setShowPreview(false); setActiveView('cv_studio'); }}>Edit CV</Button></td></tr>))}</tbody></table></div></Card>
      {isCandidateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Candidate</h3>
            <form onSubmit={handleAddCandidate}>
              <div className="grid grid-cols-2 gap-4"><Input name="fullName" label="Name" required /><Input name="mobile" label="Mobile" required /></div>
              <Input name="address" label="Address" required />
              <TextArea name="skills" label="Skills" required />
              <TextArea name="experience" label="Experience" required />
              <TextArea name="education" label="Education" required />
              <div className="mb-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isRegFeePaid" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" /> Reg Fee Paid?</label></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setIsCandidateModalOpen(false)}>Cancel</Button><Button type="submit" isLoading={isSubmitting}>Save</Button></div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );

  const renderVacancies = () => (
    <div className="space-y-6">
      <div className="flex justify-between"><h2 className="text-2xl font-bold">Vacancies</h2><Button onClick={() => setIsVacancyModalOpen(true)}><Plus size={16} /> Add</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{vacancies.map(v => (
        <Card key={v.id} className="flex flex-col"><div className="p-5 flex-1"><h3 className="font-bold">{v.role}</h3><div className="text-sm text-blue-600 mb-2">{v.companyName}</div><div className="text-xs text-slate-500 space-y-1"><div>Salary: {v.salary}</div><div>Count: {v.count}</div></div></div>
          <div className="p-4 bg-slate-50 border-t flex gap-2"><Button className="flex-1 text-xs" onClick={() => setMatchingVacancyId(v.id)} disabled={v.status !== 'OPEN'}>Match</Button><Button variant="secondary" className="text-xs" onClick={() => toggleVacancyStatus(v.id)}>{v.status}</Button></div></Card>
      ))}</div>
      {isVacancyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">New Vacancy</h3>
            <form onSubmit={handleAddVacancy}>
              <div className="grid grid-cols-2 gap-4">
                <Input name="companyName" label="Company" required />
                <Input name="contactPerson" label="Contact Person" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input name="phone" label="Phone" />
                <Input name="address" label="Address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input name="role" label="Role" required />
                <Input name="count" label="Count" type="number" defaultValue={1} />
              </div>
              <Input name="timing" label="Timing" placeholder="e.g. Full-time, 9am-5pm" />
              <TextArea name="requiredSkills" label="Required Skills" placeholder="List key skills..." />
              <Input name="salary" label="Salary" />
              <TextArea name="remarks" label="Remarks" />
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsVacancyModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Post</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {matchingVacancyId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4"><h3 className="font-bold">Matches</h3><XCircle className="cursor-pointer" onClick={() => setMatchingVacancyId(null)} /></div>
            <div className="grid grid-cols-2 gap-4">{candidates.filter(c => c.status === 'ACTIVE').map(c => (<div key={c.id} className="p-3 border rounded flex justify-between"><div><div className="font-bold">{c.fullName}</div><div className="text-xs">{c.skills}</div></div><Button variant="secondary" className="text-xs" onClick={() => { setStudioCandidateId(c.id); setMatchingVacancyId(null); setActiveView('cv_studio'); }}>CV</Button></div>))}</div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderPlacements = () => (
    <div className="space-y-6">
      <div className="flex justify-between"><h2 className="text-2xl font-bold">Placements</h2><Button onClick={() => setIsPlacementModalOpen(true)}><Plus size={16} /> New</Button></div>
      <Card><div className="overflow-x-auto w-full"><table className="w-full text-sm text-left min-w-[700px]"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Candidate</th><th className="p-4">Company</th><th className="p-4">Commission</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
        <tbody className="divide-y">{placements.map(p => (<tr key={p.id}><td className="p-4 font-medium">{getCandidateName(p.candidateId)}</td><td className="p-4 text-slate-600">{p.companyName}</td><td className="p-4 text-slate-600 font-mono">NPR {p.commissionAmount.toLocaleString()}</td><td className="p-4"><Badge color={p.paymentStatus === 'PAID' ? 'green' : 'yellow'}>{p.paymentStatus}</Badge></td><td className="p-4">{p.paymentStatus !== 'PAID' && <Button variant="secondary" className="text-xs" onClick={() => markCommissionPaid(p.id)}>Mark Paid</Button>}</td></tr>))}</tbody></table></div></Card>
      {isPlacementModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><Card className="w-full max-w-lg p-6"><h3 className="text-xl font-bold mb-4">New Placement</h3><form onSubmit={handleAddPlacement}><Select name="candidateId" label="Candidate" options={candidates.map(c => ({ value: c.id, label: c.fullName }))} required /><Input name="companyName" label="Company" required /><Input name="salary" type="number" step="0.01" label="Salary" required /><Input name="joiningDate" type="date" label="Date" required /><div className="flex justify-end gap-2 mt-4"><Button type="button" variant="secondary" onClick={() => setIsPlacementModalOpen(false)}>Cancel</Button><Button type="submit" isLoading={isSubmitting}>Save</Button></div></form></Card></div>)}
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <Card className="p-6">
        <form onSubmit={handleUpdateSettings}>
          <div className="flex justify-center mb-6"><img src={settings.logoUrl} className="h-24 w-24 object-contain border rounded p-2" /></div>
          <Input label="Agency Name" value={settings.agencyName} onChange={(e: any) => setSettings({ ...settings, agencyName: e.target.value })} />
          <Input label="Logo URL" value={settings.logoUrl} onChange={(e: any) => setSettings({ ...settings, logoUrl: e.target.value })} />
          <Input label="Commission %" type="number" value={settings.commissionPercent} onChange={(e: any) => setSettings({ ...settings, commissionPercent: parseFloat(e.target.value) })} />
          <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>Save Settings</Button>
        </form>
      </Card>
    </div>
  );

  const renderCVStudio = () => {
    // Reuse existing CV Studio render logic, just ensuring it uses the Supabase state `cvForm` and `studioCandidateId`
    const sortedEducation = [...cvForm.educations].sort((a, b) => EDUCATION_LEVEL_ORDER[b.level] - EDUCATION_LEVEL_ORDER[a.level]);
    const editingCandidate = studioCandidateId ? candidates.find(c => c.id === studioCandidateId) : null;
    const isFeePaid = editingCandidate ? editingCandidate.isRegFeePaid : false;

    if (showPreview) {
      return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
          <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-20">
            <div className="flex items-center gap-4"><Button variant="secondary" onClick={() => setShowPreview(false)}><ArrowLeft size={16} /> Edit</Button><span className="text-slate-500 text-sm">Print Preview</span></div>
            {editingCandidate && !isFeePaid ? <div className="text-red-600 flex gap-2 items-center"><Lock size={16} /> Fee Pending</div> : <Button onClick={() => window.print()}><Printer size={16} /> Print PDF</Button>}
          </div>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div id="cv-print-area" className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] relative text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><img src={settings.logoUrl} className="w-[400px] opacity-[0.08] grayscale" /></div>
              <div className="relative z-10">
                <div className="border-b-2 border-blue-900 pb-4 mb-6"><h1 className="text-3xl font-bold text-blue-900 uppercase">{cvForm.fullName}</h1><div className="text-sm">{cvForm.address} | {cvForm.mobile} | {cvForm.email}</div></div>
                {cvForm.summary && <div className="mb-6"><h2 className="font-bold text-blue-900 border-b mb-2">SUMMARY</h2><p className="text-justify">{cvForm.summary}</p></div>}
                {cvForm.experiences.length > 0 && (
                  <div className="mb-6">
                    <h2 className="font-bold text-blue-900 border-b mb-2 uppercase tracking-wide">EXPERIENCE</h2>
                    {cvForm.experiences.map(e => (
                      <div key={e.id} className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="font-bold text-slate-900">{e.role}</div>
                          <div className="text-xs text-slate-600 font-semibold">{e.startDate} — {e.isCurrent ? 'Present' : e.endDate}</div>
                        </div>
                        <div className="text-sm italic text-slate-700 mb-1">{e.company}</div>
                        <p className="text-sm leading-relaxed text-slate-800">{e.responsibilities}</p>
                      </div>
                    ))}
                  </div>
                )}
                {sortedEducation.length > 0 && <div className="mb-6"><h2 className="font-bold text-blue-900 border-b mb-2">EDUCATION</h2>{sortedEducation.map(e => (<div key={e.id} className="flex justify-between text-sm"><div><span className="font-bold">{e.degree}</span> ({e.level})</div><div>{e.board}, {e.year}</div></div>))}</div>}
                {cvForm.skills && <div className="mb-6"><h2 className="font-bold text-blue-900 border-b mb-2">SKILLS</h2><p>{cvForm.skills}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50 flex flex-col">
        <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex-1 max-w-md"><select className="w-full px-3 py-2 border rounded" value={studioCandidateId} onChange={(e) => setStudioCandidateId(e.target.value)}><option value="">-- New --</option>{candidates.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select></div>
          <div className="flex gap-2"><Button variant="ai" onClick={generateCVContentWithAI} disabled={isAiGenerating}><Sparkles size={16} /> Auto-Polish</Button><Button onClick={saveCvData} variant="secondary"><Save size={16} /> Save</Button><Button onClick={() => setShowPreview(true)}><Eye size={16} /> Preview</Button></div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded">
            <h2 className="text-xl font-bold mb-6">Editor</h2>
            <div className="grid grid-cols-2 gap-4 mb-4"><Input label="Name" value={cvForm.fullName} onChange={(e: any) => setCvForm({ ...cvForm, fullName: e.target.value })} /><Input label="Mobile" value={cvForm.mobile} onChange={(e: any) => setCvForm({ ...cvForm, mobile: e.target.value })} /></div>
            <Input label="Address" value={cvForm.address} onChange={(e: any) => setCvForm({ ...cvForm, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-4 mb-4"><Input label="Email" value={cvForm.email || ''} onChange={(e: any) => setCvForm({ ...cvForm, email: e.target.value })} /><Input label="LinkedIn" value={cvForm.linkedin || ''} onChange={(e: any) => setCvForm({ ...cvForm, linkedin: e.target.value })} /></div>
            <TextArea label="Summary" value={cvForm.summary} onChange={(e: any) => setCvForm({ ...cvForm, summary: e.target.value })} />
            <div className="mb-4 font-bold border-b">Experience <Button className="inline text-xs" variant="secondary" onClick={addExperience}>+</Button></div>
            {cvForm.experiences.map(e => (
              <div key={e.id} className="p-4 border rounded mb-2 relative">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input value={e.company} onChange={(ev: any) => updateExperience(e.id, 'company', ev.target.value)} placeholder="Company" />
                  <Input value={e.role} onChange={(ev: any) => updateExperience(e.id, 'role', ev.target.value)} placeholder="Role" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <Input type="month" label="Start Date" value={e.startDate} onChange={(ev: any) => updateExperience(e.id, 'startDate', ev.target.value)} />
                  <div className="flex flex-col">
                    <Input
                      type="month"
                      label="End Date"
                      value={e.isCurrent ? '' : e.endDate}
                      disabled={e.isCurrent}
                      onChange={(ev: any) => updateExperience(e.id, 'endDate', ev.target.value)}
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-500 mt-[-10px]">
                      <input
                        type="checkbox"
                        checked={e.isCurrent}
                        onChange={(ev) => updateExperience(e.id, 'isCurrent', ev.target.checked)}
                      />
                      Currently Working Here
                    </label>
                  </div>
                </div>
                <TextArea value={e.responsibilities} onChange={(ev: any) => updateExperience(e.id, 'responsibilities', ev.target.value)} placeholder="Responsibilities" />
                <Button variant="danger" className="text-xs mt-2" onClick={() => removeExperience(e.id)}>Remove</Button>
              </div>
            ))}
            <div className="mb-4 mt-6 font-bold border-b">Education <Button className="inline text-xs" variant="secondary" onClick={addEducation}>+</Button></div>
            {cvForm.educations.map(e => (<div key={e.id} className="p-4 border rounded mb-2"><div className="grid grid-cols-3 gap-2"><Input value={e.degree} onChange={(ev: any) => updateEducation(e.id, 'degree', ev.target.value)} placeholder="Degree" /><Input value={e.board} onChange={(ev: any) => updateEducation(e.id, 'board', ev.target.value)} placeholder="Board" /><Input value={e.year} onChange={(ev: any) => updateEducation(e.id, 'year', ev.target.value)} placeholder="Year" /></div><Button variant="danger" className="text-xs mt-2" onClick={() => removeEducation(e.id)}>Remove</Button></div>))}
            <TextArea label="Skills" value={cvForm.skills} onChange={(e: any) => setCvForm({ ...cvForm, skills: e.target.value })} className="mt-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r fixed h-full z-30 flex flex-col transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
        <div className="p-6 border-b flex flex-col items-center relative">
          <button
            className="absolute right-4 top-4 lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
          <img src={settings.logoUrl} className="h-12 object-contain mb-2" />
          <h1 className="font-bold text-blue-700 text-center">{settings.agencyName}</h1>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {['dashboard', 'cv_studio', 'candidates', 'vacancies', 'placements', 'settings'].map(v => (
            <button
              key={v}
              onClick={() => { setActiveView(v); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded capitalize transition-colors ${activeView === v ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {v === 'dashboard' && <LayoutDashboard size={18} />}
              {v === 'cv_studio' && <FileText size={18} />}
              {v === 'candidates' && <Users size={18} />}
              {v === 'vacancies' && <Briefcase size={18} />}
              {v === 'placements' && <CheckCircle2 size={18} />}
              {v === 'settings' && <SettingsIcon size={18} />}
              {v.replace('_', ' ')}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t bg-slate-50 text-xs text-slate-500 flex items-center gap-2">
          <Cloud size={12} className="text-green-600" /> Supabase Connected
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <img src={settings.logoUrl} className="h-8 object-contain" />
            <span className="font-bold text-blue-700 text-sm truncate max-w-[150px]">{settings.agencyName}</span>
          </div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'candidates' && renderCandidates()}
          {activeView === 'vacancies' && renderVacancies()}
          {activeView === 'placements' && renderPlacements()}
          {activeView === 'settings' && renderSettings()}
          {activeView === 'cv_studio' && renderCVStudio()}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);