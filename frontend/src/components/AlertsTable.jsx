import React from 'react';
import { renderAssetIcon, getConditionStyle } from '../utils/tableHelpers';
import LiveTrackerCell from './LiveTrackerCell';

const AlertsTable = ({ rules, livePrices, onOpenNewAlert, onDeleteAlert }) => {

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white tracking-wide">Configured Alerts</h2>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-[#1A1D2D] hover:bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Filter
                    </button>
                    <button onClick={onOpenNewAlert} className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-bold flex items-center">
                        + New Alert
                    </button>
                </div>
            </div>

            <div className="bg-[#1A1D2D] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="py-4 px-6 font-medium">Asset</th>
                            <th className="py-4 px-6 font-medium">Alert Condition</th>
                            <th className="py-4 px-6 font-medium">Live Tracker</th>
                            <th className="py-4 px-6 font-medium text-right">Status</th>
                            <th className="py-4 px-6 font-medium text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {rules.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No alerts configured yet. Click 'New Alert' to start monitoring.</td>
                            </tr>
                        ) : (
                            rules.map((rule) => {
                                const condition = getConditionStyle(rule.conditionType, rule.targetPrice);

                                return (
                                    <tr key={rule.id} className="hover:bg-[#202436] transition-colors group">

                                        {/* Asset Column */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">

                                                {/* Real SVG Icon Container */}
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-800/50">
                                                    {renderAssetIcon(rule.assetId)}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-white capitalize">{rule.assetId}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Alert Condition Column */}
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border ${condition.classes}`}>
                                                <span className="mr-2 opacity-70">{condition.icon}</span>
                                                {condition.text}
                                            </div>
                                        </td>

                                        {/* Live Tracker Column (Mocked progress for now until Websockets are added) */}
                                        <LiveTrackerCell rule={rule} currentPrice={livePrices[rule.assetId]} />

                                        {/* Status Column */}
                                        <td className="py-4 px-6 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${rule.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400'
                                                }`}>
                                                {rule.active ? 'Active' : 'Paused'}
                                            </span>
                                        </td>

                                        {/* Trash Icon Column */}
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => onDeleteAlert(rule.id)}
                                                className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AlertsTable;