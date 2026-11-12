import React from 'react';
import { MarketAsset } from '../types/market';
import { Flame, TrendingUp, TrendingDown, Star, ChevronRight } from 'lucide-react';

interface FuturesViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlistSymbols: string[];
  onToggleStar: (symbol: string) => void;
}

export const FuturesView: React.FC<FuturesViewProps> = ({
  assets,
  onSelectAsset,
  watchlistSymbols,
  onToggleStar,
}) => {
  const futuresAssets = assets.filter((a) => a.category === 'futures');

  return (
    <div className="w-full bg-[#131722] text-[#d1d4dc] p-4 lg:p-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-500" />
            Futures, Metals & Energy Commodities
          </h1>
          <p className="text-xs lg:text-sm text-[#787b86] mt-1">
            Real-time precious metals, crude oil benchmarks, and commodity contract quotes
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {futuresAssets.map((f) => {
          const isUp = f.changePercent >= 0;

          return (
            <div
              key={f.symbol}
              onClick={() => onSelectAsset(f)}
              className="p-4 rounded-xl bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#131722] p-1 border border-[#2a2e39] overflow-hidden shrink-0">
                    <img
                      src={f.logoUrl}
                      alt={f.symbol}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm group-hover:text-[#2962ff] transition-colors">
                      {f.symbol}
                    </span>
                    <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">{f.name}</div>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {f.changePercent.toFixed(2)}%
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  ${f.price >= 1000 ? f.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : f.price.toFixed(2)}
                </span>
                <span className={`text-xs font-mono font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {isUp ? '+' : ''}${f.change.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Futures Table */}
      <div className="rounded-2xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] bg-[#161a25] text-[#787b86] font-semibold">
                <th className="py-3 px-4 w-10 text-center">★</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4 text-right">Settlement Price</th>
                <th className="py-3 px-4 text-right">Change $</th>
                <th className="py-3 px-4 text-right">Change %</th>
                <th className="py-3 px-4 text-right">Exchange</th>
                <th className="py-3 px-4 text-center">Technical Rating</th>
                <th className="py-3 px-4 text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {futuresAssets.map((item) => {
                const isUp = item.changePercent >= 0;
                const isStarred = watchlistSymbols.includes(item.symbol);

                return (
                  <tr
                    key={item.symbol}
                    className="hover:bg-[#2a2e39]/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(item.symbol);
                        }}
                        className="text-[#787b86] hover:text-amber-400 p-1"
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    <td onClick={() => onSelectAsset(item)} className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#131722] p-1 border border-[#2a2e39] overflow-hidden shrink-0">
                          <img
                            src={item.logoUrl}
                            alt={item.symbol}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {item.symbol}
                          </span>
                          <div className="text-[11px] text-[#787b86]">{item.name}</div>
                        </div>
                      </div>
                    </td>

                    <td
                      onClick={() => onSelectAsset(item)}
                      className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums text-sm"
                    >
                      ${item.price >= 1000 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(2)}
                    </td>

                    <td
                      onClick={() => onSelectAsset(item)}
                      className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums"
                    >
                      <span className={isUp ? 'text-[#089981]' : 'text-[#f23645]'}>
                        {isUp ? '+' : ''}${item.change.toFixed(2)}
                      </span>
                    </td>

                    <td
                      onClick={() => onSelectAsset(item)}
                      className="py-3.5 px-4 text-right font-mono font-bold tabular-nums"
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${
                          isUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>
                          {isUp ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    <td
                      onClick={() => onSelectAsset(item)}
                      className="py-3.5 px-4 text-right font-mono text-[#787b86]"
                    >
                      {item.exchange}
                    </td>

                    <td onClick={() => onSelectAsset(item)} className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          item.rating.includes('Buy')
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : item.rating.includes('Sell')
                            ? 'bg-[#f23645]/15 text-[#f23645]'
                            : 'bg-[#787b86]/15 text-[#d1d4dc]'
                        }`}
                      >
                        {item.rating}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectAsset(item)}
                        className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#2962ff] text-[#787b86] hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
