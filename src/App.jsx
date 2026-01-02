import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import MarketStrength from './components/MarketStrength';
import './index.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [marketData, setMarketData] = useState(null);
    const ws = useRef(null);

    // WebSocket Connection Logic
    useEffect(() => {
        if (isLoggedIn) {
            // Connect to Backend WebSocket
            ws.current = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws');

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
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {marketData && marketData.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
                            gap: '0.25rem', // Tight gap
                            width: '100%',
                            maxWidth: '100%', // Use full width
                            padding: '0.5rem'
                        }}>
                            {[...marketData].sort((a, b) => b.strengthPercent - a.strengthPercent).map((stock) => (
                                <MarketStrength key={stock.symbol} data={stock} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '2rem', color: '#94a3b8' }}>
                            Connecting to live feed...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
