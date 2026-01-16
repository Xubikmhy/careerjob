import React from 'react';
import {
    Users, Briefcase, DollarSign, Clock, RefreshCw, Plus,
    Sparkles, AlertCircle, LayoutDashboard, CheckCircle2
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface DashboardProps {
    candidates: any[];
    vacancies: any[];
    placements: any[];
    dashboardStats: any;
    timeFilter: string;
    setTimeFilter: (filter: 'today' | 'week' | 'month') => void;
    fetchData: () => void;
    setIsCandidateModalOpen: (open: boolean) => void;
    setActiveView: (view: string) => void;
    getCandidateName: (id: string) => string;
    upcomingCommissions: any[]; // Deprecated, but keeping for prop compatibility if needed (will remove usage)
}

const Dashboard: React.FC<DashboardProps> = ({
    candidates, vacancies, placements, dashboardStats,
    timeFilter, setTimeFilter, fetchData, setIsCandidateModalOpen,
    setActiveView, getCandidateName
}) => {
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
                    <Button variant="secondary" onClick={fetchData}><RefreshCw size={16} /> Refresh</Button>
                    <Button onClick={() => setIsCandidateModalOpen(true)}><Plus size={16} /> Quick Add</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
            </div>

            {/* Quick Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 items-center">
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
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-6">
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

export default Dashboard;
