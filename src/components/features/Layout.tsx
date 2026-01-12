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

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, activeView }) => (
    <header className="hidden lg:flex bg-white h-16 border-b px-8 items-center justify-between sticky top-0 z-20 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 capitalize">
            {activeView === 'search' ? 'Global Search' : activeView.replace('_', ' ')}
        </h2>

        <div className="flex-1 max-w-xl mx-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            <input
                type="text"
                placeholder="Search candidates, vacancies, skills..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:bg-white sm:text-sm transition duration-150 ease-in-out"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="flex items-center gap-4">
            {/* Add notification or user profile here if needed later */}
        </div>
    </header>
);
