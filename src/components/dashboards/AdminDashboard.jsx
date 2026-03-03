import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import AccountSettings from '../AccountSettings';
import AILoadingScreen from '../common/AILoadingScreen';
import { generateCourseSyllabus } from '../../services/aiService';
import AIChatView from '../common/AIChatView';

// --- Helper Components ---

const DetailModal = ({ title, onClose, children }) => (
    <div className="fade-in" style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(17, 24, 39, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
        <div className="crisp-card animate-slide-up" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '32px' }}>
                <h2 style={{ margin: 0 }}>{title}</h2>
                <button onClick={onClose} style={{ background: 'var(--bg-blueprint)', color: 'var(--text-main)', border: '1px solid var(--border)', width: '40px', height: '40px', padding: 0 }}>
                    <span className="material-icons">close</span>
                </button>
            </div>
            {children}
        </div>
    </div>
);

const UserProfileView = ({ user, onClose }) => {
    const { updateUser, enrollments, courses, courseAssignments } = useData();
    const [permissions, setPermissions] = useState(user.permissions || 'standard');
    const [isEditing, setIsEditing] = useState(false);

    const handleSavePermissions = () => {
        updateUser(user.id, { permissions });
        setIsEditing(false);
    };

    const getAdditionalInfo = () => {
        if (user.role === 'student') {
            const studentEnrollments = enrollments.filter(e => e.studentId === user.id);
            const studentCourses = courses.filter(c => studentEnrollments.some(e => e.courseId === c.id));
            const completed = user.completedCourses || [];
            return (
                <div style={{ marginTop: '32px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Academic History</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div className="crisp-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-blueprint)' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{studentCourses.length}</div>
                            <div style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Courses</div>
                        </div>
                        <div className="crisp-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-blueprint)' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent)' }}>{completed.length}</div>
                            <div style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Completed</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {studentCourses.map(c => (
                            <div key={c.id} style={{
                                padding: '12px 16px',
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontWeight: '600' }}>{c.title}</span>
                                <span style={{
                                    fontSize: '0.625rem',
                                    fontWeight: '800',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: completed.includes(c.id) ? '#dcfce7' : '#fef3c7',
                                    color: completed.includes(c.id) ? '#166534' : '#92400e'
                                }}>
                                    {completed.includes(c.id) ? 'GRADUATED' : 'IN_PROGRESS'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (user.role === 'teacher') {
            const teacherAssignments = courseAssignments.filter(ca => ca.teacherId === user.id);
            const teachingCourses = courses.filter(c => teacherAssignments.some(ca => ca.courseId === c.id));
            return (
                <div style={{ marginTop: '32px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Teaching Assignment</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {teachingCourses.map(c => (
                            <div key={c.id} style={{
                                padding: '12px 16px',
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '18px' }}>school</span>
                                <span style={{ fontWeight: '600' }}>{c.title}</span>
                            </div>
                        ))}
                        {teachingCourses.length === 0 && <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '24px', border: '1px dashed var(--border)' }}>No assignments.</div>}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <DetailModal title="Identity Record" onClose={onClose}>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
                <div>
                    <div className="crisp-card" style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-blueprint)' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'white',
                            borderRadius: '50%',
                            margin: '0 auto 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            border: '4px solid white',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            {user.photo ? <img src={user.photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{user.name.charAt(0)}</span>}
                        </div>
                        <h3 style={{ marginBottom: '4px' }}>{user.name}</h3>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: 'var(--accent)',
                            background: '#d1fae5',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            display: 'inline-block'
                        }}>{user.role.toUpperCase()}</div>

                        <div style={{ marginTop: '32px', textAlign: 'left', fontSize: '0.8125rem' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.625rem', textTransform: 'uppercase' }}>Internal ID</div>
                                <div style={{ fontWeight: '600' }}>{user.id}</div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.625rem', textTransform: 'uppercase' }}>Email Coord</div>
                                <div style={{ fontWeight: '600' }}>{user.email}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {(user.role === 'teacher' || user.role === 'admin') && (
                        <div className="crisp-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '0.875rem' }}>Clearance Level</h4>
                                <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', padding: 0, textDecoration: 'underline', color: 'var(--primary)', fontSize: '0.75rem' }}>
                                    {isEditing ? 'CANCEL' : 'CHANGE'}
                                </button>
                            </div>

                            {!isEditing ? (
                                <div style={{ fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.05em' }}>{permissions.toUpperCase()}</div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={permissions}
                                        onChange={e => setPermissions(e.target.value)}
                                        style={{ padding: '8px', flex: 1 }}
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="full_access">Full Access</option>
                                    </select>
                                    <button onClick={handleSavePermissions} style={{ background: 'var(--accent)', color: 'white' }}>SAVE</button>
                                </div>
                            )}
                        </div>
                    )}
                    {getAdditionalInfo()}
                </div>
            </div>
        </DetailModal>
    );
};

// --- Sub-Components (Views) ---

const DashboardView = () => {
    const { users, courses } = useData();
    const activeUsers = users.length;
    const studentCount = users.filter(u => u.role === 'student').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;

    const maxVal = Math.max(studentCount, teacherCount, courses.length, 10);
    const getHeight = (val) => `${(val / maxVal) * 100}% `;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1>Operations Hub</h1>
                    <p>Real-time system diagnostics and population statistics.</p>
                </div>
                <button className="secondary-btn">Download Report</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="dash-card">
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Active Participants</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{activeUsers}</div>
                    <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '600' }}>↑ 12% from last cycle</div>
                </div>
                <div className="dash-card">
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Validated Curriculums</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{courses.length}</div>
                    <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-dim)' }}>Operational modules</div>
                </div>
                <div className="dash-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>System Stability</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>99.9%</div>
                    <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '600' }}>Datalink active</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                <div className="crisp-card">
                    <h3 style={{ marginBottom: '32px' }}>Population Segment Analysis</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '260px', gap: '48px', paddingBottom: '20px', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.4, pointerEvents: 'none' }}>
                            {[1, 2, 3, 4].map(i => <div key={i} style={{ borderTop: '1px dashed var(--border)', width: '100%' }}></div>)}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                            <div style={{ width: '100%', background: 'var(--primary)', height: getHeight(studentCount), borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ fontWeight: '700', fontSize: '0.75rem' }}>STUDENTS</div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                            <div style={{ width: '100%', background: 'var(--secondary)', height: getHeight(teacherCount), borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ fontWeight: '700', fontSize: '0.75rem' }}>FACULTY</div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                            <div style={{ width: '100%', background: 'var(--accent)', height: '15%', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ fontWeight: '700', fontSize: '0.75rem' }}>ADMINS</div>
                        </div>
                    </div>
                </div>

                <div className="crisp-card">
                    <h3 style={{ marginBottom: '32px' }}>Resource Load</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-blueprint)" strokeWidth="10" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset="56.5" />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>80%</div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: '700' }}>OPTIMIZED</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div> Active
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--bg-blueprint)' }}></div> Latent
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserListView = () => {
    const { users, deleteUser, openModal } = useData();
    const [filter, setFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);

    const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

    const handleDelete = (id, e) => {
        e.stopPropagation();
        openModal({
            title: "Permanent Removal",
            message: "Verify execution of permanent record deletion? This cannot be reversed.",
            type: 'confirm',
            onConfirm: () => deleteUser(id)
        });
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Participant Directory</h1>
                    <p>Total managed entities across all sectors.</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-blueprint)', padding: '4px', borderRadius: '8px' }}>
                    {['all', 'student', 'teacher', 'admin'].map(role => (
                        <button
                            key={role}
                            onClick={() => setFilter(role)}
                            style={{
                                padding: '8px 16px',
                                background: filter === role ? 'white' : 'transparent',
                                border: '1px solid',
                                borderColor: filter === role ? 'var(--border)' : 'transparent',
                                color: filter === role ? 'var(--primary)' : 'var(--text-dim)',
                                boxShadow: filter === role ? 'var(--shadow-sm)' : 'none',
                                fontSize: '0.75rem'
                            }}
                        >
                            {role === 'all' ? 'All Entities' : role.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="crisp-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-blueprint)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-dim)' }}>INTERNAL ID</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-dim)' }}>SECTOR</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-dim)' }}>FULL NAME</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-dim)' }}>EMAIL COORD</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-dim)', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                style={{
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <td style={{ padding: '16px 24px', fontWeight: '600' }}>{u.id}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        background: u.role === 'admin' ? '#fee2e2' : u.role === 'teacher' ? '#e0e7ff' : '#f1f3f5',
                                        color: u.role === 'admin' ? '#991b1b' : u.role === 'teacher' ? '#3730a3' : '#4b5563',
                                        padding: '4px 10px', fontSize: '0.625rem', fontWeight: '800', borderRadius: '4px'
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: '600' }}>{u.name}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>{u.email}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <button
                                        onClick={(e) => handleDelete(u.id, e)}
                                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', fontSize: '0.625rem' }}
                                    >PURGE</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <UserProfileView user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    );
};

const AddUserView = ({ onComplete }) => {
    const { addUser, courses } = useData();
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student', permissions: 'standard', phone: '' });
    const [selectedCourse, setSelectedCourse] = useState('');
    const [createdId, setCreatedId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const createdUser = addUser(newUser, selectedCourse);
        setCreatedId(createdUser.id);
        setNewUser({ name: '', email: '', password: '', role: 'student', permissions: 'standard', phone: '' });
        setSelectedCourse('');
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h1>Register Participant</h1>
                <p>Onboard new system users and map initial access parameters.</p>
            </div>

            {createdId && (
                <div className="crisp-card" style={{ background: '#dcfce7', border: '1px solid #166534', padding: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="material-icons" style={{ color: '#166534' }}>task_alt</span>
                    <div>
                        <div style={{ color: '#14532d', fontWeight: '800', fontSize: '0.875rem' }}>SUCCESSFULLY ARCHIVED</div>
                        <div style={{ color: '#166534', fontWeight: '700', fontSize: '0.75rem' }}>ACCESS_ID: {createdId}</div>
                    </div>
                </div>
            )}

            <div className="crisp-card" style={{ maxWidth: '800px', padding: '32px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Operational Domain</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['student', 'teacher', 'admin'].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setNewUser({ ...newUser, role: r })}
                                    className={newUser.role === r ? 'primary-btn' : 'secondary-btn'}
                                    style={{ flex: 1, textTransform: 'uppercase' }}
                                >{r}</button>
                            ))}
                        </div>
                    </div>

                    {(newUser.role === 'teacher' || newUser.role === 'admin') && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>CLEARANCE ACCESS</label>
                            <select
                                value={newUser.permissions}
                                onChange={e => setNewUser({ ...newUser, permissions: e.target.value })}
                            >
                                <option value="standard">STANDARD</option>
                                <option value="moderator">MODERATOR</option>
                                <option value="full_access">FULL_ROOT</option>
                            </select>
                        </div>
                    )}

                    {newUser.role === 'student' && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>INITIAL COURSE ASSIGNMENT</label>
                            <select
                                value={selectedCourse}
                                onChange={e => setSelectedCourse(e.target.value)}
                            >
                                <option value="">SELECT MODULE...</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label>LEGAL IDENTITY</label>
                        <input required placeholder="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                    </div>
                    <div>
                        <label>CONTACT PHONE</label>
                        <input placeholder="+1 (555) 000-0000" type="tel" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                    </div>
                    <div>
                        <label>EMAIL COORD</label>
                        <input required placeholder="email@nexus.com" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                    </div>
                    <div>
                        <label>ACCESS CIPHER</label>
                        <input required placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <button type="submit" className="primary-btn" style={{ width: '100%', padding: '16px' }}>INITIALIZE ACCESS</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddBookView = () => {
    const { addBook, courses, books, courseBooks, enrollments, users, openModal } = useData();
    const [viewMode, setViewMode] = useState('add');
    const [book, setBook] = useState({ title: '', author: '', category: 'Computer Science', file: null });
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBookDetail, setSelectedBookDetail] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookData = {
            title: book.title,
            author: book.author,
            category: book.category,
            fileName: book.file ? book.file.name : null
        };
        addBook(bookData, selectedCourse);
        setBook({ title: '', author: '', category: 'Computer Science', file: null });
        setSelectedCourse('');
        openModal({
            title: "Archive Successful",
            message: "The knowledge asset has been successfully indexed in the core library.",
            type: 'info'
        });
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Library Operations</h1>
                    <p>Index and manage the collective knowledge repository.</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-blueprint)', padding: '4px', borderRadius: '8px' }}>
                    <button onClick={() => setViewMode('add')} className={viewMode === 'add' ? 'primary-btn' : 'secondary-btn'} style={{ fontSize: '0.75rem' }}>ADD ASSET</button>
                    <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'primary-btn' : 'secondary-btn'} style={{ fontSize: '0.75rem' }}>CATALOGUE</button>
                </div>
            </div>

            {viewMode === 'add' ? (
                <div className="crisp-card animate-slide-up" style={{ maxWidth: '800px', padding: '32px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Designation</label>
                            <input required placeholder="Title" value={book.title} onChange={e => setBook({ ...book, title: e.target.value })} />
                        </div>
                        <div>
                            <label>Originator</label>
                            <input required placeholder="Author" value={book.author} onChange={e => setBook({ ...book, author: e.target.value })} />
                        </div>
                        <div>
                            <label>Category</label>
                            <select value={book.category} onChange={e => setBook({ ...book, category: e.target.value })}>
                                <option>Computer Science</option>
                                <option>Mathematics</option>
                                <option>Physics</option>
                                <option>Literature</option>
                                <option>Art</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Linked Module (Optional)</label>
                            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                                <option value="">SELECT TARGET...</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Data Content</label>
                            <div style={{
                                border: '1px solid var(--border)',
                                padding: '24px',
                                borderRadius: '4px',
                                textAlign: 'center',
                                background: 'var(--bg-blueprint)'
                            }}>
                                <input type="file" id="book-upload" onChange={e => setBook({ ...book, file: e.target.files[0] })} style={{ display: 'none' }} required />
                                <label htmlFor="book-upload" style={{ cursor: 'pointer' }}>
                                    <span className="material-icons" style={{ fontSize: '32px', color: 'var(--primary)' }}>cloud_upload</span>
                                    <div style={{ fontWeight: '700', marginTop: '8px' }}>{book.file ? book.file.name : 'CLICK TO UPLOAD'}</div>
                                </label>
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" className="primary-btn" style={{ width: '100%', padding: '16px' }}>COMMIT TO LIBRARY</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {books.map((b) => (
                        <div key={b.id} onClick={() => setSelectedBookDetail(b)} className="crisp-card hover-scale" style={{ cursor: 'pointer', padding: '24px' }}>
                            <div style={{ background: 'var(--bg-blueprint)', padding: '24px', borderRadius: '4px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ fontSize: '48px', color: 'var(--primary)' }}>menu_book</span>
                            </div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{b.title}</h4>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>{b.author.toUpperCase()}</div>
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '0.625rem', color: 'var(--accent)', fontWeight: '800' }}>
                                {b.category.toUpperCase()}
                            </div>
                        </div>
                    ))}
                    {books.length === 0 && <div className="crisp-card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', border: '1px dashed var(--border)' }}>Library is empty.</div>}
                </div>
            )}

            {selectedBookDetail && (
                <DetailModal title={selectedBookDetail.title} onClose={() => setSelectedBookDetail(null)}>
                    <div className="fade-in">
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Indexing Summary</h3>
                        <div style={{ marginBottom: '24px' }}>
                            <label>Authorized Access</label>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Full record access enabled for faculty and related students.</div>
                        </div>
                        <button className="primary-btn" style={{ width: '100%' }}>DOWNLOAD ASSET</button>
                    </div>
                </DetailModal>
            )}
        </div>
    );
};



const AdminChatView = () => {
    const { user } = useAuth();
    const { users, sendMessage, getChats } = useData();
    const [activeTab, setActiveTab] = useState('student'); // 'student' | 'teacher'
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const filteredUsers = useMemo(() => {
        return users.filter(u => u.role === activeTab);
    }, [users, activeTab]);

    const chatHistory = useMemo(() => {
        if (!selectedUserId) return [];
        return getChats(user.id, selectedUserId);
    }, [selectedUserId, user.id, getChats]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        sendMessage({
            senderId: user.id,
            receiverId: selectedUserId,
            text: newMessage,
            read: false
        });

        setNewMessage('');
    };

    return (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2px', height: 'calc(100vh - 140px)', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ background: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    {['student', 'teacher'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1, padding: '16px', border: 'none', background: activeTab === tab ? 'var(--bg-blueprint)' : 'white',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-dim)', fontWeight: '800', fontSize: '0.625rem', textTransform: 'uppercase',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent'
                            }}
                        >{tab}S</button>
                    ))}
                </div>

                <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                    {filteredUsers.map(u => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUserId(u.id)}
                            style={{
                                padding: '16px 24px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                                background: selectedUserId === u.id ? 'var(--bg-blueprint)' : 'white',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{u.id}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
                {selectedUserId ? (
                    <>
                        <div style={{ padding: '16px 32px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '0.75rem' }}>{users.find(u => u.id === selectedUserId)?.name.charAt(0)}</div>
                            <div style={{ fontWeight: '800', fontSize: '0.875rem' }}>{users.find(u => u.id === selectedUserId)?.name}</div>
                        </div>

                        <div className="custom-scrollbar" style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {chatHistory.map((msg, idx) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                        <div style={{
                                            padding: '12px 16px',
                                            background: isMe ? 'var(--primary)' : 'white',
                                            color: isMe ? 'white' : 'var(--primary)',
                                            borderRadius: '4px',
                                            border: isMe ? 'none' : '1px solid var(--border)',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                        }}>
                                            {msg.text}
                                        </div>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px', textAlign: isMe ? 'right' : 'left', fontWeight: '800' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} style={{ padding: '24px', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                            <input
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                style={{ flex: 1 }}
                            />
                            <button className="primary-btn" style={{ width: 'auto' }}>SEND</button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons" style={{ fontSize: '32px', color: 'var(--border)' }}>forum</span>
                        <div style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.875rem' }}>Select a conversation</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddCourseView = ({ onComplete }) => {
    const { addCourse, updateCourse, assignTeacher, updateCourseAssignment, users, courses, courseAssignments, enrollments, openModal } = useData();
    const [viewMode, setViewMode] = useState('add');
    const [course, setCourse] = useState({ title: '', description: '', duration: '' });
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editCourseData, setEditCourseData] = useState({});
    const [editTeacherId, setEditTeacherId] = useState('');

    const teachers = users.filter(u => u.role === 'teacher');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsGenerating(true);
        let modules = [];
        try {
            const syllabus = await generateCourseSyllabus(course.title);
            if (syllabus && syllabus.modules) {
                modules = syllabus.modules;
            }
        } catch (error) {
            console.error("Failed to generate content", error);
        }
        setIsGenerating(false);

        const newCourse = addCourse({ ...course, modules });
        if (selectedTeacherId) {
            assignTeacher(newCourse.id, selectedTeacherId);
        }
        setCourse({ title: '', description: '', duration: '' });
        setSelectedTeacherId('');
        openModal({
            title: "Course Provisioned",
            message: "Curriculum successfully initialized with AI-structured modules.",
            type: 'info'
        });
        if (onComplete) onComplete();
    };

    const handleEditSave = () => {
        if (!editCourseData.title || !editCourseData.description) {
            return openModal({ title: "Incomplete Data", message: "Title and description are mandatory.", type: 'error' });
        }
        updateCourse(editCourseData.id, {
            title: editCourseData.title,
            description: editCourseData.description,
            duration: editCourseData.duration
        });
        updateCourseAssignment(editCourseData.id, editTeacherId);
        setIsEditing(false);
        setSelectedCourseDetail(null);
        openModal({ title: "Updated", message: "Curriculum successfully modified.", type: 'info' });
    };

    const openEditMode = (course) => {
        const assignment = courseAssignments.find(ca => ca.courseId === course.id);
        const currentTeacherId = assignment ? assignment.teacherId : '';
        setEditCourseData({ ...course });
        setEditTeacherId(currentTeacherId);
        setIsEditing(true);
    };

    const getCourseDetails = (course) => {
        const assignment = courseAssignments.find(ca => ca.courseId === course.id);
        const teacher = assignment ? users.find(u => u.id === assignment.teacherId) : null;
        const enrollmentList = enrollments.filter(e => e.courseId === course.id);
        const students = users.filter(u => enrollmentList.some(e => e.studentId === u.id));

        if (isEditing) {
            return (
                <div className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Module Title</label>
                            <input value={editCourseData.title} onChange={e => setEditCourseData({ ...editCourseData, title: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Syllabus Overview</label>
                            <textarea rows="4" value={editCourseData.description} onChange={e => setEditCourseData({ ...editCourseData, description: e.target.value })} />
                        </div>
                        <div>
                            <label>Timeline (Cycles)</label>
                            <input type="number" value={editCourseData.duration} onChange={e => setEditCourseData({ ...editCourseData, duration: e.target.value })} />
                        </div>
                        <div>
                            <label>Lead Instructor</label>
                            <select value={editTeacherId} onChange={e => setEditTeacherId(e.target.value)}>
                                <option value="">Unassigned</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button onClick={handleEditSave} className="primary-btn" style={{ flex: 1 }}>SAVE CHANGES</button>
                        <button onClick={() => setIsEditing(false)} className="secondary-btn" style={{ flex: 1 }}>CANCEL</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-blueprint)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        <span className="material-icons" style={{ color: 'var(--primary)' }}>school</span>
                        <div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: '800' }}>FACULTY</div>
                            <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{teacher ? teacher.name : 'UNASSIGNED'}</div>
                        </div>
                    </div>
                    <button onClick={() => openEditMode(course)} className="secondary-btn" style={{ fontSize: '0.75rem' }}>MODIFY ARCHIVE</button>
                </div>

                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Operational Roster ({students.length})</h3>
                <div className="crisp-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-blueprint)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.625rem', color: 'var(--text-dim)' }}>PARTICIPANT</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.625rem', color: 'var(--text-dim)' }}>ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.email}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem' }}>{s.id}</td>
                                </tr>
                            ))}
                            {students.length === 0 && <tr><td colSpan="2" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>Zero active enrollments.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Curriculum Operations</h1>
                    <p>Architect and deploy advanced learning modules.</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-blueprint)', padding: '4px', borderRadius: '8px' }}>
                    <button onClick={() => setViewMode('add')} className={viewMode === 'add' ? 'primary-btn' : 'secondary-btn'} style={{ fontSize: '0.75rem' }}>PROVISION</button>
                    <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'primary-btn' : 'secondary-btn'} style={{ fontSize: '0.75rem' }}>REPOSITORY</button>
                </div>
            </div>

            {viewMode === 'add' ? (
                <div className="crisp-card animate-slide-up" style={{ maxWidth: '800px', padding: '32px' }}>
                    {isGenerating ? (
                        <div style={{ padding: '64px 0' }}>
                            <AILoadingScreen title="Synthesizing Curriculum..." subtitle="Our AI is crafting high-fidelity learning modules." />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label>Course Designation</label>
                                <input required placeholder="Title" value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label>Operational Objectives</label>
                                <textarea rows="4" placeholder="Define primary learning vectors..." value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} />
                            </div>
                            <div>
                                <label>Assigned Instructor</label>
                                <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                                    <option value="">SELECT FACULTY...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Timeline (Cycles)</label>
                                <input type="number" placeholder="12" value={course.duration} onChange={e => setCourse({ ...course, duration: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                                <button type="submit" className="primary-btn" style={{ width: '100%', padding: '16px' }}>INITIALIZE DEPLOYMENT</button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {courses.map((c) => (
                        <div key={c.id} onClick={() => setSelectedCourseDetail(c)} className="crisp-card hover-scale" style={{ cursor: 'pointer', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--bg-blueprint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ color: 'var(--primary)' }}>architecture</span>
                                </div>
                                <span style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-dim)' }}>{c.duration || '0'} CYCLES</span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{c.title}</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '24px' }}>{(c.description || '').substring(0, 100)}...</p>
                            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem' }}>VIEW SCHEMATIC</div>
                        </div>
                    ))}
                    {courses.length === 0 && <div className="crisp-card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', border: '1px dashed var(--border)' }}>No curricula found.</div>}
                </div>
            )}

            {selectedCourseDetail && (
                <DetailModal title={isEditing ? "Configuration" : "Schematic"} onClose={() => { setSelectedCourseDetail(null); setIsEditing(false); }}>
                    {getCourseDetails(selectedCourseDetail)}
                </DetailModal>
            )}
        </div>
    );
};

const ManageCoursesView = () => {
    const { courses, users, books, enrollStudent, addBookToCourse, courseAssignments, enrollments, courseBooks } = useData();
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
    const [studentToEnroll, setStudentToEnroll] = useState('');
    const [bookToAdd, setBookToAdd] = useState('');

    const handleEnroll = (e) => {
        e.preventDefault();
        if (!studentToEnroll) return;
        enrollStudent(selectedCourseId, studentToEnroll);
        setStudentToEnroll('');
    };

    const handleAddBook = (e) => {
        e.preventDefault();
        if (!bookToAdd) return;
        addBookToCourse(selectedCourseId, bookToAdd);
        setBookToAdd('');
    };

    if (courses.length === 0) return (
        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <span className="material-icons" style={{ fontSize: '48px', marginBottom: '16px' }}>error_outline</span>
            <div style={{ fontWeight: '800' }}>DATA NULL</div>
            <p>Insufficient curricula found. Initialize modules first.</p>
        </div>
    );

    const currentCourse = courses.find(c => c.id === selectedCourseId);
    const currentTeacherId = courseAssignments.find(ca => ca.courseId === selectedCourseId)?.teacherId;
    const currentTeacher = users.find(u => u.id === currentTeacherId);

    const enrolledStudentIds = enrollments.filter(e => e.courseId === selectedCourseId).map(e => e.studentId);
    const enrolledStudents = users.filter(u => enrolledStudentIds.includes(u.id));
    const availableStudents = users.filter(u => u.role === 'student' && !enrolledStudentIds.includes(u.id));

    const linkedBookIds = courseBooks.filter(cb => cb.courseId === selectedCourseId).map(cb => cb.bookId);
    const linkedBooks = books.filter(b => linkedBookIds.includes(b.id));
    const availableBooks = books.filter(b => !linkedBookIds.includes(b.id));

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Relationship Hub</h1>
                    <p>Synchronize personnel and resources across curricula.</p>
                </div>
                <div style={{ width: '320px' }}>
                    <label>Module Selection</label>
                    <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            {currentCourse && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="crisp-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px' }}>FACULTY</div>
                            <div style={{ fontWeight: '800', fontSize: '1.125rem' }}>{currentTeacher ? currentTeacher.name : 'UNASSIGNED'}</div>
                        </div>

                        <div className="crisp-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Personnel Roster ({enrolledStudents.length})</h3>
                            <div style={{ background: 'var(--bg-blueprint)', border: '1px solid var(--border)', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                                {enrolledStudents.map((s) => (
                                    <div key={s.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{s.name}</span>
                                        <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px' }}>{s.id}</span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleEnroll} style={{ display: 'flex', gap: '8px' }}>
                                <select flex="1" value={studentToEnroll} onChange={e => setStudentToEnroll(e.target.value)}>
                                    <option value="">+ AUTHORIZE...</option>
                                    {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <button className="secondary-btn" style={{ fontSize: '0.75rem' }}>ADD</button>
                            </form>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="crisp-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Objective</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{currentCourse.description}</p>
                        </div>

                        <div className="crisp-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Knowledge Assets</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                                {linkedBooks.map(b => (
                                    <div key={b.id} style={{ padding: '16px', background: 'var(--bg-blueprint)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '0.875rem' }}>{b.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.author}</div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddBook} style={{ display: 'flex', gap: '12px' }}>
                                <select flex="1" value={bookToAdd} onChange={e => setBookToAdd(e.target.value)}>
                                    <option value="">ATTACH RESOURCE...</option>
                                    {availableBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                </select>
                                <button className="secondary-btn" style={{ fontSize: '0.75rem' }}>ATTACH</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Ticket Management View ---

const TicketManagementView = () => {
    const { tickets, resolveTicket, users } = useData();
    const [filter, setFilter] = useState('active'); // active, solved

    const displayedTickets = tickets.filter(t => filter === 'active' ? t.status !== 'Solved' : t.status === 'Solved');

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Support Console</h1>
                    <p>Manage participant inquiries and technical reports.</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-blueprint)', padding: '4px', borderRadius: '8px' }}>
                    <button onClick={() => setFilter('active')} className={filter === 'active' ? 'primary-btn' : 'secondary-btn'} style={{ fontSize: '0.75rem' }}>ACTIVE</button>
                    <button onClick={() => setFilter('solved')} className={filter === 'solved' ? 'primary-btn' : 'secondary-btn'} style={{ fontSize: '0.75rem' }}>RESOLVED</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayedTickets.length === 0 ? (
                    <div className="crisp-card" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border)' }}>
                        <span className="material-icons" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}>check_circle</span>
                        <p>All inquiries are currently synchronized.</p>
                    </div>
                ) : (
                    displayedTickets.map((t) => {
                        const requester = users.find(u => u.id === t.userId);
                        return (
                            <div key={t.id} className="crisp-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--bg-blueprint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px' }}>help_outline</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1.125rem' }}>{t.subject}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase' }}>{t.type}</span>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>• {new Date(t.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {t.status !== 'Solved' && (
                                        <button onClick={() => resolveTicket(t.id)} className="secondary-btn" style={{ fontSize: '0.625rem', padding: '8px 16px' }}>RESOLVE</button>
                                    )}
                                </div>
                                <div style={{ color: 'var(--text-dim)', background: 'var(--bg-blueprint)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem' }}>{t.description}</div>
                                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                    <div style={{ fontSize: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-dim)' }}>Initiated by </span>
                                        <strong>{requester ? requester.name : t.userId}</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// --- Main Container ---

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme, openModal, closeModal, modalConfig } = useData();
    const settings = useSettings();
    const [activeTab, setActiveTab] = useState('dashboard');

    const Menu = ({ id, icon, label }) => (
        <div
            className={`admin - nav - item ${activeTab === id ? 'active' : ''} `}
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                color: activeTab === id ? 'var(--primary)' : 'var(--text-dim)',
                background: activeTab === id ? 'var(--bg-blueprint)' : 'transparent',
                fontWeight: activeTab === id ? '800' : '600',
                fontSize: '0.8125rem',
                border: activeTab === id ? '1px solid var(--border)' : '1px solid transparent'
            }}
        >
            <span className="material-icons" style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{ letterSpacing: '0.02em' }}>{label.toUpperCase()}</span>
        </div>
    );

    return (
        <div className="admin-container" style={{ background: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar Navigation */}
            <nav className="admin-sidebar" style={{
                width: '260px',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                padding: '32px 20px',
                height: '100vh',
                flexShrink: 0,
                borderRight: '1px solid var(--border)',
                zIndex: 30
            }}>
                <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '1px', color: 'black', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                        PRAXIUM<span style={{ color: 'var(--accent)' }}>.AI</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '8px', paddingLeft: '16px', letterSpacing: '0.1em' }}>CONTROL</div>
                    <Menu id="dashboard" icon="dashboard" label={settings.t('dashboard')} />
                    <Menu id="chat" icon="terminal" label={settings.t('messenger')} />
                    <Menu id="profile" icon="person" label="My Account" />

                    <div style={{ fontSize: '0.625rem', fontWeight: '900', color: 'var(--text-dim)', marginTop: '24px', marginBottom: '8px', paddingLeft: '16px', letterSpacing: '0.1em' }}>PERSONNEL</div>
                    <Menu id="users" icon="group" label="Participants" />
                    <Menu id="add-user" icon="person_add" label="Authorize" />

                    <div style={{ fontSize: '0.625rem', fontWeight: '900', color: 'var(--text-dim)', marginTop: '24px', marginBottom: '8px', paddingLeft: '16px', letterSpacing: '0.1em' }}>CURRICULUM</div>
                    <Menu id="add-courses" icon="architecture" label="Syllabus" />
                    <Menu id="manage-courses" icon="hub" label="Relations" />
                    <Menu id="add-books" icon="library_books" label="Archive" />

                    <div style={{ fontSize: '0.625rem', fontWeight: '900', color: 'var(--text-dim)', marginTop: '24px', marginBottom: '8px', paddingLeft: '16px', letterSpacing: '0.1em' }}>SUPPORT</div>
                    <Menu id="tickets" icon="confirmation_number" label="Reports" />
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <div
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#e11d48', // High contrast red
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>logout</span>
                        TERMINATE SESSION
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="custom-scrollbar" style={{
                flex: 1,
                overflowY: activeTab === 'aichat' ? 'hidden' : 'auto',
                background: '#f8fafc', // Light slate background for main area
                display: 'flex',
                flexDirection: 'column'
            }}>
                <header style={{
                    padding: '16px 40px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                    background: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AUTHORIZED OPERATOR</div>
                            <div style={{ fontSize: '0.875rem', color: 'black', fontWeight: '800' }}>{user?.name || 'ADMIN'}</div>
                        </div>
                        <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: 'var(--bg-blueprint)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '18px' }}>shield</span>
                        </div>
                    </div>
                </header>

                <div style={{
                    padding: activeTab === 'aichat' ? 0 : '40px',
                    maxWidth: activeTab === 'aichat' ? '100%' : '1400px',
                    margin: '0 auto',
                    width: '100%',
                    flex: activeTab === 'aichat' ? 1 : 'none',
                    display: activeTab === 'aichat' ? 'flex' : 'block',
                    flexDirection: 'column'
                }}>
                    {activeTab === 'dashboard' && <DashboardView />}
                    {activeTab === 'users' && <UserListView />}
                    {activeTab === 'add-user' && <AddUserView onComplete={() => setActiveTab('users')} />}
                    {activeTab === 'add-books' && <AddBookView />}
                    {activeTab === 'add-courses' && <AddCourseView onComplete={() => setActiveTab('manage-courses')} />}
                    {activeTab === 'manage-courses' && <ManageCoursesView />}
                    {activeTab === 'chat' && <AdminChatView />}
                    {activeTab === 'tickets' && <TicketManagementView />}
                    {activeTab === 'profile' && <AccountSettings />}
                    {activeTab === 'aichat' && <AIChatView />}
                </div>
            </main>
        </div>
    );
}
