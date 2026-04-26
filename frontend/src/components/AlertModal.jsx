import React, { useState } from 'react';

const AlertModal = ({ isOpen, onClose, options, onSave }) => {
    // State for our form inputs
    const [asset, setAsset] = useState('bitcoin');
    const [condition, setCondition] = useState('DROPS_BELOW');
    const [price, setPrice] = useState('65000.00');
    const [isActive, setIsActive] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">

            {/* Modal Container */}
            <div className="bg-[#141621] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800/60">
                    <h3 className="text-white font-semibold tracking-wide">New Alert</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body / Form */}
                <div className="p-6 space-y-6">

                    {/* Asset Dropdown */}
                    <div>
                        <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-2 block">
                            Asset
                        </label>
                        <select
                            value={asset}
                            onChange={(e) => setAsset(e.target.value)}
                            className="w-full bg-[#0F111A] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                        >
                            {options.assets.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Condition & Price Row */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-2 block">
                                Alert Condition
                            </label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full bg-[#0F111A] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                            >
                                {options.conditions.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-2 block opacity-0">
                                Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                <input
                                    type="text"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-[#0F111A] border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center space-x-4 pt-2">
                        <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider w-24">
                            Status
                        </label>
                        <div className="flex items-center space-x-3">
                            {/* Custom Toggle Switch */}
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${isActive ? 'bg-indigo-500' : 'bg-gray-600'}`}
                            >
                                <div className={`w-3.5 h-3.5 bg-white rounded-full transform transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                            <span className="text-sm font-medium text-gray-300">
                                {isActive ? 'Active' : 'Paused'}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end items-center px-6 py-4 border-t border-gray-800/60 space-x-4 bg-[#1A1D2D]">
                    <button onClick={onClose} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Cancel
                    </button>

                    {/* 🌟 NEW: Package the state and send it to Dashboard */}
                    <button
                        onClick={() => onSave({ asset, condition, price, isActive })}
                        className="px-5 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AlertModal;