import React from 'react';
import { Candidate, Vacancy, Placement } from '../../types';
import { Users, Briefcase, CheckCircle2, User, Building, MapPin } from 'lucide-react';

interface SearchResultsProps {
    query: string;
    results: {
        candidates: Candidate[];
        vacancies: Vacancy[];
        placements: Placement[];
    };
    onNavigate: (view: string, id?: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, results, onNavigate }) => {
    const hasResults = results.candidates.length > 0 || results.vacancies.length > 0 || results.placements.length > 0;

    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                <Users size={48} className="mb-4 opacity-50" />
                <p className="text-lg">Start typing to search...</p>
            </div>
        );
    }

    if (!hasResults) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <Building size={48} className="mb-4 opacity-50 text-slate-300" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-sm">We couldn't find anything matching "{query}"</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Search Results</h2>
                <p className="text-slate-500">Found {results.candidates.length + results.vacancies.length + results.placements.length} matches for "{query}"</p>
            </div>

            {/* Candidates Section */}
            {results.candidates.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4 text-blue-700 pb-2 border-b border-blue-100">
                        <Users size={20} />
                        <h3 className="font-semibold text-lg">Candidates ({results.candidates.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.candidates.map(candidate => (
                            <div key={candidate.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => onNavigate('candidates', candidate.id)}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {candidate.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900">{candidate.fullName}</h4>
                                            <p className="text-xs text-slate-500">{candidate.mobile}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${candidate.status === 'PLACED' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                                        {candidate.status}
                                    </span>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <MapPin size={14} /> {candidate.address || 'N/A'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                        {candidate.skills}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Vacancies Section */}
            {results.vacancies.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4 text-purple-700 pb-2 border-b border-purple-100">
                        <Briefcase size={20} />
                        <h3 className="font-semibold text-lg">Vacancies ({results.vacancies.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.vacancies.map(vacancy => (
                            <div key={vacancy.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => onNavigate('vacancies', vacancy.id)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{vacancy.role}</h4>
                                        <p className="text-sm text-purple-600 font-medium">{vacancy.companyName}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${vacancy.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {vacancy.status}
                                    </span>
                                </div>
                                <div className="mt-3 flex gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {vacancy.address}</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> Needed: {vacancy.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Placements Section */}
            {results.placements.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4 text-green-700 pb-2 border-b border-green-100">
                        <CheckCircle2 size={20} />
                        <h3 className="font-semibold text-lg">Placements ({results.placements.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {results.placements.map(placement => (
                            <div key={placement.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow flex justify-between items-center"
                                onClick={() => onNavigate('placements', placement.id)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">{placement.jobRole} @ {placement.companyName}</h4>
                                        <p className="text-xs text-slate-500">Salary: {placement.salary.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SearchResults;
