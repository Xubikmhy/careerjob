import React from 'react';
import {
    X, LayoutDashboard, FileText, Users, Briefcase,
    CheckCircle2, Settings as SettingsIcon, Cloud, Menu
} from 'lucide-react';
import { AppSettings } from '../../types';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    activeView: string;
    setActiveView: (view: string) => void;
    settings: AppSettings;
    supabaseConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen, setIsSidebarOpen, activeView, setActiveView, settings, supabaseConnected
}) => (
    <>
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

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
                <img src={settings.logoUrl} className="h-12 object-contain mb-2" alt="Logo" />
                <h1 className="font-bold text-blue-700 text-center">{settings.agencyName}</h1>
            </div>
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                {[
                    { id: 'dashboard', icon: <LayoutDashboard size={18} /> },
                    { id: 'cv_studio', icon: <FileText size={18} /> },
                    { id: 'candidates', icon: <Users size={18} /> },
                    { id: 'vacancies', icon: <Briefcase size={18} /> },
                    { id: 'placements', icon: <CheckCircle2 size={18} /> },
                    { id: 'settings', icon: <SettingsIcon size={18} /> },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded capitalize transition-colors ${activeView === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        {item.icon}
                        {item.id.replace('_', ' ')}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t bg-slate-50 text-xs text-slate-500 flex items-center gap-2">
                <Cloud size={12} className={supabaseConnected ? "text-green-600" : "text-slate-400"} />
                {supabaseConnected ? "Supabase Connected" : "Not Connected"}
            </div>
        </aside>
    </>
);

interface MobileHeaderProps {
    setIsSidebarOpen: (open: boolean) => void;
    settings: AppSettings;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ setIsSidebarOpen, settings }) => (
    <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
        >
            <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
            <img src={settings.logoUrl} className="h-8 object-contain" alt="Logo" />
            <span className="font-bold text-blue-700 text-sm truncate max-w-[150px]">{settings.agencyName}</span>
        </div>
        <div className="w-10"></div>
    </header>
);
