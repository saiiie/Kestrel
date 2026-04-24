import React from 'react';

const Sidebar = () => {
    return (
        <div className="w-64 bg-[#141621] border-r border-gray-800 flex flex-col justify-between">

            {/* Brand Header */}
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-wider text-white">Kestrel</h1>
                <p className="text-xs text-gray-500 mt-1">v1.0.4-Celestial</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 mt-6">
                <ul className="space-y-2">
                    <li>
                        <a href="#" className="flex items-center px-6 py-3 bg-[#1A1D2D] text-white border-l-4 border-indigo-500">
                            <span className="mr-3">🔔</span>
                            <span className="font-medium">Alerts</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#1A1D2D] transition-colors">
                            <span className="mr-3">⚙️</span>
                            <span className="font-medium">Settings</span>
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Log Out */}
            <div className="p-6 mb-4">
                <button className="flex items-center text-gray-400 hover:text-red-400 transition-colors">
                    <span className="mr-3">🚪</span>
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;