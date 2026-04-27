import React, { memo } from 'react';

const SummaryCard = memo(({ rules }) => {
    // Calculate dynamic stats based on your NeonDB data
    const totalAlerts = rules.length;
    const activeAlerts = rules.filter(rule => rule.active).length;
    const pausedAlerts = totalAlerts - activeAlerts;

    return (
        <div className="bg-[#0F111A] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between h-full shadow-lg">
            <div>
                <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
                <p className="text-sm text-gray-400 mt-1">Monitoring {totalAlerts} conditions</p>
            </div>

            <div className="mt-8 mb-8 flex items-baseline space-x-2">
                <span className="text-6xl font-bold text-white tracking-tight">{totalAlerts}</span>
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total</span>
            </div>

            <div className="flex space-x-3 mt-auto">
                <div className="flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                    <span className="text-xs font-medium text-emerald-400">{activeAlerts} Active</span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-gray-700/30 border border-gray-700/50 rounded-md">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                    <span className="text-xs font-medium text-gray-300">{pausedAlerts} Paused</span>
                </div>
            </div>
        </div>
    );
});

export default SummaryCard;