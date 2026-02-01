import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import MarketStrength from './components/MarketStrength';
import StockChartModal from './components/StockChartModal';
import SymbolSearch from './components/SymbolSearch';
import './index.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [marketData, setMarketData] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [isChartOpen, setIsChartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const ws = useRef(null);

    // WebSocket Connection Logic
    useEffect(() => {
        if (isLoggedIn) {
            // Connect to Backend WebSocket
            ws.current = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws');
            console.log(import.meta.env.VITE_WS_URL)
            ws.current.onopen = () => {
                console.log('Connected to Market Data Stream');
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMarketData(data);
                } catch (e) {
                    console.error("Error parsing market data", e);
                }
            };

            ws.current.onclose = () => {
                console.log('Disconnected from Market Stream');
            };

            return () => {
                if (ws.current) ws.current.close();
            };
        }
    }, [isLoggedIn]);

    const fetchStockHistory = async (symbol, interval = 'ONE_DAY', days = 30) => {
        setIsChartLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const response = await fetch(`${baseUrl}/stock-history/${symbol}?interval=${interval}&days=${days}`);
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }
            const data = await response.json();
            setHistoryData(data);
        } catch (error) {
            console.error("Error fetching history:", error);
            setHistoryData([]);
        } finally {
            setIsChartLoading(false);
        }
    };

    const handleStockClick = (symbol) => {
        setSelectedStock(symbol);
        setIsChartOpen(true);
        setHistoryData([]);
        fetchStockHistory(symbol, 'ONE_DAY', 30);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '2rem 1rem',
            background: 'radial-gradient(circle at top, #1e293b, #0f172a)'
        }}>
            <header style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                }}>
                    TradeSense
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Real-time Market Sentiment Analytics</p>
            </header>

            {!isLoggedIn ? (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
            ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <SymbolSearch
                        onAdd={(symbol) => console.log('Added', symbol)}
                        onQueryChange={(val) => setSearchQuery(val.toUpperCase())}
                    />

                    {marketData && marketData.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1rem',
                            width: '95%',
                            maxWidth: '1400px'
                        }}>
                            {[...marketData]
                                .sort((a, b) => {
                                    if (searchQuery) {
                                        const aMatch = a.symbol.includes(searchQuery);
                                        const bMatch = b.symbol.includes(searchQuery);
                                        if (aMatch && !bMatch) return -1;
                                        if (!aMatch && bMatch) return 1;
                                    }
                                    // If no search query, or both/neither match, sort by strengthPercent
                                    return b.strengthPercent - a.strengthPercent;
                                })
                                .map((stock, index) => (
                                    <MarketStrength
                                        key={stock.symbol || index}
                                        data={stock}
                                        onClick={() => handleStockClick(stock.symbol)}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '2rem', color: '#94a3b8' }}>
                            Connecting to live feed...
                        </div>
                    )}
                </div>
            )}

            <StockChartModal
                isOpen={isChartOpen}
                onClose={() => setIsChartOpen(false)}
                symbol={selectedStock}
                data={historyData}
                loading={isChartLoading}
                onTimeframeChange={(interval) => fetchStockHistory(selectedStock, interval)}
            />
        </div>
    );
}

export default App;
