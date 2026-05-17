import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import SummaryCard from '../components/SummaryCard';
import ActivityFeed from '../components/ActivityFeed';
import AlertsTable from '../components/AlertsTable';
import AlertModal from '../components/AlertModal';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const Dashboard = () => {
    const [rules, setRules] = useState([]);
    const [history, setHistory] = useState([]);
    const [livePrices, setLivePrices] = useState({});
    const [formOptions, setFormOptions] = useState({ assets: [], conditions: [] }); // <-- NEW STATE
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    const { user } = useAuth();
    const userId = user?.id;

    const fetchHistory = async () => {
        if (!userId) return;
        try {
            const res = await apiFetch(`http://localhost:5000/api/history/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                console.log("📜 Latest Activity History:", data);
                setHistory(data);
            }
        } catch (error) {
            console.error("❌ Failed to fetch history:", error);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch each with individual error handling to avoid one crash blocking everything
                const fetchWithLogs = async (url, setter, label) => {
                    if (!userId && url.includes('user/')) return;
                    try {
                        const res = await apiFetch(url);
                        if (res.ok) {
                            const data = await res.json();
                            console.log(`✅ ${label} Data:`, data);
                            setter(data);
                        } else {
                            console.error(`❌ ${label} failed with status: ${res.status}`);
                        }
                    } catch (e) {
                        console.error(`❌ Error fetching ${label}:`, e.message);
                    }
                };

                await Promise.all([
                    fetchWithLogs(`http://localhost:5000/api/rules/user/${userId}`, setRules, "Rules"),
                    fetchHistory(),
                    fetchWithLogs(`http://localhost:5000/api/config/form-options`, setFormOptions, "Form Options")
                ]);

            } catch (error) {
                console.error("Failed to fetch Kestrel data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId]);

    const fetchRules = async () => {
        if (!userId) return;
        try {
            const res = await apiFetch(`http://localhost:5000/api/rules/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setRules(data);
            }
        } catch (error) {
            console.error("❌ Failed to fetch rules:", error);
        }
    };

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await apiFetch('http://localhost:5000/api/prices/live');
                if (res.ok) {
                    setLivePrices(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch live prices.");
            }
        };

        // Fetch immediately on load
        fetchPrices();
        fetchHistory();
        fetchRules();

        // Smart Polling: Fetch every 15s, but only if the tab is visible
        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchPrices();
                fetchHistory();
                fetchRules();
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [userId]);

    const handleCreateAlert = async (newAlertData) => {
        try {
            const payload = {
                user: { id: userId }, // Map to the User entity in Java
                assetId: newAlertData.asset,
                conditionType: newAlertData.condition,
                targetPrice: parseFloat(newAlertData.price),
                active: newAlertData.isActive
            };

            const response = await apiFetch('http://localhost:5000/api/rules', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const savedRule = await response.json();
                // Add the new rule to the table instantly!
                setRules([...rules, savedRule]);
                setIsModalOpen(false); // Close the modal

                // 🌟 Trigger a history refresh so the card updates instantly!
                fetchHistory();
            }
        } catch (error) {
            console.error("Failed to create alert:", error);
        }
    };

    const handleUpdateAlert = async (updatedData) => {
        try {
            const payload = {
                user: { id: userId }, // Keep the JPA mapping happy!
                assetId: updatedData.asset,
                conditionType: updatedData.condition,
                targetPrice: parseFloat(updatedData.price),
                active: updatedData.isActive
            };

            const response = await apiFetch(`http://localhost:5000/api/rules/${updatedData.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const updatedRule = await response.json();
                // Swap out the old rule in the array with the newly updated one instantly
                setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
                setIsModalOpen(false);
                setEditingRule(null);
            }
        } catch (error) {
            console.error("Failed to update alert:", error);
        }
    };

    const handleDeleteAlert = async (ruleId) => {
        try {
            const response = await apiFetch(`http://localhost:5000/api/rules/${ruleId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Filter out the deleted rule from the UI state
                setRules(rules.filter(rule => rule.id !== ruleId));
            }
        } catch (error) {
            console.error("Failed to delete alert:", error);
        }
    };

    const handleOpenEditModal = (rule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleClearHistory = async () => {
        try {
            const response = await apiFetch(`http://localhost:5000/api/history/user/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Instantly clear the UI!
                setHistory([]);
                console.log("🗑️ Recent activity cleared.");
            }
        } catch (error) {
            console.error("Failed to clear history:", error);
        }
    };

    return (
        <DashboardLayout>
            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
                    Syncing with Kestrel Engine...
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in will-change-transform">
                    {/* Top Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            {/* Pass the rules data down to the Summary Card */}
                            <SummaryCard rules={rules} />
                        </div>
                        <div className="lg:col-span-2">
                            {/* Pass the history data down to the Activity Feed */}
                            <ActivityFeed history={history} onClearHistory={handleClearHistory} />
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="mt-8">
                        {/* Pass the rules data down to the Table and the open modal handler */}
                        <AlertsTable
                            rules={rules}
                            livePrices={livePrices}
                            onOpenNewAlert={() => setIsModalOpen(true)}
                            onEditAlert={handleOpenEditModal}
                            onDeleteAlert={handleDeleteAlert}
                        />
                    </div>
                </div>
            )}
            <AlertModal
                key={editingRule ? `edit-${editingRule.id}` : 'new-alert'}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingRule(null);
                }}
                options={formOptions}
                onSave={editingRule ? handleUpdateAlert : handleCreateAlert}
                initialData={editingRule}
            />
        </DashboardLayout>
    );
};

export default Dashboard;