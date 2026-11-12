import React, { useState, useEffect, useCallback } from 'react';
import { MarketAsset, AssetCategory } from './types/market';
import { INITIAL_ASSETS, SECTOR_HEATMAP_DATA, LATEST_NEWS, TRADING_IDEAS } from './data/marketData';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketsSubNav, NavTab } from './components/MarketsSubNav';
import { OverviewView } from './components/OverviewView';
import { StocksView } from './components/StocksView';
import { CryptoView } from './components/CryptoView';
import { ForexView } from './components/ForexView';
import { FuturesView } from './components/FuturesView';
import { SectorHeatmap } from './components/SectorHeatmap';
import { InteractiveChart } from './components/InteractiveChart';
import { NewsView } from './components/NewsView';
import { SearchModal } from './components/SearchModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';

export default function App() {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(INITIAL_ASSETS[7]); // NVDA default
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([
    'NVDA',
    'AAPL',
    'BTCUSDT',
    'SPX',
    'XAUUSD',
  ]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [recentTicks, setRecentTicks] = useState<Record<string, 'up' | 'down'>>({});

  // Toggle dark mode on <html> tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Watchlist persistence to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tv_markets_watchlist');
      if (saved) {
        setWatchlistSymbols(JSON.parse(saved));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  const handleToggleStar = useCallback((symbol: string) => {
    setWatchlistSymbols((prev) => {
      const updated = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      try {
        localStorage.setItem('tv_markets_watchlist', JSON.stringify(updated));
      } catch {
        // LocalStorage fallback
      }
      return updated;
    });
  }, []);

  // Live price simulator
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      // Pick 1 to 3 random assets to tick
      const countToUpdate = Math.floor(Math.random() * 2) + 1;
      const targetIndices: number[] = [];
      while (targetIndices.length < countToUpdate) {
        const randIdx = Math.floor(Math.random() * INITIAL_ASSETS.length);
        if (!targetIndices.includes(randIdx)) targetIndices.push(randIdx);
      }

      const ticksUpdate: Record<string, 'up' | 'down'> = {};

      setAssets((prevAssets) => {
        return prevAssets.map((asset, idx) => {
          if (!targetIndices.includes(idx)) return asset;

          // Micro variation between -0.3% and +0.3%
          const pctVariation = (Math.random() - 0.49) * 0.006;
          const oldPrice = asset.price;
          const newPrice = Math.max(0.01, oldPrice * (1 + pctVariation));
          const tickDirection = newPrice >= oldPrice ? 'up' : 'down';
          ticksUpdate[asset.symbol] = tickDirection;

          const priceDiff = newPrice - asset.open24h;
          const newChangePercent = (priceDiff / asset.open24h) * 100;

          // Also update selectedAsset if it's the one ticking
          if (selectedAsset.symbol === asset.symbol) {
            setSelectedAsset((curr) => ({
              ...curr,
              price: Number(newPrice.toFixed(asset.price < 1 ? 4 : 2)),
              change: Number(priceDiff.toFixed(2)),
              changePercent: Number(newChangePercent.toFixed(2)),
              high24h: Math.max(curr.high24h, newPrice),
              low24h: Math.min(curr.low24h, newPrice),
            }));
          }

          return {
            ...asset,
            price: Number(newPrice.toFixed(asset.price < 1 ? 4 : 2)),
            change: Number(priceDiff.toFixed(2)),
            changePercent: Number(newChangePercent.toFixed(2)),
            high24h: Math.max(asset.high24h, newPrice),
            low24h: Math.min(asset.low24h, newPrice),
          };
        });
      });

      setRecentTicks((prev) => ({ ...prev, ...ticksUpdate }));

      // Clear the tick flash after 700ms
      setTimeout(() => {
        setRecentTicks((prev) => {
          const next = { ...prev };
          Object.keys(ticksUpdate).forEach((k) => delete next[k]);
          return next;
        });
      }, 700);
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveActive, selectedAsset.symbol]);

  const handleSelectAsset = (asset: MarketAsset) => {
    setSelectedAsset(asset);
    setCurrentTab('chart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSymbol = (symbol: string) => {
    const found = assets.find((a) => a.symbol === symbol);
    if (found) {
      handleSelectAsset(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#131722] text-[#d1d4dc] flex flex-col font-sans">
      {/* 1. Header with Top Bar Contract */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        watchlistCount={watchlistSymbols.length}
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        selectedRegion={selectedRegion}
        onChangeRegion={setSelectedRegion}
        currency={currency}
        onChangeCurrency={setCurrency}
        isLiveActive={isLiveActive}
        onToggleLive={() => setIsLiveActive(!isLiveActive)}
      />

      {/* 2. Continuous Marquee Ticker Tape */}
      <TickerTape
        assets={assets}
        onSelectAsset={handleSelectAsset}
        recentTicks={recentTicks}
      />

      {/* 3. Markets Subnavigation */}
      <MarketsSubNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedAssetSymbol={selectedAsset.symbol}
      />

      {/* 4. Active Main Content Screen */}
      <main className="flex-1">
        {currentTab === 'overview' && (
          <OverviewView
            assets={assets}
            sectors={SECTOR_HEATMAP_DATA}
            news={LATEST_NEWS}
            ideas={TRADING_IDEAS}
            onSelectAsset={handleSelectAsset}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'stocks' && (
          <StocksView
            assets={assets}
            onSelectAsset={handleSelectAsset}
            watchlistSymbols={watchlistSymbols}
            onToggleStar={handleToggleStar}
          />
        )}

        {currentTab === 'crypto' && (
          <CryptoView
            assets={assets}
            onSelectAsset={handleSelectAsset}
            watchlistSymbols={watchlistSymbols}
            onToggleStar={handleToggleStar}
          />
        )}

        {currentTab === 'forex' && (
          <ForexView
            assets={assets}
            onSelectAsset={handleSelectAsset}
            watchlistSymbols={watchlistSymbols}
            onToggleStar={handleToggleStar}
          />
        )}

        {currentTab === 'futures' && (
          <FuturesView
            assets={assets}
            onSelectAsset={handleSelectAsset}
            watchlistSymbols={watchlistSymbols}
            onToggleStar={handleToggleStar}
          />
        )}

        {currentTab === 'heatmap' && (
          <SectorHeatmap
            sectors={SECTOR_HEATMAP_DATA}
            onSelectSymbol={handleSelectSymbol}
          />
        )}

        {currentTab === 'chart' && (
          <InteractiveChart
            asset={selectedAsset}
            isStarred={watchlistSymbols.includes(selectedAsset.symbol)}
            onToggleStar={handleToggleStar}
          />
        )}

        {currentTab === 'news' && (
          <NewsView
            news={LATEST_NEWS}
            ideas={TRADING_IDEAS}
            assets={assets}
            onSelectAsset={handleSelectAsset}
          />
        )}
      </main>

      {/* Global Search Dialog Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={assets}
        onSelectAsset={handleSelectAsset}
      />

      {/* Slide-out Watchlist Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistSymbols={watchlistSymbols}
        assets={assets}
        onSelectAsset={handleSelectAsset}
        onToggleStar={handleToggleStar}
      />

      {/* Footer */}
      <footer className="bg-[#0e1118] border-t border-[#2a2e39] py-8 px-4 lg:px-8 text-xs text-[#787b86]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#2962ff] flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 28 28">
                <path d="M4 19h4.5v-6H4v6zm7.5 0H16V9h-4.5v10zM19 5v14h4.5V5H19z" />
              </svg>
            </div>
            <span className="font-semibold text-white">TradingView Markets</span>
            <span>·</span>
            <span>Live Market Data & Advanced Financial Analytics</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentTab('overview')} className="hover:text-white transition-colors">Overview</button>
            <button onClick={() => setCurrentTab('stocks')} className="hover:text-white transition-colors">Stocks</button>
            <button onClick={() => setCurrentTab('crypto')} className="hover:text-white transition-colors">Crypto</button>
            <button onClick={() => setCurrentTab('forex')} className="hover:text-white transition-colors">Forex</button>
            <button onClick={() => setCurrentTab('heatmap')} className="hover:text-white transition-colors">Heatmap</button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-[#2a2e39]/50 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2 text-[#5d606b]">
          <span>Financial market quotes are simulated in real time for interactive exploration. All trademarks and logos belong to their respective holders.</span>
          <span>TradingView Markets Hub Edition</span>
        </div>
      </footer>
    </div>
  );
}
