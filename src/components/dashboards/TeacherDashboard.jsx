import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import AccountSettings from '../AccountSettings';
import AILoadingScreen from '../common/AILoadingScreen';
import { generateCourseSyllabus, generateQuestionsFromImage } from '../../services/aiService';
import AIChatView from '../common/AIChatView';

// --- Sub-Components (Utilities) ---

const DetailModal = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} className="animate-fade-in">
        <div className="animate-scale" style={{ background: 'var(--bg-card)', padding: '30px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', border: '3px solid black', boxShadow: '10px 10px 0 black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{title}</h2>
                <button onClick={onClose} style={{ background: 'black', color: 'white', border: 'none', padding: '5px 10px', fontWeight: 'bold' }}>CLOSE</button>
            </div>
            {children}
        </div>
    </div>
);

// --- Sub-Components (Views) ---

const ReportModal = ({ student, onClose }) => {
    // Mock Data Calculation
    const attendance = 85;
    const quizAverage = 92;
    const assignmentsSubmitted = 12;
    const assignmentsTotal = 15;

    return (
        <DetailModal title={`Student Report: ${student.name.toUpperCase()}`} onClose={onClose}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Left: Stats & Info */}
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontWeight: 'bold' }}>Contact Information</div>
                        <div style={{ fontSize: '0.9rem' }}>Email: {student.email}</div>
                        <div style={{ fontSize: '0.9rem' }}>ID: {student.id}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, border: '2px solid black', padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{quizAverage}%</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>AVG SCORE</div>
                        </div>
                        <div style={{ flex: 1, border: '2px solid black', padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{attendance}%</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ATTENDANCE</div>
                        </div>
                    </div>
                </div>

                {/* Right: Visuals */}
                <div>
                    <h4 style={{ marginTop: 0 }}>Performance Overview</h4>
                    {/* Attendance Bar */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                            <span>Attendance Reliability</span>
                            <span>{attendance}%</span>
                        </div>
                        <div style={{ width: '100%', height: '20px', background: '#eee', border: '2px solid black' }}>
                            <div style={{ width: `${attendance}%`, height: '100%', background: 'var(--secondary)' }}></div>
                        </div>
                    </div>

                    {/* Assignment Progress */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                            <span>Assignments ({assignmentsSubmitted}/{assignmentsTotal})</span>
                            <span>{Math.round((assignmentsSubmitted / assignmentsTotal) * 100)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '20px', background: '#eee', border: '2px solid black' }}>
                            <div style={{ width: `${(assignmentsSubmitted / assignmentsTotal) * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                        </div>
                    </div>

                    <div style={{ padding: '15px', background: '#f9f9f9', border: '2px dashed black', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        "Demonstrates strong understanding of core concepts. Needs to improve punctuality with assignment submissions."
                    </div>
                </div>
            </div>
        </DetailModal>
    );
}

const TeacherDashboardView = ({ setActiveTab }) => {
    const { user } = useAuth();
    const { getStudentsForTeacher, getCoursesForTeacher } = useData();
    const myStudents = getStudentsForTeacher(user.id);
    const myCourses = getCoursesForTeacher(user.id);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 28px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* ====== HEADER ====== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '24px 32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '900', boxShadow: '0 8px 24px rgba(76, 175, 125, 0.3)' }}>
                        <span className="material-icons" style={{ fontSize: '32px' }}>school</span>
                    </div>
                    <div>
                        <h1 style={{ fontWeight: '900', margin: 0, fontSize: '1.8rem', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            Teacher Portal
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '600', margin: '4px 0 0' }}>
                            Manage your courses, students, and sessions.
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => setActiveTab('courses')} className="auth-button" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons" style={{ fontSize: '18px' }}>add</span> New Course
                    </button>
                    <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', border: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Time</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-main)' }}>{dateStr}</div>
                    </div>
                </div>
            </div>

            {/* ====== MAIN CARDS ====== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>

                {/* My Courses Summary */}
                <div
                    className="glass-card hover-lift"
                    style={{ padding: '28px', border: '1px solid var(--glass-border)', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}
                    onClick={() => setActiveTab('courses')}
                >
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', zIndex: 1, position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <span className="material-icons" style={{ fontSize: '24px', color: 'white' }}>menu_book</span>
                        </div>
                        <span className="material-icons" style={{ color: 'var(--primary)' }}>arrow_forward</span>
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', position: 'relative', zIndex: 1 }}>Teaching Load</h3>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1, position: 'relative', zIndex: 1 }}>{myCourses.length}</div>
                    <div style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.5px', marginTop: '8px', position: 'relative', zIndex: 1 }}>ACTIVE COURSES</div>
                </div>

                {/* Students Summary */}
                <div
                    className="glass-card hover-lift"
                    style={{ padding: '28px', border: '1px solid var(--glass-border)', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}
                    onClick={() => setActiveTab('students')}
                >
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'var(--secondary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', zIndex: 1, position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <span className="material-icons" style={{ fontSize: '24px', color: 'white' }}>people</span>
                        </div>
                        <span className="material-icons" style={{ color: 'var(--secondary)' }}>arrow_forward</span>
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', position: 'relative', zIndex: 1 }}>Total Students</h3>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1, position: 'relative', zIndex: 1 }}>{myStudents.length}</div>
                    <div style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.5px', marginTop: '8px', position: 'relative', zIndex: 1 }}>ENROLLED ACROSS ALL COURSES</div>
                </div>

                {/* Quick Actions Shortcuts */}
                <div className="glass-card" style={{ padding: '28px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'var(--accent)', opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', zIndex: 1, position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(232,93,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-icons" style={{ fontSize: '24px', color: 'var(--accent)' }}>flash_on</span>
                        </div>
                    </div>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', position: 'relative', zIndex: 1 }}>Quick Actions</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
                        <button onClick={() => setActiveTab('meetings')} style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', color: 'var(--text-main)', cursor: 'pointer', transition: 'border 0.2s' }} className="hover-lift">
                            <span className="material-icons" style={{ color: 'var(--secondary)' }}>calendar_today</span> SCHEDULE MEETING
                        </button>
                        <button onClick={() => setActiveTab('chat')} style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', color: 'var(--text-main)', cursor: 'pointer', transition: 'border 0.2s' }} className="hover-lift">
                            <span className="material-icons" style={{ color: 'var(--primary)' }}>chat</span> OPEN CHAT CONSOLE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MyStudentsView = () => {
    const { user } = useAuth();
    const { getStudentsForTeacher } = useData();
    const myStudents = getStudentsForTeacher(user.id);
    const [selectedStudent, setSelectedStudent] = useState(null);

    return (
        <div className="animate-slide-up">
            <div className="admin-header-strip">
                <h2>Student Roster</h2>
            </div>
            <div className="dash-card">
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myStudents.map((s, idx) => (
                        <div key={s.id} className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '2px solid black', background: 'var(--bg-card)', animationDelay: `${idx * 0.05}s` }}>
                            <div>
                                <div style={{ fontWeight: '700' }}>{s.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'gray' }}>{s.email}</div>
                                <div style={{ fontSize: '0.8rem' }}>ID: {s.id}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button onClick={() => setSelectedStudent(s)} style={{ fontSize: '0.7rem', padding: '6px 12px', background: 'black', color: 'white', marginTop: '4px', border: 'none' }}>VIEW REPORT</button>
                            </div>
                        </div>
                    ))}
                    {myStudents.length === 0 && <p>No students enrolled in your courses.</p>}
                </div>
            </div>
            {selectedStudent && <ReportModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
        </div>
    );
};

const ManageCoursesView = () => {
    const { user } = useAuth();
    const { addCourse, assignTeacher, getCoursesForTeacher, openModal } = useData();
    const [viewMode, setViewMode] = useState('list'); // 'add' or 'list'
    const [course, setCourse] = useState({ title: '', description: '', duration: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    const myCourses = getCoursesForTeacher(user.id);

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
        assignTeacher(newCourse.id, user.id);

        setCourse({ title: '', description: '', duration: '' });
        openModal({
            title: "Course Published",
            message: "Course created and assigned to you with AI-generated content!",
            type: 'info'
        });
        setViewMode('list');
    };

    return (
        <div className="animate-slide-up">
            <div className="admin-header-strip">
                <h2>Course Management</h2>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setViewMode('list')} style={{ padding: '10px 20px', fontWeight: 'bold', border: '2px solid black', background: viewMode === 'list' ? 'black' : 'white', color: viewMode === 'list' ? 'white' : 'black', cursor: 'pointer' }}>MY COURSES</button>
                <button onClick={() => setViewMode('add')} style={{ padding: '10px 20px', fontWeight: 'bold', border: '2px solid black', background: viewMode === 'add' ? 'black' : 'white', color: viewMode === 'add' ? 'white' : 'black', cursor: 'pointer' }}>+ CREATE NEW</button>
            </div>

            {viewMode === 'add' ? (
                <div className="dash-card animate-scale" style={{ maxWidth: '800px' }}>
                    <h3>Create New Course</h3>
                    {isGenerating ? (
                        <AILoadingScreen title="Generating Course Content..." subtitle="Our AI is crafting a comprehensive 30-module syllabus for you." />
                    ) : (
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label>Course Name</label>
                                <input required placeholder="e.g. Advanced Botany" value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="4" style={{ width: '100%', padding: '16px', border: '3px solid black', fontFamily: 'inherit' }} placeholder="Course objectives and summary..." value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Duration (Weeks)</label>
                                <input type="number" placeholder="12" value={course.duration} onChange={e => setCourse({ ...course, duration: e.target.value })} />
                            </div>
                            <button className="auth-button" style={{ background: 'var(--accent)' }}>Publish Course</button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="dash-card">
                    <h3>My Course Catalog</h3>
                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {myCourses.map((c, index) => (
                            <div key={c.id} className="animate-scale hover-scale" style={{ padding: '20px', border: '2px solid black', background: 'var(--bg-card)', animationDelay: `${index * 0.1}s` }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>{c.title.toUpperCase()}</div>
                                <div style={{ fontSize: '0.9rem', color: 'gray', marginBottom: '15px' }}>{c.description}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{c.duration} Weeks</div>
                                    <button style={{ fontSize: '0.7rem', textDecoration: 'underline', background: 'none', border: 'none', color: 'var(--text-main)' }}>Edit Details</button>
                                </div>
                            </div>
                        ))}
                        {myCourses.length === 0 && <p>You haven't created any courses yet.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const MeetingView = () => {
    const { user } = useAuth();
    const { getStudentsForTeacher, scheduleMeeting, meetings, openModal } = useData();
    const myStudents = getStudentsForTeacher(user.id);
    const [meeting, setMeeting] = useState({ studentId: '', date: '', time: '', link: '' });
    const [activeSubTab, setActiveSubTab] = useState('schedule'); // 'schedule' or 'view'

    // Filter meetings created by this teacher
    const myScheduledMeetings = meetings.filter(m => m.teacherId === user.id);

    const handleScheduleMeeting = (e) => {
        e.preventDefault();
        scheduleMeeting({ ...meeting, teacherId: user.id });
        setMeeting({ studentId: '', date: '', time: '', link: '' });
        openModal({
            title: "Meeting Scheduled",
            message: "Your learning session has been successfully scheduled.",
            type: 'info'
        });
        setActiveSubTab('view');
    };

    return (
        <div className="animate-slide-up">
            <div className="admin-header-strip">
                <h2>Schedule Manager</h2>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setActiveSubTab('schedule')} style={{ padding: '10px 20px', fontWeight: 'bold', border: '2px solid black', background: activeSubTab === 'schedule' ? 'black' : 'white', color: activeSubTab === 'schedule' ? 'white' : 'black', cursor: 'pointer' }}>SCHEDULE NEW</button>
                <button onClick={() => setActiveSubTab('view')} style={{ padding: '10px 20px', fontWeight: 'bold', border: '2px solid black', background: activeSubTab === 'view' ? 'black' : 'white', color: activeSubTab === 'view' ? 'white' : 'black', cursor: 'pointer' }}>VIEW SCHEDULED</button>
            </div>

            {activeSubTab === 'schedule' ? (
                <div className="dash-card animate-scale" style={{ maxWidth: '600px' }}>
                    <h3>Schedule a New Meeting</h3>
                    <p style={{ marginBottom: '20px', color: 'gray' }}>Set up doubt sessions or 1:1 reviews with your students.</p>

                    <form onSubmit={handleScheduleMeeting}>
                        <div className="form-group">
                            <label>Select Student</label>
                            <select
                                value={meeting.studentId}
                                onChange={e => setMeeting({ ...meeting, studentId: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '3px solid black', marginBottom: '10px' }}
                                required
                            >
                                <option value="">-- Choose Student --</option>
                                {myStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Virtual Meeting Link</label>
                            <input type="text" placeholder="https://zoom.us/j/..." required value={meeting.link} onChange={e => setMeeting({ ...meeting, link: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" required value={meeting.date} onChange={e => setMeeting({ ...meeting, date: e.target.value })} style={{ padding: '12px', border: '3px solid black' }} />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input type="time" required value={meeting.time} onChange={e => setMeeting({ ...meeting, time: e.target.value })} style={{ padding: '12px', border: '3px solid black' }} />
                            </div>
                        </div>
                        <button type="submit" className="auth-button" style={{ background: 'var(--primary)', color: 'black' }}>Send Meeting Invite</button>
                    </form>
                </div>
            ) : (
                <div className="dash-card animate-scale">
                    <h3>Upcoming Meetings</h3>
                    <div style={{ marginTop: '20px' }}>
                        {myScheduledMeetings.map((m, idx) => {
                            const student = myStudents.find(s => s.id === m.studentId);
                            return (
                                <div key={m.id} className="animate-slide-up hover-scale" style={{ padding: '15px', border: '2px solid black', marginBottom: '15px', background: '#e3f2fd', animationDelay: `${idx * 0.05}s` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Meeting with {student ? student.name : `Student ${m.studentId}`}</div>
                                            <div style={{ fontSize: '0.9rem' }}>{m.date} at {m.time}</div>
                                            <a href={m.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'blue' }}>{m.link}</a>
                                        </div>
                                        <button style={{ background: 'black', color: 'white', border: 'none', padding: '5px 10px' }}>CANCEL</button>
                                    </div>
                                </div>
                            )
                        })}
                        {myScheduledMeetings.length === 0 && <p>No meetings scheduled.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const ChatView = () => {
    const { user } = useAuth();
    const { getStudentsForTeacher, sendMessage, getChats } = useData();
    const myStudents = getStudentsForTeacher(user.id);

    // State
    // State
    const [selectedStudentId, setSelectedStudentId] = useState(myStudents[0]?.id || '');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    const chatHistory = useMemo(() => {
        if (!selectedStudentId) return [];
        return getChats(user.id, selectedStudentId);
    }, [selectedStudentId, user.id, getChats]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        sendMessage({
            senderId: user.id,
            receiverId: selectedStudentId,
            text: newMessage,
            read: false
        });

        setNewMessage('');
    };

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
        <div className="animate-slide-up" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-header-strip" style={{ marginBottom: '20px' }}>
                <h2>Classroom Messenger</h2>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                {/* Left: Contact List */}
                <div className="dash-card" style={{ width: '300px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', background: 'var(--primary)', borderBottom: '2px solid black', fontWeight: 'bold' }}>
                        CONTACTS
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {myStudents.map(s => (
                            <div
                                key={s.id}
                                onClick={() => setSelectedStudentId(s.id)}
                                style={{
                                    padding: '15px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    background: selectedStudentId === s.id ? '#e3f2fd' : 'white',
                                    fontWeight: selectedStudentId === s.id ? 'bold' : 'normal'
                                }}
                            >
                                {s.name}
                                <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>ID: {s.id}</div>
                            </div>
                        ))}
                        {myStudents.length === 0 && <div style={{ padding: '15px', color: 'gray' }}>No students found.</div>}
                    </div>
                </div>

                {/* Right: Chat Window */}
                <div className="dash-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedStudentId ? (
                        <>
                            <div style={{ padding: '15px', borderBottom: '2px solid black', background: '#f9f9f9', fontWeight: 'bold' }}>
                                Chatting with: {myStudents.find(s => s.id === selectedStudentId)?.name || selectedStudentId}
                            </div>

                            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {chatHistory.map(msg => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                            <div style={{ fontSize: '0.7rem', marginBottom: '4px', color: '#666', textAlign: isMe ? 'right' : 'left' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style={{
                                                background: isMe ? 'var(--secondary)' : 'white',
                                                color: isMe ? 'white' : 'black',
                                                padding: '12px 16px',
                                                border: '2px solid black',
                                                boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
                                            }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                {chatHistory.length === 0 && <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>No messages yet. Start the conversation!</div>}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSend} style={{ padding: '20px', background: 'var(--bg-card)', borderTop: '2px solid black', display: 'flex', gap: '10px' }}>
                                <input
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    style={{ flex: 1, border: '2px solid black', padding: '12px' }}
                                />
                                <button className="auth-button" style={{ width: 'auto', marginTop: 0, padding: '0 30px' }}>SEND</button>
                            </form>
                        </>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'gray' }}>Select a student to start chatting.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Manage Assessments View ---
const ManageAssessmentsView = () => {
    const { user } = useAuth();
    const { customTests, addCustomTest } = useData();
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(30);
    const [questions, setQuestions] = useState([{ text: '', correctAnswer: '', options: ['', '', '', ''] }]);
    const [isGenerating, setIsGenerating] = useState(false);

    const myTests = (customTests || []).filter(t => t.teacherId === user?.id);

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', correctAnswer: '', options: ['', '', '', ''] }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQ = [...questions];
        newQ[index][field] = value;
        setQuestions(newQ);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQ = [...questions];
        newQ[qIndex].options[oIndex] = value;
        setQuestions(newQ);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsGenerating(true);
        try {
            const aiData = await generateQuestionsFromImage(file);
            if (aiData && aiData.questions && aiData.questions.length > 0) {
                if (questions.length === 1 && questions[0].text === '') {
                    setQuestions(aiData.questions);
                } else {
                    setQuestions([...questions, ...aiData.questions]);
                }
            } else {
                alert("AI could not extract questions from this image.");
            }
        } catch (error) {
            console.error(error);
            alert("Error processing image. Please try again.");
        } finally {
            setIsGenerating(false);
            e.target.value = null; // Reset file input
        }
    };

    const handleSaveTest = async () => {
        if (!title.trim()) return alert("Test title required");
        // Validate at least one question
        const validQuestions = questions.filter(q => q.text.trim() && q.correctAnswer.trim());
        if (validQuestions.length === 0) return alert("Add at least one complete question.");

        await addCustomTest({
            teacherId: user.id,
            title,
            duration: parseInt(duration),
            questions: validQuestions
        });

        setTitle('');
        setDuration(30);
        setQuestions([{ text: '', correctAnswer: '', options: ['', '', '', ''] }]);
        alert("Custom test published successfully!");
    };

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '20px' }}>Manage Assessments</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) 1fr', gap: '30px' }}>
                <div className="admin-card">
                    <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: '800' }}>Create New Custom Test</h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Test Title</label>
                        <input className="chat-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Physics Exam" style={{ width: '100%', padding: '12px', border: '2px solid black' }} />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Duration (minutes)</label>
                        <input className="chat-input" type="number" value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100px', padding: '12px', border: '2px solid black' }} />
                    </div>

                    <div style={{ borderTop: '2px solid black', paddingTop: '20px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ margin: 0, fontWeight: '800' }}>Questions</h4>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    id="imageUpload"
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="imageUpload"
                                    style={{
                                        padding: '8px 16px',
                                        background: isGenerating ? '#ccc' : 'var(--accent)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        border: '2px solid black',
                                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: '18px' }}>{isGenerating ? 'hourglass_empty' : 'image'}</span>
                                    {isGenerating ? 'ANALYZING IMAGE...' : 'UPLOAD IMAGE (AI)'}
                                </label>
                            </div>
                        </div>
                        {isGenerating && (
                            <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-app)', border: '2px dashed black', marginBottom: '15px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                                <span className="material-icons" style={{ animation: 'spin 2s linear infinite', display: 'inline-block', marginBottom: '10px', fontSize: '2rem' }}>autorenew</span><br />
                                Our AI is extracting questions from your image. This will take a few seconds...
                            </div>
                        )}
                        {questions.map((q, idx) => (
                            <div key={idx} style={{ padding: '15px', border: '2px solid black', marginBottom: '15px', background: 'var(--bg-app)' }}>
                                <div style={{ fontWeight: '800', marginBottom: '10px' }}>Q{idx + 1}</div>
                                <input value={q.text} onChange={e => handleQuestionChange(idx, 'text', e.target.value)} placeholder="Question Text" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '2px solid black' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                    {q.options.map((opt, oIdx) => (
                                        <input key={oIdx} value={opt} onChange={e => handleOptionChange(idx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} style={{ padding: '8px', border: '2px solid black' }} />
                                    ))}
                                </div>
                                <input value={q.correctAnswer} onChange={e => handleQuestionChange(idx, 'correctAnswer', e.target.value)} placeholder="Correct Answer (must match an option exactly)" style={{ width: '100%', padding: '10px', border: '2px solid black', borderColor: 'var(--success)' }} />
                            </div>
                        ))}

                        <button onClick={handleAddQuestion} style={{ padding: '8px 16px', background: 'var(--secondary)', color: 'white', fontWeight: 'bold', border: '2px solid black', cursor: 'pointer' }}>+ ADD QUESTION</button>
                    </div>

                    <button onClick={handleSaveTest} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', border: '2px solid black', cursor: 'pointer', fontSize: '1.1rem' }}>
                        PUBLISH TEST TO STUDENTS
                    </button>
                </div>

                <div className="admin-card">
                    <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: '800' }}>Your Published Tests</h3>
                    {myTests.length === 0 ? (
                        <p style={{ fontStyle: 'italic', opacity: 0.7 }}>You haven't created any custom tests yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {myTests.map(t => (
                                <div key={t.id} style={{ padding: '15px', border: '2px solid black', background: 'white' }}>
                                    <h4 style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{t.title}</h4>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{t.questions?.length} Questions • {t.duration} mins</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Container ---

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme, openModal, closeModal, modalConfig } = useData();
    const settings = useSettings();
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderMenu = (id, label) => (
        <div
            key={id}
            className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            style={{
                borderColor: activeTab === id ? 'white' : 'rgba(255,255,255,0.3)',
                color: activeTab === id ? 'black' : 'white',
                background: activeTab === id ? 'white' : 'transparent',
                boxShadow: activeTab === id ? '4px 4px 0 rgba(0,0,0,0.2)' : 'none',
                cursor: 'pointer'
            }}
        >
            {label}
        </div>
    );

    return (
        <div className="admin-container">
            {/* Sidebar Navigation - Updated Color */}
            <nav className="admin-sidebar" style={{ background: 'var(--secondary)', borderRight: '4px solid black' }}>
                <div className="admin-brand" style={{ background: 'var(--primary)', color: 'black', borderColor: 'white' }}>PRAXIUM FACULTY</div>

                <div className="admin-nav-menu">
                    {renderMenu('dashboard', settings.t('dashboard').toUpperCase())}
                    {renderMenu('students', 'STUDENTS')}
                    {renderMenu('courses', settings.t('courses').toUpperCase())}
                    {renderMenu('assessments', 'ASSESSMENTS')}
                    {renderMenu('meetings', 'MEETING')}
                    {renderMenu('chat', settings.t('messenger').toUpperCase())}
                    {renderMenu('aichat', 'AI CHAT')}
                    {renderMenu('profile', 'MY ACCOUNT')}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div
                        className="admin-nav-item"
                        style={{ border: '2px solid white', color: 'white', background: 'var(--accent)' }}
                        onClick={logout}
                    >
                        LOGOUT
                    </div>
                </div>
            </nav >

            <main className="admin-main" style={
                activeTab === 'aichat' ? { padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' } : { display: 'flex', flexDirection: 'column' }
            }>
                {/* Only show the default Teacher header if we are NOT on AI chat, since AI Chat has its own header */}
                {activeTab !== 'aichat' && (
                    <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FACULTY PORTAL</h2>
                        <span style={{ fontWeight: 'bold' }}>HELLO, {(user?.name || 'TEACHER').toUpperCase()}</span>
                    </header>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: activeTab === 'aichat' ? 'hidden' : 'visible' }}>
                    {activeTab === 'dashboard' && <TeacherDashboardView setActiveTab={setActiveTab} />}
                    {activeTab === 'students' && <MyStudentsView />}
                    {activeTab === 'courses' && <ManageCoursesView />}
                    {activeTab === 'assessments' && <ManageAssessmentsView />}
                    {activeTab === 'meetings' && <MeetingView />}
                    {activeTab === 'chat' && <ChatView />}
                    {activeTab === 'aichat' && <AIChatView />}
                    {activeTab === 'profile' && <AccountSettings />}
                </div>
            </main>
        </div >
    );
}
