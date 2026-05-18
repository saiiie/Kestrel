import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ProfileSettingsCard from '../components/ProfileSettingsCard';
import AlertPipelineCard from '../components/AlertPipelineCard';
import SecurityCard from '../components/SecurityCard';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();

    const userData = {
        username: user?.username || 'Commander',
        email: user?.email || 'Unknown',
        discordWebhook: user?.discordWebhookUrl || ''
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-white mb-2">System Configuration</h1>
                    <p className="text-sm text-gray-400">
                        Manage your Kestrel profile details and set your alert pipelines.
                    </p>
                </div>

                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Column (Profile & Pipelines) */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProfileSettingsCard initialData={userData} />
                        <AlertPipelineCard initialWebhook={userData.discordWebhook} />
                    </div>

                    {/* Right Column (Security) */}
                    <div className="lg:col-span-1">
                        <SecurityCard />
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;