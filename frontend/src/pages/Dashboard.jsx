import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import SummaryCard from '../components/SummaryCard';
import ActivityFeed from '../components/ActivityFeed';
import AlertsTable from '../components/AlertsTable';
import AlertModal from '../components/AlertModal';

const Dashboard = () => {
    const [rules, setRules] = useState([]);
    const [history, setHistory] = useState([]);
    const [livePrices, setLivePrices] = useState({});
    const [formOptions, setFormOptions] = useState({ assets: [], conditions: [] }); // <-- NEW STATE
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    const userId = 1;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all three endpoints at the exact same time
                const [rulesRes, historyRes, optionsRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/rules/user/${userId}`),
                    fetch(`http://localhost:5000/api/history/user/${userId}`),
                    fetch(`http://localhost:5000/api/config/form-options`) // <-- NEW FETCH
                ]);

                if (rulesRes.ok && historyRes.ok && optionsRes.ok) {
                    setRules(await rulesRes.json());
                    setHistory(await historyRes.json());
                    setFormOptions(await optionsRes.json()); // <-- SAVE TO STATE
                }
            } catch (error) {
                console.error("Failed to fetch Kestrel data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId]);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/prices/live');
                if (res.ok) {
                    setLivePrices(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch live prices.");
            }
        };

        // Fetch immediately on load, then every 5 seconds
        fetchPrices();
        const interval = setInterval(fetchPrices, 5000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const handleCreateAlert = async (newAlertData) => {
        try {
            const payload = {
                user: { id: userId }, // Map to the User entity in Java
                assetId: newAlertData.asset,
                conditionType: newAlertData.condition,
                targetPrice: parseFloat(newAlertData.price),
                active: newAlertData.isActive
            };

            const response = await fetch('http://localhost:5000/api/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const savedRule = await response.json();
                // Add the new rule to the table instantly!
                setRules([...rules, savedRule]);
                setIsModalOpen(false); // Close the modal
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

            const response = await fetch(`http://localhost:5000/api/rules/${updatedData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`http://localhost:5000/api/rules/${ruleId}`, {
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