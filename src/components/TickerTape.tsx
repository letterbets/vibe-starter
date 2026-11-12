import React from 'react';
import { MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  recentTicks: Record<string, 'up' | 'down'>;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ assets, onSelectAsset, recentTicks }) => {
  // Duplicate assets to make an infinite seamless looping ticker
  const tickerItems = [...assets, ...assets];

  return (
    <div className="w-full bg-[#1e222d] dark:bg-[#1e222d] border-b border-[#2a2e39] overflow-hidden py-1.5 select-none relative z-10">
      <div className="flex animate-ticker hover:[animation-play-state:paused] items-center">
        {tickerItems.map((asset, index) => {
          const isUp = asset.changePercent >= 0;
          const tick = recentTicks[asset.symbol];

          return (
            <button
              key={`${asset.symbol}-${index}`}
              onClick={() => onSelectAsset(asset)}
              className={`flex items-center gap-2 px-4 py-0.5 text-xs border-r border-[#2a2e39] hover:bg-[#2a2e39]/50 transition-all cursor-pointer shrink-0 ${
                tick === 'up'
                  ? 'bg-[#089981]/20'
                  : tick === 'down'
                  ? 'bg-[#f23645]/20'
                  : ''
              }`}
            >
              {/* Asset Logo or Fallback */}
              <div className="w-4 h-4 rounded-full overflow-hidden bg-[#2a2e39] flex items-center justify-center shrink-0">
                <img
                  src={asset.logoUrl}
                  alt={asset.symbol}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text initials
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Symbol */}
              <span className="font-semibold text-[#d1d4dc] tracking-tight">{asset.symbol}</span>

              {/* Price */}
              <span className="font-mono tabular-nums text-white">
                {asset.price >= 1000 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(asset.price < 1 ? 4 : 2)}
              </span>

              {/* Change % */}
              <div
                className={`flex items-center gap-0.5 font-mono tabular-nums font-medium ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isUp ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
