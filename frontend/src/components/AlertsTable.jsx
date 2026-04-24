import React from 'react';

// Accept the 'rules' prop
const AlertsTable = ({ rules }) => {

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white tracking-wide">Configured Alerts</h2>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-[#1A1D2D] hover:bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 flex items-center">
                        Filter
                    </button>
                    <button className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-bold flex items-center">
                        + New Alert
                    </button>
                </div>
            </div>

            <div className="bg-[#1A1D2D] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="py-4 px-6 font-medium">Asset</th>
                            <th className="py-4 px-6 font-medium">Condition</th>
                            <th className="py-4 px-6 font-medium">Target Price</th>
                            <th className="py-4 px-6 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {rules.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-500">No alerts configured yet. Click 'New Alert' to start monitoring.</td>
                            </tr>
                        ) : (
                            rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-[#202436] transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-semibold text-white capitalize">{rule.assetId}</p>
                                    </td>

                                    <td className="py-4 px-6">
                                        <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border ${rule.conditionType === 'DROPS_BELOW' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {rule.conditionType.replace('_', ' ')}
                                        </div>
                                    </td>

                                    <td className="py-4 px-6">
                                        <p className="text-sm font-semibold text-white">{formatCurrency(rule.targetPrice)}</p>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${rule.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400'
                                            }`}>
                                            {rule.active ? 'Active' : 'Paused'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AlertsTable;