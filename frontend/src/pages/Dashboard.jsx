import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import SummaryCard from '../components/SummaryCard';
import ActivityFeed from '../components/ActivityFeed';
import AlertsTable from '../components/AlertsTable';

const Dashboard = () => {
    const [rules, setRules] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Hardcode user ID to 1 for now, until we build a login page!
    const userId = 1;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch from your API Gateway (Port 5000)
                const [rulesResponse, historyResponse] = await Promise.all([
                    fetch(`http://localhost:5000/api/rules/user/${userId}`),
                    fetch(`http://localhost:5000/api/history/user/${userId}`)
                ]);

                if (rulesResponse.ok && historyResponse.ok) {
                    const rulesData = await rulesResponse.json();
                    const historyData = await historyResponse.json();

                    setRules(rulesData);
                    setHistory(historyData);
                }
            } catch (error) {
                console.error("Failed to fetch Kestrel data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId]);

    return (
        <DashboardLayout>
            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
                    Syncing with Kestrel Engine...
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Top Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            {/* Pass the rules data down to the Summary Card */}
                            <SummaryCard rules={rules} />
                        </div>
                        <div className="lg:col-span-2">
                            {/* Pass the history data down to the Activity Feed */}
                            <ActivityFeed history={history} />
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="mt-8">
                        {/* Pass the rules data down to the Table */}
                        <AlertsTable rules={rules} />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Dashboard;