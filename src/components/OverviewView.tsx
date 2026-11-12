import React, { useState } from 'react';
import { MarketAsset, NewsArticle, TradingIdea, SectorGroup } from '../types/market';
import { 
  TrendingUp, TrendingDown, ArrowRight, Zap, Globe, 
  ExternalLink, MessageSquare, ThumbsUp, ChevronRight 
} from 'lucide-react';

interface OverviewViewProps {
  assets: MarketAsset[];
  sectors: SectorGroup[];
  news: NewsArticle[];
  ideas: TradingIdea[];
  onSelectAsset: (asset: MarketAsset) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  assets,
  sectors,
  news,
  ideas,
  onSelectAsset,
  onNavigateTab,
}) => {
  const [moverTab, setMoverTab] = useState<'active' | 'gainers' | 'losers' | 'highs'>('active');

  const indices = assets.filter((a) => a.category === 'indices');
  const stocks = assets.filter((a) => a.category === 'stocks');

  // Filter market movers
  const getMovers = () => {
    const list = [...stocks, ...assets.filter((a) => a.category === 'crypto')];
    switch (moverTab) {
      case 'gainers':
        return list.sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
      case 'losers':
        return list.sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
      case 'highs':
        return list.filter((a) => a.week52High && a.price / a.week52High > 0.95).slice(0, 5);
      case 'active':
      default:
        return list.sort((a, b) => (parseFloat(b.volume) || 0) - (parseFloat(a.volume) || 0)).slice(0, 5);
    }
  };

  const movers = getMovers();

  return (
    <div className="w-full bg-[#131722] text-[#d1d4dc] pb-16">
      {/* Hero Banner with TradingView Markets Illustration */}
      <div className="relative overflow-hidden border-b border-[#2a2e39] bg-gradient-to-r from-[#131722] via-[#1a1e2b] to-[#131722] px-4 lg:px-8 py-8 lg:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2962ff] mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Real-Time Global Market Intelligence
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Where the world trades, analyzes, and tracks markets.
            </h1>
            <p className="text-sm lg:text-base text-[#787b86] mt-3 leading-relaxed">
              Live quotes, interactive candlestick charts, sector heatmaps, and financial screeners across global indices, stocks, crypto, forex, and futures.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                onClick={() => onNavigateTab('stocks')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2962ff] hover:bg-[#1e53e5] rounded-lg transition-colors cursor-pointer shadow-sm shadow-[#2962ff]/30"
              >
                Explore Stock Movers
              </button>
              <button
                onClick={() => onNavigateTab('heatmap')}
                className="px-4 py-2 text-xs font-semibold text-[#d1d4dc] bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] rounded-lg transition-colors cursor-pointer"
              >
                View Sector Heatmap
              </button>
            </div>
          </div>

          {/* Hotlinked TradingView Illustration */}
          <div className="relative w-full md:w-80 lg:w-96 h-48 md:h-52 rounded-2xl overflow-hidden border border-[#2a2e39] shadow-2xl bg-[#1e222d] shrink-0">
            <img
              src="https://s.tradingview.com/static/images/illustrations/markets.jpg"
              alt="TradingView Markets"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Subtle Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#131722]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 text-xs font-semibold text-white/90">
              Live Indices & Macro Dashboard
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8 space-y-10">
        {/* Section 1: Major World Indices Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#2962ff]" />
              Major World Indices
            </h2>
            <button
              onClick={() => onNavigateTab('chart')}
              className="text-xs font-semibold text-[#2962ff] hover:underline flex items-center gap-1"
            >
              Full Chart View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {indices.map((indexAsset) => {
              const isUp = indexAsset.changePercent >= 0;

              return (
                <div
                  key={indexAsset.symbol}
                  onClick={() => onSelectAsset(indexAsset)}
                  className="p-4 rounded-xl bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#131722] p-1 border border-[#2a2e39] flex items-center justify-center shrink-0">
                        <img
                          src={indexAsset.logoUrl}
                          alt={indexAsset.symbol}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm group-hover:text-[#2962ff] transition-colors">
                          {indexAsset.symbol}
                        </span>
                        <div className="text-[11px] text-[#787b86] truncate max-w-[130px]">
                          {indexAsset.name}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {indexAsset.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-white tabular-nums">
                      {indexAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-xs font-mono font-medium ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {indexAsset.change.toFixed(2)}
                    </span>
                  </div>

                  {/* Mini Sparkline SVG */}
                  <div className="mt-3 h-9 w-full">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <polyline
                        fill="none"
                        stroke={isUp ? '#089981' : '#f23645'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={indexAsset.sparkline
                          .map((val, idx) => {
                            const min = Math.min(...indexAsset.sparkline);
                            const max = Math.max(...indexAsset.sparkline);
                            const range = max - min || 1;
                            const x = (idx / (indexAsset.sparkline.length - 1)) * 100;
                            const y = 28 - ((val - min) / range) * 24;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Split Columns: Market Movers & Sector Preview */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Market Movers Screener Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col p-5 rounded-2xl bg-[#1e222d] border border-[#2a2e39]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2a2e39]">
              <h3 className="text-base font-bold text-white tracking-tight">Market Movers</h3>

              {/* Segmented Movers Tabs */}
              <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
                <button
                  onClick={() => setMoverTab('active')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    moverTab === 'active' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  Most Active
                </button>
                <button
                  onClick={() => setMoverTab('gainers')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    moverTab === 'gainers' ? 'bg-[#2a2e39] text-[#089981]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  Top Gainers
                </button>
                <button
                  onClick={() => setMoverTab('losers')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    moverTab === 'losers' ? 'bg-[#2a2e39] text-[#f23645]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  Top Losers
                </button>
                <button
                  onClick={() => setMoverTab('highs')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    moverTab === 'highs' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  52W Highs
                </button>
              </div>
            </div>

            {/* Movers Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2a2e39] text-[#787b86] font-semibold">
                    <th className="py-2.5 px-2">Symbol</th>
                    <th className="py-2.5 px-2 text-right">Price</th>
                    <th className="py-2.5 px-2 text-right">Change %</th>
                    <th className="py-2.5 px-2 text-right">Volume</th>
                    <th className="py-2.5 px-2 text-center">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2e39]/50">
                  {movers.map((item) => {
                    const isUp = item.changePercent >= 0;

                    return (
                      <tr
                        key={item.symbol}
                        onClick={() => onSelectAsset(item)}
                        className="hover:bg-[#2a2e39]/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#131722] p-0.5 shrink-0">
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
                              <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                                {item.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-right font-mono font-semibold text-white tabular-nums">
                          ${item.price >= 1000 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(item.price < 1 ? 4 : 2)}
                        </td>

                        <td className="py-3 px-2 text-right font-mono font-bold tabular-nums">
                          <span className={isUp ? 'text-[#089981]' : 'text-[#f23645]'}>
                            {isUp ? '+' : ''}
                            {item.changePercent.toFixed(2)}%
                          </span>
                        </td>

                        <td className="py-3 px-2 text-right font-mono text-[#787b86] tabular-nums">
                          {item.volume}
                        </td>

                        <td className="py-3 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 mt-2 border-t border-[#2a2e39] text-center">
              <button
                onClick={() => onNavigateTab('stocks')}
                className="text-xs font-semibold text-[#2962ff] hover:underline"
              >
                Open Full Stock Screener →
              </button>
            </div>
          </div>

          {/* Right: Sector Heatmap Mini Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col p-5 rounded-2xl bg-[#1e222d] border border-[#2a2e39]">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
              <h3 className="text-base font-bold text-white tracking-tight">Market Heatmap Snapshot</h3>
              <button
                onClick={() => onNavigateTab('heatmap')}
                className="text-xs font-semibold text-[#2962ff] hover:underline flex items-center gap-1"
              >
                Expand <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mini Heatmap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {sectors.flatMap((s) => s.items.slice(0, 2)).slice(0, 6).map((item) => {
                const isUp = item.changePercent >= 0;

                return (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      const found = assets.find((a) => a.symbol === item.symbol);
                      if (found) onSelectAsset(found);
                    }}
                    className={`p-3 rounded-lg flex flex-col justify-between text-left transition-transform hover:scale-102 cursor-pointer ${
                      item.changePercent >= 2
                        ? 'bg-[#089981] text-white'
                        : item.changePercent > 0
                        ? 'bg-[#089981]/70 text-white'
                        : item.changePercent > -2
                        ? 'bg-[#f23645]/70 text-white'
                        : 'bg-[#f23645] text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs">{item.symbol}</span>
                      <span className="text-[10px] opacity-80">${(item.marketCapNumber / 1000).toFixed(1)}T</span>
                    </div>
                    <div className="mt-2 flex justify-between items-baseline font-mono text-xs font-bold tabular-nums">
                      <span>${item.price.toFixed(1)}</span>
                      <span>
                        {isUp ? '+' : ''}
                        {item.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Macro Stats */}
            <div className="mt-6 pt-4 border-t border-[#2a2e39] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <span className="text-[10px] text-[#787b86] block">VIX Volatility</span>
                <span className="font-mono font-bold text-white">14.85 (-3.2%)</span>
              </div>
              <div className="p-2 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <span className="text-[10px] text-[#787b86] block">US 10Y Yield</span>
                <span className="font-mono font-bold text-white">4.42% (+0.04)</span>
              </div>
              <div className="p-2 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <span className="text-[10px] text-[#787b86] block">DXY Dollar</span>
                <span className="font-mono font-bold text-white">106.48 (+0.3%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Community Technical Ideas & Analysis */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Community Trends & Trading Ideas
            </h2>
            <button
              onClick={() => onNavigateTab('news')}
              className="text-xs font-semibold text-[#2962ff] hover:underline"
            >
              See All Ideas →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea) => {
              return (
                <div
                  key={idea.id}
                  className="p-5 rounded-2xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between hover:border-[#434651] transition-all"
                >
                  <div>
                    {/* Author & Direction */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{idea.author}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2a2e39] text-[#787b86]">
                          {idea.authorBadge}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          idea.direction === 'Long'
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {idea.direction}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {idea.title}
                    </h4>

                    <p className="text-xs text-[#787b86] mt-2 line-clamp-3 leading-relaxed">
                      {idea.content}
                    </p>
                  </div>

                  {/* Target & Engagement */}
                  <div className="mt-4 pt-3 border-t border-[#2a2e39] flex items-center justify-between text-xs text-[#787b86]">
                    <span className="font-mono text-white">
                      Target: ${idea.targetPrice?.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {idea.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {idea.comments}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Latest Breaking Financial News */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
              Latest Market News
            </h2>
            <button
              onClick={() => onNavigateTab('news')}
              className="text-xs font-semibold text-[#2962ff] hover:underline"
            >
              News Wire →
            </button>
          </div>

          <div className="divide-y divide-[#2a2e39] rounded-2xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
            {news.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-[#2a2e39]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#787b86] mb-1">
                    <span className="font-semibold text-white">{item.source}</span>
                    <span>·</span>
                    <span>{item.timeAgo}</span>
                    <span>·</span>
                    <span>{item.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white hover:text-[#2962ff] transition-colors cursor-pointer">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#787b86] mt-1 line-clamp-1">{item.summary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.symbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => {
                        const match = assets.find((a) => a.symbol === sym);
                        if (match) onSelectAsset(match);
                      }}
                      className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-[#131722] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#2962ff] transition-colors"
                    >
                      ${sym}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
