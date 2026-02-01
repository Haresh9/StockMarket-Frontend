import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';

const SymbolSearch = ({ onAdd, onQueryChange }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val) => {
        setQuery(val);
        if (onQueryChange) onQueryChange(val); // Notify parent for live sorting

        if (val.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const response = await fetch(`${baseUrl}/search?query=${val}`);
            const data = await response.json();
            setResults(data);
            setShowResults(true);
        } catch (e) {
            console.error("Search failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (item) => {
        const symbol = item.tradingsymbol.endsWith('.BSE') ? item.tradingsymbol : `${item.tradingsymbol}.BSE`;
        const token = item.symboltoken;

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/watchlist/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, token })
            });

            if (!res.ok) throw new Error("Add failed");

            if (onAdd) onAdd(symbol);
            alert(`Added ${symbol} to watchlist!`); // Basic feedback
            setQuery('');
            setShowResults(false);
        } catch (e) {
            console.error("Failed to add to watchlist", e);
            alert("Error adding stock. Check backend connection.");
        }
    };

    return (
        <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 0 1.5rem 0' }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search stocks (e.g. RELIANCE, TCS)..."
                    style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.8rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1rem',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'all 0.3s'
                    }}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                />
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                {loading && <Loader2 size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />}
            </div>

            {showResults && results.length > 0 && (
                <div style={{
                    position: 'absolute', top: '110%', left: 0, right: 0,
                    background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1rem', zIndex: 1000, maxHeight: '300px', overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}>
                    {results.map((item) => (
                        <div
                            key={item.symboltoken}
                            onClick={() => handleAdd(item)}
                            style={{
                                padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ flex: 1 }} onClick={() => handleAdd(item)}>
                                <div style={{ color: 'white', fontWeight: 700 }}>{item.tradingsymbol}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{item.exchange}</div>
                            </div>
                            <button
                                className="add-button"
                                onClick={() => handleAdd(item)}
                                style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '0.5rem',
                                    padding: '0.4rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Plus size={16} color="#3b82f6" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SymbolSearch;
