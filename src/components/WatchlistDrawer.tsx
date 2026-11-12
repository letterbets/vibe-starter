import React from 'react';
import { MarketAsset } from '../types/market';
import { Star, X, Trash2, TrendingUp, TrendingDown, ChevronRight, Bell } from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onToggleStar: (symbol: string) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  assets,
  onSelectAsset,
  onToggleStar,
}) => {
  if (!isOpen) return null;

  const starredAssets = assets.filter((a) => watchlistSymbols.includes(a.symbol));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-md h-full bg-[#1e222d] border-l border-[#2a2e39] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39] bg-[#131722]">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Personal Watchlist</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#2a2e39] text-[#787b86]">
              {starredAssets.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watchlist Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50 p-2">
          {starredAssets.length === 0 ? (
            <div className="p-8 text-center text-[#787b86] text-xs space-y-3">
              <Star className="w-10 h-10 mx-auto text-[#2a2e39] stroke-1" />
              <p className="text-sm font-semibold text-white">Your watchlist is empty</p>
              <p>Click the ★ star icon next to any stock, crypto, forex, or index quote to pin it here for real-time tracking.</p>
            </div>
          ) : (
            starredAssets.map((asset) => {
              const isUp = asset.changePercent >= 0;

              return (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#2a2e39]/60 transition-colors group"
                >
                  <div
                    onClick={() => {
                      onSelectAsset(asset);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#131722] p-1 border border-[#2a2e39] overflow-hidden shrink-0">
                      <img
                        src={asset.logoUrl}
                        alt={asset.symbol}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors text-sm">
                        {asset.symbol}
                      </div>
                      <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => {
                        onSelectAsset(asset);
                        onClose();
                      }}
                      className="text-right font-mono tabular-nums cursor-pointer"
                    >
                      <div className="text-sm font-bold text-white">
                        ${asset.price >= 1000 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(asset.price < 1 ? 4 : 2)}
                      </div>
                      <div
                        className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                          isUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleStar(asset.symbol)}
                      className="p-1.5 rounded-lg text-[#787b86] hover:text-[#f23645] hover:bg-[#2a2e39] transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#2a2e39] bg-[#131722] text-xs text-[#787b86] flex justify-between items-center">
          <span>Synced with local storage</span>
          <button
            onClick={() => {
              if (starredAssets.length > 0) {
                alert(`Price alert simulated: Notifications active for ${starredAssets.length} tracked symbols.`);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-[#2962ff] hover:underline"
          >
            <Bell className="w-3.5 h-3.5" />
            Set Alerts
          </button>
        </div>
      </div>
    </div>
  );
};
