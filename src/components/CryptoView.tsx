import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { Bitcoin, TrendingUp, TrendingDown, Star, ChevronRight, Flame } from 'lucide-react';

interface CryptoViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlistSymbols: string[];
  onToggleStar: (symbol: string) => void;
}

export const CryptoView: React.FC<CryptoViewProps> = ({
  assets,
  onSelectAsset,
  watchlistSymbols,
  onToggleStar,
}) => {
  const cryptoAssets = assets.filter((a) => a.category === 'crypto');

  return (
    <div className="w-full bg-[#131722] text-[#d1d4dc] p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bitcoin className="w-6 h-6 text-amber-400" />
            Cryptocurrency Market Tracker
          </h1>
          <p className="text-xs lg:text-sm text-[#787b86] mt-1">
            Real-time digital asset quotes, 24-hour volume, dominance, and sentiment
          </p>
        </div>
      </div>

      {/* Global Crypto Market Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <span className="text-xs text-[#787b86] block">Total Market Cap</span>
          <span className="text-lg lg:text-xl font-bold font-mono text-white mt-1 block">$3.14T</span>
          <span className="text-xs font-mono text-[#089981] font-semibold">+3.84% (24h)</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <span className="text-xs text-[#787b86] block">24h Trading Volume</span>
          <span className="text-lg lg:text-xl font-bold font-mono text-white mt-1 block">$134.8B</span>
          <span className="text-xs font-mono text-[#089981] font-semibold">+18.2%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <span className="text-xs text-[#787b86] block">BTC Dominance</span>
          <span className="text-lg lg:text-xl font-bold font-mono text-white mt-1 block">58.4%</span>
          <span className="text-xs font-mono text-[#787b86]">ETH: 13.2%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <span className="text-xs text-[#787b86] block flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Fear & Greed Index
          </span>
          <span className="text-lg lg:text-xl font-bold font-mono text-amber-400 mt-1 block">84 / 100</span>
          <span className="text-xs font-semibold text-amber-400">Extreme Greed</span>
        </div>
      </div>

      {/* Crypto Table */}
      <div className="rounded-2xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] bg-[#161a25] text-[#787b86] font-semibold">
                <th className="py-3 px-4 w-10 text-center">★</th>
                <th className="py-3 px-4">Coin</th>
                <th className="py-3 px-4 text-right">Price (USD)</th>
                <th className="py-3 px-4 text-right">24h Change %</th>
                <th className="py-3 px-4 text-right">24h High / Low</th>
                <th className="py-3 px-4 text-right">24h Volume</th>
                <th className="py-3 px-4 text-right">Market Cap</th>
                <th className="py-3 px-4 text-center">Technical Rating</th>
                <th className="py-3 px-4 text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {cryptoAssets.map((coin) => {
                const isUp = coin.changePercent >= 0;
                const isStarred = watchlistSymbols.includes(coin.symbol);

                return (
                  <tr
                    key={coin.symbol}
                    className="hover:bg-[#2a2e39]/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(coin.symbol);
                        }}
                        className="text-[#787b86] hover:text-amber-400 p-1"
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    <td onClick={() => onSelectAsset(coin)} className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#131722] p-1 border border-[#2a2e39] overflow-hidden shrink-0">
                          <img
                            src={coin.logoUrl}
                            alt={coin.symbol}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                              {coin.name}
                            </span>
                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#131722] text-[#787b86]">
                              {coin.symbol}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#787b86]">{coin.exchange}</div>
                        </div>
                      </div>
                    </td>

                    <td
                      onClick={() => onSelectAsset(coin)}
                      className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums"
                    >
                      ${coin.price >= 1000 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(coin.price < 1 ? 4 : 2)}
                    </td>

                    <td
                      onClick={() => onSelectAsset(coin)}
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
                          {coin.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    <td
                      onClick={() => onSelectAsset(coin)}
                      className="py-3.5 px-4 text-right font-mono text-[11px] text-[#787b86] tabular-nums"
                    >
                      <div>H: ${coin.high24h >= 1000 ? coin.high24h.toLocaleString() : coin.high24h.toFixed(2)}</div>
                      <div>L: ${coin.low24h >= 1000 ? coin.low24h.toLocaleString() : coin.low24h.toFixed(2)}</div>
                    </td>

                    <td
                      onClick={() => onSelectAsset(coin)}
                      className="py-3.5 px-4 text-right font-mono text-[#787b86] tabular-nums"
                    >
                      {coin.volume}
                    </td>

                    <td
                      onClick={() => onSelectAsset(coin)}
                      className="py-3.5 px-4 text-right font-mono font-medium text-white tabular-nums"
                    >
                      {coin.marketCap}
                    </td>

                    <td onClick={() => onSelectAsset(coin)} className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          coin.rating.includes('Buy')
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : coin.rating.includes('Sell')
                            ? 'bg-[#f23645]/15 text-[#f23645]'
                            : 'bg-[#787b86]/15 text-[#d1d4dc]'
                        }`}
                      >
                        {coin.rating}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectAsset(coin)}
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
