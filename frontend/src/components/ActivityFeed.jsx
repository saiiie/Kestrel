import React from 'react';

// Accept the 'history' prop
const ActivityFeed = ({ history }) => {

    // A quick helper to format the ugly Java timestamp into a readable date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-[#1A1D2D] rounded-xl p-6 border border-gray-800 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    View All
                </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                {history.length === 0 ? (
                    <p className="text-gray-500 text-sm mt-4">No recent activity detected.</p>
                ) : (
                    history.map((activity) => (
                        <div key={activity.id} className="flex items-start">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 bg-orange-500/20">
                                <span className="text-sm">🔔</span>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-white">{activity.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                            </div>

                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap ml-4">
                                {formatDate(activity.triggeredAt)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;