import { useState, useEffect, useRef, memo } from 'react';
import { renderAssetIcon, getConditionStyle } from '../utils/tableHelpers';
import LiveTrackerCell from './LiveTrackerCell';

const AlertsTable = memo(({ rules, livePrices, onOpenNewAlert, onEditAlert, onDeleteAlert }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'ACTIVE', 'PAUSED'
    const [filterAsset, setFilterAsset] = useState('ALL');
    const filterRef = useRef(null);

    const itemsPerPage = 6;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const uniqueAssets = Array.from(new Set(rules.map(r => r.assetId)));

    const filteredRules = rules.filter(r => {
        const matchStatus = filterStatus === 'ALL' || (filterStatus === 'ACTIVE' && r.active) || (filterStatus === 'PAUSED' && !r.active);
        const matchAsset = filterAsset === 'ALL' || r.assetId === filterAsset;
        return matchStatus && matchAsset;
    });

    // Reset to page 1 if filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterAsset]);

    // Pagination calculations based on FILTERED rules
    const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRules = filteredRules.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white tracking-wide">Configured Alerts</h2>
                <div className="flex space-x-3">
                    <div className="relative" ref={filterRef}>
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="cursor-pointer px-4 py-2 bg-[#1A1D2D] hover:bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 flex items-center transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            Filter
                            {(filterStatus !== 'ALL' || filterAsset !== 'ALL') && (
                                <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                        </button>
                        
                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#0F111A] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-3">
                                    <div className="mb-3">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</h3>
                                        <div className="flex flex-col space-y-1">
                                            {['ALL', 'ACTIVE', 'PAUSED'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setFilterStatus(status)}
                                                    className={`cursor-pointer text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${filterStatus === status ? 'bg-[#1A1D2D] text-white font-medium' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'}`}
                                                >
                                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Asset</h3>
                                        <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                            <button
                                                onClick={() => setFilterAsset('ALL')}
                                                className={`cursor-pointer text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${filterAsset === 'ALL' ? 'bg-[#1A1D2D] text-white font-medium' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'}`}
                                            >
                                                All Assets
                                            </button>
                                            {uniqueAssets.map(asset => (
                                                <button
                                                    key={asset}
                                                    onClick={() => setFilterAsset(asset)}
                                                    className={`cursor-pointer text-left px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${filterAsset === asset ? 'bg-[#1A1D2D] text-white font-medium' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'}`}
                                                >
                                                    {asset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={onOpenNewAlert} className="cursor-pointer px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-bold flex items-center transition-transform active:scale-95">
                        + New Alert
                    </button>
                </div>
            </div>

            <div className="bg-[#0F111A] rounded-xl border border-gray-800/50 overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
                <div className="flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B0D14] border-b border-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-6 font-medium">Asset</th>
                                <th className="py-4 px-6 font-medium">Alert Condition</th>
                                <th className="py-4 px-6 font-medium">Live Tracker</th>
                                <th className="py-4 px-6 font-medium text-right">Status</th>
                                <th className="py-4 px-6 font-medium text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/30">
                            {currentRules.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-sm text-gray-500">
                                        No alerts configured yet. Click 'New Alert' to start monitoring.
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {currentRules.map((rule) => {
                                        const condition = getConditionStyle(rule.conditionType, rule.targetPrice);

                                        return (
                                            <tr key={rule.id} onClick={() => onEditAlert(rule)} className="hover:bg-[#151824] transition-colors group cursor-pointer h-[73px]">
                                                {/* Asset Column */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-800/30 group-hover:bg-gray-700/50 transition-colors">
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

                                                <LiveTrackerCell rule={rule} currentPrice={livePrices[rule.assetId]} />

                                                {/* Status Column */}
                                                <td className="py-4 px-6 text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${rule.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-800/50 border-gray-700/50 text-gray-400'}`}>
                                                        {rule.active ? 'Active' : 'Paused'}
                                                    </span>
                                                </td>

                                                {/* Trash Icon Column */}
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteAlert(rule.id);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* 🕯️ Filler Rows to maintain constant height */}
                                    {[...Array(itemsPerPage - currentRules.length)].map((_, i) => (
                                        <tr key={`filler-${i}`} className="h-[73px] pointer-events-none">
                                            <td colSpan="5"></td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🌟 Pagination Controls (Slimmed Down) */}
                <div className="flex items-center justify-center py-2 bg-[#0B0D14] border-t border-gray-800/50 space-x-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => goToPage(currentPage - 1)}
                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <div className="flex items-center space-x-0.5">
                        {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToPage(i + 1)}
                                className={`w-6 h-6 rounded-md text-xs transition-all ${currentPage === i + 1
                                    ? 'text-white font-bold scale-110'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => goToPage(currentPage + 1)}
                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default AlertsTable;