import React from 'react';
import { Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Candidate } from '../../types';

interface CandidateListProps {
    candidates: Candidate[];
    setIsCandidateModalOpen: (open: boolean) => void;
    setStudioCandidateId: (id: string) => void;
    setShowPreview: (show: boolean) => void;
    setActiveView: (view: string) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({
    candidates, setIsCandidateModalOpen, setStudioCandidateId,
    setShowPreview, setActiveView
}) => (
    <div className="space-y-6">
        <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Candidates</h2>
            <Button onClick={() => setIsCandidateModalOpen(true)}>
                <Plus size={16} /> Add Candidate
            </Button>
        </div>
        <Card>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Mobile</th>
                            <th className="p-4">Skills</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {candidates.map(c => (
                            <tr key={c.id}>
                                <td className="p-4 font-medium">{c.fullName}</td>
                                <td className="p-4 text-slate-600">{c.mobile}</td>
                                <td className="p-4 max-w-xs truncate text-slate-600">{c.skills}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <Button
                                        variant="secondary"
                                        className="text-xs py-1"
                                        onClick={() => {
                                            setStudioCandidateId(c.id);
                                            setShowPreview(false);
                                            setActiveView('cv_studio');
                                        }}
                                    >
                                        Edit CV
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

export default CandidateList;
