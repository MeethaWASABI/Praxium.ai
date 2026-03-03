import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await login(email, password);
                if (!res.success) setError(res.message);
            } else {
                if (!name) {
                    setError('Name is required');
                    setIsLoading(false);
                    return;
                }
                const res = await signup(name, email, password);
                if (!res.success) setError(res.message);
            }
        } catch (err) {
            setError(err.message || 'Auth system unreachable');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0b',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Ambient Animated Orbs */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
                <div style={orbStyle({ top: '-10%', left: '-10%', background: 'var(--primary, #4f46e5)' })}></div>
                <div style={orbStyle({ bottom: '-20%', right: '-10%', background: 'var(--secondary, #8b5cf6)', animationDirection: 'alternate-reverse' })}></div>
            </div>

            {/* Grid overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                zIndex: 0,
                pointerEvents: 'none',
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
            }}></div>

            {/* Main Glass Card */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '420px',
                padding: '48px 40px',
                background: 'rgba(255, 255, 255, 0.03)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'white',
                animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--primary, #4f46e5), var(--primary-soft, #6366f1))',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)'
                    }}>
                        <span className="material-icons" style={{ fontSize: '32px', color: 'white' }}>school</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        {isLogin ? 'Sign in to access your learning dashboard.' : 'Enter your details to get started.'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderLeft: '4px solid #ef4444',
                        color: '#fca5a5',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {!isLogin && (
                        <div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                                style={inputStyle}
                            />
                        </div>
                    )}

                    <div>
                        <input
                            type="text"
                            placeholder="Email Address or ID"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} style={buttonStyle}>
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-icons" style={{ animation: 'spin 1s linear infinite', fontSize: '18px' }}>autorenew</span>
                                Processing...
                            </span>
                        ) : (
                            isLogin ? 'Sign In' : 'Sign Up'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            type="button"
                            onClick={toggleMode}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontWeight: '700',
                                marginLeft: '8px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                textUnderlineOffset: '4px',
                                textDecorationColor: 'rgba(255,255,255,0.3)',
                                fontSize: '0.9rem'
                            }}
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes floatOrb {
                    0% { transform: scale(1) translate(0, 0); }
                    33% { transform: scale(1.1) translate(30px, -50px); }
                    66% { transform: scale(0.9) translate(-20px, 20px); }
                    100% { transform: scale(1) translate(0, 0); }
                }
                @keyframes slideUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                input:focus {
                    border-color: var(--primary, #6366f1) !important;
                    background: rgba(0, 0, 0, 0.3) !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
                }
            `}</style>
        </div>
    );
}

const orbStyle = (custom) => ({
    position: 'absolute',
    width: '50vw',
    height: '50vw',
    filter: 'blur(120px)',
    opacity: 0.15,
    borderRadius: '50%',
    animation: 'floatOrb 15s infinite ease-in-out',
    ...custom
});

const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
};

const buttonStyle = {
    width: '100%',
    padding: '16px',
    background: 'var(--primary, #4f46e5)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};
