import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const STATUS_MESSAGES = [
    "INITIALIZING SECURE PROTOCOLS...",
    "SYNCING OPERATOR PROFILES...",
    "CALIBRATING NEURAL MODELS...",
    "CONNECTING TO COMMAND CENTER...",
    "LEVELING UP YOUR MIND..."
];

export default function LoadingScreen({ onComplete }) {
    const [fading, setFading] = useState(false);
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const totalDuration = 4000;
        const messageInterval = 800;

        const timer = setTimeout(() => {
            setFading(true);
            setTimeout(onComplete, 600);
        }, totalDuration);

        const statusTimer = setInterval(() => {
            setStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
        }, messageInterval);

        return () => {
            clearTimeout(timer);
            clearInterval(statusTimer);
        };
    }, [onComplete]);

    return (
        <div className={`loading-screen ${fading ? 'fade-out' : ''}`}>
            <div className="blueprint-overlay"></div>
            <div className="loading-content">
                <div className="loading-logo">
                    <div className="logo-glow"></div>
                    <span className="material-icons logo-icon">school</span>
                </div>

                <h1 className="loading-brand">PRAXIUM</h1>

                <div className="status-container">
                    <div className="status-bar">
                        <div className="status-fill"></div>
                    </div>
                    <p className="status-text">{STATUS_MESSAGES[statusIndex]}</p>
                </div>

                <div className="loading-decoration">
                    <div className="deco-line"></div>
                    <div className="deco-dot"></div>
                </div>
            </div>
        </div>
    );
}
