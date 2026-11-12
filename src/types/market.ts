export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  sector?: string;
  industry?: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  open24h: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  rating: TechnicalRating;
  technicalScore: number; // 0 to 100
  logoUrl: string;
  sparkline: number[];
  history: CandlePoint[];
  exchange: string;
  country: string;
  countryFlag?: string;
  currency?: string;
  week52High?: number;
  week52Low?: number;
  beta?: number;
  dividendYield?: string;
  description: string;
}

export interface SectorHeatmapItem {
  id: string;
  symbol: string;
  name: string;
  marketCapNumber: number; // in billions
  changePercent: number;
  price: number;
  logoUrl: string;
}

export interface SectorGroup {
  id: string;
  name: string;
  totalMarketCap: number;
  averageChange: number;
  items: SectorHeatmapItem[];
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  symbols: string[];
  summary: string;
  url: string;
  readTime: string;
}

export interface TradingIdea {
  id: string;
  title: string;
  author: string;
  authorBadge: string;
  symbol: string;
  direction: 'Long' | 'Short' | 'Neutral';
  timeframe: string;
  likes: number;
  comments: number;
  timestamp: string;
  content: string;
  targetPrice?: number;
  stopLoss?: number;
}
