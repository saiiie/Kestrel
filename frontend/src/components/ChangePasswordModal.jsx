import React, { useState, useEffect, memo } from 'react';

const ChangePasswordModal = memo(({ isOpen, onClose, onSubmit }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setLocalError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setLocalError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setLocalError('New passwords do not match');
            return;
        }

        setLocalError('');
        onSubmit({ oldPassword, newPassword });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in will-change-transform p-4">
            <div className="bg-[#11131C] border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
                <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                
                {localError && (
                    <div className="mb-4 text-rose-400 text-xs italic">
                        {localError}
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-2 block">Old Password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-[#05050A] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-2 block">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#05050A] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-2 block">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#05050A] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-400 hover:text-white bg-transparent border border-gray-800 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="flex-1 py-3 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-bold transition-colors"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ChangePasswordModal;
