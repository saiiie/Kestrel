import React, { memo } from 'react';
import { renderAssetIcon } from '../utils/tableHelpers';

const ActivityFeed = memo(({ history, onClearHistory }) => {

    // A quick helper to turn timestamps into "2 mins ago" or "1 hour ago"
    const getRelativeTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMinutes = Math.floor((now - past) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    return (
        <div className="bg-[#0F111A] rounded-xl border border-gray-800/50 p-6 h-full shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white tracking-wide">Recent Activity</h3>
                <button
                    onClick={onClearHistory}
                    className="text-xs font-medium text-gray-500 hover:text-red-400 transition-colors tracking-wider"
                >
                    Clear Activity
                </button>
            </div>

            <div className="space-y-6 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {!history || history.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No recent activity detected.</p>
                ) : (
                    history.map((event) => (
                        <div key={event.id} className="flex items-start group">

                            {/* Asset Icon */}
                            <div className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                                {renderAssetIcon(event.assetId)}
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {event.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 truncate">
                                    {event.description}
                                </p>
                            </div>

                            {/* Timestamp */}
                            <div className="text-xs font-medium text-gray-500 whitespace-nowrap ml-4 mt-1">
                                {getRelativeTime(event.triggeredAt)}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

export default ActivityFeed;