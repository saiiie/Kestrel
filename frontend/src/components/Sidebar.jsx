import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Settings, LogOut, Bird } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    // Helper function to handle the active vs inactive wrapper classes
    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-6 py-3 text-sm transition-all group border-l-4 ${isActive
            ? 'bg-[#1A1D2D] text-white border-indigo-500'
            : 'text-gray-400 hover:text-white hover:bg-[#1A1D2D] border-transparent'
        }`;

    return (
        <div className="w-64 bg-[#0F111A] border-r border-gray-800/50 flex flex-col justify-between">

            {/* Brand Header */}
            <div className="p-6">
                <div className="flex items-center space-x-2 text-indigo-500 mb-1">
                    <Bird size={20} strokeWidth={2.5} />
                    <h1 className="text-lg font-bold tracking-wider text-white">Kestrel</h1>
                </div>
                <p className="text-[10px] text-gray-500">v1.0.4-Celestial</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 mt-6">
                <ul className="space-y-2">
                    <li>
                        <NavLink to="/dashboard" className={navLinkClasses}>
                            {({ isActive }) => (
                                <>
                                    <Bell size={18} className={`mr-3 ${isActive ? 'text-indigo-400' : ''}`} />
                                    <span className="font-medium">Alerts</span>
                                </>
                            )}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={navLinkClasses}>
                            {({ isActive }) => (
                                <>
                                    <Settings size={18} className={`mr-3 group-hover:rotate-45 transition-transform ${isActive ? 'text-indigo-400' : ''}`} />
                                    <span className="font-medium">Settings</span>
                                </>
                            )}
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* Log Out */}
            <div className="p-6 mb-4">
                <button 
                    onClick={logout}
                    className="cursor-pointer flex items-center text-sm text-gray-400 hover:text-red-400 transition-colors group"
                >
                    <LogOut size={18} className="mr-3" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;