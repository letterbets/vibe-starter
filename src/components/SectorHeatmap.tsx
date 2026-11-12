import React, { useState } from 'react';
import { SectorGroup, SectorHeatmapItem } from '../types/market';
import { Info, ZoomIn, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SectorHeatmapProps {
  sectors: SectorGroup[];
  onSelectSymbol: (symbol: string) => void;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ sectors, onSelectSymbol }) => {
  const [hoveredItem, setHoveredItem] = useState<SectorHeatmapItem | null>(null);
  const [filterTimeframe, setFilterTimeframe] = useState<'1D' | '1W' | '1M' | 'YTD'>('1D');

  // Helper for performance color calculation
  const getTileBg = (change: number) => {
    if (change >= 3) return 'bg-[#089981] text-white hover:bg-[#0aa88f]';
    if (change >= 1.5) return 'bg-[#089981]/85 text-white hover:bg-[#089981]';
    if (change > 0) return 'bg-[#089981]/50 text-white hover:bg-[#089981]/70';
    if (change === 0) return 'bg-[#2a2e39] text-[#d1d4dc] hover:bg-[#363a45]';
    if (change > -1.5) return 'bg-[#f23645]/50 text-white hover:bg-[#f23645]/70';
    if (change > -3) return 'bg-[#f23645]/85 text-white hover:bg-[#f23645]';
    return 'bg-[#f23645] text-white hover:bg-[#e02d3c]';
  };

  return (
    <div className="w-full bg-[#131722] text-[#d1d4dc] p-4 lg:p-8">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            S&P 500 & Mega-Cap Sector Heatmap
          </h2>
          <p className="text-xs lg:text-sm text-[#787b86] mt-0.5">
            Area corresponds to market capitalization · Color indicates price change
          </p>
        </div>

        {/* Timeframe & Legend Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1e222d] p-1 rounded-lg border border-[#2a2e39]">
            {(['1D', '1W', '1M', 'YTD'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setFilterTimeframe(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filterTimeframe === tf
                    ? 'bg-[#2962ff] text-white shadow-xs'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Color Scale Legend */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#787b86]">
            <span>-3%</span>
            <div className="flex h-3 w-28 rounded overflow-hidden">
              <span className="flex-1 bg-[#f23645]" />
              <span className="flex-1 bg-[#f23645]/60" />
              <span className="flex-1 bg-[#2a2e39]" />
              <span className="flex-1 bg-[#089981]/60" />
              <span className="flex-1 bg-[#089981]" />
            </div>
            <span>+3%</span>
          </div>
        </div>
      </div>

      {/* Treemap Sectors Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[600px]">
        {sectors.map((sector, sIdx) => {
          // Layout sectors proportionally
          const colSpan =
            sector.id === 'tech'
              ? 'lg:col-span-6'
              : sector.id === 'communication'
              ? 'lg:col-span-3'
              : sector.id === 'consumer_cyclical'
              ? 'lg:col-span-3'
              : sector.id === 'financial'
              ? 'lg:col-span-4'
              : 'lg:col-span-4';

          return (
            <div
              key={sector.id}
              className={`${colSpan} flex flex-col p-3 rounded-xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden`}
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2a2e39]/60">
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  {sector.name}
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    sector.averageChange >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {sector.averageChange >= 0 ? '+' : ''}
                  {sector.averageChange.toFixed(2)}%
                </span>
              </div>

              {/* Items Grid */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sector.items.map((item) => {
                  const isUp = item.changePercent >= 0;
                  const isLarge = item.marketCapNumber > 1500;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSymbol(item.symbol)}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`relative flex flex-col justify-between p-2.5 rounded-lg transition-all cursor-pointer text-left ${getTileBg(
                        item.changePercent
                      )} ${isLarge ? 'col-span-2 row-span-2' : ''}`}
                    >
                      {/* Top: Logo & Symbol */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm tracking-tight">{item.symbol}</span>
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-black/20 p-0.5">
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
                      </div>

                      {/* Middle: Name */}
                      <span className="text-[11px] opacity-90 truncate w-full font-medium">
                        {item.name}
                      </span>

                      {/* Bottom: Price & Change */}
                      <div className="mt-1 flex items-baseline justify-between w-full font-mono tabular-nums text-xs">
                        <span className="font-semibold">${item.price.toFixed(2)}</span>
                        <span className="font-bold flex items-center">
                          {isUp ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating or Footer Item Details when Hovered */}
      {hoveredItem && (
        <div className="mt-4 p-3 rounded-lg bg-[#1e222d] border border-[#2962ff]/40 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm">{hoveredItem.symbol}</span>
            <span className="text-[#787b86]">{hoveredItem.name}</span>
            <span className="text-[#787b86]">·</span>
            <span className="font-mono text-white font-medium">
              Market Cap: ${(hoveredItem.marketCapNumber / 1000).toFixed(2)}T
            </span>
            <span className="text-[#787b86]">·</span>
            <span className="font-mono text-white font-medium">Price: ${hoveredItem.price.toFixed(2)}</span>
          </div>

          <button
            onClick={() => onSelectSymbol(hoveredItem.symbol)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded font-medium transition-colors"
          >
            <span>Open in Interactive Chart</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
