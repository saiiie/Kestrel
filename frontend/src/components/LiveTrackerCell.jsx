import { memo } from 'react';

const LiveTrackerCell = memo(({ rule, currentPrice }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const calculateProgress = () => {
        if (!rule.active) {
            return {
                width: '0%',
                text: 'Paused',
                color: 'bg-gray-700',
                badgeColor: 'text-gray-500 bg-gray-500/5 border-gray-800'
            };
        }

        if (!currentPrice) {
            return {
                width: '0%',
                text: 'Syncing...',
                color: 'bg-gray-600',
                badgeColor: 'text-indigo-400 bg-indigo-400/5 border-indigo-400/20 animate-pulse'
            };
        }

        let percentage;
        let barColor;
        let badgeColor;

        if (rule.conditionType === 'DROPS_BELOW') {
            percentage = (rule.targetPrice / currentPrice) * 100;
            barColor = 'bg-rose-500/80';
            badgeColor = 'text-rose-400 bg-rose-400/10 border-rose-400/20';
        } else if (rule.conditionType === 'RISES_ABOVE') {
            percentage = (currentPrice / rule.targetPrice) * 100;
            barColor = 'bg-indigo-500/80';
            badgeColor = 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        } else {
            percentage = 50;
            barColor = 'bg-violet-500/80';
            badgeColor = 'text-violet-400 bg-violet-400/10 border-violet-400/20';
        }

        const finalWidth = Math.min(100, Math.max(5, percentage));

        return {
            width: `${finalWidth}%`,
            text: formatCurrency(currentPrice),
            color: barColor,
            badgeColor: badgeColor
        };
    };

    const progress = calculateProgress();

    return (
        <td className="py-4 px-6">
            <div className="flex items-center space-x-4">
                {/* Progress Bar Container */}
                <div className="w-28 h-1.5 bg-gray-800/80 rounded-full overflow-hidden flex-shrink-0">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${progress.color}`}
                        style={{ width: progress.width }}
                    ></div>
                </div>

                {/* The Value Badge (Price or Syncing) */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${progress.badgeColor} transition-all duration-500 whitespace-nowrap`}>
                    {progress.text}
                </span>
            </div>
        </td>
    );
});

export default LiveTrackerCell;
