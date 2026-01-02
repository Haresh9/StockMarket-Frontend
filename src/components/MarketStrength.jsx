import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MarketStrength = ({ data }) => {

  // Helper to format numbers in Indian System (Lkh/Cr)
  const formatVolume = (num) => {
    if (!num) return '0';
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
    return num.toLocaleString();
  };

  const {
    symbol = "NIFTY",
    buyPercent = 0,
    sellPercent = 0,
    buyVolume = 0,
    sellVolume = 0,
    totalVolume = 0,
    tradedVolume = 0,
    strengthPercent = 0,
    sentiment = "Neutral",
    ltp = 0
  } = data || {};

  const isBullish = sentiment === "Bullish";
  const isBearish = sentiment === "Bearish";

  let sentimentColor = "#333941ff"; // Neutral
  if (isBullish) sentimentColor = "#003715ff"; // Deeper Dark Green
  if (isBearish) sentimentColor = "#ef4444";

  return (
    <div className="glass-panel" style={{
      padding: '0.4rem 0.6rem',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      fontSize: '0.75rem',
      background: isBullish ? 'rgba(22, 101, 34, 0.6)' : isBearish ? 'rgba(153, 27, 27, 0.4)' : 'rgba(71, 85, 105, 0.3)',
      border: isBullish ? '1px solid rgba(22, 101, 34, 0.8)' : isBearish ? '1px solid rgba(153, 27, 27, 0.6)' : '1px solid rgba(148, 163, 184, 0.3)',
      transition: 'all 0.3s ease',
      color: 'white' // Reverted to white
    }}>
      {/* Symbol and Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{symbol}</h3>
        <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{typeof ltp === 'number' ? ltp.toFixed(2) : ltp}</span> {/* Restored yellow */}
      </div>

      {/* Sentiment and Strength */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          padding: '0.05rem 0.4rem',
          borderRadius: '1rem',
          background: 'rgba(255, 255, 255, 0.1)', // Subtle white overlay
          color: 'white',
          border: `1px solid rgba(255, 255, 255, 0.2)`,
          fontSize: '0.65rem'
        }}>
          {isBullish && <TrendingUp size={10} color="#4ade80" />}
          {isBearish && <TrendingDown size={10} color="#f87171" />}
          {!isBullish && !isBearish && <Minus size={10} color="#94a3b8" />}
          <span style={{ fontWeight: 800 }}>{sentiment.toUpperCase()}</span>
        </div>
        <span style={{ color: 'white', fontWeight: 800 }}>{strengthPercent > 0 ? '+' : ''}{strengthPercent}%</span>
      </div>

      {/* Volume Bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: `${buyPercent}%`, background: '#22c55e', transition: 'width 0.5s ease-out' }} />
        <div style={{ width: `${sellPercent}%`, background: '#ef4444', transition: 'width 0.5s ease-out' }} />
      </div>

      {/* Volume Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 600 }}>
        <span>B: {buyPercent}%</span>
        <span>S: {sellPercent}%</span>
      </div>

      {/* Total Volume */}
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.1rem' }}>
        Vol: <span style={{ color: 'white', fontWeight: 700 }}>{formatVolume(tradedVolume)}</span>
      </div>
    </div>
  );
};

export default MarketStrength;
