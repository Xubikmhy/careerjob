import React from 'react';
import { Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Placement } from '../../types';

interface PlacementListProps {
    placements: Placement[];
    setIsPlacementModalOpen: (open: boolean) => void;
    getCandidateName: (id: string) => string;
    markCommissionPaid: (id: string) => void;
}

const PlacementList: React.FC<PlacementListProps> = ({
    placements, setIsPlacementModalOpen, getCandidateName, markCommissionPaid
}) => (
    <div className="space-y-6">
        <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Placements</h2>
            <Button onClick={() => setIsPlacementModalOpen(true)}>
                <Plus size={16} /> New
            </Button>
        </div>
        <Card>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4">Candidate</th>
                            <th className="p-4">Company</th>
                            <th className="p-4">Salary</th>
                            <th className="p-4">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {placements.map(p => (
                            <tr key={p.id}>
                                <td className="p-4 font-medium">{getCandidateName(p.candidateId)}</td>
                                <td className="p-4 text-slate-600">{p.companyName}</td>
                                <td className="p-4 text-slate-600 font-mono">NPR {p.salary.toLocaleString()}</td>
                                <td className="p-4 text-slate-600">
                                    {new Date(p.joiningDate).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

export default PlacementList;
