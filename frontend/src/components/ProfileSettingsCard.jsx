import React, { useState, useEffect, useRef } from 'react';

const ProfileSettingsCard = ({ initialData }) => {
    const [localData, setLocalData] = useState(initialData);
    const [originalData, setOriginalData] = useState(initialData);
    const cardRef = useRef(null);

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

    const handleSave = () => {
        console.log("Saving to backend:", localData);
        setOriginalData(localData); // Update the baseline
        // TODO: Wire up PUT /api/users/1/profile here
    };

    return (
        <div ref={cardRef} className="bg-[#0F111A] rounded-xl border border-gray-800/50 p-8 shadow-xl">
            <div className="flex items-center mb-8">
                <svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h2 className="text-xl font-bold text-white tracking-wide">Profile Settings</h2>
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

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
                    >
                        Update Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsCard;