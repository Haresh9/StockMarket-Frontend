import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        apiKey: '',
        clientId: '',
        password: '',
        totp: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Real Auth Call
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const res = await axios.post(`${apiBase}/login`, formData);

            // If we get here, it means success (200 OK)
            // In a real app we might store the token: res.data.tokens
            onLoginSuccess();
            setLoading(false);

        } catch (err) {
            console.error(err);
            setError('Login failed. Check credentials or backend console logs.');
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Angel One Login</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    className="input-field"
                    name="clientId"
                    placeholder="Client ID"
                    value={formData.clientId}
                    onChange={handleChange}
                />
                <input
                    className="input-field"
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <input
                    className="input-field"
                    name="totp"
                    placeholder="TOTP Code"
                    value={formData.totp}
                    onChange={handleChange}
                />
                <input
                    className="input-field"
                    name="apiKey"
                    placeholder="API Key (Optional if in .env)"
                    value={formData.apiKey}
                    onChange={handleChange}
                />

                <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Authenticating...' : 'Connect to Market'}
                </button>
            </form>
        </div>
    );
};

export default Login;
