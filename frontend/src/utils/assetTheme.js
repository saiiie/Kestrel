// This file acts as the single source of truth for your asset branding across the whole app
export const assetTheme = {
    bitcoin: { name: 'Bitcoin', symbol: 'BTC', color: 'bg-orange-500/20 text-orange-500', initial: 'B' },
    ethereum: { name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500/20 text-blue-500', initial: 'E' },
    solana: { name: 'Solana', symbol: 'SOL', color: 'bg-teal-500/20 text-teal-500', initial: 'S' },
    tether: { name: 'Tether', symbol: 'USDT', color: 'bg-green-500/20 text-green-500', initial: 'T' },

    // A fallback just in case the database sends an asset the frontend doesn't recognize yet
    default: { name: 'Unknown', symbol: '???', color: 'bg-gray-500/20 text-gray-500', initial: '?' }
};

// A helper function you can call from anywhere
export const getAssetStyle = (assetId) => {
    return assetTheme[assetId] || assetTheme.default;
};