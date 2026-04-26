import React from 'react';

const LiveTrackerCell = ({ rule, currentPrice }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // The math logic is now safely isolated inside this component
    const calculateProgress = () => {
        // 1. First, check if the alert is even active
        if (!rule.active) {
            return {
                width: '0%',
                text: 'Paused', // 🌟 No more "Syncing" for paused alerts!
                color: 'bg-gray-800'
            };
        }

        // 2. If it is active, check if we have the price data yet
        if (!currentPrice) {
            return {
                width: '0%',
                text: 'Syncing...',
                color: 'bg-gray-600'
            };
        }

        // 3. Otherwise, proceed with the math as usual
        let percentage = 0;
        let barColor = 'bg-gray-500';

        if (rule.conditionType === 'DROPS_BELOW') {
            percentage = (rule.targetPrice / currentPrice) * 100;
            barColor = 'bg-red-500';
        } else if (rule.conditionType === 'RISES_ABOVE') {
            percentage = (currentPrice / rule.targetPrice) * 100;
            barColor = 'bg-emerald-500';
        } else {
            percentage = 50;
            barColor = 'bg-pink-500';
        }

        const finalWidth = Math.min(100, Math.max(5, percentage));

        return {
            width: `${finalWidth}%`,
            text: formatCurrency(currentPrice),
            color: barColor
        };
    };

    const progress = calculateProgress();

    return (
        <td className="py-4 px-6">
            <p className="text-sm font-semibold text-white mb-1.5 transition-all duration-500">
                {progress.text}
            </p>
            <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${progress.color}`}
                    style={{ width: progress.width }}
                ></div>
            </div>
        </td>
    );
};

export default LiveTrackerCell;