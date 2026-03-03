import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import ChatInput from '../ChatInput';
import { generateAIResponse, generateQuiz, analyzeQuizResults, generateLevelContent } from '../../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChecklistLoader from '../ChecklistLoader';
import PlacementPortalView from '../PlacementPortal';
import { MCQTest } from '../placement/TestEngines';
import AccountSettings from '../AccountSettings';
import AIChatView from '../common/AIChatView';

// --- Sub-Components (Views) ---

const AILoadingScreen = ({ title, subtitle }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
        <div className="ai-spinner"></div>
        <h2 style={{ color: 'var(--text-main)', marginTop: '20px' }}>{title}</h2>
        <p style={{ color: 'var(--text-dim)' }}>{subtitle}</p>
    </div>
);

const HelpView = () => {
    const { user } = useAuth();
    const { addTicket, tickets, openModal } = useData();
    const [subTab, setSubTab] = useState('faq'); // faq, new, history
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', type: 'General' });

    const myTickets = tickets.filter(t => t.userId === user.id);

    const handleSubmit = (e) => {
        e.preventDefault();
        addTicket({ ...newTicket, userId: user.id });
        setNewTicket({ subject: '', description: '', type: 'General' });
        openModal({
            title: "Ticket Submitted",
            message: "An admin will review it shortly.",
            type: 'info'
        });
        setSubTab('history');
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {['faq', 'new', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSubTab(tab)}
                        style={{
                            padding: '12px 28px',
                            fontWeight: '800',
                            borderRadius: '14px',
                            border: '1px solid var(--glass-border)',
                            background: subTab === tab ? 'var(--primary)' : 'var(--bg-card)',
                            color: subTab === tab ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)',
                            fontSize: '0.85rem',
                            letterSpacing: '0.5px'
                        }}
                        className="hover-lift"
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {subTab === 'faq' && (
                <div className="crisp-card">
                    <h3 style={{ marginBottom: '20px' }}>Frequently Asked Questions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { q: "How do I reset my password?", a: "Contact your student administrator or submit a ticket to request a reset." },
                            { q: "How does the AI Course work?", a: "Our AI analyzes your quiz results and automatically generates new learning modules tailored to your weak areas." },
                            { q: "Can I retake a quiz?", a: "Yes, you can revisit any module and retake the quiz to improve your score." }
                        ].map((item, idx) => (
                            <div key={idx} style={{
                                padding: '15px',
                                background: 'var(--bg-blueprint)',
                                borderRadius: 'var(--card-radius)',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontWeight: '700', marginBottom: '5px', color: 'var(--text-main)' }}>{item.q}</div>
                                <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{item.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subTab === 'new' && (
                <div className="crisp-card" style={{ maxWidth: '600px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Submit a Support Ticket</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="form-group">
                            <label>Issue Type</label>
                            <select
                                value={newTicket.type}
                                onChange={e => setNewTicket({ ...newTicket, type: e.target.value })}
                            >
                                <option>General</option>
                                <option>Technical Issue</option>
                                <option>Course Content</option>
                                <option>Account Access</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                required
                                placeholder="Brief summary of the issue"
                                value={newTicket.subject}
                                onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                required
                                rows="5"
                                placeholder="Please describe your issue in detail..."
                                value={newTicket.description}
                                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                            />
                        </div>
                        <button className="auth-button" style={{ marginTop: '10px' }}>SUBMIT TICKET</button>
                    </form>
                </div>
            )}

            {subTab === 'history' && (
                <div className="crisp-card">
                    <h3 style={{ marginBottom: '20px' }}>My Support Tickets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {myTickets.map(t => (
                            <div key={t.id} style={{
                                padding: '20px',
                                background: 'var(--bg-blueprint)',
                                borderRadius: 'var(--card-radius)',
                                border: '1px solid var(--border)',
                                opacity: t.status === 'Solved' ? 0.7 : 1
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{t.subject}</span>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900',
                                        background: t.status === 'Solved' ? 'var(--accent)' : 'var(--warning)',
                                        color: 'white'
                                    }}>{t.status.toUpperCase()}</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '12px', letterSpacing: '0.05em' }}>{new Date(t.date).toLocaleDateString().toUpperCase()} • {t.type.toUpperCase()}</div>
                                <div style={{ color: 'var(--text-main)', lineHeight: '1.5', fontSize: '0.95rem' }}>{t.description}</div>
                            </div>
                        ))}
                        {myTickets.length === 0 && <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>No tickets submitted yet.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const MissionMap = ({ level = 1 }) => {
    const nodes = useMemo(() => [
        { x: 50, y: 150, id: 1, title: 'Basics' },
        { x: 150, y: 80, id: 2, title: 'Logic' },
        { x: 250, y: 120, id: 3, title: 'Variables' },
        { x: 350, y: 60, id: 4, title: 'Loops' },
        { x: 450, y: 140, id: 5, title: 'Functions' },
    ], []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>
                {/* Path */}
                <path
                    d={`M ${nodes.map(n => `${n.x},${n.y}`).join(' L ')}`}
                    fill="none"
                    stroke="var(--secondary)"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                    opacity="0.3"
                />
                {/* Nodes */}
                {nodes.map((node) => {
                    const isCompleted = node.id < level;
                    const isActive = node.id === level;
                    return (
                        <g key={node.id}>
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={isActive ? 12 : 8}
                                fill={isCompleted ? 'var(--secondary)' : isActive ? 'var(--primary)' : 'var(--bg-card)'}
                                stroke={isActive ? 'var(--primary)' : 'var(--secondary)'}
                                strokeWidth="2"
                                style={{ transition: 'all 0.3s ease' }}
                            />
                            {isActive && (
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r="18"
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="1"
                                    opacity="0.4"
                                >
                                    <animate attributeName="r" from="12" to="22" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            )}
                            <text
                                x={node.x}
                                y={node.y + 25}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="800"
                                fill="var(--text-dim)"
                                style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                            >
                                {node.title}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};


const OverviewPanel = ({ user, myCourses, onNavigate }) => {
    const { courses, meetings, courseAssignments, users } = useData();

    // Today's date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Course thumbnails
    const courseThumbs = ['/course_thumb_1.png', '/course_thumb_2.png'];

    // Real course progress from user.completedModules
    const getCourseProgress = (course) => {
        const completedModules = user.completedModules || {};
        const courseIdKey = Object.keys(completedModules).find(k => k.trim().toLowerCase() === String(course.id).trim().toLowerCase()) || course.id;
        const completed = completedModules[courseIdKey] || [];
        const total = course.modules?.length || 30;
        return total > 0 ? Math.round((completed.length / total) * 100) : 0;
    };

    // Real placement probability from assessment history
    const assessmentHistory = JSON.parse(localStorage.getItem('assessment_history') || '[]');
    const avgScore = assessmentHistory.length > 0
        ? Math.round(assessmentHistory.reduce((sum, a) => sum + (a.score || 0), 0) / assessmentHistory.length)
        : 0;
    const placementProb = assessmentHistory.length > 0 ? Math.min(99.9, (avgScore * 1.05)).toFixed(1) : '—';

    // Upcoming schedule - synced with instructor sessions
    const myAssignment = courseAssignments.find(a => a.studentId === user.id);
    const myTeacher = myAssignment ? users.find(u => u.id === myAssignment.teacherId) : null;
    const mySessionMeetings = meetings.filter(m =>
        (m.studentId === user.id) ||
        (m.teacherId === myAssignment?.teacherId) ||
        (myCourses.some(c => String(m.courseId) === String(c.id)))
    ).slice(0, 3);
    const upcomingItems = mySessionMeetings.length > 0 ? mySessionMeetings.map(m => {
        const course = courses.find(c => String(c.id) === String(m.courseId));
        return {
            date: new Date(m.date),
            title: course?.title || m.title || 'Live Session',
            subtitle: `${myTeacher?.name || 'Instructor'} • ${m.time || 'TBD'}`,
            type: 'live',
            link: m.link
        };
    }) : [
        { date: new Date(today.getTime() + 86400000), title: myCourses[0]?.title || 'Upcoming Session', subtitle: `${myTeacher?.name || 'Instructor'} • 02:00 PM - 03:30 PM`, type: 'live' },
        { date: new Date(today.getTime() + 172800000), title: 'Assessment Review', subtitle: 'Assessment • Deadline 11:59 PM', type: 'assessment' },
    ];

    // Stat card component (Premium Glassmorphic)
    const StatCard = ({ icon, iconBg, label, value, change, changeColor }) => (
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: iconBg, opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', zIndex: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <span className="material-icons" style={{ fontSize: '20px', color: 'white' }}>{icon}</span>
                </div>
                {change && <span style={{ fontSize: '0.7rem', fontWeight: '800', color: changeColor || 'var(--secondary)', background: `${changeColor || 'var(--secondary)'}15`, padding: '4px 10px', borderRadius: '8px' }}>{change}</span>}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 1 }}>{label}</span>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1.1, zIndex: 1 }}>{value}</span>
        </div>
    );

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 28px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* ====== HEADER ====== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '24px 32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '900', boxShadow: '0 8px 24px rgba(74, 112, 169, 0.3)' }}>
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ fontWeight: '900', margin: 0, fontSize: '1.8rem', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            Welcome back, {user.name.split(' ')[0]}
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '600', margin: '4px 0 0' }}>
                            {myCourses.length > 0 ? `${myCourses.length} active course${myCourses.length > 1 ? 's' : ''}. Keep the momentum going!` : 'Start your learning journey today!'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid var(--border)' }}>
                        <span className="material-icons" style={{ color: 'var(--text-dim)', fontSize: '22px' }}>notifications</span>
                    </div>
                    <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', border: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Today Date</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-main)' }}>{dateStr}</div>
                    </div>
                </div>
            </div>

            {/* ====== MAIN CONTENT GRID ====== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'start' }}>

                {/* LEFT COLUMN: Stats & Courses */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* STAT CARDS ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        <StatCard icon="local_fire_department" iconBg="linear-gradient(135deg, #FF6B6B, #FF8E53)" label="Learning Streak" value={`${user.streak || 0} Days`} change={user.streak > 0 ? 'Active' : null} changeColor="#FF6B6B" />
                        <StatCard icon="workspace_premium" iconBg="linear-gradient(135deg, var(--secondary), #8FABD4)" label="Placement Probability" value={assessmentHistory.length > 0 ? `${placementProb}%` : '—'} change={assessmentHistory.length > 0 ? `${assessmentHistory.length} tests` : 'No tests yet'} changeColor="var(--secondary)" />
                    </div>

                    {/* Active Courses */}
                    <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(74, 112, 169, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: '18px', color: 'var(--primary)' }}>play_circle</span>
                                </div>
                                Active Courses
                            </h2>
                            <button onClick={() => onNavigate('courses')} className="auth-button" style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>View All</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            {myCourses.slice(0, 2).map((course, idx) => {
                                const progress = getCourseProgress(course);
                                return (
                                    <div key={course.id} style={{ padding: '16px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', transition: 'transform 0.2s', cursor: 'pointer' }} className="hover-lift">
                                        <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
                                            <img src={courseThumbs[idx] || courseThumbs[0]} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', backdropFilter: 'blur(4px)' }}>{course.modules?.length || 30} Modules</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.3 }}>{course.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>{progress}% COMPLETED</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-app)', overflow: 'hidden' }}>
                                                <div style={{ width: `${progress}%`, height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${idx === 0 ? 'var(--secondary)' : 'var(--primary)'}, ${idx === 0 ? '#8FABD4' : '#6A8ABF'})`, transition: 'width 0.8s ease' }} />
                                            </div>
                                            <button onClick={() => onNavigate('courses')} className="auth-button" style={{ marginTop: '4px', padding: '10px', fontSize: '0.85rem' }}>Resume Learning</button>
                                        </div>
                                    </div>
                                );
                            })}
                            {myCourses.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-app)', borderRadius: '16px', border: '1px dashed var(--border)', gridColumn: '1 / -1' }}>
                                    <span className="material-icons" style={{ fontSize: '48px', color: 'var(--text-dim)', opacity: 0.5 }}>school</span>
                                    <p style={{ color: 'var(--text-dim)', marginTop: '12px', fontSize: '0.95rem', fontWeight: '600' }}>No courses enrolled yet. Explore our comprehensive catalog!</p>
                                    <button onClick={() => onNavigate('courses')} className="auth-button" style={{ marginTop: '16px', padding: '12px 24px' }}>Browse Courses</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: AI Tutor & Schedule */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* AI Tutor Assistant - Premium Card */}
                    <div style={{
                        padding: '28px', background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white', borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', gap: '16px',
                        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--secondary)', opacity: 0.2, borderRadius: '50%', filter: 'blur(40px)' }}></div>
                        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, background: 'var(--primary)', opacity: 0.2, borderRadius: '50%', filter: 'blur(30px)' }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                <span className="material-icons" style={{ fontSize: '20px', color: 'white' }}>smart_toy</span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>AI Tutor Assistant</h3>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', fontWeight: '500', lineHeight: 1.5, margin: 0, position: 'relative', zIndex: 1 }}>
                            "Want to do a quick 5-minute drill on your weakest topics, or need help understanding a complex concept?"
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', position: 'relative', zIndex: 1 }}>
                            <button onClick={() => onNavigate('ai_chat')} style={{
                                padding: '14px', borderRadius: '12px', border: 'none',
                                background: 'var(--bg-card)', color: '#1E293B', fontWeight: '900', fontSize: '0.9rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
                            }} className="hover-lift">
                                <span className="material-icons" style={{ fontSize: '18px', color: 'var(--secondary)' }}>bolt</span>
                                Start Drill Now
                            </button>
                            <button onClick={() => onNavigate('ai_chat')} style={{
                                padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: '800', fontSize: '0.85rem',
                                cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.2s'
                            }}>
                                Ask me anything
                            </button>
                        </div>
                    </div>

                    {/* UPCOMING SCHEDULE */}
                    <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--glass-border)' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 171, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ fontSize: '18px', color: 'var(--secondary)' }}>calendar_month</span>
                            </div>
                            Upcoming Schedule
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {upcomingItems.map((item, idx) => {
                                const d = item.date instanceof Date ? item.date : new Date(item.date);
                                const monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                                const dayStr = d.getDate();
                                return (
                                    <div key={idx} style={{
                                        padding: '16px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', gap: '16px',
                                        borderRadius: '16px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: item.type === 'live' ? 'var(--secondary)' : 'var(--primary)' }}></div>
                                        <div style={{ textAlign: 'center', minWidth: '45px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: item.type === 'live' ? 'var(--secondary)' : 'var(--primary)', letterSpacing: '0.5px' }}>{monthStr}</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}>{dayStr}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>{item.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>{item.subtitle}</div>
                                        </div>
                                        {item.type === 'live' ? (
                                            <button style={{
                                                padding: '8px 16px', borderRadius: '10px', border: 'none',
                                                background: 'rgba(143, 171, 212, 0.15)', color: 'var(--secondary)', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer'
                                            }}>Join</button>
                                        ) : (
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                <span className="material-icons" style={{ fontSize: '18px', color: 'var(--text-dim)' }}>chevron_right</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};


const GamifiedLearningView = ({ course, onExit, openModal }) => {
    const { updateSuggestedProgress } = useData();
    const [levelData, setLevelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('lesson'); // lesson, quiz, success
    const [quizAnswer, setQuizAnswer] = useState(null);

    useEffect(() => {
        loadLevel();
    }, []); // Only load on mount. Next levels loaded manually.

    const loadLevel = async () => {
        setLoading(true);
        try {
            const data = await generateLevelContent(course.title, course.currentLevel);
            setLevelData(data);
            setStep('lesson');
            setQuizAnswer(null);
        } catch (e) {
            console.error(e);
            openModal({
                title: "Error",
                message: "Failed to load level content. Please try again.",
                type: 'alert',
                confirmText: "Close"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSubmit = () => {
        if (!levelData?.quiz) return;
        if (quizAnswer === levelData.quiz.correctAnswer) {
            setStep('success');
            // Update progress in context
            updateSuggestedProgress(course.id, course.currentLevel + 1);
        } else {
            openModal({
                title: "Incorrect Answer",
                message: "Incorrect. Try reviewing the lesson!",
                type: 'alert', // Or 'error' if supported styling differs
                confirmText: "OK"
            });
            setStep('lesson');
        }
    };

    if (loading) return (
        <AILoadingScreen
            title={`GENERATING LEVEL ${course.currentLevel}...`}
            subtitle="AI is building your personalized lesson."
        />
    );

    return (
        <div className="fade-in">
            <button
                onClick={onExit}
                style={{
                    marginBottom: '24px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-main)',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '700',
                    transition: 'var(--transition-smooth)',
                    boxShadow: 'var(--glass-shadow)'
                }}
            >
                <span className="material-icons" style={{ fontSize: '20px', color: 'var(--primary)' }}>arrow_back</span>
                Back to My Learning
            </button>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', borderRadius: '24px', boxShadow: 'var(--glass-shadow)' }}>
                <div style={{
                    background: 'linear-gradient(90deg, #1E293B, var(--primary))',
                    color: 'white',
                    padding: '32px 40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--glass-border)'
                }}>
                    <div>
                        <span style={{
                            background: 'var(--bg-card)',
                            color: 'var(--primary)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '900',
                            marginRight: '16px',
                            letterSpacing: '1.5px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>AI MODULE</span>
                        <h2 style={{ display: 'inline', fontSize: '1.8rem', color: 'white', fontWeight: '800' }}>{course.title}</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '4px' }}>CURRENT LEVEL</div>
                        <div style={{ fontSize: '2.8rem', fontWeight: '950', color: 'white', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>{course.currentLevel}</div>
                    </div>
                </div>

                <div style={{ padding: '40px 60px' }}>
                    {step === 'lesson' && levelData && (
                        <div className="fade-in">
                            <h3 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '28px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{levelData.lessonTitle}</h3>

                            <div style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                marginBottom: '32px',
                                border: '1px solid var(--glass-border)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }}>
                                <SmartVideoPlayer
                                    videoId={levelData.videoId}
                                    title={levelData.lessonTitle}
                                    query={levelData.youtubeQuery || levelData.lessonTitle + " tutorial"}
                                />
                            </div>

                            <div className="markdown-content" style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.8',
                                marginBottom: '40px',
                                color: 'var(--text-main)'
                            }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{levelData.lessonContent}</ReactMarkdown>
                            </div>

                            <button
                                onClick={() => setStep('quiz')}
                                className="auth-button"
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    fontSize: '1.1rem',
                                    letterSpacing: '2px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
                                }}
                            >
                                START CHALLENGE
                            </button>
                        </div>
                    )}

                    {step === 'quiz' && levelData?.quiz && (
                        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '32px', color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800' }}>Level {course.currentLevel} Challenge</h3>
                            <div style={{
                                background: 'var(--bg-app)',
                                padding: '40px',
                                borderRadius: '24px',
                                border: '1px solid var(--border)',
                                marginBottom: '32px',
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                color: 'var(--text-main)',
                                textAlign: 'center',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                {levelData.quiz.question}
                            </div>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {levelData.quiz.options.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setQuizAnswer(opt)}
                                        style={{
                                            padding: '24px',
                                            textAlign: 'left',
                                            borderRadius: '16px',
                                            border: quizAnswer === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: quizAnswer === opt ? 'var(--primary)' : 'var(--bg-app)',
                                            color: quizAnswer === opt ? 'white' : 'var(--text-main)',
                                            cursor: 'pointer',
                                            fontSize: '1.1rem',
                                            fontWeight: '700',
                                            transition: 'var(--transition-smooth)',
                                            boxShadow: quizAnswer === opt ? '0 8px 20px rgba(var(--primary-rgb), 0.2)' : 'none'
                                        }}
                                        className="hover-lift"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                border: quizAnswer === opt ? '2px solid white' : '2px solid var(--text-dim)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem'
                                            }}>
                                                {quizAnswer === opt && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white' }}></div>}
                                            </div>
                                            {opt}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleQuizSubmit}
                                disabled={!quizAnswer}
                                className="auth-button"
                                style={{
                                    width: '100%',
                                    marginTop: '32px',
                                    padding: '20px',
                                    opacity: quizAnswer ? 1 : 0.5,
                                    cursor: quizAnswer ? 'pointer' : 'not-allowed'
                                }}
                            >
                                SUBMIT ANSWER
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="fade-in" style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{
                                fontSize: '5rem',
                                marginBottom: '24px',
                                filter: 'drop-shadow(0 0 20px rgba(var(--primary-rgb), 0.3))'
                            }}>🏆</div>
                            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '900' }}>Level Complete!</h2>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '40px', fontWeight: '600' }}>You've analyzed the concept perfectly. Next challenge unlocked.</p>
                            <button
                                onClick={() => loadLevel()}
                                className="auth-button"
                                style={{
                                    padding: '16px 60px',
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                                    boxShadow: '0 8px 30px rgba(var(--primary-rgb), 0.3)'
                                }}
                            >
                                CONTINUE TO LEVEL {course.currentLevel}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const getYouTubeVideoId = (urlOrId) => {
    if (!urlOrId) return null;
    const cleanId = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanId)) return cleanId;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// --- Help Chat Modal ---
const HelpChatModal = ({ isOpen, onClose, courseTitle, moduleTitle, moduleContent }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'intro',
                sender: 'ai',
                text: `Hi ${user.name}! I'm your AI tutor for "${moduleTitle}". What part can I explain better?`
            }]);
        }
    }, [isOpen, moduleTitle, user.name]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Import askTutor dynamically to avoid circular deps if any, or just use global
            const { askTutor } = await import('../../services/aiService');
            const responseText = await askTutor(courseTitle, moduleTitle, moduleContent, userMsg.text);

            const aiMsg = { id: Date.now() + 1, sender: 'ai', text: responseText };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: "I'm having trouble connecting right now. Please try again." }]);
        }
        setIsTyping(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 1100,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="glass-card" style={{
                width: '90%',
                maxWidth: '500px',
                height: '650px',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-icons" style={{ color: 'var(--primary)' }}>school</span>
                        AI Tutor: {moduleTitle}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'var(--transition-smooth)'
                        }}
                    >✕</button>
                </div>

                {/* Chat Area */}
                <div style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    background: 'var(--bg-blueprint)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%'
                        }}>
                            <div style={{
                                padding: '16px 20px',
                                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                                color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                fontWeight: '500'
                            }}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isTyping && <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '10px' }}>AI is thinking...</div>}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSend}
                    style={{
                        padding: '20px',
                        background: 'rgba(0,0,0,0.3)',
                        borderTop: '1px solid var(--glass-border)',
                        display: 'flex',
                        gap: '12px'
                    }}
                >
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask your tutor anything..."
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '24px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            transition: 'var(--transition-smooth)'
                        }}
                    >
                        <span className="material-icons">send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- Smart Video Player Component ---
const SmartVideoPlayer = ({ videoId, title, query }) => {
    // Robust Logic:
    // If we have a query, PREFER the search list because it's safer than pointing to a specific ID that might be dead.
    const searchUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query || title + " tutorial")}`;
    const directUrl = videoId && videoId.length === 11 ? `https://www.youtube.com/embed/${videoId}` : null;

    // Default to Search if query exists (safest for AI content), unless user specifically requested direct ID logic.
    // Given the user compliant "fix unavailable issue", we default to search for robustness.
    const [mode, setMode] = useState(query ? 'search' : 'direct');
    const finalSrc = mode === 'search' ? searchUrl : (directUrl || searchUrl);

    return (
        <div style={{ marginBottom: '32px' }}>
            <div style={{
                borderRadius: '16px',
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                background: '#000',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
                <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={finalSrc}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <div style={{
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                borderTop: 'none',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
            }}>
                <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>
                        {mode === 'search' ? 'search' : 'play_circle'}
                    </span>
                    {mode === 'search' ? "Related research content" : "Direct module video"}
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {directUrl && query && (
                        <button
                            onClick={() => setMode(mode === 'search' ? 'direct' : 'search')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {mode === 'search' ? "TRY DIRECT VIDEO" : "SWITCH TO SEARCH"}
                        </button>
                    )}
                    <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query || title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255,0,0,0.1)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,0,0,0.2)'
                        }}
                    >
                        YOUTUBE <span className="material-icons" style={{ fontSize: '14px' }}>open_in_new</span>
                    </a>
                </div>
            </div>
        </div>
    );
};


const StandardLessonView = ({ course, onExit, openModal }) => {
    const { user } = useAuth();
    const { markCourseComplete, markModuleComplete, users } = useData();
    const student = users.find(u => String(u.id).trim().toLowerCase() === String(user.id).trim().toLowerCase());
    const courseIdKey = Object.keys(student?.completedModules || {}).find(k => k.trim().toLowerCase() === String(course.id).trim().toLowerCase()) || course.id;
    const completedModules = student?.completedModules?.[courseIdKey] || [];

    const storageKey = `last_active_module_${user.id}_${course.id}`;

    // Load last active module from storage or default to first
    const [activeModule, setActiveModule] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const found = course.modules?.find(m => m.title === saved);
            if (found) return found;
        }
        return course.modules?.[0] || null;
    });

    // Save active module whenever it changes
    useEffect(() => {
        if (activeModule) {
            localStorage.setItem(storageKey, activeModule.title);
        }
    }, [activeModule, storageKey]);

    const [activeTab, setActiveTab] = useState('lecture'); // lecture, video, notes, tips
    const [showHelp, setShowHelp] = useState(false);
    const [isMarking, setIsMarking] = useState(false);

    // Group modules by section
    const sections = useMemo(() => {
        const groups = {};
        course.modules?.forEach((m, index) => {
            const sectionName = m.section || "Introduction & Fundamentals";
            if (!groups[sectionName]) groups[sectionName] = [];
            groups[sectionName].push({ ...m, index });
        });
        return Object.entries(groups).map(([name, mods]) => ({ name, modules: mods }));
    }, [course.modules]);

    // Collapsed sections state
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (name) => {
        setCollapsedSections(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // Auto-expand section containing active module
    useEffect(() => {
        if (activeModule) {
            const sectionName = activeModule.section || "Introduction & Fundamentals";
            if (collapsedSections[sectionName]) {
                setCollapsedSections(prev => ({ ...prev, [sectionName]: false }));
            }
        }
    }, [activeModule]);

    // Locking logic: Module is unlocked if it's first OR if previous is completed
    const isModuleUnlocked = (index) => {
        if (index === 0) return true;
        const prevModule = course.modules[index - 1];
        return completedModules.includes(prevModule.title);
    };

    const isLastModule = activeModule && course.modules?.[course.modules.length - 1]?.title === activeModule.title;

    // Helper to render content with markdown
    const RenderContent = ({ content }) => (
        <div className="markdown-content" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "_No content available for this section._"}
            </ReactMarkdown>
        </div>
    );

    return (
        <div className="fade-in" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-app)' }}>
            {/* Header Strip */}
            <div style={{
                padding: '20px 40px',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                zIndex: 10,
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button
                            onClick={onExit}
                            style={{
                                background: 'var(--bg-blueprint)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                padding: '10px 24px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '0.75rem',
                                letterSpacing: '0.5px',
                                transition: 'var(--transition-smooth)'
                            }}
                            className="hover-lift"
                        >
                            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--primary)' }}>arrow_back</span>
                            BACK TO MY LEARNING
                        </button>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1.5px', marginBottom: '4px' }}>TRAINING TRACK</div>
                            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '900', color: 'var(--text-main)' }}>{course.title.toUpperCase()}</h1>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '4px' }}>YOUR PROGRESS</div>
                            <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)' }}>{completedModules.length} <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500' }}>/ {course.modules?.length || 0}</span></div>
                        </div>
                        <div style={{ width: '150px', height: '10px', background: 'var(--bg-blueprint)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <div style={{
                                width: `${(completedModules.length / (course.modules?.length || 1)) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '12px', gap: '12px' }}>
                {/* Module Sidebar */}
                <div className="crisp-card" style={{
                    width: '340px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    padding: 0,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)'
                }}>
                    <div style={{
                        padding: '24px',
                        background: 'var(--bg-blueprint)',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontWeight: '900',
                        fontSize: '0.7rem',
                        letterSpacing: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span className="material-icons" style={{ fontSize: '18px', color: 'var(--primary)' }}>format_list_bulleted</span>
                        CURRICULUM
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
                        {sections.map((section, sIdx) => {
                            const isCollapsed = collapsedSections[section.name];
                            const completedInSection = section.modules.filter(m => completedModules.includes(m.title)).length;
                            const totalInSection = section.modules.length;

                            return (
                                <div key={sIdx} style={{ marginBottom: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div
                                        onClick={() => toggleSection(section.name)}
                                        style={{
                                            padding: '16px',
                                            background: 'var(--bg-card)',
                                            color: 'var(--text-main)',
                                            fontSize: '0.7rem',
                                            fontWeight: '900',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border)'
                                        }}
                                    >
                                        <span style={{ letterSpacing: '0.05em' }}>{section.name.toUpperCase()}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800' }}>{completedInSection}/{totalInSection}</span>
                                            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--text-dim)' }}>
                                                {isCollapsed ? 'add' : 'remove'}
                                            </span>
                                        </div>
                                    </div>

                                    {!isCollapsed && (
                                        <div className="animate-slide-down" style={{ background: 'var(--bg-blueprint)' }}>
                                            {section.modules.map((m) => {
                                                const isSelected = activeModule?.title === m.title;
                                                const isCompleted = completedModules.includes(m.title);
                                                const unlocked = isModuleUnlocked(m.index);

                                                return (
                                                    <div
                                                        key={m.title}
                                                        onClick={() => unlocked && setActiveModule(m)}
                                                        style={{
                                                            padding: '14px 16px',
                                                            cursor: unlocked ? 'pointer' : 'not-allowed',
                                                            background: isSelected ? 'var(--primary-soft)' : 'transparent',
                                                            borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                                                            color: isSelected ? 'var(--primary)' : (unlocked ? 'var(--text-main)' : 'var(--text-dim)'),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            transition: 'var(--transition-smooth)',
                                                            opacity: unlocked ? 1 : 0.6
                                                        }}
                                                    >
                                                        <span className="material-icons" style={{
                                                            fontSize: '18px',
                                                            color: isCompleted ? 'var(--accent)' : (isSelected ? 'var(--primary)' : 'var(--border)')
                                                        }}>
                                                            {isCompleted ? 'check_circle' : (unlocked ? 'play_circle' : 'lock')}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            fontWeight: isSelected ? '800' : '600',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {m.title}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Main Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                    {activeModule ? (
                        <>
                            {/* Tabs Area */}
                            <div style={{ padding: '24px 40px', background: 'var(--bg-blueprint)', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{activeModule.title.toUpperCase()}</h2>
                                    <button
                                        onClick={() => setShowHelp(true)}
                                        style={{
                                            padding: '8px 20px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontWeight: '900',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'var(--transition-fast)',
                                            fontSize: '0.7rem',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '16px' }}>smart_toy</span>
                                        ASK AI TUTOR
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[
                                        { id: 'lecture', icon: 'description', label: 'Lecture' },
                                        { id: 'video', icon: 'play_circle', label: 'Video' },
                                        { id: 'notes', icon: 'edit_note', label: 'Notes' },
                                        { id: 'tips', icon: 'lightbulb', label: 'Tips' },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                padding: '10px 24px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-secondary)',
                                                color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                                                fontWeight: '800',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                transition: 'var(--transition-smooth)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.7rem',
                                                letterSpacing: '0.5px'
                                            }}
                                            className="hover-lift"
                                        >
                                            <span className="material-icons" style={{ fontSize: '18px' }}>{tab.icon}</span>
                                            {tab.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scrollable Area */}
                            <div id="module-content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '40px' }} className="custom-scrollbar">
                                <div className="fade-in">
                                    {activeTab === 'lecture' && <RenderContent content={activeModule.content} />}
                                    {activeTab === 'notes' && <RenderContent content={activeModule.notes} />}
                                    {activeTab === 'tips' && <RenderContent content={activeModule.tips} />}
                                    {activeTab === 'video' && (
                                        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                                            <SmartVideoPlayer
                                                videoId={activeModule.videoId}
                                                title={activeModule.title}
                                                query={activeModule.youtubeQuery || activeModule.title + " tutorial"}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Completion Bar */}
                            <div style={{
                                padding: '24px 40px',
                                background: 'white',
                                borderTop: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: '24px'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '1px' }}>
                                    {isLastModule ? "READY TO GRADUATE?" : "READY FOR THE NEXT STEP?"}
                                </div>
                                {!completedModules.includes(activeModule.title) ? (
                                    <button
                                        id="mark-finished-btn"
                                        disabled={isMarking}
                                        onClick={async () => {
                                            setIsMarking(true);
                                            try {
                                                await markModuleComplete(user.id, course.id, activeModule.title);
                                                const currentIndex = course.modules.findIndex(m => m.title === activeModule.title);
                                                if (currentIndex < course.modules.length - 1) {
                                                    const next = course.modules[currentIndex + 1];
                                                    openModal({
                                                        title: "Great Job!",
                                                        message: `"${activeModule.title}" is complete. Ready for "${next.title}"?`,
                                                        type: 'info',
                                                        confirmText: "Let's Go",
                                                        onConfirm: () => {
                                                            setActiveModule(next);
                                                            const scrollContainer = document.getElementById('module-content-scroll');
                                                            if (scrollContainer) scrollContainer.scrollTop = 0;
                                                        }
                                                    });
                                                } else {
                                                    openModal({
                                                        title: "Course Completed!",
                                                        message: "You've finished all modules in this course. You can now claim your certificate.",
                                                        type: 'info',
                                                        confirmText: "Awesome"
                                                    });
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                openModal({ title: "Save Failed", message: "Failed to save progress.", type: 'error' });
                                            } finally {
                                                setIsMarking(false);
                                            }
                                        }}
                                        className="auth-button"
                                        style={{
                                            padding: '12px 32px',
                                            opacity: isMarking ? 0.7 : 1,
                                            cursor: isMarking ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        {isMarking && <span className="material-icons animate-spin" style={{ fontSize: '18px' }}>sync</span>}
                                        {isMarking ? "SAVING..." : "COMPLETED & NEXT"}
                                    </button>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: 'var(--accent)',
                                        fontWeight: '900',
                                        background: 'var(--bg-blueprint)',
                                        padding: '10px 24px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <span className="material-icons" style={{ fontSize: '18px' }}>verified</span>
                                        MODULE COMPLETED
                                    </div>
                                )}

                                {isLastModule && (
                                    <button
                                        onClick={() => {
                                            openModal({
                                                title: "Finish Course",
                                                message: `Congratulations! You have finished all ${course.modules.length} modules. Want to claim your diploma?`,
                                                type: 'confirm',
                                                confirmText: "Yes, Finish Course",
                                                onConfirm: () => {
                                                    markCourseComplete(user.id, course.id);
                                                    onExit();
                                                }
                                            });
                                        }}
                                        className="auth-button"
                                        style={{
                                            padding: '12px 32px',
                                            background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        FINISH COURSE
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <span className="material-icons" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>auto_stories</span>
                                <p>Select a module from the curriculum to begin learning.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {activeModule && (
                <HelpChatModal
                    isOpen={showHelp}
                    onClose={() => setShowHelp(false)}
                    courseTitle={course.title}
                    moduleTitle={activeModule.title}
                    moduleContent={activeModule.content}
                />
            )}
        </div>
    );
};


// BauhausModal is now a shared component

const CourseView = ({ initialSubTab = 'my_courses', autoLaunchTopic = null, openModal }) => {
    const { user } = useAuth();
    const { courses, suggestedCourses, enrollStudent, getCoursesForStudent } = useData();
    const [subTab, setSubTab] = useState(initialSubTab); // my_courses, suggested, catalog
    const [viewingCourseId, setViewingCourseId] = useState(null); // Store ID only

    const myCourses = getCoursesForStudent(user.id);
    const enrolledIds = myCourses.map(c => c.id);

    // Effect for deep linking
    useEffect(() => {
        if (initialSubTab) setSubTab(initialSubTab);
        if (autoLaunchTopic) {
            // Find the course object for the topic
            const topicCourse = suggestedCourses.find(c => c.title === autoLaunchTopic) || courses.find(c => c.title === autoLaunchTopic);
            if (topicCourse) {
                setViewingCourseId(topicCourse.id);
            }
        }
    }, [initialSubTab, autoLaunchTopic, suggestedCourses, courses]);

    // Derived State: Get the actual course object from the latest data
    const viewingCourse = viewingCourseId
        ? (suggestedCourses.find(c => c.id === viewingCourseId) || courses.find(c => c.id === viewingCourseId))
        : null;

    if (viewingCourse) {
        if (viewingCourse.isAI) {
            return <GamifiedLearningView course={viewingCourse} onExit={() => setViewingCourseId(null)} openModal={openModal} />;
        } else {
            return <StandardLessonView course={viewingCourse} onExit={() => setViewingCourseId(null)} openModal={openModal} />;
        }
    }

    return (
        <div style={{ padding: '0 28px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                {[
                    { id: 'my_courses', label: 'My Courses', count: myCourses.length },
                    { id: 'suggested', label: 'AI Suggested', count: suggestedCourses.length, isAI: true },
                    { id: 'catalog', label: 'Catalog', count: courses.length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        style={{
                            padding: '10px 22px',
                            borderRadius: '20px',
                            border: subTab === tab.id ? 'none' : '1px solid var(--border)',
                            background: subTab === tab.id ? 'var(--secondary)' : 'white',
                            color: subTab === tab.id ? 'white' : 'var(--text-main)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'var(--transition-smooth)',
                            fontSize: '0.82rem'
                        }}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span style={{
                                background: subTab === tab.id ? 'rgba(255,255,255,0.25)' : (tab.isAI ? 'var(--accent)' : 'var(--bg-app)'),
                                color: subTab === tab.id ? 'white' : (tab.isAI ? 'white' : 'var(--text-main)'),
                                padding: '2px 9px',
                                borderRadius: '10px',
                                fontSize: '0.72rem',
                                fontWeight: '800'
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {subTab === 'suggested' && suggestedCourses.length === 0 && (
                    <div className="crisp-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 32px', background: 'white' }}>
                        <div style={{ width: '56px', height: '56px', background: 'var(--bg-app)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <span className="material-icons" style={{ fontSize: '28px', color: 'var(--accent)' }}>psychology</span>
                        </div>
                        <h3 style={{ marginBottom: '10px', fontWeight: '800', fontSize: '1.2rem' }}>No personalized paths yet</h3>
                        <p style={{ color: 'var(--text-dim)', maxWidth: '420px', margin: '0 auto', fontSize: '0.88rem', fontWeight: '500', lineHeight: 1.5 }}>
                            Complete an assessment to help our AI build custom tracks for you.
                        </p>
                    </div>
                )}

                {(() => {
                    let list = [];
                    if (subTab === 'my_courses') list = myCourses;
                    else if (subTab === 'suggested') list = suggestedCourses;
                    else list = courses;

                    return list.map(c => {
                        const isEnrolled = enrolledIds.includes(c.id);
                        const isAI = c.isAI;

                        return (
                            <div key={c.id} className="crisp-card fade-in" style={{
                                padding: '28px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: 'white',
                                minHeight: '240px'
                            }}>
                                <div>
                                    {/* Icon */}
                                    <div style={{
                                        width: '40px', height: '40px',
                                        background: 'var(--bg-app)',
                                        borderRadius: '10px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '20px',
                                        color: 'var(--primary)'
                                    }}>
                                        <span className="material-icons" style={{ fontSize: '20px' }}>
                                            {isAI ? 'auto_awesome' : 'menu_book'}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 style={{
                                        fontSize: '1.1rem', color: 'var(--text-main)',
                                        fontWeight: '800', marginBottom: '10px', lineHeight: 1.3
                                    }}>{c.title}</h3>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: '0.82rem', color: 'var(--text-dim)',
                                        lineHeight: 1.5, fontWeight: '500', margin: 0
                                    }}>
                                        {c.description || (isAI ? 'AI Generated Adaptive Course' : 'Expand your horizons with this course.')}
                                    </p>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => {
                                        if (subTab === 'catalog' && !isEnrolled) enrollStudent(c.id, user.id);
                                        else setViewingCourseId(c.id);
                                    }}
                                    style={{
                                        width: '100%', padding: '14px',
                                        background: (subTab === 'catalog' && isEnrolled) ? 'transparent' : 'var(--primary)',
                                        color: (subTab === 'catalog' && isEnrolled) ? 'var(--primary)' : 'white',
                                        border: (subTab === 'catalog' && isEnrolled) ? '1.5px solid var(--border)' : 'none',
                                        borderRadius: '14px',
                                        fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                                        marginTop: '24px',
                                        transition: 'var(--transition-smooth)',
                                        letterSpacing: '0.02em'
                                    }}
                                >
                                    {subTab === 'my_courses' ? 'Continue Path' :
                                        subTab === 'suggested' ? `Start Level ${c.currentLevel || 1}` :
                                            isEnrolled ? 'View Course' : 'Enroll Now'}
                                </button>
                            </div>
                        );
                    });
                })()}
            </div>
        </div>
    );
};





const TeacherChatView = () => {
    const { user } = useAuth();
    const { users, sendMessage, getChats, getTeachersForStudent } = useData();
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const messagesEndRef = useRef(null);

    // Get relevant teachers
    const teachers = getTeachersForStudent(user.id);

    // Auto-select first teacher if available and none selected
    useEffect(() => {
        if (!selectedTeacherId && teachers.length > 0) {
            setSelectedTeacherId(teachers[0].id);
        }
    }, [teachers, selectedTeacherId]);

    const activeChatData = useMemo(() => {
        if (!selectedTeacherId) return [];
        return getChats(user.id, selectedTeacherId);
    }, [selectedTeacherId, user.id, getChats]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChatData]);

    const handleSend = (text, attachment) => {
        if (!selectedTeacherId) return;

        sendMessage({
            senderId: user.id,
            receiverId: selectedTeacherId,
            text: text,
            attachment
        });
    };

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

    return (
        <div className="fade-in" style={{
            display: 'flex',
            gap: '0',
            flex: 1,
            minHeight: 0,
            height: '100vh',
            width: '100%',
            background: 'var(--bg-app)'
        }}>
            {/* Teacher List */}
            <div className="crisp-card" style={{
                width: '320px',
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px'
            }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--glass-border)',
                    fontWeight: '900',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    letterSpacing: '0.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textTransform: 'uppercase'
                }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: '18px', color: 'var(--primary)' }}>school</span></div>
                    FACULTY DIRECTORY
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }} className="custom-scrollbar">
                    {teachers.map(t => (
                        <div
                            key={t.id}
                            className="hover-bright"
                            onClick={() => setSelectedTeacherId(t.id)}
                            style={{
                                padding: '16px',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                borderRadius: '16px',
                                background: selectedTeacherId === t.id ? 'var(--primary-soft)' : 'transparent',
                                color: selectedTeacherId === t.id ? 'var(--primary)' : 'var(--text-main)',
                                border: selectedTeacherId === t.id ? '1px solid rgba(74, 112, 169, 0.2)' : '1px solid transparent',
                                fontWeight: selectedTeacherId === t.id ? '800' : '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: selectedTeacherId === t.id ? 'var(--primary)' : 'var(--bg-app)',
                                color: selectedTeacherId === t.id ? 'white' : 'var(--text-main)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                fontWeight: '900',
                                border: selectedTeacherId === t.id ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                boxShadow: selectedTeacherId === t.id ? '0 4px 12px rgba(74, 112, 169, 0.3)' : 'none'
                            }}>
                                {t.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1rem' }}>
                                {t.name}
                            </div>
                        </div>
                    ))}
                    {teachers.length === 0 && (
                        <div style={{ padding: '40px 20px', color: 'var(--text-dim)', textAlign: 'center', opacity: 0.6 }}>
                            <span className="material-icons" style={{ fontSize: '40px', marginBottom: '16px' }}>group_off</span>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No teachers allocated.</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="crisp-card" style={{
                flex: 1,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '24px',
                position: 'relative'
            }}>
                {selectedTeacherId ? (
                    <>
                        <div style={{
                            padding: '20px 32px',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            zIndex: 10
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, rgba(74, 112, 169, 0.1), transparent)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(74, 112, 169, 0.15)',
                                        color: 'var(--text-main)',
                                        fontSize: '1.4rem',
                                        fontWeight: '900'
                                    }}>
                                        {selectedTeacher?.name?.charAt(0)}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        right: '-4px',
                                        width: '16px',
                                        height: '16px',
                                        background: 'var(--success)',
                                        borderRadius: '50%',
                                        border: '3px solid white'
                                    }}></div>
                                </div>
                                <div>
                                    <span style={{ fontWeight: '900', color: 'var(--text-main)', fontSize: '1.15rem' }}>{selectedTeacher?.name || 'Teacher'}</span>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.05em', fontWeight: 800, marginTop: 2 }}>OFFICIAL FACULTY</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="icon-button" style={{ color: 'var(--text-dim)', background: 'white', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <span className="material-icons">videocam</span>
                                </button>
                                <button className="icon-button" style={{ color: 'var(--text-dim)', background: 'white', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <span className="material-icons">info</span>
                                </button>
                            </div>
                        </div>
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '32px 40px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        }} className="custom-scrollbar">
                            {activeChatData.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: '60px', opacity: 0.6 }}>
                                    <div style={{ width: 100, height: 100, background: 'rgba(0,0,0,0.03)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><span className="material-icons" style={{ fontSize: '48px' }}>chat_bubble_outline</span></div>
                                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>Start a Discussion</h3>
                                    <p style={{ maxWidth: 300, margin: '0 auto', fontSize: '1rem', fontWeight: 500 }}>Message {selectedTeacher?.name} to ask questions or discuss course materials.</p>
                                </div>
                            ) : (
                                activeChatData.map(msg => (
                                    <div key={msg.id} className="animate-slide-up" style={{
                                        alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                                        maxWidth: '75%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: msg.senderId === user.id ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{
                                            padding: '18px 24px',
                                            background: msg.senderId === user.id ? 'linear-gradient(135deg, var(--secondary), var(--primary))' : 'var(--glass-bg)',
                                            color: msg.senderId === user.id ? 'white' : 'var(--text-main)',
                                            backdropFilter: msg.senderId === user.id ? 'none' : 'blur(20px)',
                                            borderRadius: msg.senderId === user.id ? '28px 28px 8px 28px' : '28px 28px 28px 8px',
                                            border: msg.senderId === user.id ? 'none' : '1px solid var(--glass-border)',
                                            boxShadow: msg.senderId === user.id ? '0 12px 32px rgba(74, 112, 169, 0.25)' : 'var(--glass-shadow)',
                                            fontSize: '1.05rem',
                                            lineHeight: '1.6',
                                            fontWeight: 500,
                                            position: 'relative'
                                        }}>
                                            {msg.senderId !== user.id && <div style={{ position: 'absolute', top: -14, left: -14, width: 32, height: 32, borderRadius: '10px', background: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 900 }}>{selectedTeacher?.name?.charAt(0)}</div>}
                                            {msg.attachment && (
                                                <div style={{ marginBottom: '12px', background: 'rgba(0,0,0,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                    {msg.attachment.type === 'image' && <img src={msg.attachment.url} style={{ maxWidth: '100%', borderRadius: '12px', display: 'block' }} alt="Sent" />}
                                                    {msg.attachment.type === 'audio' && (
                                                        <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit' }}>
                                                            <span className="material-icons">audiotrack</span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Audio message</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {msg.text}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-dim)',
                                            marginTop: '8px',
                                            fontWeight: '800',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {/* Chat Input */}
                        <div style={{ padding: '24px 32px', background: 'transparent', borderTop: '1px solid var(--glass-border)', zIndex: 10, position: 'relative' }}>
                            <ChatInput onSend={handleSend} placeholder={`Message ${selectedTeacher?.name}...`} />
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                        <div style={{ width: 100, height: 100, background: 'rgba(0,0,0,0.03)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <span className="material-icons" style={{ fontSize: '48px', opacity: 0.3 }}>account_circle</span>
                        </div>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>No Teacher Selected</h3>
                        <p style={{ maxWidth: 300, margin: '0 auto', fontSize: '1rem', fontWeight: 500, textAlign: 'center' }}>Select a teacher from the directory to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AssessmentView = ({ onNavigateToCourse, onNavigateToPlacement, openModal }) => {
    console.log('DEBUG_ANALYTICS: AssessmentView rendered');
    const { user, refreshUser } = useAuth();
    const {
        users, getCoursesForStudent, addSuggestedCourse, updateSuggestedProgress, awardBadge, refreshData, customTests, getTeachersForStudent
    } = useData();

    // -- STATE --
    const [viewMode, setViewMode] = useState('hub'); // 'hub', 'course_detail', 'history'
    const [subTab, setSubTab] = useState('curriculum'); // 'curriculum', 'ai_lab', 'results'

    // SYNC: Ensure Medals from History are in User Profile
    useEffect(() => {
        const performSync = async () => {
            // 1. Refresh Data Context to be sure we have latest user from LocalStorage
            // This is crucial because DataContext might have initialized empty if API failed
            if (refreshData) await refreshData();

            // 2. Scan History for missing medals
            const savedHistory = JSON.parse(localStorage.getItem('assessment_history') || '[]');

            if (savedHistory.length > 0 && user) {
                let restoredCount = 0;

                // We need to look up the user again in the freshly loaded 'users' array 
                // to be absolutely sure we're checking against the persisted state, not just Auth state
                // However, we can use the 'user' from AuthContext as a proxy for ID.

                // Note: The 'user' from useAuth might be stale if DataContext just refreshed.
                // We rely on 'users' from useData mostly for awardBadge.

                // Let's use the 'awardBadge' function's internal check, but we need to know IF we should call it.
                // We'll check against 'user.achievements' assuming Auth is reasonably up to date, 
                // OR we can trigger blindly if we are paranoid (awardBadge handles dupes).
                // Let's trigger blindly for known medals in history to be safe.

                savedHistory.forEach(record => {
                    if (record.earnedMedal) {
                        // Check if we already have it in current view
                        const hasIt = user.achievements?.some(a => a.id === record.earnedMedal.id);
                        if (!hasIt) {
                            console.log("Restoring missing medal:", record.earnedMedal.title);
                            awardBadge(user.id, record.earnedMedal.id, {
                                title: record.earnedMedal.title,
                                description: record.earnedMedal.description,
                                icon: record.earnedMedal.icon,
                                date: record.earnedMedal.date // Preserve original date
                            });
                            restoredCount++;
                        }
                    }
                });

                if (restoredCount > 0) {
                    console.log(`Restored ${restoredCount} medals.`);
                    // Small delay to allow backend save, then refresh auth to update UI
                    setTimeout(() => refreshUser(), 500);
                }
            }
        };

        performSync();
    }, [user?.id, viewMode]); // Run on mount and when view changes
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showPerfOptions, setShowPerfOptions] = useState(false); // Toggle for Recent Performance options
    const [showPerfSuggested, setShowPerfSuggested] = useState(false); // Toggle for "See Suggested Topics" list inside Perf Options
    const [revExpanded, setRevExpanded] = useState({}); // Track expanded states for Needs Revision modules {"TopicName": true }

    // Test State
    const [testState, setTestState] = useState('idle'); // idle, loading, taking, analyzing, complete
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [activeTopic, setActiveTopic] = useState(null); // The specific topic (module) being tested
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // For paginated AI tests
    const [expandedAnalyticsId, setExpandedAnalyticsId] = useState(null); // Fixed: Moved from nested block to top level

    // Data State
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('assessment_history');
        if (saved) return JSON.parse(saved);

        // Seed Mock Data for Demonstration
        const mockHistory = [
            {
                id: 1,
                date: new Date().toLocaleDateString(),
                score: 65,
                course: 'Machine Learning',
                topic: 'Introduction to ML',
                feedback: 'Good effort, but review the core definitions of Supervised vs Unsupervised learning.'
            }
        ];
        // Also seed Topic Scores to match
        const mockScores = { 'ml-101': { 0: 65 } };
        localStorage.setItem('topic_scores', JSON.stringify(mockScores));

        return mockHistory;
    });

    // Persist history changes
    useEffect(() => {
        localStorage.setItem('assessment_history', JSON.stringify(history));
    }, [history]);

    const [topicScores, setTopicScores] = useState(() => {
        const saved = localStorage.getItem('topic_scores');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('topic_scores', JSON.stringify(topicScores));
    }, [topicScores]);

    const myCourses = getCoursesForStudent(user.id);

    // Helpers
    const getUnlockStatus = (course, index) => {
        if (index === 0) return true; // First topic always unlocked
        const prevScore = topicScores[course.id]?.[index - 1];
        return prevScore >= 80;
    };

    const startTopicTest = async (course, module, index) => {
        if (!getUnlockStatus(course, index)) {
            openModal({ title: "Locked", message: "Complete the previous topic with 80% to unlock.", type: 'alert' });
            return;
        }

        setTestState('loading');
        setActiveTopic({ ...module, index });

        try {
            // Updated Prompt to be Topic Specific
            const promptTitle = `${module.title} of course ${course.title}`;
            const data = await generateQuiz(promptTitle);

            if (data && data.questions) {
                setQuiz(data.questions);
                setTestState('taking');
                setAnswers({});
            } else {
                openModal({ title: "AI Busy", message: "Failed to generate quiz.", type: 'alert' });
                setTestState('idle');
            }
        } catch (e) {
            console.error(e);
            setTestState('idle');
        }
    };

    const startAITest = async (course) => {
        setTestState('loading');
        setActiveTopic({ title: `Practice: ${course.title}`, index: 'ai_practice' });
        setSelectedCourse({ ...course, isAI: true });
        setCurrentQuestionIndex(0);

        try {
            const promptTitle = `Comprehensive Practice Test for ${course.title} with 15 questions`;
            const data = await generateQuiz(promptTitle);

            if (data && data.questions) {
                setQuiz(data.questions);
                setTestState('taking');
                setAnswers({});
            } else {
                openModal({ title: "AI Busy", message: "Failed to generate AI Practice test.", type: 'alert' });
                setTestState('idle');
            }
        } catch (e) {
            console.error(e);
            openModal({ title: "Error", message: "Error starting practice test.", type: 'alert' });
            setTestState('idle');
        }
    };

    const submitTest = async () => {
        setTestState('analyzing');
        const finalAnswers = window._tempEvalAnswers || answers;
        try {
            const analysis = await analyzeQuizResults(quiz, finalAnswers, selectedCourse.title);
            if (window._tempEvalAnswers) window._tempEvalAnswers = null;
            if (analysis) {
                setResult(analysis);

                // Auto-suggest weak topics
                if (analysis.weakTopics && analysis.weakTopics.length > 0) {
                    analysis.weakTopics.forEach(topic => {
                        if (typeof addSuggestedCourse === 'function') {
                            addSuggestedCourse(topic);
                        }
                    });
                }

                setTestState('complete');

                let earnedMedal = null;

                // --- Gamification: Award Medals ---
                if (analysis.score >= 100) {
                    earnedMedal = {
                        title: 'Perfect Score!',
                        description: `Aced the ${activeTopic.title} test!`,
                        icon: 'star'
                    };
                    awardBadge(user.id, `perfect_score_${selectedCourse.id}_${activeTopic.index}`, earnedMedal);
                } else if (analysis.score >= 80) {
                    earnedMedal = {
                        title: 'Topic Mastered',
                        description: `Mastered ${activeTopic.title}.`,
                        icon: 'verified'
                    };
                    awardBadge(user.id, `passed_${selectedCourse.id}_${activeTopic.index}`, earnedMedal);
                }

                if (earnedMedal) {
                    setResult(prev => ({ ...prev, earnedMedal }));
                    // Refresh Auth User State to reflect new badges immediately
                    setTimeout(() => refreshUser(), 100);
                }

                // AI Suggested Progress
                if (selectedCourse?.isAI && analysis.score >= 70) {
                    updateSuggestedProgress(selectedCourse.id, selectedCourse.currentLevel + 1);
                }

                // Save Topic Score
                setTopicScores(prev => ({
                    ...prev,
                    [selectedCourse.id]: {
                        ...(prev[selectedCourse.id] || {}),
                        [activeTopic.index]: analysis.score
                    }
                }));

                // History
                const newRecord = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    score: analysis.score,
                    course: selectedCourse.title,
                    topic: activeTopic.title,
                    feedback: analysis.feedback,
                    weakTopics: analysis.weakTopics || [],
                    fullResult: analysis,
                    earnedMedal: earnedMedal, // Save the medal explicitly
                    quizSnapshot: quiz,
                    answersSnapshot: answers
                };
                setHistory(prev => [newRecord, ...prev]);
            }
        } catch (e) {
            console.error(e);
            openModal({ title: "Error", message: "Analysis failed.", type: 'alert' });
            setTestState('taking');
        }
    };

    // --- Loading Views (Checklist) ---
    if (testState === 'loading') return <ChecklistLoader mode="curating" />;
    if (testState === 'analyzing') return <ChecklistLoader mode="evaluating" />;

    // --- Taking Test View ---
    if (testState === 'taking' && quiz) {
        const mcqQuestions = quiz.map((q, i) => ({
            id: q.id || i,
            question: q.text,
            options: q.options,
            correctAnswer: q.options.indexOf(q.correctAnswer) !== -1 ? q.options.indexOf(q.correctAnswer) : 0,
            originalData: q
        }));

        const handleMCQSubmit = async (result) => {
            const formattedAnswers = {};
            mcqQuestions.forEach((q, i) => {
                if (result.answers[i] !== undefined) {
                    formattedAnswers[q.id] = q.options[result.answers[i]];
                }
            });
            setAnswers(formattedAnswers);
            window._tempEvalAnswers = formattedAnswers;
            submitTest();
        };

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'var(--bg-app)' }}>
                <MCQTest questions={mcqQuestions} onSubmit={handleMCQSubmit} isPractice={selectedCourse?.isAI} />
            </div>
        );
    }

    // --- Result View ---
    if (testState === 'complete' && result) {
        const isMastered = result.score >= 80;
        return (
            <div className="fade-in" style={{ padding: '40px' }}>
                <div className="crisp-card" style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: '48px', padding: '60px', border: '1px solid var(--border)' }}>
                    <div style={{
                        fontSize: '7rem',
                        fontWeight: '900',
                        color: isMastered ? 'var(--accent)' : 'var(--error)',
                        lineHeight: 1,
                        marginBottom: '16px',
                        letterSpacing: '-0.05em'
                    }}>
                        {result.score}<span style={{ fontSize: '2.5rem', opacity: 0.4 }}>%</span>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', fontWeight: '800', marginBottom: '40px', letterSpacing: '-0.02em' }}>
                        {isMastered ? 'Mastery Achieved' : 'Revision Suggested'}
                    </h2>

                    {/* Visual Reward: Medal */}
                    {result.earnedMedal && (
                        <div className="animate-slide-up" style={{
                            margin: '0 auto 40px',
                            padding: '40px',
                            background: 'var(--bg-app)',
                            borderRadius: '32px',
                            maxWidth: '400px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                border: '1px solid var(--border)',
                                color: 'var(--accent)'
                            }}>
                                <span className="material-icons" style={{ fontSize: '4rem' }}>{result.earnedMedal.icon}</span>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '800' }}>{result.earnedMedal.title}</h3>
                            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dim)', fontWeight: '500', lineHeight: '1.5' }}>{result.earnedMedal.description}</p>
                        </div>
                    )}

                    <p style={{ fontSize: '1.15rem', color: 'var(--text-dim)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.7', fontWeight: '500' }}>
                        {result.feedback}
                    </p>

                    {!isMastered && (
                        <div style={{
                            background: 'rgba(226, 149, 120, 0.1)',
                            color: 'var(--error)',
                            padding: '16px 32px',
                            borderRadius: '24px',
                            fontWeight: '800',
                            marginBottom: '40px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(226, 149, 120, 0.2)'
                        }}>
                            <span className="material-icons" style={{ fontSize: '20px' }}>info</span>
                            Minimum 80% accuracy required for module validation.
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '56px', textAlign: 'left' }}>
                        {/* Option 1: Study Weak Areas */}
                        <div className="crisp-card" style={{ background: 'var(--bg-app)', padding: '32px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '20px', fontWeight: '800' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)' }}>psychology</span>
                                Learning Path
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: '1.5', fontWeight: '500' }}>
                                Targeted focus areas identified by AI analyzer:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {result.weakTopics && result.weakTopics.length > 0 ? result.weakTopics.map((topic, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onNavigateToCourse(topic)}
                                        style={{
                                            background: 'white',
                                            padding: '14px 20px',
                                            border: '1px solid var(--border)',
                                            borderRadius: '16px',
                                            color: 'var(--primary)',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        <span>{topic}</span>
                                        <span className="material-icons" style={{ fontSize: '18px' }}>east</span>
                                    </button>
                                )) : (
                                    <div style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                                        <span className="material-icons">stars</span>
                                        Curriculum Mastered
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Option 2: Review Answers */}
                        <div
                            className="crisp-card clickable"
                            style={{
                                background: 'white',
                                padding: '32px',
                                borderRadius: '32px',
                                border: '1px solid var(--border)',
                                cursor: 'pointer'
                            }}
                            onClick={() => document.getElementById('review-area').classList.toggle('hidden')}
                        >
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '20px', fontWeight: '800' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)' }}>auto_stories</span>
                                Detailed Review
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: '1.6', fontWeight: '500', marginBottom: '24px' }}>
                                Breakdown of correct vs incorrect responses with AI-derived context and explanations.
                            </p>
                            <div className="auth-button" style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                REVIEW DATA <span className="material-icons" style={{ fontSize: '20px' }}>expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Review Section (Hidden by default) */}
                    <div id="review-area" className="fade-in hidden" style={{ textAlign: 'left', borderTop: '1px solid var(--bg-app)', paddingTop: '48px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Performance Breakdown</h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '800', background: 'var(--bg-app)', padding: '8px 16px', borderRadius: '12px' }}>AI ANALYSIS READY</div>
                        </div>

                        {!quiz ? (
                            <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontWeight: '500' }}>Detailed response data is unavailable for this session.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {quiz.map((q, i) => {
                                    const userAns = answers[q.id];
                                    const isCorrect = userAns === q.correctAnswer;
                                    return (
                                        <div key={q.id} style={{
                                            padding: '32px',
                                            borderRadius: '32px',
                                            background: isCorrect ? 'var(--bg-app)' : 'white',
                                            border: isCorrect ? '1px solid var(--border)' : '1px solid rgba(226, 149, 120, 0.3)'
                                        }}>
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                                <div style={{
                                                    minWidth: '32px', height: '32px', borderRadius: '10px', background: isCorrect ? 'var(--accent)' : 'var(--error)',
                                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem'
                                                }}>{i + 1}</div>
                                                <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: '1.5' }}>{q.text}</div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
                                                <div style={{
                                                    background: isCorrect ? 'white' : 'rgba(226, 149, 120, 0.05)',
                                                    padding: '16px 20px',
                                                    borderRadius: '16px',
                                                    color: isCorrect ? 'var(--accent)' : 'var(--error)',
                                                    fontWeight: '700',
                                                    fontSize: '0.9rem',
                                                    border: '1px solid var(--border)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px'
                                                }}>
                                                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>Your Selection</span>
                                                    <span>{userAns || '(Skipped)'}</span>
                                                </div>
                                                {!isCorrect && (
                                                    <div style={{
                                                        background: 'white',
                                                        padding: '16px 20px',
                                                        borderRadius: '16px',
                                                        color: 'var(--accent)',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem',
                                                        border: '1px solid var(--border)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '4px'
                                                    }}>
                                                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>Correct Path</span>
                                                        <span>{q.correctAnswer}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '64px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                setTestState('idle');
                                setViewMode('hub');
                            }}
                            className="auth-button"
                            style={{ padding: '18px 48px', borderRadius: '18px', fontSize: '1rem' }}
                        >
                            Return to Assessment Hub
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Test History View ---
    if (viewMode === 'history') {
        return (
            <div className="fade-in" style={{ padding: '40px' }}>
                <button
                    onClick={() => setViewMode('hub')}
                    style={{
                        background: 'white',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '40px',
                        fontWeight: '800',
                        color: 'var(--primary)',
                        fontSize: '0.9rem',
                        padding: '12px 28px',
                        borderRadius: '16px'
                    }}
                >
                    <span className="material-icons" style={{ fontSize: '20px' }}>west</span> RETURN TO ASSESSMENT HUB
                </button>

                <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', fontWeight: '800', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.02em' }}>
                    <span className="material-icons" style={{ fontSize: '2.8rem', color: 'var(--accent)' }}>history_edu</span>
                    Academic Record
                </h2>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {history.length > 0 ? history.map((record, index) => (
                        <div key={index} className="crisp-card animate-slide-up" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '32px',
                            background: 'white',
                            padding: '32px 40px',
                            borderRadius: '32px',
                            animationDelay: `${index * 0.05}s`
                        }}>
                            <div style={{ flex: 2, minWidth: '240px' }}>
                                <div style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '6px', letterSpacing: '-0.01em' }}>{record.topic}</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--text-dim)', fontWeight: '600' }}>{record.course} • {record.date}</div>

                                {record.earnedMedal && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginTop: '20px',
                                        padding: '8px 16px',
                                        background: 'var(--bg-app)',
                                        borderRadius: '16px',
                                        fontSize: '0.8rem',
                                        border: '1px solid var(--border)',
                                        color: 'var(--accent)',
                                        fontWeight: '800'
                                    }}>
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>emoji_events</span>
                                        {record.earnedMedal.title}
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, textAlign: 'center', minWidth: '120px' }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '900',
                                    color: record.score >= 80 ? 'var(--accent)' : record.score >= 50 ? 'var(--primary)' : 'var(--error)',
                                    lineHeight: 1
                                }}>
                                    {record.score}<span style={{ fontSize: '1rem', opacity: 0.5 }}>%</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', marginTop: '8px', letterSpacing: '1px' }}>ACCURACY</div>
                            </div>

                            <div style={{ flex: 2, minWidth: '300px' }}>
                                {record.weakTopics && record.weakTopics.length > 0 ? (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning Priorities</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {record.weakTopics.map((t, i) => (
                                                <span key={i} style={{
                                                    fontSize: '0.75rem',
                                                    padding: '6px 14px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '12px',
                                                    background: 'var(--bg-app)',
                                                    color: 'var(--text-main)',
                                                    fontWeight: '700'
                                                }}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-app)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <span className="material-icons">verified</span>
                                        Full System Mastery
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, textAlign: 'right', minWidth: '180px' }}>
                                <button
                                    onClick={() => {
                                        if (record.fullResult) {
                                            setResult({
                                                ...record.fullResult,
                                                earnedMedal: record.earnedMedal
                                            });
                                            if (record.quizSnapshot) setQuiz(record.quizSnapshot);
                                            else setQuiz(null);
                                            if (record.answersSnapshot) setAnswers(record.answersSnapshot);
                                            else setAnswers({});
                                            setTestState('complete');
                                        } else {
                                            openModal({ title: "Session Expired", message: "Detailed session data is no longer cached for this record.", type: 'alert' });
                                        }
                                    }}
                                    className="auth-button"
                                    style={{
                                        padding: '14px 28px',
                                        borderRadius: '16px',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Review Insights
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '120px 40px', color: 'var(--text-dim)', background: 'white', borderRadius: '48px', border: '2px dashed var(--border)' }}>
                            <span className="material-icons" style={{ fontSize: '72px', color: 'var(--bg-app)', marginBottom: '32px' }}>history_toggle_off</span>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>No Records Yet</h3>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', marginTop: '12px' }}>Complete your first assessment to begin your academic legacy.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Course Detail View (Topic List + Stats) ---
    if (viewMode === 'course_detail' && selectedCourse) {
        const modules = selectedCourse.modules || [{ title: 'Baseline Assessment' }, { title: 'Core Competencies' }];
        const courseHistory = history.filter(h => h.course === selectedCourse.title);
        const lastAttempt = courseHistory.length > 0 ? courseHistory[0] : null;

        const cScores = topicScores[selectedCourse.id] || {};
        const weakTopicIndices = Object.keys(cScores).filter(idx => cScores[idx] < 80);
        const weakTopics = weakTopicIndices.map(idx => {
            const mod = selectedCourse.modules ? selectedCourse.modules[idx] : null;
            return mod ? mod.title : `Module ${parseInt(idx) + 1}`;
        });

        return (
            <div className="fade-in" style={{ padding: '40px' }}>
                <button
                    onClick={() => setViewMode('hub')}
                    style={{
                        background: 'white',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '40px',
                        fontWeight: '800',
                        color: 'var(--primary)',
                        fontSize: '0.9rem',
                        padding: '12px 24px',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-soft)'
                    }}
                >
                    <span className="material-icons">west</span> RETURN TO DIRECTORY
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '40px', alignItems: 'start' }}>

                    {/* Left Column: Topic List */}
                    <div className="crisp-card" style={{ padding: '40px', background: 'white', borderRadius: '48px' }}>
                        <h2 style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '2rem', marginBottom: '40px', letterSpacing: '-0.02em' }}>
                            {selectedCourse.title} Curricular Scope
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {modules.map((mod, i) => {
                                const unlocked = getUnlockStatus(selectedCourse, i);
                                const score = topicScores[selectedCourse.id]?.[i];
                                const passed = score >= 80;

                                return (
                                    <div key={i} className="animate-slide-up" style={{
                                        padding: '24px 32px',
                                        border: unlocked ? '1px solid var(--border)' : '1px solid var(--bg-app)',
                                        borderRadius: '24px',
                                        background: unlocked ? 'var(--bg-app)' : 'rgba(0,0,0,0.01)',
                                        opacity: unlocked ? 1 : 0.5,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        animationDelay: `${i * 0.1}s`,
                                        transition: 'var(--transition-smooth)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '16px',
                                                background: passed ? 'var(--accent)' : unlocked ? 'var(--primary)' : 'var(--border)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '900',
                                                fontSize: '1.1rem'
                                            }}>
                                                {passed ? <span className="material-icons" style={{ fontSize: '24px' }}>check</span> : i + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)' }}>{mod.title}</div>
                                                {score !== undefined && (
                                                    <div style={{ fontSize: '0.85rem', color: passed ? 'var(--accent)' : 'var(--primary)', fontWeight: '800', marginTop: '4px', letterSpacing: '0.5px' }}>
                                                        VALIDATED: {score}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {unlocked ? (
                                            <button
                                                onClick={() => startTopicTest(selectedCourse, mod, i)}
                                                className="auth-button"
                                                style={{
                                                    padding: '12px 28px',
                                                    borderRadius: '14px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {score ? 'REVALIDATE' : 'INITIATE'}
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: '800', background: 'white', padding: '10px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                                                LOCKED <span className="material-icons" style={{ fontSize: '18px' }}>lock_clock</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Performance & Revision */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Recent Performance Card */}
                        <div className="crisp-card" style={{ padding: '32px', background: 'white', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '800' }}>Recent Assessment</h3>
                                <button
                                    onClick={() => setViewMode('history')}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-app)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        color: 'var(--primary)',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: '16px' }}>history</span> HISTORY
                                </button>
                            </div>
                            {lastAttempt ? (
                                <div style={{ marginTop: '10px' }}>

                                    {/* Clickable Header Area */}
                                    <div
                                        onClick={() => setShowPerfOptions(!showPerfOptions)}
                                        style={{
                                            cursor: 'pointer',
                                            border: '1px solid var(--border)',
                                            padding: '24px',
                                            borderRadius: '24px',
                                            background: showPerfOptions ? 'var(--bg-app)' : 'white',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>Target Framework</div>
                                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{lastAttempt.topic}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>Accuracy</div>
                                                <span style={{ fontWeight: '900', color: lastAttempt.score >= 80 ? 'var(--accent)' : 'var(--error)', fontSize: '1.75rem' }}>{lastAttempt.score}%</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <span className="material-icons" style={{ fontSize: '20px', color: 'var(--text-dim)', transform: showPerfOptions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>expand_more</span>
                                        </div>
                                    </div>

                                    {showPerfOptions && (
                                        <div className="fade-in" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                            <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '0.7rem', marginBottom: '12px', fontWeight: '800', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>MASTERY PROGRESSION</div>
                                                <div style={{ height: '8px', width: '100%', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${lastAttempt.score}%`,
                                                        background: lastAttempt.score >= 80 ? 'var(--accent)' : 'var(--error)',
                                                        borderRadius: '4px',
                                                        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                                                    }}></div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const topics = lastAttempt.weakTopics || [];
                                                    if (topics.length > 0) {
                                                        setShowPerfSuggested(!showPerfSuggested);
                                                    } else {
                                                        openModal({ title: "Mastery Confirmed", message: "Curricular objectives for this module have been fully validated.", type: 'info' });
                                                    }
                                                }}
                                                style={{
                                                    padding: '16px',
                                                    background: 'white',
                                                    border: '1px solid var(--border)',
                                                    cursor: 'pointer',
                                                    fontWeight: '800',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    borderRadius: '16px',
                                                    color: 'var(--primary)',
                                                    fontSize: '0.9rem',
                                                    transition: 'var(--transition-smooth)'
                                                }}
                                            >
                                                <span className="material-icons" style={{ color: 'var(--accent)' }}>psychology</span>
                                                {showPerfSuggested ? 'CONCEAL ANALYTICS' : 'VIEW AI INSIGHTS'}
                                            </button>

                                            {showPerfSuggested && lastAttempt.weakTopics && (
                                                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {lastAttempt.weakTopics.map((t, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                if (typeof addSuggestedCourse === 'function') addSuggestedCourse(t);
                                                                onNavigateToCourse(t);
                                                            }}
                                                            style={{
                                                                textAlign: 'left',
                                                                padding: '14px 20px',
                                                                background: 'white',
                                                                border: '1px solid var(--border)',
                                                                color: 'var(--primary)',
                                                                borderRadius: '14px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '700',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                transition: 'var(--transition-smooth)'
                                                            }}
                                                        >
                                                            <span>{t}</span>
                                                            <span className="material-icons" style={{ fontSize: '18px' }}>east</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => {
                                                    if (lastAttempt.fullResult) {
                                                        setResult({
                                                            ...lastAttempt.fullResult,
                                                            earnedMedal: lastAttempt.earnedMedal
                                                        });
                                                        if (lastAttempt.quizSnapshot) setQuiz(lastAttempt.quizSnapshot);
                                                        else setQuiz(null);
                                                        if (lastAttempt.answersSnapshot) setAnswers(lastAttempt.answersSnapshot);
                                                        else setAnswers({});
                                                        setTestState('complete');
                                                    } else {
                                                        openModal({ title: "Session Expired", message: "Detailed analytical telemetry is no longer cached for this session.", type: 'alert' });
                                                    }
                                                }}
                                                className="auth-button"
                                                style={{
                                                    width: '100%',
                                                    padding: '18px',
                                                    borderRadius: '16px',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px'
                                                }}
                                            >
                                                <span className="material-icons" style={{ fontSize: '20px' }}>analytics</span>
                                                PERFORMANCE REPORT
                                            </button>
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'right', marginTop: '20px', fontWeight: '800', letterSpacing: '0.5px' }}>VALIDATED ON {lastAttempt.date}</div>
                                </div>
                            ) : (
                                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                    <span className="material-icons" style={{ fontSize: '48px', color: 'var(--bg-app)', marginBottom: '16px', display: 'block' }}>insights</span>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>Analytical baseline pending.</p>
                                    <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Complete an assessment to generate insights.</p>
                                </div>
                            )}
                        </div>

                        {/* Needs Revision Card */}
                        <div className="crisp-card" style={{ background: 'rgba(226, 149, 120, 0.03)', border: '1px solid rgba(226, 149, 120, 0.2)', padding: '32px', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <span className="material-icons" style={{ color: 'var(--error)' }}>emergency_home</span>
                                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '800' }}>Revision Areas</h3>
                            </div>

                            {weakTopics.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: '1.6', fontWeight: '500' }}>Precision tracking of low-scoring sections requiring focus:</p>
                                    {weakTopics.map((topicModuleTitle, i) => {
                                        const isExpanded = revExpanded[topicModuleTitle];
                                        const subTopics = history.find(h => h.course === selectedCourse.title && h.topic === topicModuleTitle)?.weakTopics || [];

                                        return (
                                            <div key={i} style={{ borderRadius: '24px', background: 'white', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                                {/* Module Header */}
                                                <div
                                                    onClick={() => setRevExpanded(prev => ({ ...prev, [topicModuleTitle]: !prev[topicModuleTitle] }))}
                                                    style={{
                                                        padding: '24px',
                                                        cursor: 'pointer',
                                                        fontWeight: '800',
                                                        color: 'var(--text-main)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        background: isExpanded ? 'var(--bg-app)' : 'white',
                                                        transition: 'var(--transition-smooth)',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    <span>{topicModuleTitle}</span>
                                                    <span className="material-icons" style={{ fontSize: '20px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', color: 'var(--text-dim)' }}>expand_more</span>
                                                </div>

                                                {/* Expanded Sub-Topics */}
                                                {isExpanded && (
                                                    <div className="fade-in" style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {subTopics.length > 0 ? subTopics.map((st, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => {
                                                                    if (typeof addSuggestedCourse === 'function') addSuggestedCourse(st);
                                                                    onNavigateToCourse(st);
                                                                }}
                                                                style={{
                                                                    padding: '14px 18px',
                                                                    textAlign: 'left',
                                                                    background: 'var(--bg-app)',
                                                                    border: '1px solid var(--border)',
                                                                    borderRadius: '14px',
                                                                    color: 'var(--primary)',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '800',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    transition: 'var(--transition-smooth)'
                                                                }}
                                                            >
                                                                <span>{st}</span>
                                                                <span className="material-icons" style={{ fontSize: '18px', opacity: 0.5 }}>east</span>
                                                            </button>
                                                        )) : (
                                                            <div style={{ padding: '12px', color: 'var(--text-dim)', fontSize: '0.75rem', fontStyle: 'italic', fontWeight: '800', textAlign: 'center' }}>Knowledge extraction in progress...</div>
                                                        )}

                                                        <button
                                                            onClick={() => {
                                                                if (typeof addSuggestedCourse === 'function') addSuggestedCourse(topicModuleTitle);
                                                                onNavigateToCourse(topicModuleTitle);
                                                            }}
                                                            className="auth-button"
                                                            style={{
                                                                width: '100%',
                                                                padding: '14px',
                                                                borderRadius: '14px',
                                                                fontSize: '0.85rem',
                                                                marginTop: '8px'
                                                            }}
                                                        >
                                                            TARGETED REVIEW
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--accent)', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <span className="material-icons">verified</span> ALL OBJECTIVES SECURED
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div >
        );
    }


    // --- AI Practice Lab quick subjects ---
    const aiSubjects = [
        { name: 'Algorithms & Data Structures', icon: 'account_tree', color: '#4A70A9', qCount: 15 },
        { name: 'JavaScript Mastery', icon: 'javascript', color: '#F0A500', qCount: 15 },
        { name: 'Python Programming', icon: 'code', color: '#4CAF7D', qCount: 15 },
        { name: 'SQL & Databases', icon: 'storage', color: '#E85D4A', qCount: 15 },
        { name: 'System Design', icon: 'architecture', color: '#8FABD4', qCount: 15 },
        { name: 'General Aptitude', icon: 'psychology', color: '#9B59B6', qCount: 15 },
    ];

    // Memoized Results aggregation to prevent unnecessary re-computations and potential crashes
    const allResults = useMemo(() => {
        try {
            const placementHistory = JSON.parse(localStorage.getItem('placement_test_history') || '[]');
            const teacherHistory = (history || []).filter(h => h && h.topic && !h.topic.startsWith('Practice:'));
            const aiHistory = (history || []).filter(h => h && h.topic && h.topic.startsWith('Practice:'));

            const aggregated = [
                ...teacherHistory.map(h => ({ ...h, source: 'teacher', percentage: h.score })),
                ...aiHistory.map(h => ({ ...h, source: 'ai', percentage: h.score })),
                ...placementHistory.map(h => ({ ...h, source: 'placement', score: h.percentage, percentage: h.percentage }))
            ];

            // Safety check for date sorting
            return aggregated.sort((a, b) => {
                const dA = a.date ? new Date(a.date).getTime() : 0;
                const dB = b.date ? new Date(b.date).getTime() : 0;
                return (isNaN(dB) ? 0 : dB) - (isNaN(dA) ? 0 : dA);
            });
        } catch (e) {
            console.error("DEBUG_ANALYTICS: Error calculating allResults", e);
            return [];
        }
    }, [history]);

    const aiAvg = useMemo(() => {
        const aiHistory = (history || []).filter(h => h && h.topic && h.topic.startsWith('Practice:'));
        return aiHistory.length > 0 ? Math.round(aiHistory.reduce((s, a) => s + (a.score || 0), 0) / aiHistory.length) : 0;
    }, [history]);

    const teacherAvg = useMemo(() => {
        const teacherHistory = (history || []).filter(h => h && h.topic && !h.topic.startsWith('Practice:'));
        return teacherHistory.length > 0 ? Math.round(teacherHistory.reduce((s, a) => s + (a.score || 0), 0) / teacherHistory.length) : 0;
    }, [history]);

    const overallAvg = useMemo(() => {
        return allResults.length > 0 ? Math.round(allResults.reduce((s, a) => s + (a.percentage || a.score || 0), 0) / allResults.length) : 0;
    }, [allResults]);

    console.log('DEBUG_ANALYTICS:', {
        subTab,
        allResultsCount: allResults.length,
        historyCount: history?.length,
        teacherAvg,
        aiAvg
    });

    // --- Hub View with Sub-Tabs ---
    return (
        <div className="fade-in" style={{ padding: '24px 28px' }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Assessments</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>Track, practice, and review your performance.</p>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="placement-tabs" style={{ marginBottom: 24 }}>
                {[{ id: 'curriculum', icon: 'school', label: 'Curriculum Tests' }, { id: 'ai_lab', icon: 'auto_awesome', label: 'AI Practice Lab' }, { id: 'results', icon: 'analytics', label: 'Results & Analytics' }].map(t => (
                    <button key={t.id} className={`placement-tab ${subTab === t.id ? 'active' : ''}`} onClick={() => setSubTab(t.id)}>
                        <span className="material-icons">{t.icon}</span>{t.label}
                    </button>
                ))}
            </div>

            {/* ─── Curriculum Tests Tab ─── */}
            {subTab === 'curriculum' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <h2 style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.8rem', margin: 0, letterSpacing: '-0.03em' }}>
                                    Curriculum Tests
                                </h2>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500', marginTop: '8px' }}>Manage tests assigned by your instructors and complete course progression tests.</p>
                            </div>

                            {/* Section 1: Teacher Assessments */}
                            <div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px' }}>assignment_ind</span>
                                    Teacher Assessments
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(() => {
                                        const myTeachers = getTeachersForStudent(user?.id) || [];
                                        const myTeacherIds = myTeachers.map(t => t.id);
                                        const myCustomTests = (customTests || []).filter(ct => myTeacherIds.includes(ct.teacherId));

                                        if (myCustomTests.length === 0) {
                                            return <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic', padding: '12px' }}>No active assessments assigned by your instructors.</div>;
                                        }

                                        return myCustomTests.map((t, i) => (
                                            <div key={t.id} className="crisp-card hover-lift animate-slide-up" style={{ padding: '20px 24px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: `${i * 0.1}s` }}>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>CUSTOM TEST</div>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>{t.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '700', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span className="material-icons" style={{ fontSize: '14px' }}>schedule</span> {t.duration} mins • {t.questions?.length || 0} Questions
                                                    </div>
                                                </div>
                                                <button onClick={() => alert('Custom test runner coming soon!')} className="auth-button hover-bright" style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                                    START TEST
                                                </button>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Section 2: Course Progression */}
                            <div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons" style={{ color: 'var(--accent)', fontSize: '20px' }}>route</span>
                                    Course Progression
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                    {myCourses.map((c, i) => (
                                        <div key={c.id} className="crisp-card animate-slide-up" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'white', borderRadius: '20px', height: '220px', border: '1px solid var(--border)', animationDelay: `${i * 0.08}s`, position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'var(--primary)', opacity: 0.04, borderRadius: '50%' }}></div>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '0.08em', marginBottom: '10px' }}>COURSE TEST</div>
                                                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.3' }}>{c.title}</h3>
                                            </div>
                                            <button onClick={() => { setSelectedCourse(c); setViewMode('course_detail'); }} className="auth-button" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <span className="material-icons" style={{ fontSize: '18px' }}>quiz</span> START TEST
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="crisp-card" style={{ background: 'var(--primary)', padding: '28px', borderRadius: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', opacity: 0.8 }}>TEACHER TESTS AVG</h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '12px 0 4px' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>{teacherAvg}</span>
                                    <span style={{ fontSize: '1rem', opacity: 0.6, fontWeight: '800' }}>%</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '600', opacity: 0.8 }}>{history.length} tests completed</p>
                            </div>
                        </div>
                        <div className="crisp-card" style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>Recent Tests</h3>
                            {history.length === 0 ? <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>No tests yet.</div> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {history.slice(0, 4).map((h, idx) => (
                                        <div key={idx} onClick={() => { const c = myCourses.find(c => c.title === h.course); if (c) { setSelectedCourse(c); setViewMode('course_detail'); } }} className="clickable" style={{ padding: '12px 14px', background: 'var(--bg-app)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s ease' }}>
                                            <div><div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{h.topic}</div><div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{h.course}</div></div>
                                            <div style={{ fontWeight: 900, color: h.score >= 80 ? 'var(--success)' : h.score >= 50 ? 'var(--warning)' : 'var(--error)', fontSize: '0.95rem' }}>{h.score}%</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button onClick={() => setSubTab('results')} style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                VIEW ALL RESULTS <span className="material-icons" style={{ fontSize: '14px' }}>east</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── AI Practice Lab Tab ─── */}
            {subTab === 'ai_lab' && (
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>AI Practice Lab</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>Quick AI-generated tests for self-practice. No grades — just improvement.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: 24 }}>
                        {myCourses.length > 0 ? myCourses.map((c, i) => (
                            <div key={i} onClick={() => startAITest(c)} className="crisp-card clickable" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `var(--bg-blueprint)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <span className="material-icons" style={{ fontSize: 24, color: 'var(--primary)' }}>school</span>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 4 }}>{c.title}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--secondary)', fontWeight: 800 }}>AI Practice Test</div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                                Enroll in courses from the catalog to generate customized practice tests.
                            </div>
                        )}

                        {/* Static AI Subjects */}
                        {aiSubjects.map((s, i) => (
                            <div key={`static_${i}`} onClick={() => startAITest({ title: s.name })} className="crisp-card clickable" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <span className="material-icons" style={{ fontSize: 24, color: s.color }}>{s.icon}</span>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 4 }}>{s.name}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{s.qCount} questions</div>
                            </div>
                        ))}
                    </div>

                    {/* AI Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="crisp-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(74,112,169,0.06), rgba(143,171,212,0.04))', border: '1px solid rgba(74,112,169,0.1)', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{aiHistory.length}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>AI Tests Taken</div>
                        </div>
                        <div className="crisp-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(76,175,125,0.06), rgba(76,175,125,0.02))', border: '1px solid rgba(76,175,125,0.1)', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)' }}>{aiAvg}%</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>Average Score</div>
                        </div>
                        <div className="crisp-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(240,165,0,0.06), rgba(240,165,0,0.02))', border: '1px solid rgba(240,165,0,0.1)', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--warning)' }}>{aiHistory.filter(h => (h.score || 0) >= 80).length}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>Tests Passed (80%+)</div>
                        </div>
                    </div>

                    {/* Recent AI test results */}
                    {aiHistory.length > 0 && (
                        <div className="crisp-card" style={{ marginTop: 20, padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 800 }}>Recent AI Practice Results</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {aiHistory.slice(-5).reverse().map((r, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 10 }}>
                                        <div><span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.topic}</span><span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginLeft: 8 }}>{r.course}</span></div>
                                        <span style={{ fontWeight: 900, color: (r.score || 0) >= 80 ? 'var(--success)' : (r.score || 0) >= 50 ? 'var(--warning)' : 'var(--error)', fontSize: '0.9rem' }}>{r.score || 0}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Results & Analytics Tab ─── */}
            {subTab === 'results' && (
                <div>
                    <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>Results & Analytics</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>Combined performance from Curriculum Tests and AI Practice.</p>
                    </div>

                    {/* Summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: 24 }}>
                        {[{ label: 'Total Tests', value: allResults.length, color: 'var(--primary)', icon: 'assignment' }, { label: 'Teacher Avg', value: `${teacherAvg}%`, color: 'var(--secondary)', icon: 'school' }, { label: 'AI Avg', value: `${aiAvg}%`, color: 'var(--success)', icon: 'auto_awesome' }, { label: 'Overall Avg', value: `${allResults.length > 0 ? Math.round(allResults.reduce((s, a) => s + (a.percentage || a.score || 0), 0) / allResults.length) : 0}%`, color: 'var(--warning)', icon: 'trending_up' }].map((s, i) => (
                            <div key={i} className="crisp-card" style={{ padding: '20px', borderRadius: 14, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 20, color: s.color }}>{s.icon}</span></div>
                                <div><div style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600, marginTop: 2 }}>{s.label}</div></div>
                            </div>
                        ))}
                    </div>

                    {/* Results filter tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        {['all', 'teacher', 'ai'].map(f => (
                            <button key={f} onClick={() => { }} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: f === 'all' ? 'var(--primary)' : 'white', color: f === 'all' ? 'white' : 'var(--text-dim)', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>{f === 'all' ? 'All' : f === 'teacher' ? '📘 Teacher' : '🤖 AI'}</button>
                        ))}
                    </div>

                    {/* Results list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {allResults.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-dim)', background: 'white', borderRadius: 20, border: '1px solid var(--border)' }}>
                                <span className="material-icons" style={{ fontSize: 48, color: 'var(--bg-secondary)', marginBottom: 16 }}>history_toggle_off</span>
                                <h3 style={{ margin: '0 0 8px', fontWeight: 800, color: 'var(--text-main)' }}>No Results Yet</h3>
                                <p style={{ fontSize: '0.85rem' }}>Take a test to see your results here.</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>DEBUG: subTab={subTab} allResults={allResults.length}</p>
                            </div>
                        ) : (
                            allResults.slice(0, 20).map((r, i) => {
                                const isExpanded = expandedAnalyticsId === i;

                                return (
                                    <div key={i} className="crisp-card animate-slide-up" style={{ padding: 0, overflow: 'hidden', borderRadius: 14, border: isExpanded ? '2px solid var(--primary)' : '1px solid var(--border)', background: 'white', transition: 'all 0.2s', animationDelay: `${i * 0.05}s` }}>

                                        {/* Clickable Header */}
                                        <div onClick={() => setExpandedAnalyticsId(isExpanded ? null : i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', background: isExpanded ? 'var(--bg-blueprint)' : 'white' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: r.source === 'teacher' ? 'rgba(74,112,169,0.1)' : r.source === 'placement' ? 'rgba(232,93,74,0.1)' : 'rgba(76,175,125,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span className="material-icons" style={{ fontSize: 18, color: r.source === 'teacher' ? 'var(--primary)' : r.source === 'placement' ? 'var(--error)' : 'var(--success)' }}>
                                                        {r.source === 'teacher' ? 'school' : r.source === 'placement' ? 'work' : 'auto_awesome'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.topic || r.subject || 'General'}</div>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                                                        {r.course || 'AI Practice'} • {new Date(r.date || new Date()).toLocaleDateString()} •
                                                        <span style={{ fontWeight: 700, color: r.source === 'teacher' ? 'var(--primary)' : r.source === 'placement' ? 'var(--error)' : 'var(--success)' }}>
                                                            {r.source === 'teacher' ? ' Curriculum' : r.source === 'placement' ? ' Placement' : ' AI Lab'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: (r.percentage || r.score || 0) >= 80 ? 'var(--success)' : (r.percentage || r.score || 0) >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                                                    {r.percentage || r.score || 0}%
                                                </div>
                                                <span className="material-icons" style={{ color: 'var(--text-dim)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>expand_more</span>
                                            </div>
                                        </div>

                                        {/* Expanded Region */}
                                        {isExpanded && r.quizSnapshot && r.answersSnapshot && (
                                            <div className="fade-in" style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', background: 'var(--bg-app)' }}>
                                                <h4 style={{ margin: '0 0 20px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 18 }}>analytics</span> Granular Validation Data
                                                </h4>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                    {r.quizSnapshot.map((q, qIndex) => {
                                                        const userAnsIndex = r.answersSnapshot[qIndex];
                                                        const isCorrect = userAnsIndex === q.correctAnswer;

                                                        return (
                                                            <div key={qIndex} style={{ padding: '20px', borderRadius: 16, background: 'white', border: isCorrect ? '1px solid rgba(76,175,125,0.3)' : '1px solid rgba(232,93,74,0.3)' }}>
                                                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                                                    <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: 8, background: isCorrect ? 'var(--success)' : 'var(--error)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                                                                        {qIndex + 1}
                                                                    </div>
                                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{q.question || q.text}</div>
                                                                </div>

                                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }}>
                                                                    <div style={{ padding: '12px 16px', borderRadius: 12, background: isCorrect ? 'white' : 'rgba(232,93,74,0.05)', border: '1px solid var(--border)' }}>
                                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Your Answer</div>
                                                                        <div style={{ fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--error)', fontSize: '0.85rem' }}>
                                                                            {userAnsIndex !== undefined ? q.options[userAnsIndex] : '(Skipped)'}
                                                                        </div>
                                                                    </div>
                                                                    {!isCorrect && (
                                                                        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(76,175,125,0.05)', border: '1px solid var(--border)' }}>
                                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Correct Answer</div>
                                                                            <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>
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

                                        {isExpanded && !(r.quizSnapshot && r.answersSnapshot) && (
                                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 500, borderTop: '1px solid var(--border)', background: 'var(--bg-app)' }}>
                                                Raw granular telemetry unavailable for this archival record.
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SectionPlaceholder = ({ title }) => (
    <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--text-dim)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', margin: '40px' }}>
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            border: '1px solid var(--glass-border)'
        }}>
            <span className="material-icons" style={{ fontSize: '40px', color: 'rgba(255,255,255,0.2)' }}>construction</span>
        </div>
        <h2 style={{ fontSize: '2rem', color: 'white', fontWeight: '900', marginBottom: '12px' }}>{title}</h2>
        <p style={{ fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>We're currently architecting this module for a premium experience. Stay tuned for the deployment.</p>
    </div>
);

// --- Achievements View ---

const AchievementsView = () => {
    const { user, refreshUser } = useAuth();
    const { awardBadge, refreshData } = useData();

    // Refresh user data on mount to ensure new medals appear
    useEffect(() => {
        refreshUser();
    }, []);

    const achievements = user.achievements || [];

    // Separate by type
    const medals = achievements.filter(a => a.type === 'medal');
    const certificates = achievements.filter(a => a.type === 'certificate');

    const handleForceSync = async () => {
        const savedHistory = JSON.parse(localStorage.getItem('assessment_history') || '[]');
        let restoredCount = 0;

        if (savedHistory.length > 0) {
            for (const record of savedHistory) {
                if (record.earnedMedal) {
                    const hasIt = user.achievements?.some(a => a.title === record.earnedMedal.title);
                    if (!hasIt) {
                        console.log("Force restoring:", record.earnedMedal.title);
                        await awardBadge(user.id, record.earnedMedal.id, {
                            title: record.earnedMedal.title,
                            description: record.earnedMedal.description,
                            icon: record.earnedMedal.icon,
                            date: record.earnedMedal.date
                        });
                        restoredCount++;
                    }
                }
            }

            if (restoredCount > 0) {
                if (refreshData) await refreshData();
                setTimeout(() => {
                    refreshUser();
                }, 500);
            }
        }
    };

    return (
        <div className="fade-in" style={{ padding: '32px' }}>
            {/* Header */}
            <div className="glass-card" style={{
                marginBottom: '40px',
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(0,0,0,0))',
                border: '1px solid var(--glass-border)',
                padding: '48px',
                borderRadius: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '32px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(255, 193, 7, 0.3)'
                }}>
                    <span className="material-icons" style={{ fontSize: '40px', color: 'white' }}>emoji_events</span>
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '2.8rem', color: 'white', fontWeight: '900', letterSpacing: '-0.04em' }}>Excellence Gallery</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-dim)', fontSize: '1.2rem', fontWeight: '500' }}>Chronicle of your academic milestones and validated competencies.</p>
                </div>
                <button
                    onClick={handleForceSync}
                    className="glass-card clickable"
                    style={{
                        padding: '12px 24px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        color: 'white',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.05)'
                    }}
                >
                    SYNC RECORDS
                </button>
            </div>

            {/* Medals Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'white', letterSpacing: '2px' }}>MEDALS ({medals.length})</h3>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--glass-border), transparent)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
                {medals.length > 0 ? medals.map((m, idx) => (
                    <div key={idx} className="glass-card animate-slide-up" style={{
                        textAlign: 'center',
                        padding: '40px 32px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '40px',
                        animationDelay: `${idx * 0.1}s`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFD700, #FDB931)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px auto',
                            boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)',
                            border: '4px solid rgba(255,255,255,0.2)'
                        }}>
                            <span className="material-icons" style={{ fontSize: '4rem', color: 'white' }}>{m.icon || 'military_tech'}</span>
                        </div>

                        <div style={{ fontWeight: '900', fontSize: '1.3rem', color: 'white', marginBottom: '8px' }}>{m.title}</div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-dim)', marginBottom: '24px', fontWeight: '500', lineHeight: '1.5' }}>{m.description}</div>

                        <div style={{
                            fontSize: '0.75rem', color: 'white', background: 'rgba(255, 193, 7, 0.2)',
                            padding: '8px 16px', borderRadius: '20px', display: 'inline-block',
                            fontWeight: '800', border: '1px solid rgba(255, 193, 7, 0.3)'
                        }}>
                            EARNED {new Date(m.date).toLocaleDateString().toUpperCase()}
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: '1 / -1', padding: '100px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--glass-border)', borderRadius: '40px' }}>
                        <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '16px' }}>emoji_events</span>
                        <p style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: '800' }}>Trophy Cabinet Empty</p>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)', marginTop: '8px' }}>Achieve over 80% accuracy in assessments to earn medals.</p>
                    </div>
                )}
            </div>

            {/* Certificates Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', marginTop: '64px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'white', letterSpacing: '2px' }}>CERTIFICATIONS ({certificates.length})</h3>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--glass-border), transparent)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
                {certificates.map((c, idx) => (
                    <div key={idx} className="glass-card hover-scale animate-slide-up" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', borderRadius: '48px', animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '40px', textAlign: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                            <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--accent)' }}>workspace_premium</span>
                            <h2 style={{ margin: '16px 0 0 0', color: 'white', fontWeight: '900', fontSize: '1.8rem', letterSpacing: '-0.5px' }}>Credential</h2>
                        </div>
                        <div style={{ padding: '48px 40px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: '600', margin: 0 }}>This clarifies that</p>
                            <h3 style={{ fontSize: '2rem', color: 'white', fontWeight: '900', margin: '16px 0', borderBottom: '2px solid var(--primary)', display: 'inline-block', paddingBottom: '8px' }}>{user.name}</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: '600', margin: 0 }}>has successfully mastered</p>
                            <div style={{ fontWeight: '900', fontSize: '1.4rem', margin: '16px 0', color: 'var(--primary)', letterSpacing: '-0.3px' }}>{c.title.replace('Certified in ', '')}</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '800', marginTop: '24px' }}>VALIDATED ON {new Date(c.date).toLocaleDateString().toUpperCase()}</p>
                        </div>
                    </div>
                ))}
                {certificates.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '60px 40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: '600' }}>
                        No certifications issued yet. Complete professional tracks to earn formal credentials.
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Live Classes View ---

const LiveClassView = () => {
    const { user } = useAuth();
    const { getCoursesForStudent, meetings, courseAssignments, users } = useData();
    const [selectedCourse, setSelectedCourse] = useState(null);

    const myCourses = getCoursesForStudent(user.id);

    // Filter meetings for the selected course
    const teacherAssignment = selectedCourse ? courseAssignments.find(ca => ca.courseId === selectedCourse.id) : null;
    const teacherId = teacherAssignment?.teacherId;
    const teacher = users.find(u => u.id === teacherId);

    const liveSessions = selectedCourse && teacherId
        ? meetings.filter(m => m.teacherId === teacherId && m.studentId === user.id)
        : [];

    liveSessions.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    const youtubeResources = selectedCourse ? [
        { id: 1, title: `Live: ${selectedCourse.title} - Key Concepts`, thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`, link: `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedCourse.title + ' tutorial')}` },
        { id: 2, title: `${selectedCourse.title} Full Course Stream`, thumbnail: `https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg`, link: `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedCourse.title + ' lesson')}` },
        { id: 3, title: `Advanced ${selectedCourse.title} Workshop`, thumbnail: `https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg`, link: `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedCourse.title + ' advanced')}` }
    ] : [];

    return (
        <div className="fade-in" style={{ padding: '32px' }}>
            {/* Header */}
            <div className="crisp-card" style={{
                marginBottom: '32px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                padding: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                color: 'white',
                border: 'none',
                boxShadow: '0 12px 32px rgba(74, 112, 169, 0.25)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -30, right: -20, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.3)'
                }}>
                    <span className="material-icons" style={{ fontSize: '36px', color: 'white' }}>live_tv</span>
                </div>
                <div style={{ zIndex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'white', fontWeight: '900', letterSpacing: '-0.02em' }}>Live Classroom</h1>
                    <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', fontWeight: 500 }}>Synchronous learning sessions and curated expert streams.</p>
                </div>
            </div>

            {!selectedCourse ? (
                <div>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '800' }}>Active Curriculums</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {myCourses.map((c, i) => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedCourse(c)}
                                className="crisp-card clickable animate-slide-up"
                                style={{
                                    padding: '32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    animationDelay: `${i * 0.05}s`
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '800' }}>{c.title}</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.5' }}>{c.description.substring(0, 80)}...</p>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px' }}>ENTER CLASSROOM</span>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons" style={{ fontSize: '18px', color: 'var(--primary)' }}>arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up">
                    <button
                        onClick={() => setSelectedCourse(null)}
                        style={{
                            background: 'var(--bg-blueprint)',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '32px',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            letterSpacing: '0.5px',
                            transition: 'var(--transition-smooth)'
                        }}
                        className="hover-lift"
                    >
                        <span className="material-icons" style={{ fontSize: '18px', color: 'var(--primary)' }}>arrow_back</span> BACK TO COURSES
                    </button>

                    <h2 style={{ marginBottom: '40px', fontSize: '2rem', color: 'var(--text-main)', fontWeight: '900' }}>{selectedCourse.title}: <span style={{ color: 'var(--primary)' }}>Live Hub</span></h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '40px' }}>

                        {/* Instructor Sessions */}
                        <div className="crisp-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <span className="material-icons" style={{ color: 'var(--secondary)', fontSize: '24px' }}>video_call</span>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '800' }}>Instructor Sessions</h3>
                            </div>

                            {teacher ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'white', fontSize: '1.2rem' }}>{teacher.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Assigned Mentor</div>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>{teacher.name}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {liveSessions.length > 0 ? liveSessions.map(session => (
                                            <div key={session.id} className="crisp-card hover-lift" style={{ padding: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Upcoming Session</div>
                                                        <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: '800', marginTop: '4px' }}>{new Date(session.date).toLocaleDateString()} • {session.time}</div>
                                                    </div>
                                                    <div style={{ background: 'var(--secondary)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.05em' }}>LIVE SOON</div>
                                                </div>
                                                <a
                                                    href={session.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="auth-button hover-bright"
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', margin: 0, textDecoration: 'none', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: 'white', boxShadow: '0 8px 24px rgba(74, 112, 169, 0.25)', borderRadius: '12px', fontWeight: 900 }}
                                                >
                                                    <span className="material-icons" style={{ fontSize: '20px' }}>videocam</span>
                                                    JOIN SECURE MEETING
                                                </a>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '48px 24px', background: 'var(--bg-secondary)', textAlign: 'center', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                                                <span className="material-icons" style={{ fontSize: '40px', color: 'var(--text-dim)', marginBottom: '16px', opacity: 0.3 }}>event_busy</span>
                                                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>No synchronous sessions scheduled with {teacher.name}. Check your notifications for sudden updates.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '32px', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '16px', textAlign: 'center' }}>
                                    <span className="material-icons" style={{ color: 'var(--accent)', fontSize: '32px', marginBottom: '12px' }}>error_outline</span>
                                    <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: '700' }}>Awaiting Mentor Assignment</p>
                                </div>
                            )}
                        </div>

                        {/* YouTube Stream & Labs */}
                        <div className="crisp-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <span className="material-icons" style={{ color: '#ef4444', fontSize: '24px' }}>play_circle</span>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '800' }}>Global Lab Streams</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {youtubeResources.map(yt => (
                                    <a
                                        key={yt.id}
                                        href={yt.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div className="crisp-card clickable" style={{ display: 'flex', gap: '16px', padding: '16px' }}>
                                            <div style={{ width: '140px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                                <img src={yt.thumbnail} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span className="material-icons" style={{ color: 'white', fontSize: '24px' }}>play_arrow</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '6px', lineHeight: '1.4' }}>{yt.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span className="material-icons" style={{ fontSize: '14px' }}>sensors</span> WATCH STREAM
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

// PlacementPortalView is now imported from '../PlacementPortal'

// --- Main Shell ---

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme, getCoursesForStudent, checkStreaks, openModal, closeModal, modalConfig } = useData();
    const settings = useSettings();
    const [activeTab, setActiveTab] = useState('home');
    const [viewProps, setViewProps] = useState({}); // To pass navigating params like {initialSubTab, autoLaunchTopic}

    // Check streaks on mount
    useEffect(() => {
        if (user && user.id) {
            checkStreaks(user.id);
        }
    }, [user, checkStreaks]);

    // Modal State is now managed globally in DataContext

    const handleNavigateToCourse = (topic) => {
        setViewProps({ initialSubTab: 'suggested', autoLaunchTopic: topic });
        setActiveTab('courses');
    };

    // Override Styles
    // const currentTheme = darkMode ? darkStudentTheme : studentTheme;
    // const themeStyles = {...currentTheme};

    const myCourses = getCoursesForStudent(user.id);

    const renderMenu = (id, label, icon) => (
        <div
            key={id}
            onClick={() => {
                setActiveTab(id);
                if (id !== 'courses') setViewProps({});
            }}
            style={{
                padding: '11px 18px',
                marginBottom: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '12px',
                background: activeTab === id ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: activeTab === id ? 'white' : 'rgba(255,255,255,0.7)',
                fontWeight: activeTab === id ? '700' : '500',
                transition: 'var(--transition-smooth)',
                position: 'relative'
            }}
            className="hover-bright"
        >
            <span className="material-icons" style={{
                fontSize: '1.2rem',
                color: activeTab === id ? 'white' : 'rgba(255,255,255,0.6)',
                opacity: activeTab === id ? 1 : 0.8
            }}>{icon}</span>
            <span style={{ fontSize: '0.88rem', letterSpacing: '-0.01em' }}>{label}</span>
        </div>
    );

    return (
        <div className="admin-container" style={{ background: 'transparent', height: '100vh', display: 'flex' }}>
            {/* Light Glass Sidebar */}
            <nav style={{
                width: '260px',
                minWidth: '260px',
                background: `linear-gradient(180deg, var(--primary), var(--secondary))`,
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{
                    padding: '40px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '1.75rem',
                        letterSpacing: '-0.04em'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.25)',
                            borderTopLeftRadius: '14px',
                            borderBottomRightRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <span className="material-icons" style={{ fontSize: '24px', color: 'white' }}>school</span>
                        </div>
                        Praxium
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', paddingLeft: '52px' }}>LEVEL UP YOUR MIND</div>
                </div>

                <div className="custom-scrollbar" style={{ padding: '16px 16px', flex: 1, overflowY: 'auto' }}>
                    {renderMenu('home', settings.t('dashboard'), 'dashboard')}
                    {renderMenu('courses', settings.t('courses'), 'library_books')}
                    {renderMenu('live', settings.t('liveClasses'), 'live_tv')}
                    {renderMenu('chat', settings.t('messenger'), 'chat')}
                    {renderMenu('ai_chat', 'Chat with AI', 'auto_awesome')}
                    {renderMenu('assessments', 'Assessments', 'assignment')}
                    {renderMenu('placement', 'Placement Portal', 'work')}
                    {renderMenu('profile', 'My Account', 'person')}
                </div>

                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)'
                        }}
                        className="hover-bright"
                    >
                        <span className="material-icons" style={{ fontSize: '16px' }}>logout</span>
                        Sign Out
                    </button>
                </div>

            </nav>

            <main style={{
                flex: 1,
                height: '100vh',
                overflowY: (activeTab === 'chat' || activeTab === 'ai_chat') ? 'hidden' : 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: (activeTab === 'chat' || activeTab === 'ai_chat') ? '0' : '20px 0 0 0'
            }} className="custom-scrollbar">
                {activeTab === 'home' && <OverviewPanel user={user} myCourses={myCourses} onNavigate={(tab, props) => { setActiveTab(tab); setViewProps(props); }} />}
                {activeTab === 'courses' && <CourseView {...viewProps} openModal={openModal} />}
                {activeTab === 'live' && <LiveClassView />}
                {activeTab === 'chat' && <TeacherChatView />}
                {activeTab === 'ai_chat' && <AIChatView />}
                {activeTab === 'assessments' && <AssessmentView onNavigateToCourse={handleNavigateToCourse} onNavigateToPlacement={(subject) => { setActiveTab('placement'); /* pass subject to Placement Portal via sessionStorage */ sessionStorage.setItem('ai_test_subject', subject); }} openModal={openModal} />}
                {activeTab === 'achievements' && <AchievementsView />}
                {activeTab === 'placement' && <PlacementPortalView />}
                {activeTab === 'profile' && <AccountSettings />}
                {activeTab === 'help' && <HelpView />}
            </main>
        </div>
    );
}
