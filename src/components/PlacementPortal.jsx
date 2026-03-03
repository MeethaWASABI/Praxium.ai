import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './PlacementTest.css';
import RadarChart from './placement/RadarChart';
import LineChart from './placement/LineChart';
import { questionBanks, codingProblems, companyPrepTracks, leaderboardData } from './placement/testData';
import { MCQTest, CodingTest } from './placement/TestEngines';
import { generateQuiz } from '../services/aiService';

// ─── Main Portal ────────────────────────────────────────
export default function PlacementPortalView() {
    const { user } = useAuth();
    const { getCoursesForStudent } = useData();
    const myCourses = getCoursesForStudent(user.id);
    const [tab, setTab] = useState('dashboard');
    const [testMode, setTestMode] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [difficulty, setDifficulty] = useState('medium');
    const [isPractice, setIsPractice] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [prepTrack, setPrepTrack] = useState(null);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'placement_test_history') {
                const hist = JSON.parse(e.newValue || '[]');
                if (hist.length > 0) {
                    const latest = hist[hist.length - 1];
                    setTestResult(latest);
                    setTestMode(null);
                    setTab('dashboard');
                }
            } else if (e.key === 'active_placement_test' && e.newValue === null) {
                // Return gracefully if window closes without submission
                setTimeout(() => {
                    setTestMode(prev => prev === 'waiting_for_popup' ? null : prev);
                }, 500);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const assessmentHistory = JSON.parse(localStorage.getItem('assessment_history') || '[]');
    const placementTestHistory = JSON.parse(localStorage.getItem('placement_test_history') || '[]');
    const allResults = [...assessmentHistory, ...placementTestHistory];
    const avgScore = allResults.length > 0 ? Math.round(allResults.reduce((s, a) => s + (a.score || a.percentage || 0), 0) / allResults.length) : 0;
    const placementProb = allResults.length > 0 ? Math.min(99, Math.round(avgScore * 1.05)) : 0;
    const completedModules = user.completedModules || {};
    const totalCompleted = Object.values(completedModules).reduce((s, a) => s + (a?.length || 0), 0);
    const readiness = Math.min(100, Math.round((placementProb * 0.4) + (Math.min(totalCompleted, 30) / 30 * 30) + (Math.min(allResults.length, 10) / 10 * 30)));

    // Skill data for radar
    const skillData = { 'DSA': Math.min(100, avgScore + 5), 'JavaScript': Math.min(100, avgScore), 'Python': Math.min(100, avgScore - 10), 'SQL': Math.min(100, avgScore - 5), 'System Design': Math.min(100, avgScore - 15), 'Communication': Math.min(100, avgScore + 10) };
    const expectedSkills = { 'DSA': 80, 'JavaScript': 75, 'Python': 70, 'SQL': 75, 'System Design': 65, 'Communication': 80 };

    // Progress data for line chart
    const progressData = placementTestHistory.slice(-8).map((r, i) => ({ label: `T${i + 1}`, value: r.percentage || 0 }));
    if (progressData.length < 2 && assessmentHistory.length >= 2) {
        assessmentHistory.slice(-8).forEach((a, i) => progressData.push({ label: `A${i + 1}`, value: a.score || 0 }));
    }

    const subjects = [
        { name: 'Data Structures', icon: 'account_tree', color: '#4A70A9' },
        { name: 'JavaScript', icon: 'javascript', color: '#F0A500' },
        { name: 'Python', icon: 'code', color: '#4CAF7D' },
        { name: 'SQL', icon: 'storage', color: '#E85D4A' },
    ];

    const events = [
        { date: 'Mar 5', company: 'TechCorp India', role: 'Software Engineer', type: 'On-Campus', pkg: '12 LPA' },
        { date: 'Mar 12', company: 'DataVerse AI', role: 'ML Engineer', type: 'Virtual', pkg: '18 LPA' },
        { date: 'Mar 20', company: 'CloudNine Systems', role: 'Full Stack Dev', type: 'On-Campus', pkg: '15 LPA' },
        { date: 'Apr 2', company: 'Infosys', role: 'Systems Engineer', type: 'On-Campus', pkg: '6.5 LPA' },
        { date: 'Apr 10', company: 'Wipro', role: 'Project Engineer', type: 'Virtual', pkg: '5 LPA' },
    ];

    // Weak topics from results
    const weakTopics = [];
    if (avgScore < 70) weakTopics.push('Dynamic Programming', 'Tree Traversals');
    if (avgScore < 80) weakTopics.push('Graph Algorithms');
    if (allResults.length < 5) weakTopics.push('Practice Consistency');

    const saveResult = (result) => {
        const entry = { ...result, date: new Date().toISOString() };
        const hist = JSON.parse(localStorage.getItem('placement_test_history') || '[]');
        hist.push(entry);
        localStorage.setItem('placement_test_history', JSON.stringify(hist));
    };

    const handleSubmit = (result) => {
        const full = { ...result, subject: selectedSubject, difficulty };
        setTestResult(full);
        saveResult(full);
        setTestMode(null);
    };

    // Test modes
    const [isLoadingTest, setIsLoadingTest] = useState(false);
    const [activeTestQA, setActiveTestQA] = useState(null);

    const startTest = async (mode) => {
        if (mode === 'mcq') {
            // PRE-OPEN POPUP: Browsers block window.open if it occurs after an async await. 
            // We open a blank window immediately on user click, then redirect it later.
            const popupWindow = window.open('about:blank', 'PlacementTestPopup', 'width=1200,height=800,popup=1');
            if (popupWindow) {
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>Loading Secure Test...</title>
                            <style>
                                body { margin: 0; background: var(--bg-app, #f8fafc); color: var(--text-main, #1e293b); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; }
                                .loader { border: 4px solid #e2e8f0; border-top: 4px solid #3b82f6; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 24px; }
                                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                h2 { margin: 0; font-weight: 800; font-size: 1.5rem; }
                                p { color: #64748b; font-weight: 500; margin-top: 8px; }
                            </style>
                        </head>
                        <body>
                            <div class="loader"></div>
                            <h2>Generating Pre-Assessment...</h2>
                            <p>Tailoring questions for you. Please do not close this window.</p>
                        </body>
                    </html>
                `);
            }

            setIsLoadingTest(true);
            setTestMode('loading');
            const contextType = isPractice ? "practice" : "placement";
            const generatedData = await generateQuiz(selectedSubject, contextType, difficulty);

            let qs;
            if (generatedData && generatedData.questions) {
                qs = generatedData.questions.map((q, i) => ({
                    id: i,
                    question: q.text,
                    options: q.options,
                    correctAnswer: q.options.indexOf(q.correctAnswer) !== -1 ? q.options.indexOf(q.correctAnswer) : 0,
                    marks: 1
                }));
            } else {
                const bank = questionBanks[selectedSubject]?.[difficulty] || questionBanks[selectedSubject]?.medium || [];
                qs = bank.map((q, i) => ({ id: i, question: q.q, options: q.opts, correctAnswer: q.ans, marks: 1 }));
            }

            const testStateData = {
                mode: 'mcq',
                questions: qs,
                subject: selectedSubject,
                difficulty: difficulty,
                isPractice: isPractice
            };
            localStorage.setItem('active_placement_test', JSON.stringify(testStateData));

            if (popupWindow) {
                popupWindow.location.href = window.location.pathname + '?placementTest=true';
            } else {
                window.open(window.location.pathname + '?placementTest=true', 'PlacementTestPopup', 'width=1200,height=800,popup=1');
            }

            setTestMode('waiting_for_popup');
            setIsLoadingTest(false);
        } else if (mode === 'coding') {
            const prob = codingProblems[selectedSubject]?.[difficulty] || codingProblems[selectedSubject]?.medium;
            const testStateData = {
                mode: 'coding',
                problem: prob,
                subject: selectedSubject,
                difficulty: difficulty,
                isPractice: isPractice
            };
            localStorage.setItem('active_placement_test', JSON.stringify(testStateData));
            window.open(window.location.pathname + '?placementTest=true', 'PlacementTestPopup', 'width=1200,height=800,popup=1');
            setTestMode('waiting_for_popup');
        }
    };

    if (testMode === 'loading') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', width: '100%' }}>
                <div className="ai-spinner"></div>
                <h2 style={{ color: 'var(--text-main)', marginTop: '20px' }}>Generating {isPractice ? "Practice" : "Placement"} Assessment...</h2>
                <p style={{ color: 'var(--text-dim)' }}>Tailoring questions for {selectedSubject} ({difficulty})</p>
            </div>
        );
    }

    if (testMode === 'waiting_for_popup') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', width: '100%', background: 'var(--bg-app)', borderRadius: 24, border: '1px dashed var(--border)' }}>
                <span className="material-icons" style={{ fontSize: 64, color: 'var(--primary)', marginBottom: 16 }}>open_in_new</span>
                <h2 style={{ color: 'var(--text-main)', marginTop: '20px' }}>Secure Testing Environment Active</h2>
                <p style={{ color: 'var(--text-dim)', maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>Please complete the assessment in the newly opened window. This screen will automatically update when you submit the test.</p>
                <button type="button" className="auth-button" onClick={() => setTestMode(null)} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', marginTop: 24 }}>Cancel / Go Back</button>
            </div>
        );
    }

    // Leaderboard with current user
    const lb = leaderboardData.map(l => l.isCurrentUser ? { ...l, score: readiness } : l).sort((a, b) => b.score - a.score);

    // ─── Dashboard Tab ──────────────────────────────────
    const DashboardTab = () => (
        <div className="fade-in">
            {testResult && (
                <div className="crisp-card animate-slide-up" style={{ marginBottom: 24, padding: '24px 32px', background: testResult.percentage >= 70 ? 'rgba(76,175,125,0.06)' : 'rgba(232,93,74,0.06)', borderRadius: '24px', border: `1px solid ${testResult.percentage >= 70 ? 'rgba(76,175,125,0.3)' : 'rgba(232,93,74,0.3)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: testResult.percentage >= 70 ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>LATEST RESULT • {testResult.type}</div>
                            <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-main)' }}>{testResult.subject} ({testResult.difficulty})</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: 4 }}>{testResult.score || testResult.passed}/{testResult.total} points scored successfully</div>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: testResult.percentage >= 70 ? 'var(--success)' : 'var(--error)', letterSpacing: '-0.03em' }}>{testResult.percentage}%</div>
                    </div>
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: 24, marginBottom: 24 }}>
                <div className="crisp-card" style={{ padding: '36px 32px', background: 'var(--primary)', color: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'relative', width: 140, height: 140, borderRadius: '50%', border: '8px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
                        <svg width="140" height="140" style={{ position: 'absolute', top: -8, left: -8, transform: 'rotate(-90deg)' }}><circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" /><circle cx="70" cy="70" r="62" fill="none" stroke="#fff" strokeWidth="8" strokeDasharray={`${readiness * 3.89} 389`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease-out' }} /></svg>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{readiness}</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>Readiness Score</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>Probability of placement</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[{ icon: 'school', label: 'Enrolled Courses', value: myCourses.length, color: 'var(--secondary)' }, { icon: 'trending_up', label: 'Average Test Score', value: avgScore > 0 ? `${avgScore}%` : '—', color: 'var(--primary)' }, { icon: 'assignment_turned_in', label: 'Total Assessments', value: allResults.length, color: 'var(--accent)' }, { icon: 'workspace_premium', label: 'System Prediction', value: placementProb > 0 ? `${placementProb}%` : '—', color: 'var(--warning)' }].map((s, i) => (
                        <div key={i} className="crisp-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '16px', background: `${s.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 28, color: s.color }}>{s.icon}</span></div>
                            <div><div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-main)' }}>{s.value}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, marginTop: 6 }}>{s.label}</div></div>
                        </div>
                    ))}
                </div>
            </div>
            {/* AI Insights */}
            <div className="crisp-card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(74,112,169,0.06), rgba(143,171,212,0.04))', border: '1px solid rgba(74,112,169,0.15)', borderRadius: '24px', padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ background: 'var(--primary)', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 18, color: 'white' }}>auto_awesome</span></div>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Targeted AI Guidance</span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: '0 0 16px', fontWeight: 500 }}>
                    {allResults.length > 0 ? `Based on your recent testing data, ${weakTopics.length > 0 ? `you should prioritize ${weakTopics.slice(0, 2).join(' and ')}. These are your weakest areas and are highly requested by visiting recruiters.` : 'you are demonstrating exceptional proficiency across all current topics! Continue to maintain your practice consistency.'}` : 'Complete a few assessments or practice tests to unlock personalized, AI-driven insights regarding your skill gaps.'}
                </p>
                {weakTopics.length > 0 && <div style={{ display: 'flex', gap: 10 }}>{weakTopics.map((t, i) => <span key={i} style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(232, 93, 74, 0.1)', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="material-icons" style={{ fontSize: 14 }}>warning</span>{t}</span>)}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Radar Chart */}
                <div className="crisp-card" style={{ padding: 20 }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}><span className="material-icons" style={{ fontSize: 16, color: 'var(--primary)' }}>radar</span>Skill Gap Analysis</h2>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', margin: '0 0 8px' }}>Blue = You • Dashed = Company Avg</p>
                    <RadarChart data={skillData} expectedData={expectedSkills} size={220} />
                </div>
                {/* Progress Chart */}
                <div className="crisp-card" style={{ padding: 20 }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}><span className="material-icons" style={{ fontSize: 16, color: 'var(--secondary)' }}>show_chart</span>Progress Over Time</h2>
                    <LineChart data={progressData} width={420} height={180} />
                </div>
            </div>
            {/* Leaderboard */}
            <div className="crisp-card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}><span className="material-icons" style={{ fontSize: 16, color: 'var(--warning)' }}>leaderboard</span>Placement Leaderboard</h2>
                {lb.slice(0, 8).map((l, i) => (
                    <div key={i} className="leaderboard-row" style={{ background: l.isCurrentUser ? 'rgba(74,112,169,0.06)' : 'transparent' }}>
                        <div className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal'}`}>{i + 1}</div>
                        <div style={{ flex: 1 }}><span style={{ fontWeight: l.isCurrentUser ? 900 : 700, fontSize: '0.88rem', color: l.isCurrentUser ? 'var(--primary)' : 'var(--text-main)' }}>{l.name}</span></div>
                        <div style={{ fontWeight: 900, fontSize: '0.9rem', color: l.score >= 80 ? 'var(--success)' : l.score >= 60 ? 'var(--warning)' : 'var(--error)' }}>{l.score}%</div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ─── Details Tab ────────────────────────────────────
    const DetailsTab = () => (
        <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: 40 }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 24px', color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="material-icons" style={{ color: 'var(--primary)' }}>business_center</span> Active Opportunities
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {events.map((ev, i) => (
                            <div key={i} className="crisp-card hover-lift animate-slide-up" style={{ padding: '28px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: 20, animationDelay: `${i * 0.1}s` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: 20 }}>
                                        <div style={{ width: 64, height: 64, borderRadius: '18px', background: `${['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)', 'var(--accent)'][i % 5]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)', 'var(--accent)'][i % 5]}20` }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: ['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)', 'var(--accent)'][i % 5] }}>domain</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 6 }}>{ev.company}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><span className="material-icons" style={{ fontSize: 16 }}>work</span> {ev.role}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><span className="material-icons" style={{ fontSize: 16 }}>location_on</span> {ev.type}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', background: 'var(--glass-bg)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>PACKAGE</div>
                                        <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--success)', marginTop: 4 }}>{ev.pkg}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <button type="button" onClick={() => { alert(`Redirecting to external job page for ${ev.company} - ${ev.role}`); }} className="auth-button hover-bright" style={{ flex: 1, padding: '14px', borderRadius: '16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(74, 112, 169, 0.25)' }}>
                                        <span className="material-icons" style={{ fontSize: 18 }}>open_in_new</span> APPLY & VIEW
                                    </button>
                                    <button type="button" onClick={() => setPrepTrack(ev.company)} className="auth-button hover-bright" style={{ flex: 1, padding: '14px', borderRadius: '16px', fontSize: '0.9rem', background: 'var(--bg-app)', color: 'var(--text-main)', border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <span className="material-icons" style={{ fontSize: 18, color: 'var(--secondary)' }}>model_training</span> INTERVIEW PREP
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="crisp-card" style={{ padding: '32px', borderRadius: '24px' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-main)' }}>
                            <span className="material-icons" style={{ fontSize: 24, color: 'var(--secondary)' }}>inventory_2</span>General Interview Prep
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[{ icon: 'quiz', t: 'Practice MCQs', d: 'By difficulty level', color: 'var(--primary)', action: () => setTab('test') }, { icon: 'code', t: 'Coding Rounds', d: 'Multi-language support', color: 'var(--secondary)', action: () => setTab('test') }, { icon: 'groups', t: 'Mock Interviews', d: 'AI-powered practice', color: 'var(--accent)', action: () => alert('Mock Interviews coming soon!') }, { icon: 'description', t: 'Resume Tips', d: 'ATS-friendly format', color: 'var(--success)', action: () => alert('Resume Builder coming soon!') }].map((x, i) => (
                                <div key={i} onClick={x.action} className="crisp-card hover-lift clickable" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    <div style={{ width: 52, height: 52, borderRadius: '14px', background: `${x.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 28, color: x.color }}>{x.icon}</span></div>
                                    <div style={{ flex: 1 }}><div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>{x.t}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, marginTop: 4 }}>{x.d}</div></div>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons" style={{ fontSize: 18, color: 'var(--text-dim)' }}>chevron_right</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Prep Track Modal */}
            {prepTrack && companyPrepTracks[prepTrack] && (
                <div className="prep-track-overlay" onClick={() => setPrepTrack(null)}>
                    <div className="prep-track-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div><h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>{prepTrack}</h2><p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-dim)' }}>Curated preparation track</p></div>
                            <button type="button" onClick={() => setPrepTrack(null)} style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>
                        </div>
                        <div style={{ marginBottom: 20 }}><span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>FOCUS AREAS</span><div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{companyPrepTracks[prepTrack].focus.map((f, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(74,112,169,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>{f}</span>)}</div></div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: 12 }}>PREPARATION MODULES</div>
                        {companyPrepTracks[prepTrack].modules.map((m, i) => (
                            <div key={i} className="prep-module-item">
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>{m.icon}</span></div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.title}</div><div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{m.dur}</div></div>
                                <span className="material-icons" style={{ fontSize: 16, color: 'var(--text-dim)' }}>lock_open</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ─── Take Test Tab ──────────────────────────────────
    const TakeTestTab = () => (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="crisp-card" style={{ padding: '36px 40px', borderRadius: '24px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Take an Assessment</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>Select your difficulty, mode, and subject to begin a simulated placement test.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: 40, marginBottom: 40 }}>
                    {/* Difficulty */}
                    <div className="crisp-card" style={{ padding: 24, borderRadius: 20 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Difficulty Level</div>
                        <div className="difficulty-selector" style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                            {['easy', 'medium', 'hard'].map(d => (
                                <button type="button" key={d} className={`difficulty-pill ${d} ${difficulty === d ? 'active' : ''} hover-lift`} onClick={() => setDifficulty(d)} style={{ padding: '16px', fontSize: '0.95rem', borderRadius: 12, border: difficulty === d ? 'none' : '1px solid var(--glass-border)', background: difficulty === d ? `var(--${d === 'easy' ? 'success' : d === 'medium' ? 'warning' : 'error'})` : 'var(--glass-bg)', color: difficulty === d ? 'white' : 'var(--text-main)', boxShadow: difficulty === d ? `0 8px 24px rgba(0,0,0,0.15)` : 'none' }}>
                                    {d.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Mode toggle */}
                    <div className="crisp-card" style={{ padding: 24, borderRadius: 20 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Assessment Mode</div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <button type="button" className="hover-lift" onClick={() => setIsPractice(false)} style={{ flex: 1, padding: '24px', borderRadius: '16px', border: !isPractice ? '2px solid var(--error)' : '1px solid var(--glass-border)', background: !isPractice ? 'rgba(232,93,74,0.06)' : 'var(--glass-bg)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                <span className="material-icons" style={{ fontSize: 36, color: !isPractice ? 'var(--error)' : 'var(--text-dim)' }}>gavel</span>
                                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: !isPractice ? 'var(--error)' : 'var(--text-dim)' }}>PROCTORED</div>
                            </button>
                            <button type="button" className="hover-lift" onClick={() => setIsPractice(true)} style={{ flex: 1, padding: '24px', borderRadius: '16px', border: isPractice ? '2px solid var(--success)' : '1px solid var(--glass-border)', background: isPractice ? 'rgba(76,175,125,0.06)' : 'var(--glass-bg)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                <span className="material-icons" style={{ fontSize: 36, color: isPractice ? 'var(--success)' : 'var(--text-dim)' }}>model_training</span>
                                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: isPractice ? 'var(--success)' : 'var(--text-dim)' }}>PRACTICE</div>
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '32px 0' }}></div>

                {/* Subjects */}
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 20 }}>SELECT SUBJECT</div>
                <div className="subject-grid" style={{ marginBottom: 40, gap: 20 }}>
                    {subjects.map((s, i) => (
                        <div key={i} className={`subject-card hover-lift ${selectedSubject === s.name ? 'selected' : ''}`} onClick={() => setSelectedSubject(s.name)} style={{ padding: '24px', borderRadius: '20px', border: selectedSubject === s.name ? `2px solid ${s.color}` : '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: selectedSubject === s.name ? `0 8px 24px ${s.color}30` : 'none', position: 'relative' }}>
                            <div className="subject-icon" style={{ background: `${s.color}15`, width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><span className="material-icons" style={{ fontSize: 32, color: s.color }}>{s.icon}</span></div>
                            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)', textAlign: 'center' }}>{s.name}</div>
                            {selectedSubject === s.name && <div style={{ position: 'absolute', top: 16, right: 16 }}><span className="material-icons" style={{ color: s.color, fontSize: 24 }}>check_circle</span></div>}
                        </div>
                    ))}
                </div>

                {selectedSubject && (
                    <div className="crisp-card animate-slide-up" style={{ padding: '40px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <div>
                                <h3 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{selectedSubject} — {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.05rem', margin: 0, fontWeight: 600 }}>{isPractice ? 'Practice mode: Anti-cheat disabled.' : 'Proctored mode: Strict monitoring active.'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 32 }}>
                            <button type="button" onClick={() => startTest('mcq')} className="hover-lift" style={{ padding: '32px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24, textAlign: 'left', transition: 'all 0.3s' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 40, color: 'var(--primary)' }}>quiz</span></div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: 6, letterSpacing: '-0.01em' }}>MCQ Assessment</div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-dim)', fontWeight: 700 }}>15 Questions • 15 mins total</div>
                                </div>
                            </button>
                            <button type="button" onClick={() => startTest('coding')} className="hover-lift" style={{ padding: '32px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24, textAlign: 'left', transition: 'all 0.3s' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'rgba(143, 171, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 40, color: 'var(--secondary)' }}>code</span></div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: 6, letterSpacing: '-0.01em' }}>Coding Challenge</div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-dim)', fontWeight: 700 }}>1 Algorithm • 30 mins</div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── History Tab ────────────────────────────────────
    const [expandedResultId, setExpandedResultId] = useState(null);

    const HistoryTab = () => (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Result History</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>Review your past placement tests and detailed performance analytics.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {allResults.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-dim)', background: 'white', borderRadius: 24, border: '1px solid var(--border)' }}>
                        <span className="material-icons" style={{ fontSize: 48, color: 'var(--bg-secondary)', marginBottom: 16 }}>history_toggle_off</span>
                        <h3 style={{ margin: '0 0 8px', fontWeight: 800, color: 'var(--text-main)' }}>No Results Yet</h3>
                        <p style={{ fontSize: '0.85rem' }}>Take a simulated placement test to populate your history.</p>
                    </div>
                ) : (
                    allResults.map((result, index) => {
                        const isExpanded = expandedResultId === index;
                        return (
                            <div key={index} className="crisp-card animate-slide-up" style={{ padding: 0, overflow: 'hidden', borderRadius: 24, border: isExpanded ? '2px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.3s', background: 'white', animationDelay: `${index * 0.05}s` }}>

                                {/* Header (Clickable) */}
                                <div onClick={() => setExpandedResultId(isExpanded ? null : index)} style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'var(--bg-blueprint)' : 'white' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)' }}>{result.subject}</span>
                                            <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: 6, fontWeight: 800, textTransform: 'uppercase', background: result.difficulty === 'hard' ? 'rgba(232,93,74,0.1)' : result.difficulty === 'medium' ? 'rgba(240,165,0,0.1)' : 'rgba(76,175,125,0.1)', color: result.difficulty === 'hard' ? 'var(--error)' : result.difficulty === 'medium' ? 'var(--warning)' : 'var(--success)' }}>
                                                {result.difficulty}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className="material-icons" style={{ fontSize: 16 }}>calendar_today</span> {new Date(result.date).toLocaleString()}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>SCORE</div>
                                            <div style={{ fontWeight: 900, fontSize: '1.4rem', color: result.percentage >= 70 ? 'var(--success)' : 'var(--error)' }}>{result.percentage}%</div>
                                        </div>
                                        <span className="material-icons" style={{ color: 'var(--text-dim)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>expand_more</span>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && result.quizSnapshot && result.answersSnapshot && (
                                    <div className="fade-in" style={{ padding: '32px', borderTop: '1px solid var(--border)', background: 'var(--bg-app)' }}>
                                        <h4 style={{ margin: '0 0 24px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>analytics</span> Performance Breakdown
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {result.quizSnapshot.map((q, qIndex) => {
                                                const userAnsIndex = result.answersSnapshot[qIndex];
                                                const isCorrect = userAnsIndex === q.correctAnswer;
                                                return (
                                                    <div key={qIndex} style={{ padding: '24px', borderRadius: 20, background: 'white', border: isCorrect ? '1px solid rgba(76,175,125,0.3)' : '1px solid rgba(232,93,74,0.3)' }}>
                                                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                                            <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: 10, background: isCorrect ? 'var(--success)' : 'var(--error)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                                                                {qIndex + 1}
                                                            </div>
                                                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{q.question || q.text}</div>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                            <div style={{ padding: '16px', borderRadius: 16, background: isCorrect ? 'white' : 'rgba(232,93,74,0.05)', border: '1px solid var(--border)' }}>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Your Answer</div>
                                                                <div style={{ fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem' }}>
                                                                    {userAnsIndex !== undefined ? q.options[userAnsIndex] : '(Skipped)'}
                                                                </div>
                                                            </div>
                                                            {!isCorrect && (
                                                                <div style={{ padding: '16px', borderRadius: 16, background: 'rgba(76,175,125,0.05)', border: '1px solid var(--border)' }}>
                                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Correct Answer</div>
                                                                    <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>
                                                                        {q.options[q.correctAnswer]}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {isExpanded && !(result.quizSnapshot && result.answersSnapshot) && (
                                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', fontWeight: 500, background: 'var(--bg-app)', borderTop: '1px solid var(--border)' }}>
                                        Detailed breakdown is unavailable for this older record.
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    return (
        <div className="placement-portal" style={{ padding: '0 24px 40px' }}>
            {/* Rich Header */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                borderRadius: '24px',
                padding: '32px 40px',
                color: 'white',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 12px 32px rgba(74, 112, 169, 0.2)'
            }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                            <span className="material-icons" style={{ fontSize: 32, color: 'white' }}>work_outline</span>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>Placement Portal</h1>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>Track readiness, prepare for interviews, and take tests.</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '16px 24px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)' }}>READINESS</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px' }}>{readiness}%</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '16px 24px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)' }}>AVG SCORE</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px' }}>{avgScore > 0 ? `${avgScore}%` : '--'}</div>
                    </div>
                </div>
            </div>

            <div className="placement-tabs" style={{ background: 'white', padding: '6px', borderRadius: '16px', display: 'inline-flex', marginBottom: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                {[{ id: 'dashboard', icon: 'dashboard', label: 'Dashboard' }, { id: 'details', icon: 'business', label: 'Companies & Prep' }, { id: 'test', icon: 'assignment', label: 'Take Test' }, { id: 'history', icon: 'history', label: 'Result History' }].map(t => (
                    <button type="button" key={t.id} className={`placement-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px' }}>
                        <span className="material-icons">{t.icon}</span>{t.label}
                    </button>
                ))}
            </div>

            <div style={{ background: 'transparent' }}>
                {tab === 'dashboard' && DashboardTab()}
                {tab === 'details' && DetailsTab()}
                {tab === 'test' && TakeTestTab()}
                {tab === 'history' && HistoryTab()}
            </div>
        </div>
    );
}
