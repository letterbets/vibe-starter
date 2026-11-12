import React from 'react';
import { LayoutGrid, BarChart2, Bitcoin, DollarSign, Flame, Grid3X3, CandlestickChart, Newspaper } from 'lucide-react';

export type NavTab = 'overview' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'heatmap' | 'chart' | 'news';

interface MarketsSubNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedAssetSymbol?: string;
}

export const MarketsSubNav: React.FC<MarketsSubNavProps> = ({ currentTab, onTabChange, selectedAssetSymbol }) => {
  const tabs = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutGrid },
    { id: 'stocks' as NavTab, label: 'Stocks', icon: BarChart2 },
    { id: 'crypto' as NavTab, label: 'Crypto', icon: Bitcoin },
    { id: 'forex' as NavTab, label: 'Forex', icon: DollarSign },
    { id: 'futures' as NavTab, label: 'Futures & Commodities', icon: Flame },
    { id: 'heatmap' as NavTab, label: 'Sector Heatmap', icon: Grid3X3 },
    { id: 'chart' as NavTab, label: selectedAssetSymbol ? `Chart (${selectedAssetSymbol})` : 'Interactive Chart', icon: CandlestickChart },
    { id: 'news' as NavTab, label: 'News & Ideas', icon: Newspaper },
  ];

  return (
    <div className="w-full bg-[#131722] dark:bg-[#131722] border-b border-[#2a2e39] px-4 lg:px-8">
      <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none" aria-label="Markets subnavigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#2a2e39] text-[#2962ff] dark:text-[#2962ff] font-semibold shadow-xs'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2962ff]' : 'text-[#787b86]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
