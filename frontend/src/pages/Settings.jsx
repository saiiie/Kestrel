import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ProfileSettingsCard from '../components/ProfileSettingsCard';
import AlertPipelineCard from '../components/AlertPipelineCard';
import SecurityCard from '../components/SecurityCard';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const Settings = () => {
    const { user, logout } = useAuth();
    const userId = user?.id;

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    const handleChangePassword = async ({ oldPassword, newPassword }) => {
        try {
            const response = await apiFetch(`http://localhost:5000/api/users/${userId}/password`, {
                method: 'PUT',
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Password updated successfully', 'success');
                setShowPasswordModal(false);
            } else {
                showToast(data.error || 'Failed to update password', 'error');
            }
        } catch (error) {
            showToast('Network error while updating password', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await apiFetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                logout(); // Will clear token and redirect to landing page
            } else {
                const data = await response.json();
                showToast(data.error || 'Failed to delete account', 'error');
            }
        } catch (error) {
            showToast('Network error while deleting account', 'error');
        }
    };

    const userData = {
        username: user?.username || 'Commander',
        email: user?.email || 'Unknown',
        discordWebhook: user?.discordWebhookUrl || ''
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative">
                
                {/* Global Page Toast Notification */}
                <div className="absolute top-0 right-0">
                    {toast.show && (
                        <div className={`flex items-center px-4 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {toast.type === 'success' && <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                            {toast.type === 'error' && <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </div>
                    )}
                </div>

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
                        <SecurityCard 
                            onOpenPasswordModal={() => setShowPasswordModal(true)}
                            onOpenDeleteModal={() => setShowDeleteModal(true)}
                        />
                    </div>

                </div>
            </div>

            {/* Modals rendered safely outside the animated div */}
            <ChangePasswordModal 
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handleChangePassword}
            />

            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
            />
        </DashboardLayout>
    );
};

export default Settings;