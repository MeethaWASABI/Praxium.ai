const Test = () => <div>
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
                                    <div className="crisp-card animate-slide-up" style={{ padding: '20px 24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Machine Learning</div>
                                            <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>Midterm Examination</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '700', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span className="material-icons" style={{ fontSize: '14px' }}>schedule</span> Due: Oct 15, 2026
                                            </div>
                                        </div>
                                        <button className="auth-button" style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                            START TEST
                                        </button>
                                    </div>
                                    <div className="crisp-card animate-slide-up" style={{ animationDelay: '0.1s', padding: '20px 24px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Data Structures</div>
                                            <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>Trees & Graphs Quiz</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '700', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span className="material-icons" style={{ fontSize: '14px' }}>check_circle</span> Completed
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '900', color: 'var(--success)', fontSize: '1.5rem' }}>
                                            92%
                                        </div>
                                    </div>
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
                    </div></div>;