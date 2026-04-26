import React from 'react';
import { Bell, Settings, LogOut, Bird } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="w-64 bg-[#0F111A] border-r border-gray-800/50 flex flex-col justify-between">

            {/* Brand Header */}
            <div className="p-6">
                <div className="flex items-center space-x-2 text-indigo-500 mb-1">
                    <Bird size={24} strokeWidth={2.5} />
                    <h1 className="text-xl font-bold tracking-wider text-white">Kestrel</h1>
                </div>
                <p className="text-xs text-gray-500">v1.0.4-Celestial</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 mt-6">
                <ul className="space-y-2">
                    <li>
                        <a href="#" className="flex items-center px-6 py-3 bg-[#1A1D2D] text-white border-l-4 border-indigo-500 group">
                            <Bell size={18} className="mr-3 text-indigo-400" />
                            <span className="font-medium">Alerts</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#1A1D2D] transition-all group">
                            <Settings size={18} className="mr-3 group-hover:rotate-45 transition-transform" />
                            <span className="font-medium">Settings</span>
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Log Out */}
            <div className="p-6 mb-4">
                <button className="flex items-center text-gray-400 hover:text-red-400 transition-colors group">
                    <LogOut size={18} className="mr-3 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;