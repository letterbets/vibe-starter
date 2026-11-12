import React from 'react';
import { Search, Star, Moon, Sun, Globe, Radio } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  watchlistCount: number;
  onToggleWatchlist: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  selectedRegion: string;
  onChangeRegion: (region: string) => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
  isLiveActive: boolean;
  onToggleLive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  watchlistCount,
  onToggleWatchlist,
  isDarkMode,
  onToggleDarkMode,
  selectedRegion,
  onChangeRegion,
  currency,
  onChangeCurrency,
  isLiveActive,
  onToggleLive,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 md:gap-8 px-4 lg:px-8 py-2.5 bg-[#131722] dark:bg-[#131722] border-b border-[#2a2e39] text-[#d1d4dc] transition-colors">
      {/* Zone 1: Single text element wordmark with TradingView branding */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="#overview" className="flex items-center gap-2.5 group">
          {/* TradingView signature polygon logo */}
          <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white shadow-sm shadow-[#2962ff]/30 group-hover:bg-[#1e53e5] transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 28 28">
              <path d="M4 19h4.5v-6H4v6zm7.5 0H16V9h-4.5v10zM19 5v14h4.5V5H19z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              TradingView
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#2962ff]">
                MARKETS
              </span>
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Search Affordance */}
      <div className="flex-1 max-w-xl mx-auto">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-sm text-[#787b86] hover:text-[#d1d4dc] transition-all cursor-pointer group"
          title="Search symbols, indices, crypto (Ctrl+K)"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#787b86] group-hover:text-[#2962ff] transition-colors" />
            <span className="text-xs md:text-sm">Search markets, stocks, crypto, forex...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono text-[#787b86] bg-[#131722] border border-[#2a2e39] rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Market controls & actions */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Live Simulator Status toggle */}
        <button
          onClick={onToggleLive}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors border ${
            isLiveActive
              ? 'bg-[#089981]/10 text-[#089981] border-[#089981]/30 hover:bg-[#089981]/20'
              : 'bg-[#2a2e39]/50 text-[#787b86] border-[#2a2e39] hover:text-[#d1d4dc]'
          }`}
          title={isLiveActive ? 'Live simulation running. Click to pause.' : 'Live simulation paused. Click to resume.'}
        >
          <Radio className={`w-3 h-3 ${isLiveActive ? 'animate-pulse text-[#089981]' : 'text-[#787b86]'}`} />
          <span className="hidden sm:inline">{isLiveActive ? 'LIVE' : 'PAUSED'}</span>
        </button>

        {/* Region selector */}
        <div className="relative hidden md:flex items-center">
          <Globe className="w-3.5 h-3.5 text-[#787b86] absolute left-2 pointer-events-none" />
          <select
            value={selectedRegion}
            onChange={(e) => onChangeRegion(e.target.value)}
            className="pl-7 pr-2 py-1 text-xs rounded-md bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] hover:border-[#434651] focus:outline-none focus:border-[#2962ff] cursor-pointer appearance-none"
          >
            <option value="US">US Market</option>
            <option value="GLOBAL">Global</option>
            <option value="EU">Europe</option>
            <option value="ASIA">Asia-Pacific</option>
          </select>
        </div>

        {/* Currency selector */}
        <select
          value={currency}
          onChange={(e) => onChangeCurrency(e.target.value)}
          className="hidden sm:block px-2 py-1 text-xs rounded-md bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] hover:border-[#434651] focus:outline-none focus:border-[#2962ff] cursor-pointer"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
        </select>

        {/* Watchlist button */}
        <button
          onClick={onToggleWatchlist}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#d1d4dc] transition-colors relative"
          title="Open Watchlist"
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="hidden sm:inline">Watchlist</span>
          {watchlistCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#2962ff] text-white">
              {watchlistCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-md bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] transition-colors"
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
