import { SiBitcoin, SiEthereum, SiSolana, SiTether } from "react-icons/si";

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const renderAssetIcon = (assetId) => {
    switch (assetId) {
        case 'bitcoin': return <SiBitcoin className="w-5 h-5 text-orange-500" />;
        case 'ethereum': return <SiEthereum className="w-5 h-5 text-blue-500" />;
        case 'solana': return <SiSolana className="w-5 h-5 text-teal-500" />;
        case 'tether': return <SiTether className="w-5 h-5 text-green-500" />;
        default: return <div className="w-5 h-5 rounded-full bg-gray-500"></div>;
    }
};

export const getConditionStyle = (type, price) => {
    if (type === 'DROPS_BELOW') {
        return {
            text: `Drops Below ${formatCurrency(price)}`,
            icon: '📉',
            classes: 'bg-gray-700/30 border-gray-600/50 text-gray-300'
        };
    } else if (type === 'RISES_ABOVE') {
        return {
            text: `Rises Above ${formatCurrency(price)}`,
            icon: '📈',
            classes: 'bg-gray-700/30 border-gray-600/50 text-gray-300'
        };
    }
    return {
        text: `Deviation ${formatCurrency(price)}`,
        icon: '⚠️',
        classes: 'bg-gray-700/30 border-gray-600/50 text-gray-300'
    };
};
