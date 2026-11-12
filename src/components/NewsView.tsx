import React, { useState } from 'react';
import { NewsArticle, TradingIdea, MarketAsset } from '../types/market';
import { Newspaper, ThumbsUp, MessageSquare, ExternalLink, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface NewsViewProps {
  news: NewsArticle[];
  ideas: TradingIdea[];
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  ideas,
  assets,
  onSelectAsset,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'ideas'>('news');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ideaDirection, setIdeaDirection] = useState<'all' | 'Long' | 'Short'>('all');

  const filteredNews = news.filter(
    (n) => categoryFilter === 'all' || n.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  const filteredIdeas = ideas.filter(
    (i) => ideaDirection === 'all' || i.direction === ideaDirection
  );

  return (
    <div className="w-full bg-[#131722] text-[#d1d4dc] p-4 lg:p-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Newspaper className="w-6 h-6 text-[#2962ff]" />
            Markets News & Trading Ideas
          </h1>
          <p className="text-xs lg:text-sm text-[#787b86] mt-1">
            Real-time macroeconomic news wire and peer-reviewed technical chart analyses
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#1e222d] p-1 rounded-xl border border-[#2a2e39]">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'news' ? 'bg-[#2962ff] text-white shadow-xs' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Financial News Wire
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ideas' ? 'bg-[#2962ff] text-white shadow-xs' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Community Trading Ideas
          </button>
        </div>
      </div>

      {activeTab === 'news' ? (
        <div>
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {['all', 'Markets', 'Stocks', 'Crypto', 'Economy', 'Commodities'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#2a2e39] text-[#2962ff] font-semibold'
                    : 'bg-[#1e222d] text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News Stream */}
          <div className="space-y-4">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                className="p-5 rounded-2xl bg-[#1e222d] hover:bg-[#222634] border border-[#2a2e39] transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#787b86] mb-1.5">
                    <span className="font-bold text-white">{article.source}</span>
                    <span>·</span>
                    <span>{article.timeAgo}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                    <span>·</span>
                    <span
                      className={`font-semibold capitalize ${
                        article.sentiment === 'bullish'
                          ? 'text-[#089981]'
                          : article.sentiment === 'bearish'
                          ? 'text-[#f23645]'
                          : 'text-[#787b86]'
                      }`}
                    >
                      {article.sentiment}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-[#2962ff] transition-colors leading-snug cursor-pointer">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#787b86] mt-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  {article.symbols.map((sym) => {
                    const match = assets.find((a) => a.symbol === sym);
                    return (
                      <button
                        key={sym}
                        onClick={() => {
                          if (match) onSelectAsset(match);
                        }}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-[#131722] hover:bg-[#2962ff] text-[#2962ff] hover:text-white border border-[#2a2e39] transition-colors"
                      >
                        ${sym}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Ideas Direction Filter */}
          <div className="flex items-center gap-2 mb-6">
            {(['all', 'Long', 'Short'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setIdeaDirection(dir)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  ideaDirection === dir
                    ? 'bg-[#2a2e39] text-[#2962ff] font-semibold'
                    : 'bg-[#1e222d] text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {dir === 'all' ? 'All Directions' : dir}
              </button>
            ))}
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => {
              const match = assets.find((a) => a.symbol === idea.symbol);

              return (
                <div
                  key={idea.id}
                  className="p-5 rounded-2xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between hover:border-[#434651] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{idea.author}</span>
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

                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => {
                          if (match) onSelectAsset(match);
                        }}
                        className="text-xs font-mono font-bold text-[#2962ff] hover:underline"
                      >
                        ${idea.symbol}
                      </button>
                      <span className="text-xs text-[#787b86]">·</span>
                      <span className="text-xs text-[#787b86]">{idea.timeframe}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {idea.title}
                    </h4>

                    <p className="text-xs text-[#787b86] mt-2.5 leading-relaxed">
                      {idea.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2a2e39] flex items-center justify-between text-xs text-[#787b86]">
                    <div>
                      {idea.targetPrice && (
                        <span className="font-mono text-white mr-3">
                          Target: ${idea.targetPrice.toFixed(2)}
                        </span>
                      )}
                      {idea.stopLoss && (
                        <span className="font-mono text-[#f23645]">
                          Stop: ${idea.stopLoss.toFixed(2)}
                        </span>
                      )}
                    </div>

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
        </div>
      )}
    </div>
  );
};
