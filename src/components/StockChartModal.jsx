import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, ReferenceLine } from 'recharts';
import { X, Activity, BarChart2, AlertCircle } from 'lucide-react';

const StockChartModal = ({ isOpen, onClose, symbol, data, loading, onTimeframeChange }) => {
    const [activeLabel, setActiveLabel] = useState('1M');
    const [activeInterval, setActiveInterval] = useState('ONE_DAY');
    const [showSMA, setShowSMA] = useState(false);
    const [showRSI, setShowRSI] = useState(false);

    // Indicators Calculation
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Create deep copies to avoid mutating frozen prop objects
        let results = data.map(item => ({ ...item }));

        const smaWindow = 20;

        // Robust SMA Calculation
        if (showSMA && results.length >= smaWindow) {
            let sum = 0;
            for (let i = 0; i < results.length; i++) {
                sum += results[i].close;
                if (i >= smaWindow - 1) {
                    results[i].sma = parseFloat((sum / smaWindow).toFixed(2));
                    sum -= results[i - (smaWindow - 1)].close;
                }
            }
        }

        // RSI (14) Calculation
        if (showRSI && results.length > 14) {
            const period = 14;
            let gains = 0;
            let losses = 0;

            for (let i = 1; i < results.length; i++) {
                const change = results[i].close - (results[i - 1].close || results[i].close);
                const gain = change > 0 ? change : 0;
                const loss = change < 0 ? -change : 0;

                if (i <= period) {
                    gains += gain;
                    losses += loss;
                    if (i === period) {
                        let avgGain = gains / period;
                        let avgLoss = losses / period;
                        let rs = avgGain / (avgLoss || 1);
                        results[i].rsi = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
                        results[i].avgGain = avgGain;
                        results[i].avgLoss = avgLoss;
                    }
                } else {
                    let prevAvgGain = results[i - 1].avgGain || 0;
                    let prevAvgLoss = results[i - 1].avgLoss || 0;
                    let avgGain = (prevAvgGain * (period - 1) + gain) / period;
                    let avgLoss = (prevAvgLoss * (period - 1) + loss) / period;
                    let rs = avgGain / (avgLoss || 1);
                    results[i].rsi = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
                    results[i].avgGain = avgGain;
                    results[i].avgLoss = avgLoss;
                }
            }
        }

        return results;
    }, [data, showSMA, showRSI]);

    if (!isOpen) return null;

    const timeframes = [
        { label: '1D', interval: 'ONE_MINUTE', days: 1 },
        { label: '5D', interval: 'FIVE_MINUTE', days: 5 },
        { label: '1M', interval: 'ONE_DAY', days: 30 },
        { label: '6M', interval: 'ONE_DAY', days: 180 },
        { label: '1Y', interval: 'ONE_DAY', days: 365 },
        { label: 'ALL', interval: 'ONE_DAY', days: 1825 },
    ];

    const handleIntervalClick = (tf) => {
        setActiveLabel(tf.label);
        setActiveInterval(tf.interval);
        onTimeframeChange(tf.interval, tf.days);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (activeInterval.includes('MINUTE')) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '1200px', maxHeight: '90vh', background: '#0f172a',
                border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '1.5rem',
                padding: '2rem', position: 'relative', overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem'
                }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.025em' }}>
                            {symbol}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            {timeframes.map((tf) => (
                                <button
                                    key={tf.label}
                                    onClick={() => handleIntervalClick(tf)}
                                    style={{
                                        padding: '0.4rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
                                        fontSize: '0.8rem', fontWeight: 700,
                                        background: activeLabel === tf.label ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                                        color: activeLabel === tf.label ? 'white' : '#94a3b8',
                                        transition: 'all 0.2s',
                                        boxShadow: activeLabel === tf.label ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none'
                                    }}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowSMA(!showSMA)}
                            disabled={data.length < 20 && !showSMA}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
                                borderRadius: '0.75rem', border: `2px solid ${showSMA ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                                cursor: data.length < 20 ? 'not-allowed' : 'pointer',
                                background: showSMA ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                color: showSMA ? '#fbbf24' : (data.length < 20 ? '#475569' : '#94a3b8'), fontSize: '0.85rem', fontWeight: 700,
                                opacity: data.length < 20 && !showSMA ? 0.5 : 1,
                                transition: 'all 0.2s'
                            }}
                            title={data.length < 20 ? "Need at least 20 data points for SMA" : ""}
                        >
                            <Activity size={18} /> SMA(20)
                        </button>
                        <button
                            onClick={() => setShowRSI(!showRSI)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
                                borderRadius: '0.75rem', border: `2px solid ${showRSI ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                                cursor: 'pointer',
                                background: showRSI ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                                color: showRSI ? '#c084fc' : '#94a3b8', fontSize: '0.85rem', fontWeight: 700,
                                transition: 'all 0.2s'
                            }}
                        >
                            <BarChart2 size={18} /> RSI(14)
                        </button>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
                            cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '1rem' }}></div>
                        <span style={{ fontWeight: 500 }}>Loading Market Data...</span>
                    </div>
                ) : !data || data.length === 0 ? (
                    <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem' }}>
                        No historical data found for this period.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Main Price Chart */}
                        <div style={{ height: showRSI ? '350px' : '480px', width: '100%', position: 'relative', transition: 'height 0.3s' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={processedData}>
                                    <defs>
                                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis domain={['auto', 'auto']} stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `\u20B9${v}`} orientation="right" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.8rem', fontSize: '0.75rem' }}
                                        itemStyle={{ padding: '0.1rem 0' }}
                                    />
                                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
                                    <Area name="Price" type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" />
                                    {showSMA && <Line name="SMA (20)" type="monotone" dataKey="sma" stroke="#fbbf24" strokeWidth={3} dot={false} strokeDasharray="5 5" connectNulls={true} animationDuration={500} />}
                                </ComposedChart>
                            </ResponsiveContainer>
                            {showSMA && data.length < 20 && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(15, 23, 42, 0.95)', padding: '1.5rem', borderRadius: '1rem', border: '2px solid rgba(245, 158, 11, 0.5)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fbbf24', fontSize: '0.9rem', fontWeight: 600, zIndex: 10, boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
                                    <AlertCircle size={20} /> Insufficient data for SMA(20) calculation
                                </div>
                            )}
                        </div>

                        {/* RSI Chart */}
                        {showRSI && (
                            <div style={{ height: '160px', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', background: 'rgba(168, 85, 247, 0.03)', borderRadius: '1rem', transition: 'all 0.3s' }}>
                                <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 800, marginLeft: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <BarChart2 size={14} /> RSI (14) - Momentum Indicator
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={processedData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="date" hide />
                                        <YAxis domain={[0, 100]} ticks={[30, 70]} stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} orientation="right" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.8rem', fontSize: '0.75rem' }} />
                                        <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={2.5} dot={false} connectNulls={true} animationDuration={500} />

                                        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideRight', value: 'Overbought (70)', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} />
                                        <ReferenceLine y={30} stroke="#3b82f6" strokeDasharray="4 4" label={{ position: 'insideRight', value: 'Oversold (30)', fill: '#3b82f6', fontSize: 10, fontWeight: 700 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* News Section */}
                        <div style={{
                            marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem',
                            maxHeight: '220px', overflowY: 'auto'
                        }}>
                            <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                <Activity size={16} /> Market Highlights for {symbol}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {[
                                    { title: `Price action looks strong as ${symbol} approaches key resistance level`, time: '2h ago', color: '#4ade80' },
                                    { title: `Institutional volume spike detected in the morning session`, time: '4h ago', color: '#94a3b8' },
                                    { title: `Analysts maintain 'Buy' rating with a target increase of 12%`, time: '1d ago', color: '#3b82f6' }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.2rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.03)', transition: 'transform 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                                            <span style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 500 }}>{item.title}</span>
                                        </div>
                                        <span style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '1.5rem', fontStyle: 'italic' }}>{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockChartModal;
