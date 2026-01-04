import React from 'react';
import { XCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';
import { Candidate } from '../../types';

interface CandidateModalProps {
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ onClose, onSubmit, isSubmitting }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Candidate</h3>
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="fullName" label="Name" required />
                    <Input name="mobile" label="Mobile" required />
                </div>
                <Input name="address" label="Address" required />
                <TextArea name="skills" label="Skills" required />
                <TextArea name="experience" label="Experience" required />
                <TextArea name="education" label="Education" required />
                <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isRegFeePaid" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                        Reg Fee Paid?
                    </label>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Save</Button>
                </div>
            </form>
        </Card>
    </div>
);

interface VacancyModalProps {
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

export const VacancyModal: React.FC<VacancyModalProps> = ({ onClose, onSubmit, isSubmitting }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">New Vacancy</h3>
            <form onSubmit={onSubmit}>
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
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Post</Button>
                </div>
            </form>
        </Card>
    </div>
);

interface PlacementModalProps {
    candidates: Candidate[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

export const PlacementModal: React.FC<PlacementModalProps> = ({ candidates, onClose, onSubmit, isSubmitting }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">New Placement</h3>
            <form onSubmit={onSubmit}>
                <Select name="candidateId" label="Candidate" options={candidates.map(c => ({ value: c.id, label: c.fullName }))} required />
                <Input name="companyName" label="Company" required />
                <Input name="salary" type="number" step="0.01" label="Salary" required />
                <Input name="joiningDate" type="date" label="Date" required />
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Save</Button>
                </div>
            </form>
        </Card>
    </div>
);
interface MatchingModalProps {
    candidates: Candidate[];
    onClose: () => void;
    onSelect: (id: string) => void;
}

export const MatchingModal: React.FC<MatchingModalProps> = ({ candidates, onClose, onSelect }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
                <h3 className="font-bold">Matches</h3>
                <XCircle className="cursor-pointer" onClick={onClose} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                {candidates.filter(c => c.status === 'ACTIVE').map(c => (
                    <div key={c.id} className="p-3 border rounded flex justify-between">
                        <div>
                            <div className="font-bold">{c.fullName}</div>
                            <div className="text-xs">{c.skills}</div>
                        </div>
                        <Button variant="secondary" className="text-xs" onClick={() => onSelect(c.id)}>
                            CV
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);
