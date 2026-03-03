import React from 'react';

const BauhausModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'info', confirmText = 'OK', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }}>
            <div className="crisp-card animate-slide-up" style={{
                width: '90%',
                maxWidth: '520px',
                padding: '0',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--card-radius)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    padding: '32px 40px',
                    color: 'var(--text-main)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{title}</span>
                    <button onClick={onCancel} style={{ background: 'var(--bg-blueprint)', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <div style={{ padding: '0 40px 32px 40px', fontSize: '1.125rem', lineHeight: '1.6', color: 'var(--text-dim)', fontWeight: '500' }}>
                    {message}
                </div>

                <div style={{ padding: '32px 40px', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: 'rgba(255,255,255,0.3)', borderTop: '1px solid var(--border)' }}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '14px 28px',
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--input-radius)',
                                color: 'var(--text-main)',
                                fontWeight: '700',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '14px 28px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--input-radius)',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(45, 48, 71, 0.2)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

};

export default BauhausModal;
