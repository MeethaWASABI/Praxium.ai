import React, { useState, useEffect, useRef } from 'react';
import ChatInput from '../ChatInput';
import { generateAIResponse } from '../../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';

const AIChatView = () => {
    const { user } = useAuth();
    const sessionKey = `ai_chat_sessions_${user?.id || 'guest'}`;
    const activeIdKey = `ai_chat_active_id_${user?.id || 'guest'}`;

    // Session Management
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem(sessionKey);
        return saved ? JSON.parse(saved) : [{ id: 1, title: 'New Chat', messages: [] }];
    });
    const [activeSessionId, setActiveSessionId] = useState(() => {
        const saved = localStorage.getItem(activeIdKey);
        return saved ? parseInt(saved) : 1;
    });

    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
    const messagesEndRef = useRef(null);

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem(sessionKey, JSON.stringify(sessions));
    }, [sessions, sessionKey]);

    useEffect(() => {
        localStorage.setItem(activeIdKey, activeSessionId);
    }, [activeSessionId, activeIdKey]);

    // Handle user switching
    useEffect(() => {
        const saved = localStorage.getItem(sessionKey);
        setSessions(saved ? JSON.parse(saved) : [{ id: 1, title: 'New Chat', messages: [] }]);
        const savedId = localStorage.getItem(activeIdKey);
        setActiveSessionId(savedId ? parseInt(savedId) : 1);
    }, [sessionKey, activeIdKey]);

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeSession.messages]);

    const createNewChat = () => {
        const newId = Date.now();
        const newSession = { id: newId, title: 'New Chat', messages: [] };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newId);
    };

    const deleteChat = (e, id) => {
        e.stopPropagation();
        const remaining = sessions.filter(s => s.id !== id);
        if (remaining.length === 0) {
            // Always keep one session
            const newId = Date.now();
            setSessions([{ id: newId, title: 'New Chat', messages: [] }]);
            setActiveSessionId(newId);
        } else {
            setSessions(remaining);
            if (activeSessionId === id) {
                setActiveSessionId(remaining[0].id);
            }
        }
    };

    const handleSend = async (text, attachment) => {
        // Optimistic UI Update
        const newMsg = {
            id: Date.now(),
            sender: 'me',
            text: text,
            attachment,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Update Title if it's the first message
        const isFirstMessage = activeSession.messages.length === 0;

        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    title: isFirstMessage ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : s.title,
                    messages: [...s.messages, newMsg]
                };
            }
            return s;
        }));

        // AI Typing Placeholder
        const placeholderId = Date.now() + 1;
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, { id: placeholderId, sender: 'ai', text: "Thinking...", time: 'Now', isThinking: true }] } : s));

        try {
            const aiResponse = await generateAIResponse(text, attachment?.file);

            // Update Placeholder with Real Response
            setSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    return {
                        ...s,
                        messages: s.messages.map(msg =>
                            msg.id === placeholderId ? { ...msg, text: aiResponse, isThinking: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : msg
                        )
                    };
                }
                return s;
            }));
        } catch (error) {
            setSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    return {
                        ...s,
                        messages: s.messages.map(msg =>
                            msg.id === placeholderId ? { ...msg, text: "Sorry, I encountered an error. Please try again.", isThinking: false } : msg
                        )
                    };
                }
                return s;
            }));
        }
    };

    return (
        <div className="fade-in" style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            minHeight: 0,
            height: '100%',
            background: 'var(--bg-app)',
            gap: '0',
            width: '100%'
        }}>
            {/* Sidebar History (Floating Glass Panel) */}
            <div className="crisp-card" style={{
                width: '320px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                gap: '20px'
            }}>
                <button
                    onClick={createNewChat}
                    className="hover-lift"
                    style={{
                        width: '100%',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(74, 112, 169, 0.3)',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <span className="material-icons" style={{ fontSize: '1.4rem' }}>add</span>
                    START NEW CHAT
                </button>
                <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '16px', paddingLeft: '8px' }}>RECENT SESSIONS</div>
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            onClick={() => setActiveSessionId(s.id)}
                            className="hover-bright"
                            style={{
                                padding: '16px 20px',
                                marginBottom: '8px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                background: activeSessionId === s.id ? 'rgba(74, 112, 169, 0.08)' : 'transparent',
                                borderLeft: activeSessionId === s.id ? '4px solid var(--primary)' : '4px solid transparent',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '180px',
                                color: activeSessionId === s.id ? 'var(--primary)' : 'var(--text-main)',
                                fontSize: '0.9rem',
                                fontWeight: activeSessionId === s.id ? '800' : '600'
                            }}>{s.title}</span>
                            <span
                                onClick={(e) => deleteChat(e, s.id)}
                                className="material-icons hover-bright"
                                style={{
                                    fontSize: '18px',
                                    color: activeSessionId === s.id ? 'var(--primary)' : 'var(--text-dim)',
                                    cursor: 'pointer',
                                    opacity: activeSessionId === s.id ? 0.9 : 0.4,
                                    transition: 'opacity 0.2s',
                                    padding: '4px',
                                    borderRadius: '8px'
                                }}
                            >
                                delete
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="crisp-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, borderRadius: '24px', position: 'relative' }}>
                <div style={{
                    padding: '24px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--glass-border)',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            background: 'var(--primary-soft)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(74,112,169,0.15)'
                        }}>
                            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '28px' }}>auto_awesome</span>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 900, letterSpacing: '-0.02em' }}>AI Core Tutor</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Gemini 2.0 Flash Model</span>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: 'var(--primary)',
                        background: 'rgba(74, 112, 169, 0.1)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        letterSpacing: '0.05em'
                    }}>
                        {activeSession.messages.length} MESSAGES
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px' }} className="custom-scrollbar">
                    {activeSession.messages.length === 0 && (
                        <div className="fade-in" style={{ textAlign: 'center', color: 'var(--text-dim)', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: 'var(--primary-soft)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                boxShadow: '0 12px 40px rgba(74,112,169,0.15)'
                            }}>
                                <span className="material-icons" style={{ fontSize: '48px', color: 'var(--primary)' }}>auto_awesome</span>
                            </div>
                            <h3 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '1.4rem', fontWeight: 900 }}>How can I help you today?</h3>
                            <p style={{ maxWidth: '360px', margin: '0 auto', fontSize: '1rem', opacity: 0.8, lineHeight: 1.6, fontWeight: 500 }}>I'm your AI tutor. Ask me about your courses, math problems, coding structure, or general concepts.</p>
                        </div>
                    )}
                    {activeSession.messages.map(msg => (
                        <div key={msg.id} className="animate-slide-up" style={{
                            alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                padding: '18px 24px',
                                background: msg.sender === 'me' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--glass-bg)',
                                color: msg.sender === 'me' ? 'white' : 'var(--text-main)',
                                backdropFilter: msg.sender === 'me' ? 'none' : 'blur(20px)',
                                borderRadius: msg.sender === 'me' ? '28px 28px 8px 28px' : '28px 28px 28px 8px',
                                border: msg.sender === 'me' ? 'none' : '1px solid var(--glass-border)',
                                boxShadow: msg.sender === 'me' ? '0 12px 32px rgba(74, 112, 169, 0.25)' : 'var(--glass-shadow)',
                                fontWeight: '500',
                                fontSize: '1rem',
                                lineHeight: '1.7',
                                position: 'relative'
                            }}>
                                {msg.sender !== 'me' && <div style={{ position: 'absolute', top: -14, left: -14, width: 32, height: 32, borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(74,112,169,0.3)' }}><span className="material-icons" style={{ fontSize: 18 }}>auto_awesome</span></div>}
                                {msg.attachment && (
                                    <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        {msg.attachment.type === 'image' && <img src={msg.attachment.url} style={{ maxWidth: '100%', borderRadius: '12px', display: 'block' }} alt="Sent" />}
                                        {msg.attachment.type === 'audio' && (
                                            <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit' }}>
                                                <span className="material-icons">graphic_eq</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Audio Clip</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {msg.sender === 'me' ? (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                ) : (
                                    <div className="markdown-content" style={{ color: 'var(--text-main)' }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                {msg.isThinking && (
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                                        <div className="thinking-dot" style={{ background: 'var(--primary)' }}></div>
                                        <div className="thinking-dot" style={{ animationDelay: '0.2s', background: 'var(--primary)' }}></div>
                                        <div className="thinking-dot" style={{ animationDelay: '0.4s', background: 'var(--primary)' }}></div>
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px', fontWeight: '800', letterSpacing: '0.05em' }}>{msg.time}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '24px 32px', background: 'transparent', borderTop: '1px solid var(--glass-border)', position: 'relative', zIndex: 10 }}>
                    <ChatInput onSend={handleSend} placeholder={activeSession.messages.length === 0 ? "Ask your core tutor anything..." : "Write a message..."} />
                </div>
            </div>
        </div>
    );
};

export default AIChatView;
