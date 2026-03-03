import React, { useState, useEffect, useRef } from 'react';
import '../PlacementTest.css';

// ─── Anti-Cheat Hook ────────────────────────────────────
export const useAntiCheat = (isActive, onViolation, onAutoSubmit) => {
    const violationCount = useRef(0);
    useEffect(() => {
        if (!isActive) return;
        const MAX = 3;
        const onVis = () => { if (document.hidden) { violationCount.current++; onViolation(`Tab switch! Warning ${violationCount.current}/${MAX}`); if (violationCount.current >= MAX) onAutoSubmit(); } };
        const block = (e) => { e.preventDefault(); onViolation('Action disabled during test.'); };
        const onBlur = () => { violationCount.current++; onViolation(`Window switch! Warning ${violationCount.current}/${MAX}`); if (violationCount.current >= MAX) onAutoSubmit(); };
        const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u'].includes(e.key.toLowerCase())) { e.preventDefault(); onViolation('Shortcut disabled.'); } };
        document.addEventListener('visibilitychange', onVis);
        document.addEventListener('contextmenu', block);
        document.addEventListener('copy', block);
        document.addEventListener('cut', block);
        document.addEventListener('paste', block);
        document.addEventListener('keydown', onKey);
        window.addEventListener('blur', onBlur);
        try { document.documentElement.requestFullscreen?.(); } catch (e) { }
        return () => {
            document.removeEventListener('visibilitychange', onVis);
            document.removeEventListener('contextmenu', block);
            document.removeEventListener('copy', block);
            document.removeEventListener('cut', block);
            document.removeEventListener('paste', block);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('blur', onBlur);
            try { document.exitFullscreen?.(); } catch (e) { }
        };
    }, [isActive]);
    return violationCount;
};

// ─── Timer ──────────────────────────────────────────────
export const TestTimer = ({ totalSeconds, onExpire }) => {
    const [r, setR] = useState(totalSeconds);
    useEffect(() => { if (r <= 0) { onExpire(); return; } const t = setInterval(() => setR(x => x - 1), 1000); return () => clearInterval(t); }, [r]);
    const cls = r < 60 ? 'danger' : r < 300 ? 'warning' : '';
    return <div className={`test-timer ${cls}`}><span className="material-icons" style={{ fontSize: 20 }}>timer</span>{String(Math.floor(r / 60)).padStart(2, '0')}:{String(r % 60).padStart(2, '0')}</div>;
};

// ─── MCQ Test ───────────────────────────────────────────
export const MCQTest = ({ questions, onSubmit, isPractice }) => {
    const [cur, setCur] = useState(0);
    const [ans, setAns] = useState({});
    const [viol, setViol] = useState('');
    const onV = (m) => { setViol(m); setTimeout(() => setViol(''), 3000); };
    const autoSub = () => doSubmit();
    useAntiCheat(!isPractice, onV, autoSub);
    const q = questions[cur];
    const doSubmit = () => {
        let score = 0; questions.forEach((q, i) => { if (ans[i] === q.correctAnswer) score++; });
        onSubmit({
            answers: ans,
            score,
            total: questions.length,
            percentage: Math.round((score / questions.length) * 100),
            quizSnapshot: questions,
            answersSnapshot: ans
        });
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-app)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
            {viol && (
                <div style={{ background: 'var(--error)', color: 'white', padding: '12px 24px', textAlign: 'center', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 9999 }}>
                    <span className="material-icons">warning</span> {viol}
                </div>
            )}

            {/* Top Bar (Optional compact header) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'white', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary)', letterSpacing: '0.05em' }}>UNIVERSAL TEST ENGINE</span>
                    <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 900, background: isPractice ? 'rgba(76,175,125,0.1)' : 'rgba(232,93,74,0.1)', color: isPractice ? 'var(--success)' : 'var(--error)' }}>
                        {isPractice ? '🟢 PRACTICE MODE' : '🔴 PROCTORED MODE'}
                    </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 800 }}>
                    {Object.keys(ans).length} OF {questions.length} ANSWERED
                </div>
            </div>

            {/* Main Dual Pane Content */}
            <div style={{ display: 'flex', flex: 1, gap: 24, padding: 24, overflow: 'hidden' }}>

                {/* Left Pane: Question & Options */}
                <div className="crisp-card fade-in" style={{ flex: 1, padding: '32px 48px', borderRadius: 24, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'white' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 24 }}>QUESTION {cur + 1}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 40 }}>{q.question}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {q.options.map((o, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setAns({ ...ans, [cur]: i })}
                                style={{
                                    padding: '16px 24px',
                                    textAlign: 'left',
                                    borderRadius: 16,
                                    border: ans[cur] === i ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: ans[cur] === i ? 'var(--bg-blueprint)' : 'white',
                                    color: ans[cur] === i ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    gap: 16,
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem',
                                    boxShadow: ans[cur] === i ? 'none' : '0 4px 12px rgba(0,0,0,0.02)'
                                }}
                                className="hover-lift"
                            >
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, width: 32, height: 32, borderRadius: 10, background: ans[cur] === i ? 'var(--primary)' : 'var(--bg-app)', color: ans[cur] === i ? 'white' : 'var(--text-dim)', fontWeight: 900 }}>{String.fromCharCode(65 + i)}</span>
                                <span style={{ lineHeight: 1.5 }}>{o}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Pane: Navigation, Timer, Grid */}
                <div className="crisp-card" style={{ width: 320, padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 24, background: 'white', overflowY: 'auto' }}>
                    <button type="button" onClick={doSubmit} className="auth-button hover-bright" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: '0.95rem', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span className="material-icons" style={{ fontSize: 20 }}>check_circle</span> FINALIZE
                    </button>

                    <div style={{ padding: 16, background: 'var(--bg-app)', borderRadius: 16, display: 'flex', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        <TestTimer totalSeconds={questions.length * 90} onExpire={autoSub} />
                    </div>

                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 16 }}>QUESTION NAVIGATOR</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, overflowY: 'auto', paddingRight: '4px', paddingBottom: '16px' }}>
                            {questions.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setCur(i)}
                                    style={{
                                        padding: '12px 0',
                                        borderRadius: 12,
                                        fontWeight: 800,
                                        fontSize: '1.1rem',
                                        border: cur === i ? '2px solid var(--primary)' : ans[i] !== undefined ? '1px solid var(--primary)' : '1px solid var(--border)',
                                        background: cur === i ? 'var(--primary)' : ans[i] !== undefined ? 'var(--bg-blueprint)' : 'white',
                                        color: cur === i ? 'white' : ans[i] !== undefined ? 'var(--primary)' : 'var(--text-dim)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover-lift"
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: 16 }}>
                        <button type="button" disabled={cur === 0} onClick={() => setCur(c => c - 1)} style={{ flex: 1, padding: '16px 0', borderRadius: 16, border: '1px solid var(--border)', background: 'white', fontWeight: 900, color: 'var(--text-main)', cursor: cur === 0 ? 'not-allowed' : 'pointer', opacity: cur === 0 ? 0.3 : 1 }}>
                            PREVIOUS
                        </button>
                        <button type="button" disabled={cur === questions.length - 1} onClick={() => setCur(c => c + 1)} className="auth-button hover-bright" style={{ flex: 1, padding: '16px 0', borderRadius: 16, background: 'var(--primary)', fontWeight: 900, cursor: cur === questions.length - 1 ? 'not-allowed' : 'pointer', opacity: cur === questions.length - 1 ? 0.3 : 1 }}>
                            NEXT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Coding Test (multi-lang + history) ─────────────────
export const CodingTest = ({ problem, onSubmit, isPractice }) => {
    const [lang, setLang] = useState('javascript');
    const [code, setCode] = useState(problem.starterCode?.javascript || '');
    const [output, setOutput] = useState('');
    const [isErr, setIsErr] = useState(false);
    const [results, setResults] = useState([]);
    const [history, setHistory] = useState([]);
    const [viol, setViol] = useState('');
    const onV = (m) => { setViol(m); setTimeout(() => setViol(''), 3000); };
    useAntiCheat(!isPractice, onV, () => handleSubmit());

    const switchLang = (l) => { setLang(l); setCode(problem.starterCode?.[l] || '// Not available for this language'); };

    const runCode = () => {
        setOutput(''); setIsErr(false); setResults([]);
        if (lang !== 'javascript') { setOutput(`⚠ Client-side execution only supports JavaScript.\nYour ${lang} code has been saved. In production, this would be sent to a backend compiler.`); setIsErr(false); return; }
        try {
            const fn = new Function(code + `\nreturn { ${code.match(/function\s+(\w+)/)?.[1]}: ${code.match(/function\s+(\w+)/)?.[1]} };`)();
            const fname = code.match(/function\s+(\w+)/)?.[1];
            if (!fname || !fn[fname]) { setOutput('Error: Function not found.'); setIsErr(true); return; }
            const tr = problem.testCases.map((tc, i) => {
                try {
                    const args = tc.input.startsWith('[') ? [JSON.parse(tc.input)] : tc.input.split(', ').map(a => { try { return JSON.parse(a); } catch { return a; } });
                    const r = fn[fname](...args); const actual = JSON.stringify(r);
                    return { ...tc, actual, pass: actual === tc.expected, index: i + 1 };
                } catch (e) { return { ...tc, actual: e.message, pass: false, index: i + 1 }; }
            });
            setResults(tr);
            const p = tr.filter(r => r.pass).length;
            setOutput(`${p}/${tr.length} test cases passed`);
            if (p < tr.length) setIsErr(true);
            setHistory(h => [...h, { time: new Date().toLocaleTimeString(), passed: p, total: tr.length, code: code.substring(0, 80) + '...' }]);
        } catch (e) { setOutput(`Error: ${e.message}`); setIsErr(true); }
    };

    const handleSubmit = () => { runCode(); const p = results.filter(r => r.pass).length; onSubmit({ code, lang, passed: p, total: problem.testCases.length, percentage: Math.round((p / problem.testCases.length) * 100) }); };

    return (
        <div className="test-environment">
            {viol && <div className="violation-banner"><span className="material-icons">warning</span> {viol}</div>}
            <div className="test-env-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--primary)', letterSpacing: '0.05em' }}>CODING CHALLENGE</span>
                    <span className={`practice-badge ${isPractice ? 'practice' : 'proctored'}`}>{isPractice ? '🟢 PRACTICE' : '🔴 PROCTORED'}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <TestTimer totalSeconds={1800} onExpire={handleSubmit} />
                    <button type="button" className="coding-submit-btn" onClick={handleSubmit}><span className="material-icons" style={{ fontSize: 16 }}>upload</span> SUBMIT</button>
                </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
                <div className="coding-container">
                    <div className="coding-problem">
                        <h3>{problem.title}</h3><p>{problem.description}</p>
                        <h4 style={{ marginTop: 24, marginBottom: 12, fontSize: '0.85rem', fontWeight: 800 }}>Test Cases</h4>
                        {problem.testCases.map((tc, i) => (
                            <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 10, marginBottom: 8, fontSize: '0.82rem' }}>
                                <div><strong>Input:</strong> <code>{tc.input}</code></div>
                                <div><strong>Expected:</strong> <code>{tc.expected}</code></div>
                                {results[i] && <div style={{ marginTop: 4 }}><span className={`test-case-badge ${results[i].pass ? 'pass' : 'fail'}`}>{results[i].pass ? '✓ PASS' : '✗ FAIL'}: {results[i].actual}</span></div>}
                            </div>
                        ))}
                    </div>
                    <div className="coding-editor-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="lang-selector">
                                {['javascript', 'python', 'cpp'].map(l => <button type="button" key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => switchLang(l)}>{l.toUpperCase()}</button>)}
                            </div>
                            <button type="button" className="coding-run-btn" onClick={runCode}><span className="material-icons" style={{ fontSize: 16 }}>play_arrow</span> RUN</button>
                        </div>
                        <textarea className="coding-editor" value={code} onChange={e => setCode(e.target.value)} spellCheck={false}
                            onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); const s = e.target.selectionStart; setCode(code.substring(0, s) + '    ' + code.substring(e.target.selectionEnd)); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; }, 0); } }} />
                        <div className={`coding-output ${isErr ? 'error' : ''}`}>{output || '// Run your code to see output...'}</div>
                        {history.length > 0 && (
                            <div className="code-history-panel">
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#585b70', marginBottom: 8, letterSpacing: '0.05em' }}>RUN HISTORY</div>
                                {history.map((h, i) => (
                                    <div key={i} className="code-history-item" onClick={() => setCode(h.code)}>
                                        <span style={{ color: '#cdd6f4' }}>{h.time}</span>
                                        <span className={`test-case-badge ${h.passed === h.total ? 'pass' : 'fail'}`}>{h.passed}/{h.total}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
