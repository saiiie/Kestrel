import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const ProfileSettingsCard = ({ initialData }) => {
    const { user, updateUser } = useAuth();
    const userId = user?.id;
    const [localData, setLocalData] = useState(initialData);
    const [originalData, setOriginalData] = useState(initialData);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const cardRef = useRef(null);

    // Sync input field value when fresh initialData is loaded
    useEffect(() => {
        if (initialData) {
            setLocalData(initialData);
            setOriginalData(initialData);
        }
    }, [initialData]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    // Click-Outside Listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                // Revert to original if they click away without saving
                if (localData.username !== originalData.username || localData.email !== originalData.email) {
                    setLocalData(originalData);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [localData, originalData]);

    const handleSave = async () => {
        if (!userId) return;

        if (!localData.username || !localData.email) {
            showToast('Username and email cannot be empty', 'error');
            return;
        }

        try {
            const response = await apiFetch(`http://localhost:5000/api/users/${userId}/profile`, {
                method: 'PUT',
                body: JSON.stringify({
                    username: localData.username,
                    email: localData.email
                })
            });

            const data = await response.json();

            if (response.ok) {
                setOriginalData(localData); // Update the baseline
                updateUser({ username: data.username, email: data.email });
                showToast('Profile updated successfully!', 'success');
            } else {
                showToast(data.error || 'Failed to update profile.', 'error');
                // Revert to original on error
                setLocalData(originalData);
            }
        } catch (error) {
            showToast('Network error while updating profile.', 'error');
            setLocalData(originalData);
        }
    };

    return (
        <div ref={cardRef} className="bg-[#0F111A] rounded-xl border border-gray-800/50 p-8 shadow-xl">
            <div className="flex items-center mb-8">
                <svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h2 className="text-lg font-bold text-white tracking-wide">Profile Settings</h2>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-3.5 block ml-1">Username</label>
                    <input
                        type="text"
                        value={localData.username}
                        onChange={(e) => setLocalData({ ...localData, username: e.target.value })}
                        className="w-full bg-[#090A11] border border-gray-800 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                </div>

                <div>
                    <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-3.5 block ml-1">Email Address</label>
                    <input
                        type="email"
                        value={localData.email}
                        onChange={(e) => setLocalData({ ...localData, email: e.target.value })}
                        className="w-full bg-[#090A11] border border-gray-800 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                </div>

                <div className="pt-4 flex items-center space-x-4">
                    <button
                        onClick={handleSave}
                        className="cursor-pointer px-8 py-3 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
                    >
                        Update Profile
                    </button>

                    {/* Inline Notification */}
                    <div className="h-10 flex items-right">
                        {toast.show && (
                            <div className={`flex text-[10px] items-center animate-in fade-in slide-in-from-left-2 duration-300 ${toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {toast.type === 'success' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                                {toast.type === 'error' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                <span className="text-xs font-medium italic">{toast.message}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsCard;