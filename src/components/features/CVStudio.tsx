import React from 'react';
import {
    ArrowLeft, Lock, Printer, Sparkles, Save, Eye,
    Plus, Trash2
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import { CVFormState, Candidate, AppSettings } from '../../types';
import { EDUCATION_LEVEL_ORDER } from '../../constants';

interface CVStudioProps {
    cvForm: CVFormState;
    setCvForm: React.Dispatch<React.SetStateAction<CVFormState>>;
    candidates: Candidate[];
    studioCandidateId: string;
    setStudioCandidateId: (id: string) => void;
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    isAiGenerating: boolean;
    generateCVContentWithAI: () => void;
    saveCvData: () => void;
    addEducation: () => void;
    removeEducation: (id: string) => void;
    updateEducation: (id: string, field: string, value: any) => void;
    addExperience: () => void;
    removeExperience: (id: string) => void;
    updateExperience: (id: string, field: string, value: any) => void;
    settings: AppSettings;
}

const CVStudio: React.FC<CVStudioProps> = ({
    cvForm, setCvForm, candidates, studioCandidateId, setStudioCandidateId,
    showPreview, setShowPreview, isAiGenerating, generateCVContentWithAI,
    saveCvData, addEducation, removeEducation, updateEducation,
    addExperience, removeExperience, updateExperience, settings
}) => {
    const sortedEducation = [...cvForm.educations].sort((a, b) => EDUCATION_LEVEL_ORDER[b.level] - EDUCATION_LEVEL_ORDER[a.level]);
    const editingCandidate = studioCandidateId ? candidates.find(c => c.id === studioCandidateId) : null;
    const isFeePaid = editingCandidate ? editingCandidate.isRegFeePaid : false;

    if (showPreview) {
        return (
            <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
                <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" onClick={() => setShowPreview(false)}>
                            <ArrowLeft size={16} /> Edit
                        </Button>
                        <span className="text-slate-500 text-sm">Print Preview</span>
                    </div>
                    {editingCandidate && !isFeePaid ? (
                        <div className="text-red-600 flex gap-2 items-center"><Lock size={16} /> Fee Pending</div>
                    ) : (
                        <Button onClick={() => window.print()}><Printer size={16} /> Print PDF</Button>
                    )}
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #cv-print-area, #cv-print-area * {
                            visibility: visible;
                        }
                        #cv-print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 210mm;
                            height: 297mm;
                            margin: 0;
                            padding: 20mm !important;
                            box-shadow: none !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                ` }} />
                <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                    <div id="cv-print-area" className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] relative text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img src={settings.logoUrl} className="w-[400px] opacity-[0.08] grayscale" alt="Watermark" />
                        </div>
                        <div className="relative z-10">
                            <div className="border-b-2 border-blue-900 pb-4 mb-6">
                                <h1 className="text-3xl font-bold text-blue-900 uppercase">{cvForm.fullName}</h1>
                                <div className="text-sm">{cvForm.address} | {cvForm.mobile} | {cvForm.email}</div>
                            </div>
                            {cvForm.summary && (
                                <div className="mb-6">
                                    <h2 className="font-bold text-blue-900 border-b mb-2">SUMMARY</h2>
                                    <p className="text-justify">{cvForm.summary}</p>
                                </div>
                            )}
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
                            {sortedEducation.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="font-bold text-blue-900 border-b mb-2">EDUCATION</h2>
                                    {sortedEducation.map(e => (
                                        <div key={e.id} className="flex justify-between text-sm">
                                            <div><span className="font-bold">{e.degree}</span> ({e.level})</div>
                                            <div>{e.board}, {e.year}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {cvForm.skills && (
                                <div className="mb-6">
                                    <h2 className="font-bold text-blue-900 border-b mb-2">SKILLS</h2>
                                    <p>{cvForm.skills}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50 flex flex-col">
            <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex-1 max-w-md">
                    <select
                        className="w-full px-3 py-2 border rounded"
                        value={studioCandidateId}
                        onChange={(e) => setStudioCandidateId(e.target.value)}
                    >
                        <option value="">-- New --</option>
                        {candidates.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <Button variant="ai" onClick={generateCVContentWithAI} disabled={isAiGenerating}>
                        <Sparkles size={16} /> Auto-Polish
                    </Button>
                    <Button onClick={saveCvData} variant="secondary">
                        <Save size={16} /> Save
                    </Button>
                    <Button onClick={() => setShowPreview(true)}>
                        <Eye size={16} /> Preview
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded">
                    <h2 className="text-xl font-bold mb-6">Editor</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input label="Name" value={cvForm.fullName} onChange={(e: any) => setCvForm({ ...cvForm, fullName: e.target.value })} />
                        <Input label="Mobile" value={cvForm.mobile} onChange={(e: any) => setCvForm({ ...cvForm, mobile: e.target.value })} />
                    </div>
                    <Input label="Address" value={cvForm.address} onChange={(e: any) => setCvForm({ ...cvForm, address: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input label="Email" value={cvForm.email || ''} onChange={(e: any) => setCvForm({ ...cvForm, email: e.target.value })} />
                        <Input label="LinkedIn" value={cvForm.linkedin || ''} onChange={(e: any) => setCvForm({ ...cvForm, linkedin: e.target.value })} />
                    </div>
                    <TextArea label="Summary" value={cvForm.summary} onChange={(e: any) => setCvForm({ ...cvForm, summary: e.target.value })} />

                    <div className="mb-4 font-bold border-b flex justify-between items-center">
                        <span>Experience</span>
                        <Button className="h-8 w-8 p-0" variant="secondary" onClick={addExperience}>+</Button>
                    </div>
                    {cvForm.experiences.map(e => (
                        <div key={e.id} className="p-4 border rounded mb-4 relative bg-slate-50/50">
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
                            <TextArea
                                value={e.responsibilities}
                                onChange={(ev: any) => updateExperience(e.id, 'responsibilities', ev.target.value)}
                                placeholder="Responsibilities"
                            />
                            <Button variant="danger" className="text-xs mt-2" onClick={() => removeExperience(e.id)}>
                                <Trash2 size={14} /> Remove
                            </Button>
                        </div>
                    ))}

                    <div className="mb-4 mt-6 font-bold border-b flex justify-between items-center">
                        <span>Education</span>
                        <Button className="h-8 w-8 p-0" variant="secondary" onClick={addEducation}>+</Button>
                    </div>
                    {cvForm.educations.map(e => (
                        <div key={e.id} className="p-4 border rounded mb-4 bg-slate-50/50">
                            <div className="grid grid-cols-3 gap-2">
                                <Input value={e.degree} onChange={(ev: any) => updateEducation(e.id, 'degree', ev.target.value)} placeholder="Degree" />
                                <Input value={e.board} onChange={(ev: any) => updateEducation(e.id, 'board', ev.target.value)} placeholder="Board" />
                                <Input value={e.year} onChange={(ev: any) => updateEducation(e.id, 'year', ev.target.value)} placeholder="Year" />
                            </div>
                            <Button variant="danger" className="text-xs mt-2" onClick={() => removeEducation(e.id)}>
                                <Trash2 size={14} /> Remove
                            </Button>
                        </div>
                    ))}

                    <TextArea label="Skills" value={cvForm.skills} onChange={(e: any) => setCvForm({ ...cvForm, skills: e.target.value })} className="mt-6" />
                </div>
            </div>
        </div>
    );
};

export default CVStudio;
