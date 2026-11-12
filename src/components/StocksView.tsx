import React, { useState, useMemo } from 'react';
import { MarketAsset } from '../types/market';
import { 
  Search, Star, TrendingUp, TrendingDown, 
  ArrowUpDown, Filter, ChevronRight, BarChart2 
} from 'lucide-react';

interface StocksViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlistSymbols: string[];
  onToggleStar: (symbol: string) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'peRatio';
type SortOrder = 'asc' | 'desc';

export const StocksView: React.FC<StocksViewProps> = ({
  assets,
  onSelectAsset,
  watchlistSymbols,
  onToggleStar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const stockAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'stocks');
  }, [assets]);

  // Unique sectors
  const sectors = useMemo(() => {
    const list = stockAssets.map((s) => s.sector).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(list))];
  }, [stockAssets]);

  // Filtered & Sorted Stocks
  const filteredStocks = useMemo(() => {
    return stockAssets
      .filter((stock) => {
        const matchesSearch =
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSector = selectedSector === 'all' || stock.sector === selectedSector;
        const matchesRating = selectedRating === 'all' || stock.rating === selectedRating;
        return matchesSearch && matchesSector && matchesRating;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'marketCap') {
          // Parse $3.61T or $835.4B to number
          const parseCap = (str?: string) => {
            if (!str) return 0;
            const num = parseFloat(str.replace(/[^0-9.]/g, ''));
            if (str.includes('T')) return num * 1000;
            return num;
          };
          valA = parseCap(a.marketCap);
          valB = parseCap(b.marketCap);
        } else if (sortField === 'volume') {
          valA = parseFloat(a.volume.replace(/[^0-9.]/g, '')) || 0;
          valB = parseFloat(b.volume.replace(/[^0-9.]/g, '')) || 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [stockAssets, searchQuery, selectedSector, selectedRating, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="w-full bg-[#131722] text-[#d1d4dc] p-4 lg:p-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-[#2962ff]" />
            US & Global Stocks Screener
          </h1>
          <p className="text-xs lg:text-sm text-[#787b86] mt-1">
            Real-time equity quotes, financial valuation metrics, and technical ratings
          </p>
        </div>

        {/* Top Highlights Banner */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#787b86]">Showing {filteredStocks.length} equities</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39] mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#787b86] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by symbol or company name (e.g. NVDA, Apple)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs md:text-sm text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
          />
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#787b86] font-medium hidden sm:inline">Sector:</span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs text-white focus:outline-none focus:border-[#2962ff] cursor-pointer"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Sectors' : s}
              </option>
            ))}
          </select>
        </div>

        {/* Technical Rating Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#787b86] font-medium hidden sm:inline">Rating:</span>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs text-white focus:outline-none focus:border-[#2962ff] cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="Strong Buy">Strong Buy</option>
            <option value="Buy">Buy</option>
            <option value="Neutral">Neutral</option>
            <option value="Sell">Sell</option>
          </select>
        </div>
      </div>

      {/* Screener Table */}
      <div className="rounded-2xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] bg-[#161a25] text-[#787b86] font-semibold select-none">
                <th className="py-3 px-4 w-10 text-center">★</th>
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ticker & Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Change %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marketCap')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Market Cap</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('peRatio')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>P/E Ratio</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Technical Rating</th>
                <th className="py-3 px-4 text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {filteredStocks.map((stock) => {
                const isUp = stock.changePercent >= 0;
                const isStarred = watchlistSymbols.includes(stock.symbol);

                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-[#2a2e39]/50 transition-colors group cursor-pointer"
                  >
                    {/* Star Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(stock.symbol);
                        }}
                        className="text-[#787b86] hover:text-amber-400 p-1"
                        title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    </td>

                    {/* Ticker & Name */}
                    <td
                      onClick={() => onSelectAsset(stock)}
                      className="py-3.5 px-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#131722] p-1 border border-[#2a2e39] overflow-hidden shrink-0">
                          <img
                            src={stock.logoUrl}
                            alt={stock.symbol}
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
                              {stock.symbol}
                            </span>
                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#131722] text-[#787b86]">
                              {stock.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[150px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td
                      onClick={() => onSelectAsset(stock)}
                      className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums"
                    >
                      ${stock.price.toFixed(2)}
                    </td>

                    {/* Change % */}
                    <td
                      onClick={() => onSelectAsset(stock)}
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
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* Volume */}
                    <td
                      onClick={() => onSelectAsset(stock)}
                      className="py-3.5 px-4 text-right font-mono text-[#787b86] tabular-nums"
                    >
                      {stock.volume}
                    </td>

                    {/* Market Cap */}
                    <td
                      onClick={() => onSelectAsset(stock)}
                      className="py-3.5 px-4 text-right font-mono font-medium text-white tabular-nums"
                    >
                      {stock.marketCap || '—'}
                    </td>

                    {/* P/E Ratio */}
                    <td
                      onClick={() => onSelectAsset(stock)}
                      className="py-3.5 px-4 text-right font-mono text-[#787b86] tabular-nums hidden md:table-cell"
                    >
                      {stock.peRatio ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    {/* Rating */}
                    <td
                      onClick={() => onSelectAsset(stock)}
                      className="py-3.5 px-4 text-center"
                    >
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          stock.rating.includes('Buy')
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : stock.rating.includes('Sell')
                            ? 'bg-[#f23645]/15 text-[#f23645]'
                            : 'bg-[#787b86]/15 text-[#d1d4dc]'
                        }`}
                      >
                        {stock.rating}
                      </span>
                    </td>

                    {/* Action button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectAsset(stock)}
                        className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#2962ff] text-[#787b86] hover:text-white transition-colors"
                        title="Open Interactive Chart"
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
