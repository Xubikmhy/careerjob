import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { AppSettings } from '../../types';

interface SettingsViewProps {
    settings: AppSettings;
    setSettings: (settings: AppSettings) => void;
    handleUpdateSettings: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({
    settings, setSettings, handleUpdateSettings, isSubmitting
}) => (
    <div className="max-w-xl">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <Card className="p-6">
            <form onSubmit={handleUpdateSettings}>
                <div className="flex justify-center mb-6">
                    <img src={settings.logoUrl} className="h-24 w-24 object-contain border rounded p-2" alt="Logo" />
                </div>
                <Input
                    label="Agency Name"
                    value={settings.agencyName}
                    onChange={(e: any) => setSettings({ ...settings, agencyName: e.target.value })}
                />
                <Input
                    label="Logo URL"
                    value={settings.logoUrl}
                    onChange={(e: any) => setSettings({ ...settings, logoUrl: e.target.value })}
                />
                <Input
                    label="Commission %"
                    type="number"
                    value={settings.commissionPercent}
                    onChange={(e: any) => setSettings({ ...settings, commissionPercent: parseFloat(e.target.value) })}
                />
                <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
                    Save Settings
                </Button>
            </form>
        </Card>
    </div>
);

export default SettingsView;
