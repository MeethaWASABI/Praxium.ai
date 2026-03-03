import React, { useState, useEffect } from 'react';
import { MCQTest, CodingTest } from './placement/TestEngines';
import './PlacementTest.css';

export default function StandaloneTestWindow() {
    const [testData, setTestData] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('active_placement_test');
        if (data) {
            setTestData(JSON.parse(data));
        }
    }, []);

    if (!testData) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
            <span className="material-icons" style={{ fontSize: 64, color: 'var(--text-dim)', marginBottom: 16 }}>block</span>
            <h2>No active test found.</h2>
            <p style={{ color: 'var(--text-dim)' }}>Please initiate a test from the Placement Portal dashboard.</p>
        </div>
    );

    const handleSubmit = (result) => {
        const finalResult = { ...result, subject: testData.subject, difficulty: testData.difficulty, type: testData.mode };

        // Save to history
        const entry = { ...finalResult, date: new Date().toISOString() };
        const hist = JSON.parse(localStorage.getItem('placement_test_history') || '[]');
        hist.push(entry);
        localStorage.setItem('placement_test_history', JSON.stringify(hist));

        // Display completion overlay
        document.getElementById('submit-overlay').style.display = 'flex';

        // Notify parent window by changing active test state
        localStorage.removeItem('active_placement_test');

        setTimeout(() => {
            window.close();
        }, 1500);
    };

    return (
        <div style={{ background: 'var(--bg-app)', minHeight: '100vh' }}>
            {testData.mode === 'mcq' ? (
                <MCQTest questions={testData.questions} onSubmit={handleSubmit} isPractice={testData.isPractice} />
            ) : (
                <CodingTest problem={testData.problem} onSubmit={handleSubmit} isPractice={testData.isPractice} />
            )}

            <div id="submit-overlay" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, color: 'white', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backdropFilter: 'blur(10px)' }}>
                <span className="material-icons" style={{ fontSize: 80, color: 'var(--success)', marginBottom: 20 }}>check_circle</span>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>Test Submitted Successfully</h2>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>Saving results... this window will close automatically.</p>
            </div>
        </div>
    );
}
