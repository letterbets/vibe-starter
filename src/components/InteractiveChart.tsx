import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MarketAsset, CandlePoint } from '../types/market';
import { 
  TrendingUp, TrendingDown, Maximize2, Minimize2, 
  Layers, Star, RefreshCw, ShoppingCart, DollarSign
} from 'lucide-react';

interface InteractiveChartProps {
  asset: MarketAsset;
  isStarred: boolean;
  onToggleStar: (symbol: string) => void;
  onSelectRelated?: (symbol: string) => void;
}

type TimeFrame = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
type ChartType = 'candles' | 'area' | 'line';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  asset,
  isStarred,
  onToggleStar,
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1M');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Paper trading state
  const [simShares, setSimShares] = useState(0);
  const [avgCost, setAvgCost] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(10);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);

  // Mouse hover state for crosshairs
  const [hoverData, setHoverData] = useState<{
    candle: CandlePoint | null;
    x: number;
    y: number;
    price: number | null;
  }>({
    candle: null,
    x: -1,
    y: -1,
    price: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter candles based on timeframe
  const visibleCandles = useMemo(() => {
    const all = asset.history || [];
    if (all.length === 0) return [];

    switch (timeframe) {
      case '1D':
        return all.slice(-12);
      case '5D':
        return all.slice(-20);
      case '1M':
        return all.slice(-30);
      case '3M':
        return all.slice(-40);
      case '6M':
      case '1Y':
      case 'ALL':
      default:
        return all;
    }
  }, [asset.history, timeframe]);

  // Calculate Moving Averages
  const ma20 = useMemo(() => {
    const period = 5;
    return visibleCandles.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  }, [visibleCandles]);

  const ma50 = useMemo(() => {
    const period = 10;
    return visibleCandles.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  }, [visibleCandles]);

  // Calculate synthetic RSI
  const rsiValues = useMemo(() => {
    const values: (number | null)[] = [];
    for (let i = 0; i < visibleCandles.length; i++) {
      if (i < 6) {
        values.push(null);
        continue;
      }
      let gains = 0;
      let losses = 0;
      for (let j = i - 5; j <= i; j++) {
        const diff = visibleCandles[j].close - visibleCandles[j].open;
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
      }
      const rs = losses === 0 ? 100 : gains / losses;
      const rsi = 100 - (100 / (1 + rs));
      values.push(Math.min(95, Math.max(15, rsi)));
    }
    return values;
  }, [visibleCandles]);

  // Render chart on canvas
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (visibleCandles.length === 0) {
      ctx.fillStyle = '#787b86';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No candle data available', width / 2, height / 2);
      ctx.restore();
      return;
    }

    // Chart dimensions layout
    const paddingRight = 65; // price axis width
    const paddingBottom = showRSI ? 80 : 35; // time axis & rsi subchart height
    const paddingTop = 25;
    const paddingLeft = 15;

    const chartWidth = width - paddingRight - paddingLeft;
    const mainChartHeight = height - paddingBottom - paddingTop - (showRSI ? 60 : 0);

    // Min and Max prices for visible candles
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    // Add padding to price scale (3%)
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const effectiveRange = maxPrice - minPrice;

    const getY = (val: number) => {
      return paddingTop + (1 - (val - minPrice) / effectiveRange) * mainChartHeight;
    };

    const count = visibleCandles.length;
    const candleWidth = Math.max(3, (chartWidth / count) * 0.7);
    const stepX = chartWidth / count;

    // Draw horizontal grid lines & price labels
    const gridLines = 6;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(42, 46, 57, 0.4)';
    ctx.fillStyle = '#787b86';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridLines; i++) {
      const p = minPrice + (effectiveRange * i) / gridLines;
      const y = getY(p);

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      const formattedP = p >= 1000 ? p.toFixed(1) : p.toFixed(p < 1 ? 4 : 2);
      ctx.fillText(formattedP, width - paddingRight + 6, y + 4);
    }

    // Draw vertical grid lines & dates
    const dateInterval = Math.max(1, Math.floor(count / 6));
    ctx.textAlign = 'center';

    for (let i = 0; i < count; i += dateInterval) {
      const x = paddingLeft + i * stepX + stepX / 2;

      ctx.beginPath();
      ctx.moveTo(x, paddingTop);
      ctx.lineTo(x, paddingTop + mainChartHeight);
      ctx.stroke();

      const dateStr = visibleCandles[i].time.slice(5); // MM-DD
      ctx.fillText(dateStr, x, paddingTop + mainChartHeight + 18);
    }

    // Draw Volume bars if enabled
    if (showVolume && maxVol > 0) {
      const volHeight = mainChartHeight * 0.22;
      const volBaseY = paddingTop + mainChartHeight;

      visibleCandles.forEach((c, i) => {
        const x = paddingLeft + i * stepX + stepX / 2;
        const barH = (c.volume / maxVol) * volHeight;
        const isUp = c.close >= c.open;

        ctx.fillStyle = isUp ? 'rgba(8, 153, 129, 0.25)' : 'rgba(242, 54, 69, 0.25)';
        ctx.fillRect(x - candleWidth / 2, volBaseY - barH, candleWidth, barH);
      });
    }

    // Render Candles or Area
    if (chartType === 'candles') {
      visibleCandles.forEach((c, i) => {
        const x = paddingLeft + i * stepX + stepX / 2;
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;
        const color = isUp ? '#089981' : '#f23645';

        // Draw Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Draw Body
        ctx.fillStyle = color;
        const bodyTop = Math.min(openY, closeY);
        const bodyH = Math.max(1.5, Math.abs(closeY - openY));
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
      });
    } else if (chartType === 'area') {
      // Area mode with smooth gradient
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        const x = paddingLeft + i * stepX + stepX / 2;
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      const lastX = paddingLeft + (count - 1) * stepX + stepX / 2;
      const firstX = paddingLeft + stepX / 2;
      const baseY = paddingTop + mainChartHeight;

      // Finish area polygon
      ctx.lineTo(lastX, baseY);
      ctx.lineTo(firstX, baseY);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, paddingTop, 0, baseY);
      gradient.addColorStop(0, 'rgba(41, 98, 255, 0.35)');
      gradient.addColorStop(1, 'rgba(41, 98, 255, 0.00)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw top stroke
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        const x = paddingLeft + i * stepX + stepX / 2;
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#2962ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Line mode
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        const x = paddingLeft + i * stepX + stepX / 2;
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#2962ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Moving Average 20 (Orange line)
    if (showMA20) {
      ctx.beginPath();
      let started = false;
      ma20.forEach((val, i) => {
        if (val !== null) {
          const x = paddingLeft + i * stepX + stepX / 2;
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Moving Average 50 (Blue line)
    if (showMA50) {
      ctx.beginPath();
      let started = false;
      ma50.forEach((val, i) => {
        if (val !== null) {
          const x = paddingLeft + i * stepX + stepX / 2;
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // RSI Subchart if enabled
    if (showRSI) {
      const rsiTop = paddingTop + mainChartHeight + 25;
      const rsiHeight = 50;

      // Divider line
      ctx.strokeStyle = '#2a2e39';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, rsiTop - 8);
      ctx.lineTo(width - paddingRight, rsiTop - 8);
      ctx.stroke();

      // RSI Label
      ctx.fillStyle = '#787b86';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RSI (14)', paddingLeft + 4, rsiTop + 10);

      // RSI 70 and 30 reference lines
      const y70 = rsiTop + (1 - 70 / 100) * rsiHeight;
      const y30 = rsiTop + (1 - 30 / 100) * rsiHeight;

      ctx.strokeStyle = 'rgba(242, 54, 69, 0.3)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y70);
      ctx.lineTo(width - paddingRight, y70);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(8, 153, 129, 0.3)';
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y30);
      ctx.lineTo(width - paddingRight, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI plot line
      ctx.beginPath();
      let rsiStarted = false;
      rsiValues.forEach((val, i) => {
        if (val !== null) {
          const x = paddingLeft + i * stepX + stepX / 2;
          const y = rsiTop + (1 - val / 100) * rsiHeight;
          if (!rsiStarted) {
            ctx.moveTo(x, y);
            rsiStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Crosshair lines & Axis badges if mouse is hovering
    if (hoverData.x >= paddingLeft && hoverData.x <= width - paddingRight && hoverData.y >= paddingTop && hoverData.y <= paddingTop + mainChartHeight) {
      ctx.strokeStyle = 'rgba(120, 123, 134, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hoverData.x, paddingTop);
      ctx.lineTo(hoverData.x, paddingTop + mainChartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, hoverData.y);
      ctx.lineTo(width - paddingRight, hoverData.y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Y-axis Price badge
      const hoverPrice = maxPrice - ((hoverData.y - paddingTop) / mainChartHeight) * effectiveRange;
      ctx.fillStyle = '#2962ff';
      const badgeH = 20;
      const badgeW = paddingRight - 4;
      ctx.fillRect(width - paddingRight + 2, hoverData.y - badgeH / 2, badgeW, badgeH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      const formattedHoverP = hoverPrice >= 1000 ? hoverPrice.toFixed(1) : hoverPrice.toFixed(hoverPrice < 1 ? 4 : 2);
      ctx.fillText(formattedHoverP, width - paddingRight + 2 + badgeW / 2, hoverData.y + 4);

      // X-axis Time badge
      if (hoverData.candle) {
        ctx.fillStyle = '#2a2e39';
        const timeBadgeW = 60;
        const timeBadgeH = 18;
        const timeBadgeX = Math.max(paddingLeft, Math.min(width - paddingRight - timeBadgeW, hoverData.x - timeBadgeW / 2));
        ctx.fillRect(timeBadgeX, paddingTop + mainChartHeight + 2, timeBadgeW, timeBadgeH);

        ctx.fillStyle = '#d1d4dc';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hoverData.candle.time, timeBadgeX + timeBadgeW / 2, paddingTop + mainChartHeight + 15);
      }
    }

    ctx.restore();
  }, [visibleCandles, chartType, showMA20, showMA50, showVolume, showRSI, ma20, ma50, rsiValues, hoverData]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingRight = 65;
    const paddingLeft = 15;
    const chartWidth = canvas.clientWidth - paddingRight - paddingLeft;
    const count = visibleCandles.length;
    const stepX = chartWidth / count;

    const candleIdx = Math.floor((x - paddingLeft) / stepX);
    if (candleIdx >= 0 && candleIdx < count) {
      setHoverData({
        candle: visibleCandles[candleIdx],
        x,
        y,
        price: null,
      });
    } else {
      setHoverData({ candle: null, x, y, price: null });
    }
  };

  const handleMouseLeave = () => {
    setHoverData({ candle: null, x: -1, y: -1, price: null });
  };

  // Re-render when dependencies change or window resizes
  useEffect(() => {
    renderChart();
    const handleResize = () => renderChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  // Mock Paper Trading Actions
  const handleBuy = () => {
    const cost = orderQuantity * asset.price;
    const totalShares = simShares + orderQuantity;
    const newAvgCost = (simShares * avgCost + cost) / totalShares;
    setSimShares(totalShares);
    setAvgCost(newAvgCost);
    setTradeMessage(`Executed Market BUY: ${orderQuantity} shares of ${asset.symbol} at $${asset.price.toFixed(2)}`);
    setTimeout(() => setTradeMessage(null), 4000);
  };

  const handleSell = () => {
    if (simShares <= 0) {
      setTradeMessage(`Cannot sell: No open positions in ${asset.symbol}`);
      setTimeout(() => setTradeMessage(null), 3000);
      return;
    }
    const sellQty = Math.min(simShares, orderQuantity);
    const newShares = simShares - sellQty;
    const pnl = (asset.price - avgCost) * sellQty;
    setSimShares(newShares);
    if (newShares === 0) setAvgCost(0);
    setTradeMessage(`Executed Market SELL: ${sellQty} shares of ${asset.symbol}. Realized P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    setTimeout(() => setTradeMessage(null), 4000);
  };

  const isUp = asset.changePercent >= 0;
  const currentDisplayedCandle = hoverData.candle || visibleCandles[visibleCandles.length - 1];

  // Technical Score calculation for gauge needle (0 to 180 degrees)
  // 0-20 Strong Sell, 20-40 Sell, 40-60 Neutral, 60-80 Buy, 80-100 Strong Buy
  const needleRotation = (asset.technicalScore / 100) * 180 - 90;

  return (
    <div
      ref={containerRef}
      className={`bg-[#131722] text-[#d1d4dc] flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 p-6 bg-[#131722]' : 'w-full'
      }`}
    >
      {/* Chart Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-[#2a2e39] bg-[#1e222d]">
        {/* Symbol Details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2a2e39] overflow-hidden flex items-center justify-center shrink-0 border border-[#2a2e39]">
            <img
              src={asset.logoUrl}
              alt={asset.symbol}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{asset.symbol}</h1>
              <span className="text-xs text-[#787b86] font-medium">{asset.name}</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#787b86]">
                {asset.exchange}
              </span>
              <button
                onClick={() => onToggleStar(asset.symbol)}
                className="p-1 hover:text-amber-400 text-[#787b86] transition-colors"
                title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
              </button>
            </div>

            {/* Price display with live ticking animation */}
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
                ${asset.price >= 1000 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(asset.price < 1 ? 4 : 2)}
              </span>
              <div
                className={`flex items-center gap-1 font-mono text-sm font-semibold tabular-nums ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isUp ? '+' : ''}${asset.change.toFixed(2)} ({isUp ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
            {(['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  timeframe === tf ? 'bg-[#2962ff] text-white shadow-xs' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                chartType === 'candles' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                chartType === 'area' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                chartType === 'line' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Line
            </button>
          </div>

          {/* Indicators Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMA20(!showMA20)}
              className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                showMA20 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39]'
              }`}
              title="Toggle 20-period Moving Average"
            >
              MA20
            </button>
            <button
              onClick={() => setShowMA50(!showMA50)}
              className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                showMA50 ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39]'
              }`}
              title="Toggle 50-period Moving Average"
            >
              MA50
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                showRSI ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39]'
              }`}
              title="Toggle Relative Strength Index"
            >
              RSI
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                showVolume ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39]'
              }`}
              title="Toggle Volume Bars"
            >
              Vol
            </button>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chart'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* OHLC HUD Header info */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-2 bg-[#131722] border-b border-[#2a2e39]/60 text-xs font-mono tabular-nums text-[#787b86]">
        {currentDisplayedCandle && (
          <>
            <span>Time: <span className="text-[#d1d4dc]">{currentDisplayedCandle.time}</span></span>
            <span>O: <span className="text-[#d1d4dc]">{currentDisplayedCandle.open.toFixed(2)}</span></span>
            <span>H: <span className="text-[#089981]">{currentDisplayedCandle.high.toFixed(2)}</span></span>
            <span>L: <span className="text-[#f23645]">{currentDisplayedCandle.low.toFixed(2)}</span></span>
            <span>C: <span className="text-[#d1d4dc]">{currentDisplayedCandle.close.toFixed(2)}</span></span>
            <span>Vol: <span className="text-[#d1d4dc]">{(currentDisplayedCandle.volume / 1000000).toFixed(2)}M</span></span>
          </>
        )}
      </div>

      {/* Main Chart Area */}
      <div className="relative w-full h-[450px] lg:h-[520px] bg-[#131722]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />
      </div>

      {/* Trade Notification Toast */}
      {tradeMessage && (
        <div className="mx-6 my-2 p-3 rounded-lg bg-[#2962ff]/15 border border-[#2962ff]/40 text-xs text-white flex items-center justify-between animate-fadeIn">
          <span>{tradeMessage}</span>
          <button onClick={() => setTradeMessage(null)} className="text-[#787b86] hover:text-white">✕</button>
        </div>
      )}

      {/* Bottom Insights & Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-[#1e222d] border-t border-[#2a2e39]">
        {/* Panel 1: TradingView Technical Analysis Speedometer Widget */}
        <div className="p-4 rounded-xl bg-[#131722] border border-[#2a2e39] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
            <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider">Technical Analysis</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                asset.rating.includes('Buy')
                  ? 'bg-[#089981]/15 text-[#089981]'
                  : asset.rating.includes('Sell')
                  ? 'bg-[#f23645]/15 text-[#f23645]'
                  : 'bg-[#787b86]/15 text-[#d1d4dc]'
              }`}
            >
              {asset.rating}
            </span>
          </div>

          {/* SVG Speedometer Gauge */}
          <div className="relative flex flex-col items-center justify-center my-4">
            <svg className="w-52 h-28 overflow-visible" viewBox="0 0 200 110">
              {/* Arc background segments */}
              {/* Strong Sell */}
              <path d="M 20 100 A 80 80 0 0 1 52 43" fill="none" stroke="#f23645" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
              {/* Sell */}
              <path d="M 54 41 A 80 80 0 0 1 90 22" fill="none" stroke="#f87171" strokeWidth="12" opacity="0.8" />
              {/* Neutral */}
              <path d="M 92 21 A 80 80 0 0 1 118 21" fill="none" stroke="#9ca3af" strokeWidth="12" opacity="0.8" />
              {/* Buy */}
              <path d="M 120 22 A 80 80 0 0 1 156 41" fill="none" stroke="#34d399" strokeWidth="12" opacity="0.8" />
              {/* Strong Buy */}
              <path d="M 158 43 A 80 80 0 0 1 190 100" fill="none" stroke="#089981" strokeWidth="12" strokeLinecap="round" opacity="0.8" />

              {/* Gauge Needle Pointer */}
              <g transform={`rotate(${needleRotation}, 105, 100)`}>
                <line x1="105" y1="100" x2="105" y2="28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="105" cy="100" r="6" fill="#2962ff" stroke="#ffffff" strokeWidth="2" />
              </g>
            </svg>

            {/* Gauge Labels */}
            <div className="w-full flex justify-between px-2 text-[10px] text-[#787b86] font-semibold uppercase mt-1">
              <span className="text-[#f23645]">Strong Sell</span>
              <span className="text-[#9ca3af]">Neutral</span>
              <span className="text-[#089981]">Strong Buy</span>
            </div>
          </div>

          {/* Sub Indicators Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#2a2e39]">
            <div className="flex justify-between text-[#787b86]">
              <span>Oscillators:</span>
              <span className="font-semibold text-white">Buy (6)</span>
            </div>
            <div className="flex justify-between text-[#787b86]">
              <span>Moving Avgs:</span>
              <span className="font-semibold text-[#089981]">Strong Buy (14)</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Key Financial Statistics & 52-Week Range */}
        <div className="p-4 rounded-xl bg-[#131722] border border-[#2a2e39] flex flex-col justify-between">
          <div className="pb-3 border-b border-[#2a2e39] flex justify-between items-center">
            <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider">Key Statistics</span>
            <span className="text-xs text-[#787b86]">{asset.country}</span>
          </div>

          {/* 52-Week Range Bar */}
          {asset.week52Low && asset.week52High && (
            <div className="my-3">
              <div className="flex justify-between text-xs text-[#787b86] mb-1">
                <span>52W Low: ${asset.week52Low.toFixed(2)}</span>
                <span>52W High: ${asset.week52High.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-[#2a2e39] rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2962ff] to-[#089981] rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(5, ((asset.price - asset.week52Low) / (asset.week52High - asset.week52Low)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono tabular-nums">
            <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
              <span className="text-[#787b86]">Market Cap:</span>
              <span className="text-white font-medium">{asset.marketCap || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
              <span className="text-[#787b86]">Volume:</span>
              <span className="text-white font-medium">{asset.volume}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
              <span className="text-[#787b86]">P/E Ratio:</span>
              <span className="text-white font-medium">{asset.peRatio ? asset.peRatio.toFixed(1) : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
              <span className="text-[#787b86]">Beta:</span>
              <span className="text-white font-medium">{asset.beta ? asset.beta.toFixed(2) : '1.00'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#787b86]">Div Yield:</span>
              <span className="text-white font-medium">{asset.dividendYield || 'None'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#787b86]">Sector:</span>
              <span className="text-white font-medium truncate">{asset.sector || 'General'}</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Paper Trading Simulator & Quick Order */}
        <div className="p-4 rounded-xl bg-[#131722] border border-[#2a2e39] flex flex-col justify-between">
          <div className="pb-3 border-b border-[#2a2e39] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-[#2962ff]" />
              Paper Trading Simulator
            </span>
            <span className="text-[11px] text-[#089981] font-mono">0.00% Commission</span>
          </div>

          {/* Position Summary */}
          <div className="my-2 p-3 rounded-lg bg-[#1e222d] border border-[#2a2e39] text-xs">
            <div className="flex justify-between text-[#787b86] mb-1">
              <span>Position:</span>
              <span className="font-mono text-white font-semibold">
                {simShares} shares @ {avgCost > 0 ? `$${avgCost.toFixed(2)}` : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[#787b86]">
              <span>Unrealized P&L:</span>
              <span
                className={`font-mono font-bold ${
                  simShares > 0
                    ? asset.price >= avgCost
                      ? 'text-[#089981]'
                      : 'text-[#f23645]'
                    : 'text-[#787b86]'
                }`}
              >
                {simShares > 0 ? (
                  `${asset.price >= avgCost ? '+' : ''}$${((asset.price - avgCost) * simShares).toFixed(2)}`
                ) : (
                  '$0.00'
                )}
              </span>
            </div>
          </div>

          {/* Order size selection */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[#787b86]">Shares:</span>
            {[5, 10, 50, 100].map((qty) => (
              <button
                key={qty}
                onClick={() => setOrderQuantity(qty)}
                className={`px-2 py-0.5 text-xs rounded font-mono transition-colors ${
                  orderQuantity === qty
                    ? 'bg-[#2962ff] text-white font-bold'
                    : 'bg-[#1e222d] text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>

          {/* Buy and Sell Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBuy}
              className="py-2.5 px-4 rounded-lg bg-[#089981] hover:bg-[#07836f] text-white font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <span>BUY</span>
              <span className="text-[10px] font-mono opacity-90">
                ${(orderQuantity * asset.price).toFixed(2)}
              </span>
            </button>
            <button
              onClick={handleSell}
              disabled={simShares <= 0}
              className={`py-2.5 px-4 rounded-lg font-bold text-xs flex flex-col items-center justify-center transition-all ${
                simShares > 0
                  ? 'bg-[#f23645] hover:bg-[#d92d3b] text-white cursor-pointer active:scale-98 shadow-sm'
                  : 'bg-[#2a2e39] text-[#787b86] cursor-not-allowed opacity-60'
              }`}
            >
              <span>SELL</span>
              <span className="text-[10px] font-mono opacity-90">
                {simShares > 0 ? `$${(Math.min(simShares, orderQuantity) * asset.price).toFixed(2)}` : 'No Position'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
