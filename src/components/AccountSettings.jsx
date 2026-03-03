import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';

export default function AccountSettings() {
    const { user, updateProfile } = useAuth();
    const { updateUser } = useData();
    const settings = useSettings();

    const [activeSection, setActiveSection] = useState('profile');

    // ─── Profile State ───────────────────────────────────
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [personalEmail, setPersonalEmail] = useState(user?.personalEmail || '');
    const [saveMsg, setSaveMsg] = useState('');

    // ─── Security State ──────────────────────────────────
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    const [otpStep, setOtpStep] = useState(null); // null | 'sent' | 'verified'
    const [otpCode, setOtpCode] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [tfaStep, setTfaStep] = useState(null); // null | 'enrolling' | 'verifying'
    const [tfaCode, setTfaCode] = useState('');
    const [generatedTfaCode, setGeneratedTfaCode] = useState('');

    // ─── Appearance State ────────────────────────────────
    const [customColorInput, setCustomColorInput] = useState(settings?.accentColor || '#4A70A9');
    const [showCustomColor, setShowCustomColor] = useState(false);

    // ─── Help State ──────────────────────────────────────
    const [bugSubject, setBugSubject] = useState('');
    const [bugDesc, setBugDesc] = useState('');
    const [bugMsg, setBugMsg] = useState('');

    const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#4A70A9', '#E85D4A', '#4CAF7D', '#F0A500', '#8FABD4'];
    const avatarColor = colors[(user?.name || '').length % colors.length];
    const praxiumEmail = user?.email || '';
    const maskedPhone = phone ? phone.replace(/(\d{2})(\d+)(\d{2})/, '$1****$3') : 'Not set';

    const [currentSessionLabel, setCurrentSessionLabel] = useState('Windows PC — Chrome');
    useEffect(() => {
        const ua = navigator.userAgent;
        let browser = 'Unknown Browser';
        if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';

        let os = 'Unknown OS';
        if (ua.includes('Windows')) os = 'Windows PC';
        else if (ua.includes('Mac OS')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

        setCurrentSessionLabel(`${os} — ${browser}`);
    }, []);

    // ─── Handlers ────────────────────────────────────────
    const handleSaveProfile = () => {
        const updates = { name, bio, phone, personalEmail };
        if (updateProfile) updateProfile(updates);
        if (updateUser && user?.id) updateUser(user.id, updates);
        setSaveMsg('✅ Profile saved successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
    };

    const generateOtp = () => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedOtp(code);
        setOtpStep('sent');
        setPwMsg(`📧 OTP sent to ${personalEmail || praxiumEmail}`);
    };

    const verifyOtpAndChangePassword = () => {
        if (otpCode !== generatedOtp) { setPwMsg('❌ Invalid OTP. Try again.'); return; }
        if (!currentPw) { setPwMsg('Enter current password'); return; }
        if (newPw.length < 6) { setPwMsg('New password must be at least 6 characters'); return; }
        if (newPw !== confirmPw) { setPwMsg('Passwords do not match'); return; }
        setOtpStep('verified');
        setPwMsg('✅ Password updated successfully!');
        setCurrentPw(''); setNewPw(''); setConfirmPw(''); setOtpCode('');
        setTimeout(() => { setOtpStep(null); setPwMsg(''); }, 3000);
    };

    const startTfaEnrollment = () => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedTfaCode(code);
        setTfaStep('enrolling');
    };

    const verifyTfa = () => {
        if (tfaCode !== generatedTfaCode) { return; }
        settings.setTwoFactorEnabled(true);
        setTfaStep(null);
        setTfaCode('');
    };

    const disableTfa = () => {
        settings.setTwoFactorEnabled(false);
    };

    const handleBugReport = () => {
        if (!bugSubject || !bugDesc) { setBugMsg('Please fill in all fields.'); return; }
        setBugMsg('✅ Bug report submitted. Thank you!');
        setBugSubject(''); setBugDesc('');
        setTimeout(() => setBugMsg(''), 3000);
    };

    const exportUserData = () => {
        const data = {
            profile: { name: user?.name, email: praxiumEmail, personalEmail, phone, bio, role: user?.role, id: user?.id },
            settings: { language: settings?.language, fontSize: settings?.fontSize, accentColor: settings?.accentColor, compactMode: settings?.compactMode, darkMode: settings?.darkMode },
            notifications: settings?.notificationPrefs,
            privacy: settings?.privacyPrefs,
            assessmentHistory: JSON.parse(localStorage.getItem('assessment_history') || '[]'),
            placementHistory: JSON.parse(localStorage.getItem('placement_test_history') || '[]'),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `praxium_data_${user?.id || 'user'}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    // ─── Shared Components ───────────────────────────────
    const sections = [
        { id: 'profile', icon: 'person', label: 'Profile' },
        { id: 'appearance', icon: 'palette', label: 'Appearance' },
        { id: 'security', icon: 'lock', label: 'Security' },
        { id: 'notifications', icon: 'notifications', label: 'Notifications' },
        { id: 'language', icon: 'translate', label: 'Language' },
        { id: 'privacy', icon: 'shield', label: 'Data & Privacy' },
        { id: 'help', icon: 'help_outline', label: 'Help & Support' },
        { id: 'about', icon: 'info', label: 'About Praxium' },
    ];

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid rgba(0,0,0,0.08)',
        background: 'var(--bg-app)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)',
        outline: 'none', transition: 'border 0.2s ease', boxSizing: 'border-box'
    };
    const labelStyle = { fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.05em', display: 'block', marginBottom: 6 };

    const Toggle = ({ checked, onChange }) => (
        <div onClick={onChange} style={{
            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
            background: checked ? 'var(--primary)' : 'rgba(0,0,0,0.12)',
            position: 'relative', transition: 'all 0.2s ease', flexShrink: 0
        }}>
            <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3, left: checked ? 23 : 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'all 0.2s ease'
            }} />
        </div>
    );

    const SettingRow = ({ icon, title, desc, children, noBorder }) => (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 0', borderBottom: noBorder ? 'none' : '1px solid rgba(0,0,0,0.05)', gap: 16
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>{icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{title}</div>
                    {desc && <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{desc}</div>}
                </div>
            </div>
            <div style={{ flexShrink: 0 }}>{children}</div>
        </div>
    );

    const Toast = ({ msg }) => msg ? (
        <div style={{
            position: 'fixed', bottom: 24, right: 24, padding: '14px 24px', borderRadius: 12,
            background: msg.includes('✅') ? 'var(--success)' : msg.includes('❌') ? 'var(--error)' : 'var(--primary)',
            color: 'white', fontWeight: 700, fontSize: '0.85rem', zIndex: 9999,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease'
        }}>{msg}</div>
    ) : null;

    return (
        <div style={{ padding: '0 28px' }}>
            <Toast msg={saveMsg || pwMsg || bugMsg} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: '0 0 24px' }}>Manage your account, preferences, and privacy.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>
                {/* ─── Sidebar ─── */}
                <div style={{
                    background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)',
                    padding: '8px', position: 'sticky', top: 20
                }}>
                    {sections.map((s, i) => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '10px 14px', borderRadius: 10, border: 'none',
                            background: activeSection === s.id ? 'var(--primary)' : 'transparent',
                            color: activeSection === s.id ? 'white' : 'var(--text-main)',
                            cursor: 'pointer', fontWeight: activeSection === s.id ? 700 : 500,
                            fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.15s ease',
                            marginBottom: (i === 3 || i === 5) ? 6 : 1
                        }}>
                            <span className="material-icons" style={{ fontSize: 18 }}>{s.icon}</span>{s.label}
                        </button>
                    ))}
                </div>

                {/* ─── Content ─── */}
                <div style={{ minWidth: 0 }}>

                    {/* ════════════════ PROFILE ════════════════ */}
                    {activeSection === 'profile' && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 20px' }}>Profile</h2>
                            {/* Avatar Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: 18, background: avatarColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 900, fontSize: '1.6rem', flexShrink: 0
                                }}>{initials}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user?.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{praxiumEmail}</div>
                                    <div style={{ display: 'inline-flex', gap: 6, marginTop: 6 }}>
                                        <span style={{ padding: '2px 10px', borderRadius: 6, background: 'rgba(74,112,169,0.1)', color: 'var(--primary)', fontSize: '0.68rem', fontWeight: 800 }}>
                                            {(user?.role || 'student').toUpperCase()}
                                        </span>
                                        {user?.id && <span style={{ padding: '2px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.04)', color: 'var(--text-dim)', fontSize: '0.68rem', fontWeight: 700 }}>
                                            ID: {user.id}
                                        </span>}
                                    </div>
                                </div>
                                <button style={{
                                    padding: '8px 16px', borderRadius: 10, border: '2px solid rgba(0,0,0,0.06)',
                                    background: 'white', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <span className="material-icons" style={{ fontSize: 16 }}>photo_camera</span> Change Photo
                                </button>
                            </div>
                            {/* Fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={labelStyle}>FULL NAME</label>
                                    <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>PHONE</label>
                                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>PRAXIUM EMAIL <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>(Read-only)</span></label>
                                    <input value={praxiumEmail} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>PERSONAL EMAIL <span style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 600 }}>(Editable)</span></label>
                                    <input value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <label style={labelStyle}>BIO</label>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..."
                                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button onClick={handleSaveProfile} style={{
                                    padding: '10px 28px', borderRadius: 10, background: 'var(--primary)', color: 'white',
                                    border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(74,112,169,0.25)', transition: 'all 0.2s ease'
                                }}>
                                    <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>save</span>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════════════════ APPEARANCE ════════════════ */}
                    {activeSection === 'appearance' && settings && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 20px' }}>Appearance</h2>
                            {/* Theme */}
                            <SettingRow icon={settings.darkMode ? 'dark_mode' : 'light_mode'} title="Theme" desc={`Currently: ${settings.darkMode ? 'Dark' : 'Light'} mode`}>
                                <button onClick={settings.toggleDarkMode} style={{
                                    padding: '8px 20px', borderRadius: 20, border: '2px solid var(--primary)',
                                    background: settings.darkMode ? 'var(--primary)' : 'white', color: settings.darkMode ? 'white' : 'var(--primary)',
                                    fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s ease'
                                }}>{settings.darkMode ? '☀ Light' : '🌙 Dark'}</button>
                            </SettingRow>
                            {/* Font Size */}
                            <SettingRow icon="format_size" title="Font Size" desc={`Currently: ${settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1)}`}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {['small', 'medium', 'large'].map(s => (
                                        <button key={s} onClick={() => settings.setFontSize(s)} style={{
                                            padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                                            border: settings.fontSize === s ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.08)',
                                            background: settings.fontSize === s ? 'var(--primary)' : 'white',
                                            color: settings.fontSize === s ? 'white' : 'var(--text-dim)',
                                            fontWeight: 700, fontSize: s === 'small' ? '0.68rem' : s === 'large' ? '0.88rem' : '0.78rem',
                                            transition: 'all 0.15s ease'
                                        }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                                    ))}
                                </div>
                            </SettingRow>
                            {/* Accent Color */}
                            <SettingRow icon="palette" title="Accent Color" desc="Customize app theme color">
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    {['#4A70A9', '#E85D4A', '#4CAF7D', '#F0A500', '#9B59B6'].map(c => (
                                        <div key={c} onClick={() => { settings.setAccentColor(c); setCustomColorInput(c); }} style={{
                                            width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer',
                                            border: settings.accentColor === c ? '3px solid var(--text-main)' : '2px solid transparent',
                                            transition: 'all 0.15s ease', transform: settings.accentColor === c ? 'scale(1.15)' : 'scale(1)'
                                        }} />
                                    ))}
                                    <div onClick={() => setShowCustomColor(!showCustomColor)} style={{
                                        width: 28, height: 28, borderRadius: 8, cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(0,0,0,0.15)',
                                        background: showCustomColor ? 'var(--bg-app)' : 'white'
                                    }}>
                                        <span className="material-icons" style={{ fontSize: 14, color: 'var(--text-dim)' }}>add</span>
                                    </div>
                                </div>
                            </SettingRow>
                            {/* Custom Color Picker */}
                            {showCustomColor && (
                                <div style={{ padding: '12px 0 16px', display: 'flex', alignItems: 'center', gap: 12, marginLeft: 48, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <input type="color" value={customColorInput} onChange={e => setCustomColorInput(e.target.value)}
                                        style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                                    <input value={customColorInput} onChange={e => setCustomColorInput(e.target.value)}
                                        style={{ ...inputStyle, width: 120, padding: '8px 12px', fontSize: '0.78rem', fontFamily: 'monospace' }} />
                                    <button onClick={() => settings.setAccentColor(customColorInput)} style={{
                                        padding: '8px 16px', borderRadius: 8, border: 'none', background: customColorInput,
                                        color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
                                    }}>Apply</button>
                                </div>
                            )}
                            {/* Compact Mode */}
                            <SettingRow icon="dashboard" title="Compact Mode" desc="Reduce spacing and card sizes" noBorder>
                                <Toggle checked={settings.compactMode} onChange={() => settings.setCompactMode(!settings.compactMode)} />
                            </SettingRow>
                        </div>
                    )}

                    {/* ════════════════ SECURITY ════════════════ */}
                    {activeSection === 'security' && settings && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 20px' }}>Security</h2>
                            {/* Password Change with OTP */}
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>password</span> Change Password
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 500 }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>CURRENT PASSWORD</label>
                                    <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>NEW PASSWORD</label>
                                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>CONFIRM PASSWORD</label>
                                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} />
                                </div>
                            </div>
                            {otpStep === null && (
                                <button onClick={generateOtp} disabled={!currentPw || !newPw || !confirmPw} style={{
                                    marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none',
                                    background: (!currentPw || !newPw || !confirmPw) ? 'rgba(0,0,0,0.08)' : 'var(--primary)',
                                    color: (!currentPw || !newPw || !confirmPw) ? 'var(--text-dim)' : 'white',
                                    fontWeight: 800, fontSize: '0.82rem', cursor: (!currentPw || !newPw || !confirmPw) ? 'not-allowed' : 'pointer',
                                }}>
                                    <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>email</span>
                                    Send OTP to Email
                                </button>
                            )}
                            {otpStep === 'sent' && (
                                <div style={{ marginTop: 16, padding: 20, background: 'rgba(74,112,169,0.04)', borderRadius: 14, border: '1px solid rgba(74,112,169,0.1)' }}>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className="material-icons" style={{ fontSize: 16 }}>verified</span> OTP sent to {personalEmail || praxiumEmail}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <input value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="Enter 6-digit OTP"
                                            maxLength={6} style={{ ...inputStyle, width: 180, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 900, fontSize: '1.1rem' }} />
                                        <button onClick={verifyOtpAndChangePassword} style={{
                                            padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--success)',
                                            color: 'white', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                                        }}>Verify & Update</button>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '28px 0' }} />

                            {/* 2FA */}
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="material-icons" style={{ fontSize: 18, color: settings.twoFactorEnabled ? 'var(--success)' : 'var(--text-dim)' }}>fingerprint</span>
                                Two-Factor Authentication
                                {settings.twoFactorEnabled && <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(76,175,125,0.1)', color: 'var(--success)', fontSize: '0.65rem', fontWeight: 800 }}>ENABLED</span>}
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0 0 12px' }}>
                                {settings.twoFactorEnabled
                                    ? 'Two-factor authentication is active. Codes are sent to your personal email on each login.'
                                    : 'Add extra security by requiring a verification code sent to your personal email.'}
                            </p>
                            {!settings.twoFactorEnabled && tfaStep === null && (
                                <button onClick={startTfaEnrollment} style={{
                                    padding: '10px 24px', borderRadius: 10, border: '1px solid var(--primary)',
                                    background: 'white', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                                }}>Enable 2FA</button>
                            )}
                            {tfaStep === 'enrolling' && (
                                <div style={{ padding: 20, background: 'rgba(74,112,169,0.04)', borderRadius: 14, border: '1px solid rgba(74,112,169,0.1)' }}>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>Verification code sent to:</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 12 }}>📧 Email: {personalEmail || praxiumEmail}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 8 }}>
                                        <strong>Demo code:</strong> {generatedTfaCode}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <input value={tfaCode} onChange={e => setTfaCode(e.target.value)} placeholder="Enter code" maxLength={6}
                                            style={{ ...inputStyle, width: 160, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 900 }} />
                                        <button onClick={verifyTfa} style={{
                                            padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--success)',
                                            color: 'white', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
                                        }}>Verify & Enable</button>
                                        <button onClick={() => setTfaStep(null)} style={{
                                            padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)',
                                            background: 'white', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                                        }}>Cancel</button>
                                    </div>
                                </div>
                            )}
                            {settings.twoFactorEnabled && (
                                <button onClick={disableTfa} style={{
                                    padding: '8px 20px', borderRadius: 8, border: '1px solid var(--error)',
                                    background: 'white', color: 'var(--error)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer'
                                }}>Disable 2FA</button>
                            )}

                            {/* Divider */}
                            <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '28px 0' }} />

                            {/* Active Sessions */}
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>devices</span> Active Sessions
                            </h3>
                            {[
                                { device: currentSessionLabel, location: 'Current Session', isCurrent: true },
                                { device: 'iPhone 14 — Safari', location: 'Last active 2 hours ago', isCurrent: false },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: s.isCurrent ? 'rgba(74,112,169,0.04)' : 'var(--bg-app)', borderRadius: 10, marginBottom: 6, border: s.isCurrent ? '1px solid rgba(74,112,169,0.1)' : '1px solid transparent' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="material-icons" style={{ fontSize: 20, color: s.isCurrent ? 'var(--primary)' : 'var(--text-dim)' }}>{s.device.includes('Windows') || s.device.includes('macOS') || s.device.includes('Linux') ? 'computer' : 'phone_iphone'}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{s.device}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{s.location}</div>
                                        </div>
                                    </div>
                                    {s.isCurrent
                                        ? <span style={{ padding: '2px 10px', borderRadius: 6, background: 'rgba(76,175,125,0.1)', color: 'var(--success)', fontSize: '0.65rem', fontWeight: 800 }}>ACTIVE</span>
                                        : <button style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--error)', background: 'white', color: 'var(--error)', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>Revoke</button>
                                    }
                                </div>
                            ))}

                            {/* Danger Zone */}
                            <div style={{ marginTop: 28, padding: 20, borderRadius: 12, border: '2px solid rgba(232,93,74,0.2)', background: 'rgba(232,93,74,0.03)' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--error)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="material-icons" style={{ fontSize: 18 }}>warning</span> Danger Zone
                                </h3>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0 0 12px' }}>Permanently delete your account and all data. This action cannot be undone.</p>
                                <button style={{
                                    padding: '8px 20px', borderRadius: 8, border: '1px solid var(--error)',
                                    background: 'white', color: 'var(--error)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer'
                                }}>Delete Account</button>
                            </div>
                        </div>
                    )}

                    {/* ════════════════ NOTIFICATIONS ════════════════ */}
                    {activeSection === 'notifications' && settings && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px' }}>Notifications</h2>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0 0 20px' }}>Choose what you want to be notified about and how.</p>

                            {/* Channels */}
                            <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-app)', borderRadius: 14 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: 12 }}>NOTIFICATION CHANNELS</div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <span className="material-icons" style={{ fontSize: 20, color: 'var(--primary)' }}>email</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Email</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{personalEmail || praxiumEmail}</div>
                                        </div>
                                        <Toggle checked={settings.notificationPrefs.emailEnabled} onChange={() => settings.updateNotificationPref('emailEnabled', !settings.notificationPrefs.emailEnabled)} />
                                    </div>
                                    <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <span className="material-icons" style={{ fontSize: 20, color: 'var(--success)' }}>sms</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>SMS</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{maskedPhone}</div>
                                        </div>
                                        <Toggle checked={settings.notificationPrefs.smsEnabled} onChange={() => settings.updateNotificationPref('smsEnabled', !settings.notificationPrefs.smsEnabled)} />
                                    </div>
                                </div>
                            </div>

                            {/* Notification Types */}
                            {[
                                { key: 'assessmentResults', icon: 'assignment', label: 'Assessment Results', desc: 'Get notified when test results are available' },
                                { key: 'courseUpdates', icon: 'school', label: 'Course Updates', desc: 'New modules and content updates' },
                                { key: 'placementAlerts', icon: 'work', label: 'Placement Alerts', desc: 'New company drives and deadlines' },
                                { key: 'aiSuggestions', icon: 'auto_awesome', label: 'AI Suggestions', desc: 'Personalized learning recommendations' },
                                { key: 'upcomingClasses', icon: 'event', label: 'Upcoming Classes', desc: 'Reminders for live sessions' },
                                { key: 'messages', icon: 'chat', label: 'Messages', desc: 'New messages from teachers' },
                            ].map((n, i) => (
                                <SettingRow key={n.key} icon={n.icon} title={n.label} desc={n.desc} noBorder={i === 5}>
                                    <Toggle checked={settings.notificationPrefs[n.key]} onChange={() => settings.updateNotificationPref(n.key, !settings.notificationPrefs[n.key])} />
                                </SettingRow>
                            ))}
                        </div>
                    )}

                    {/* ════════════════ LANGUAGE ════════════════ */}
                    {activeSection === 'language' && settings && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px' }}>Language</h2>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0 0 20px' }}>Select your preferred language. The app interface will update accordingly.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                {[
                                    { code: 'english', label: 'English', flag: '🇺🇸', native: 'English' },
                                    { code: 'hindi', label: 'हिंदी', flag: '🇮🇳', native: 'Hindi' },
                                    { code: 'spanish', label: 'Español', flag: '🇪🇸', native: 'Spanish' },
                                    { code: 'french', label: 'Français', flag: '🇫🇷', native: 'French' },
                                    { code: 'german', label: 'Deutsch', flag: '🇩🇪', native: 'German' },
                                    { code: 'japanese', label: '日本語', flag: '🇯🇵', native: 'Japanese' },
                                ].map(l => (
                                    <button key={l.code} onClick={() => settings.setLanguage(l.code)} style={{
                                        padding: '16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                                        border: settings.language === l.code ? '2px solid var(--primary)' : '2px solid rgba(0,0,0,0.06)',
                                        background: settings.language === l.code ? 'rgba(74,112,169,0.06)' : 'white',
                                        fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.15s ease',
                                        color: settings.language === l.code ? 'var(--primary)' : 'var(--text-main)',
                                        display: 'flex', alignItems: 'center', gap: 10, position: 'relative'
                                    }}>
                                        <span style={{ fontSize: '1.4rem' }}>{l.flag}</span>
                                        <div>
                                            <div style={{ fontWeight: 800 }}>{l.label}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 500 }}>{l.native}</div>
                                        </div>
                                        {settings.language === l.code && (
                                            <span className="material-icons" style={{ position: 'absolute', top: 8, right: 8, fontSize: 18, color: 'var(--primary)' }}>check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {settings.language !== 'english' && (
                                <div style={{ marginTop: 20, padding: 16, background: 'rgba(74,112,169,0.04)', borderRadius: 12, border: '1px solid rgba(74,112,169,0.1)' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 8 }}>PREVIEW</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                        {settings.t('dashboard')} • {settings.t('courses')} • {settings.t('assessments')} • {settings.t('settings')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════ DATA & PRIVACY ════════════════ */}
                    {activeSection === 'privacy' && settings && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px' }}>Data & Privacy</h2>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0 0 20px' }}>Manage how your data is used and shared.</p>
                            <SettingRow icon="visibility" title="Profile Visibility" desc="Allow other students and teachers to see your profile">
                                <Toggle checked={settings.privacyPrefs.profileVisible} onChange={() => settings.updatePrivacyPref('profileVisible', !settings.privacyPrefs.profileVisible)} />
                            </SettingRow>
                            <SettingRow icon="leaderboard" title="Show on Leaderboard" desc="Appear on the placement leaderboard rankings">
                                <Toggle checked={settings.privacyPrefs.showOnLeaderboard} onChange={() => settings.updatePrivacyPref('showOnLeaderboard', !settings.privacyPrefs.showOnLeaderboard)} />
                            </SettingRow>
                            <SettingRow icon="analytics" title="Usage Analytics" desc="Send anonymous usage data to improve Praxium" noBorder>
                                <Toggle checked={settings.privacyPrefs.usageAnalytics} onChange={() => settings.updatePrivacyPref('usageAnalytics', !settings.privacyPrefs.usageAnalytics)} />
                            </SettingRow>
                            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                                <button onClick={exportUserData} style={{
                                    padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)',
                                    background: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                    color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8
                                }}>
                                    <span className="material-icons" style={{ fontSize: 18 }}>download</span> Download My Data
                                </button>
                                <button onClick={() => {
                                    localStorage.removeItem('assessment_history');
                                    localStorage.removeItem('placement_test_history');
                                    alert('Test history cleared.');
                                }} style={{
                                    padding: '10px 20px', borderRadius: 10, border: '1px solid var(--error)',
                                    background: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                    color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 8
                                }}>
                                    <span className="material-icons" style={{ fontSize: 18 }}>delete_sweep</span> Clear Test History
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════════════════ HELP & SUPPORT ════════════════ */}
                    {activeSection === 'help' && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px' }}>Help & Support</h2>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0 0 20px' }}>Get help, report issues, or reach out to us.</p>
                            {/* Quick Links */}
                            {[
                                { icon: 'menu_book', title: 'Documentation', desc: 'Browse guides and tutorials', action: () => window.open('https://praxium.in/docs', '_blank'), btn: 'Open' },
                                { icon: 'forum', title: 'Community Forum', desc: 'Ask questions, share tips', action: () => window.open('https://praxium.in/community', '_blank'), btn: 'Visit' },
                                { icon: 'email', title: 'Contact Support', desc: 'support@praxium.ai', action: () => window.open('mailto:support@praxium.ai'), btn: 'Email' },
                            ].map((h, i) => (
                                <SettingRow key={i} icon={h.icon} title={h.title} desc={h.desc}>
                                    <button onClick={h.action} style={{
                                        padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)',
                                        background: 'white', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
                                    }}>{h.btn}</button>
                                </SettingRow>
                            ))}

                            {/* Bug Report */}
                            <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-app)', borderRadius: 14 }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="material-icons" style={{ fontSize: 18, color: 'var(--warning)' }}>bug_report</span> Report a Bug
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <label style={labelStyle}>SUBJECT</label>
                                        <input value={bugSubject} onChange={e => setBugSubject(e.target.value)} placeholder="What went wrong?" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>DESCRIPTION</label>
                                        <textarea value={bugDesc} onChange={e => setBugDesc(e.target.value)} rows={3} placeholder="Steps to reproduce the issue..."
                                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                                    </div>
                                    <button onClick={handleBugReport} style={{
                                        padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--primary)',
                                        color: 'white', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', alignSelf: 'flex-start',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        <span className="material-icons" style={{ fontSize: 16 }}>send</span> Submit Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════ ABOUT ════════════════ */}
                    {activeSection === 'about' && (
                        <div className="crisp-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 20px' }}>About Praxium</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 20, background: 'var(--bg-app)', borderRadius: 14 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 28, color: 'white' }}>school</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>Praxium</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Version 2.0.0 • Build 2026.02</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>© 2026 Praxium Education Technologies</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.7, margin: '0 0 20px' }}>
                                Praxium is an AI-powered education platform designed to bridge the gap between academic learning and industry readiness.
                                Built with adaptive assessments, intelligent tutoring, and placement preparation tools.
                            </p>
                            {[
                                { label: 'Terms of Service', icon: 'description' },
                                { label: 'Privacy Policy', icon: 'policy' },
                                { label: 'Open Source Licenses', icon: 'code' },
                                { label: 'Release Notes', icon: 'new_releases' },
                            ].map((l, i) => (
                                <div key={i} onClick={() => alert(`${l.label} — Coming soon.`)} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.05)' : 'none', cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="material-icons" style={{ fontSize: 18, color: 'var(--text-dim)' }}>{l.icon}</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{l.label}</span>
                                    </div>
                                    <span className="material-icons" style={{ fontSize: 16, color: 'var(--text-dim)' }}>chevron_right</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
