import React from 'react';
import { Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Vacancy } from '../../types';

interface VacancyListProps {
    vacancies: Vacancy[];
    setIsVacancyModalOpen: (open: boolean) => void;
    setMatchingVacancyId: (id: string | null) => void;
    toggleVacancyStatus: (id: string) => void;
}

const VacancyList: React.FC<VacancyListProps> = ({
    vacancies, setIsVacancyModalOpen, setMatchingVacancyId, toggleVacancyStatus
}) => (
    <div className="space-y-6">
        <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Vacancies</h2>
            <Button onClick={() => setIsVacancyModalOpen(true)}>
                <Plus size={16} /> Add
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vacancies.map(v => (
                <Card key={v.id} className="flex flex-col">
                    <div className="p-5 flex-1">
                        <h3 className="font-bold">{v.role}</h3>
                        <div className="text-sm text-blue-600 mb-2">{v.companyName}</div>
                        <div className="text-xs text-slate-500 space-y-1">
                            <div>Salary: {v.salary}</div>
                            <div>Count: {v.count}</div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t flex gap-2">
                        <Button
                            className="flex-1 text-xs"
                            onClick={() => setMatchingVacancyId(v.id)}
                            disabled={v.status !== 'OPEN'}
                        >
                            Match
                        </Button>
                        <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => toggleVacancyStatus(v.id)}
                        >
                            {v.status}
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    </div>
);

export default VacancyList;
