import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset, AssetCategory } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | AssetCategory>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesQuery =
      asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
      asset.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#1e222d] border border-[#2a2e39] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2a2e39] bg-[#131722]">
          <Search className="w-5 h-5 text-[#2962ff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company name, crypto, or index..."
            className="w-full bg-transparent text-sm md:text-base text-white placeholder-[#787b86] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#2a2e39] overflow-x-auto bg-[#1a1e29]">
          {(['all', 'stocks', 'crypto', 'indices', 'forex', 'futures'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#787b86] text-sm">
              No matching market symbols found for "{query}".
            </div>
          ) : (
            filtered.map((asset) => {
              const isUp = asset.changePercent >= 0;

              return (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2a2e39]/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#131722] text-[#787b86] uppercase">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-xs text-[#787b86] truncate max-w-[240px]">
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
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
                </button>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2 border-t border-[#2a2e39] bg-[#131722] text-[11px] text-[#787b86] flex justify-between items-center">
          <span>Navigate with mouse or touch</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
