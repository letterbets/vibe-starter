import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { DollarSign, TrendingUp, TrendingDown, Star, ChevronRight, ArrowRightLeft } from 'lucide-react';

interface ForexViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlistSymbols: string[];
  onToggleStar: (symbol: string) => void;
}

export const ForexView: React.FC<ForexViewProps> = ({
  assets,
  onSelectAsset,
  watchlistSymbols,
  onToggleStar,
}) => {
  const forexAssets = assets.filter((a) => a.category === 'forex');

  // Interactive Pip & Currency Converter
  const [convertAmount, setConvertAmount] = useState<number>(1000);
  const [selectedPairSymbol, setSelectedPairSymbol] = useState<string>('EURUSD');

  const selectedPair = forexAssets.find((a) => a.symbol === selectedPairSymbol) || forexAssets[0];
  const convertedValue = selectedPair ? convertAmount * selectedPair.price : 0;

  return (
    <div className="w-full bg-[#131722] text-[#d1d4dc] p-4 lg:p-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Forex & Global Currency Pairs
          </h1>
          <p className="text-xs lg:text-sm text-[#787b86] mt-1">
            Real-time foreign exchange rates, bid/ask spreads, and pip volatility
          </p>
        </div>
      </div>

      {/* Quick Currency Converter Panel */}
      <div className="p-5 rounded-2xl bg-[#1e222d] border border-[#2a2e39] mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2962ff]/15 flex items-center justify-center text-[#2962ff]">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live FX Converter</h3>
            <span className="text-xs text-[#787b86]">Institutional interbank mid-market rate</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#131722] px-3 py-1.5 rounded-lg border border-[#2a2e39]">
            <span className="text-xs text-[#787b86]">Amount:</span>
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(Number(e.target.value) || 0)}
              className="w-24 bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
            />
          </div>

          <select
            value={selectedPairSymbol}
            onChange={(e) => setSelectedPairSymbol(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs font-semibold text-white focus:outline-none focus:border-[#2962ff] cursor-pointer"
          >
            {forexAssets.map((f) => (
              <option key={f.symbol} value={f.symbol}>
                {f.name} ({f.symbol})
              </option>
            ))}
          </select>

          <div className="px-4 py-2 rounded-lg bg-[#2962ff]/15 border border-[#2962ff]/30 text-xs md:text-sm font-mono font-bold text-[#2962ff]">
            = {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Forex Table */}
      <div className="rounded-2xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] bg-[#161a25] text-[#787b86] font-semibold">
                <th className="py-3 px-4 w-10 text-center">★</th>
                <th className="py-3 px-4">Currency Pair</th>
                <th className="py-3 px-4 text-right">Mid Rate</th>
                <th className="py-3 px-4 text-right">24h Change (Pips)</th>
                <th className="py-3 px-4 text-right">24h Change %</th>
                <th className="py-3 px-4 text-right">Day Range</th>
                <th className="py-3 px-4 text-center">Technical Rating</th>
                <th className="py-3 px-4 text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {forexAssets.map((pair) => {
                const isUp = pair.changePercent >= 0;
                const isStarred = watchlistSymbols.includes(pair.symbol);
                // Calculate pips (for 4-decimal pairs: change * 10000; for JPY pairs: change * 100)
                const isJPY = pair.symbol.includes('JPY');
                const pips = (pair.change * (isJPY ? 100 : 10000)).toFixed(1);

                return (
                  <tr
                    key={pair.symbol}
                    className="hover:bg-[#2a2e39]/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(pair.symbol);
                        }}
                        className="text-[#787b86] hover:text-amber-400 p-1"
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    <td onClick={() => onSelectAsset(pair)} className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#131722] p-1 border border-[#2a2e39] overflow-hidden shrink-0">
                          <img
                            src={pair.countryFlag || pair.logoUrl}
                            alt={pair.symbol}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {pair.symbol}
                          </span>
                          <div className="text-[11px] text-[#787b86]">{pair.name}</div>
                        </div>
                      </div>
                    </td>

                    <td
                      onClick={() => onSelectAsset(pair)}
                      className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums text-sm"
                    >
                      {pair.price.toFixed(isJPY ? 2 : 4)}
                    </td>

                    <td
                      onClick={() => onSelectAsset(pair)}
                      className="py-3.5 px-4 text-right font-mono font-bold tabular-nums"
                    >
                      <span className={isUp ? 'text-[#089981]' : 'text-[#f23645]'}>
                        {isUp ? '+' : ''}
                        {pips} pips
                      </span>
                    </td>

                    <td
                      onClick={() => onSelectAsset(pair)}
                      className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums"
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${
                          isUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>
                          {isUp ? '+' : ''}
                          {pair.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    <td
                      onClick={() => onSelectAsset(pair)}
                      className="py-3.5 px-4 text-right font-mono text-[11px] text-[#787b86] tabular-nums"
                    >
                      <span>{pair.low24h.toFixed(isJPY ? 2 : 4)} - {pair.high24h.toFixed(isJPY ? 2 : 4)}</span>
                    </td>

                    <td onClick={() => onSelectAsset(pair)} className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          pair.rating.includes('Buy')
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : pair.rating.includes('Sell')
                            ? 'bg-[#f23645]/15 text-[#f23645]'
                            : 'bg-[#787b86]/15 text-[#d1d4dc]'
                        }`}
                      >
                        {pair.rating}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectAsset(pair)}
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
