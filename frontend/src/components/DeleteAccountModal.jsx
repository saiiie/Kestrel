import { memo } from 'react';

const DeleteAccountModal = memo(({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in will-change-transform p-4">
            <div className="bg-[#11131C] border border-rose-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
                <div className="flex items-center text-rose-500 mb-4">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="text-lg font-bold">Delete Account</h3>
                </div>

                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Are you absolutely sure you want to delete your Kestrel account? This action cannot be undone and will permanently erase all your alert rules, configuration, and history.
                </p>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 py-3 text-gray-400 hover:text-white bg-transparent border border-gray-800 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="cursor-pointer flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        Yes, Delete it
                    </button>
                </div>
            </div>
        </div>
    );
});

export default DeleteAccountModal;
