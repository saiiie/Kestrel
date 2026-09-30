import { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/useAuth';

const AlertPipelineCard = ({ initialWebhook }) => {
    const { user, updateUser } = useAuth();
    const userId = user?.id;
    const [webhook, setWebhook] = useState(initialWebhook || '');
    const [isMasked, setIsMasked] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const [previousWebhook, setPreviousWebhook] = useState(initialWebhook);
    if (initialWebhook !== previousWebhook) {
        setPreviousWebhook(initialWebhook);
        setWebhook(initialWebhook || '');
    }

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    const handleTestConnection = async () => {
        try {
            const response = await apiFetch('/api/users/test-webhook', {
                method: 'POST',
                body: JSON.stringify({ webhookUrl: webhook })
            });

            if (response.ok) {
                showToast('Test alert queued. Check your Discord channel for delivery.', 'test');
            } else {
                showToast('Failed to reach Discord. Check your URL.', 'error');
            }
        } catch {
            showToast('Network error while testing connection.', 'error');
        }
    };

    const handleSaveWebhook = async () => {
        if (!userId) return;
        try {
            const response = await apiFetch(`/api/users/${userId}/webhook`, {
                method: 'PUT',
                body: JSON.stringify({ webhookUrl: webhook })
            });

            if (response.ok) {
                showToast('Configured webhook URL successfully!', 'success');
                updateUser({ discordWebhookUrl: webhook }); // Sync local user state immediately!
            } else {
                showToast('Failed to save webhook to database.', 'error');
            }
        } catch {
            showToast('Network error while saving webhook.', 'error');
        }
    };

    return (
        <div className="bg-[#0F111A] rounded-xl border border-gray-800/50 p-6">
            <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <h2 className="text-lg font-bold text-white">Alert Pipeline (Discord)</h2>
            </div>

            <p className="text-xs text-gray-400 mb-6">
                Route alerts to your designated Discord channel via webhook integration.
            </p>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider mb-2 block">Discord Webhook URL</label>
                    <div className="flex items-center space-x-4">
                        <input
                            type={isMasked ? "password" : "text"}
                            value={webhook}
                            onChange={(e) => setWebhook(e.target.value)}
                            className="flex-1 bg-[#090A11] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setIsMasked(!isMasked)}
                            className="p-2 text-gray-500 hover:text-white transition-colors bg-[#1A1D2D] rounded-lg border border-gray-800"
                        >
                            {isMasked ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button onClick={handleTestConnection} className="cursor-pointer px-5 py-2.5 bg-[#1A1D2D] hover:bg-gray-800 text-white rounded-lg text-sm font-medium border border-gray-700 transition-colors flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                        Test Connection
                    </button>
                    <button
                        onClick={handleSaveWebhook}
                        className="cursor-pointer px-8 py-3 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
                    >
                        Save Webhook
                    </button>
                </div>

                {/* Inline Notification */}
                <div className="h-2 flex items-center">
                    {toast.show && (
                        <div className={`flex items-center animate-in fade-in slide-in-from-left-2 duration-300 ${toast.type === 'success' ? 'text-emerald-400' :
                            toast.type === 'test' ? 'text-indigo-400' :
                                'text-rose-400'
                            }`}>
                            {toast.type === 'success' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                            {toast.type === 'test' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            {toast.type === 'error' && <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            <span className="text-[10px] font-medium italic">{toast.message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertPipelineCard;
