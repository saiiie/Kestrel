import React from 'react';

const Topbar = () => {
    return (
        <header className="h-20 px-8 flex items-center justify-end border-b border-gray-800/50 bg-[#0F111A]">
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-300">
                    Welcome back, <span className="text-white font-semibold">Observer</span>
                </span>

                {/* User Avatar Placeholder */}
                <div className="w-10 h-10 rounded-full bg-[#1A1D2D] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Topbar;