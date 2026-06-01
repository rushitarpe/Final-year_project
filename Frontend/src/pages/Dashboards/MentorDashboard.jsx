import { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import {
    Users, DollarSign, TrendingUp, Calendar, MessageSquare, Video,
    CheckCircle, Clock, ChevronLeft, ChevronRight, Star, ArrowUp,
    Zap, MoreHorizontal, BookOpen, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── Calendar ─────────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MiniCalendar = ({ bookingDates }) => {
    const today = new Date();
    const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const year = view.getFullYear(), month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const bookingSet = useMemo(() => new Set(
        bookingDates.map(d => { const dd = new Date(d); return `${dd.getFullYear()}-${dd.getMonth()}-${dd.getDate()}`; })
    ), [bookingDates]);

    const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    const hasBooking = (d) => bookingSet.has(`${year}-${month}-${d}`);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setView(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>
                <h3 className="text-sm font-semibold text-white">{MONTHS[month]} {year}</h3>
                <button onClick={() => setView(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-slate-600 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => (
                    <div key={i} className={`aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all relative
                        ${!day ? '' : isToday(day)
                            ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                            : hasBooking(day)
                                ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                                : 'text-slate-400 hover:bg-white/10 cursor-pointer'}`}>
                        {day}
                        {day && hasBooking(day) && !isToday(day) && (
                            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-violet-400" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Session expiry ────────────────────────────────────────────────────────────
const isExpired = (b) => {
    if (!b.date || !b.time) return false;
    const [h, m] = (b.time || '00').split(':').map(Number);
    const end = new Date(b.date); end.setHours(h, m + 60, 0, 0);
    return new Date() > end;
};

// ─── Mentor Dashboard ─────────────────────────────────────────────────────────
const MentorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    // Assignment creation state
    const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ mentee: '', title: '', description: '', dueDate: '' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [up, hist, assign] = await Promise.all([
                    api.get('/bookings/upcoming').catch(() => ({ data: { data: [] } })), 
                    api.get('/bookings/history').catch(() => ({ data: { data: [] } })),
                    api.get('/assignments').catch(() => ({ data: { data: [] } }))
                ]);
                
                setUpcomingBookings(up.data.data || []);
                setSessions(hist.data.data || []);
                setAssignments(assign.data?.data || []);
            } catch (err) {
                console.error("Mentor dashboard load error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleRespond = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/respond`, { status });
            const res = await api.get('/bookings/upcoming');
            setUpcomingBookings(res.data.data || []);
        } catch (err) {
            console.error('Error responding to booking:', err);
        }
    };

    const handleMessage = async (menteeId) => {
        try {
            await api.post('/chat', { userId: menteeId });
            navigate('/chat');
        } catch (err) {
            console.error('Error starting chat:', err);
        }
    };

    const handleCreateAssignment = async () => {
        if (!newAssignment.mentee || !newAssignment.title || !newAssignment.description || !newAssignment.dueDate) {
            return alert('Please fill all fields');
        }
        try {
            const res = await api.post('/assignments', newAssignment);
            setAssignments([res.data.data, ...assignments]);
            setIsCreateAssignmentOpen(false);
            setNewAssignment({ mentee: '', title: '', description: '', dueDate: '' });
            alert('Assignment created!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating assignment');
        }
    };

    const [gradingId, setGradingId] = useState(null);
    const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

    const handleGradeAssignment = async (assignmentId) => {
        if (!gradeForm.score) return alert('Please enter a score');
        const score = parseInt(gradeForm.score, 10);
        if (isNaN(score) || score < 0 || score > 100) return alert('Invalid score (0-100)');

        try {
            const res = await api.put(`/assignments/${assignmentId}/grade`, { 
                score, 
                feedback: gradeForm.feedback 
            });
            const gradeLetter = res.data.data.grade;
            
            setAssignments(assignments.map(a => a._id === assignmentId ? { ...a, status: 'graded', score, feedback: gradeForm.feedback, grade: gradeLetter } : a));
            setGradingId(null);
            setGradeForm({ score: '', feedback: '' });
            alert('Assignment graded successfully!');
        } catch (err) {
             alert(err.response?.data?.message || 'Error grading assignment');
        }
    };

    const allBookings = useMemo(() => [...upcomingBookings, ...sessions], [upcomingBookings, sessions]);
    const pending = upcomingBookings.filter(b => b.status === 'pending');
    const upcoming = upcomingBookings.filter(b => b.status === 'accepted' && !isExpired(b));
    const completed = sessions.filter(s => s.status === 'accepted' || s.status === 'completed' || isExpired(s));
    
    const uniqueStudents = useMemo(() => {
        const map = new Map();
        allBookings.forEach(b => { 
            if (b.mentee?._id && b.status !== 'pending' && b.status !== 'rejected') {
                map.set(b.mentee._id, b.mentee); 
            }
        });
        return Array.from(map.values());
    }, [allBookings]);

    const earnings = completed.length * 120;
    const bookingDates = allBookings.map(b => new Date(b.date));

    const tabs = [
        { key: 'upcoming', label: 'Upcoming', count: upcoming.length, color: 'violet' },
        { key: 'completed', label: 'Completed', count: completed.length, color: 'emerald' },
        { key: 'students', label: 'My Students', count: uniqueStudents.length, color: 'blue' },
        { key: 'assignments', label: 'Assignments', count: assignments.length, color: 'amber' },
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading your dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="text-white">
            <div className="max-w-7xl mx-auto">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-violet-500/30">
                            {user?.firstName?.[0] || 'M'}
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">Mentor Dashboard</p>
                            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName} 👋</h1>
                        </div>
                    </div>
                    <Link to="/profile">
                        <button className="px-4 py-2 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/5 transition-all flex items-center gap-2">
                            Edit Profile
                        </button>
                    </Link>
                </div>

                {/* ── Stats row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: 'Total Sessions',
                            value: sessions.length + upcoming.length,
                            icon: Calendar,
                            gradient: 'from-violet-500 to-purple-700',
                            delta: sessions.length > 0 ? `${sessions.length} done` : null,
                        },
                        {
                            label: 'Total Earnings',
                            value: `₹${earnings.toLocaleString('en-IN')}`,
                            icon: DollarSign,
                            gradient: 'from-emerald-500 to-teal-700',
                            delta: earnings > 0 ? 'earned' : null,
                        },
                        {
                            label: 'Active Students',
                            value: uniqueStudents.length,
                            icon: Users,
                            gradient: 'from-blue-500 to-indigo-700',
                            delta: uniqueStudents.length > 0 ? 'active' : null,
                        },
                        {
                            label: 'Pending Requests',
                            value: pending.length,
                            icon: Star,
                            gradient: pending.length > 0 ? 'from-rose-500 to-red-700' : 'from-amber-400 to-orange-600',
                            delta: pending.length > 0 ? 'needs action' : null,
                        },
                    ].map(({ label, value, icon: Icon, gradient, delta }) => (
                        <div key={label} className="relative overflow-hidden bg-[#0d1117] border border-white/8 rounded-2xl p-5 hover:border-white/20 transition-all group cursor-default">
                            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-500`} />
                            <div className="relative z-10">
                                <div className={`inline-flex p-2.5 rounded-xl mb-3 bg-gradient-to-br ${gradient} shadow-lg`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider mb-1">{label}</p>
                                <p className="text-2xl font-black text-white leading-none">{value}</p>
                                {delta && (
                                    <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        label === 'Pending Requests' && pending.length > 0
                                            ? 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                                            : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                                    }`}>
                                        {label === 'Pending Requests' && pending.length > 0 ? '!' : '↑'} {delta}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Main content ── */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-white/5 border border-white/8 rounded-xl w-fit">
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
                                    {tab.label}
                                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? 'bg-white/20' : 'bg-white/10 text-slate-400'}`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Upcoming */}
                        {activeTab === 'upcoming' && (
                            <div className="space-y-3">
                                {upcoming.length === 0 ? (
                                    <div className="bg-white/5 border border-white/8 rounded-2xl p-10 text-center">
                                        <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-500">No upcoming sessions scheduled.</p>
                                    </div>
                                ) : (
                                    upcoming.map(b => (
                                        <div key={b._id} className="bg-white/5 border border-white/8 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-violet-500/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-white text-lg uppercase shadow-lg shadow-violet-500/20 shrink-0">
                                                    {b.mentee?.firstName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{b.mentee?.firstName} {b.mentee?.lastName}</h3>
                                                    <p className="text-xs text-slate-400">{new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {b.time} · 1 hr</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleMessage(b.mentee?._id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:bg-white/10 transition-all">
                                                    <MessageSquare className="w-3.5 h-3.5" /> Message
                                                </button>
                                                <button onClick={() => navigate(`/video-call?room=${b._id}&name=${encodeURIComponent(b.mentee?.firstName || 'Student')}`)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all shadow-lg shadow-violet-500/20">
                                                    <Video className="w-3.5 h-3.5" /> Start
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Completed */}
                        {activeTab === 'completed' && (
                            <div className="space-y-3">
                                {completed.length === 0 ? (
                                    <div className="bg-white/5 border border-white/8 rounded-2xl p-10 text-center">
                                        <CheckCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-500">No completed sessions yet.</p>
                                    </div>
                                ) : (
                                    completed.map((b, i) => (
                                        <div key={b._id || i} className="bg-white/5 border border-white/8 rounded-xl p-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold uppercase text-slate-400 text-sm shrink-0">
                                                    {b.mentee?.firstName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white text-sm">{b.mentee?.firstName} {b.mentee?.lastName}</p>
                                                    <p className="text-xs text-slate-500">{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {b.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-emerald-400 font-semibold text-sm">+₹1,500</span>
                                                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">Done</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Students */}
                        {activeTab === 'students' && (
                            <div className="space-y-3">
                                {uniqueStudents.length === 0 ? (
                                    <div className="bg-white/5 border border-white/8 rounded-2xl p-10 text-center">
                                        <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-500">No students yet.</p>
                                    </div>
                                ) : (
                                    uniqueStudents.map(std => {
                                        const count = allBookings.filter(b => b.mentee?._id === std._id).length;
                                        const done = allBookings.filter(b => b.mentee?._id === std._id && (b.status === 'completed' || s.status === 'accepted' || isExpired(b))).length;
                                        return (
                                            <div key={std._id} className="bg-white/5 border border-white/8 rounded-xl p-4 flex items-center justify-between gap-3 hover:bg-blue-500/10 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-bold uppercase text-white text-sm shrink-0">
                                                        {std.firstName?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm">{std.firstName} {std.lastName}</p>
                                                        <p className="text-xs text-slate-500">{count} session{count !== 1 ? 's' : ''} · {done} completed</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => {
                                                        setActiveTab('assignments');
                                                        setIsCreateAssignmentOpen(true);
                                                        setNewAssignment(prev => ({ ...prev, mentee: std._id }));
                                                    }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-all">
                                                        <BookOpen className="w-3 h-3" /> Assign Task
                                                    </button>
                                                    <button onClick={() => handleMessage(std._id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition-all">
                                                        <MessageSquare className="w-3 h-3" /> Chat
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Assignments */}
                        {activeTab === 'assignments' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 border border-white/8 rounded-2xl p-5">
                                    <div>
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-amber-400" /> Student Assignments</h3>
                                        <p className="text-slate-400 text-sm mt-1">Assign tasks and grade submissions to boost student rank.</p>
                                    </div>
                                    <button onClick={() => setIsCreateAssignmentOpen(!isCreateAssignmentOpen)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm">
                                        {isCreateAssignmentOpen ? 'Close Form' : '+ New Assignment'}
                                    </button>
                                </div>

                                {isCreateAssignmentOpen && (
                                    <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                                        <h4 className="font-bold text-white">Create New Assignment</h4>
                                        <div>
                                            <label className="block text-slate-300 text-xs mb-1">Select Student</label>
                                            <select value={newAssignment.mentee} onChange={e => setNewAssignment({...newAssignment, mentee: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                                                <option value="">-- Choose Student --</option>
                                                {uniqueStudents.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-slate-300 text-xs mb-1">Title</label>
                                            <input value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="e.g. Build a React component" />
                                        </div>
                                        <div>
                                            <label className="block text-slate-300 text-xs mb-1">Description & Tasks</label>
                                            <textarea value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} rows={3} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 resize-none" placeholder="Provide detailed instructions..." />
                                        </div>
                                        <div>
                                            <label className="block text-slate-300 text-xs mb-1">Due Date</label>
                                            <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
                                        </div>
                                        <button onClick={handleCreateAssignment} className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors text-sm">Create & Assign</button>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {assignments.length === 0 ? (
                                        <div className="bg-white/5 border border-white/8 rounded-2xl p-10 text-center">
                                            <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-500">You haven&apos;t assigned any tasks yet.</p>
                                        </div>
                                    ) : (
                                        assignments.map(a => (
                                            <div key={a._id} className="bg-white/5 border border-white/8 rounded-xl p-5 hover:bg-amber-500/10 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                                <div>
                                                     <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${a.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : a.status === 'submitted' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                            {a.status}
                                                        </span>
                                                        <h3 className="font-bold text-white leading-none">{a.title}</h3>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mb-2 truncate max-w-md">{a.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                                        <span>Student: <span className="text-white font-medium">{a.mentee?.firstName} {a.mentee?.lastName}</span></span>
                                                        <span>Due: <span className="text-amber-400 font-medium">{new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
                                                    </div>
                                                    
                                                    {a.status !== 'pending' && a.submissionDetails && (
                                                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-xs">
                                                            <p className="text-slate-400 mb-1 font-semibold">Student Submission:</p>
                                                            {a.submissionDetails.startsWith('http') ? (
                                                                <a href={a.submissionDetails} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                                    <ExternalLink className="w-3 h-3" /> View Work Link
                                                                </a>
                                                            ) : (
                                                                <p className="text-slate-300 italic">"{a.submissionDetails}"</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {a.status === 'graded' && (
                                                        <div className="mt-3 flex items-center gap-3 text-xs">
                                                            <span className="flex items-center gap-1.5 focus:outline-none">
                                                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md font-bold">Score: {a.score}/100</span>
                                                                <span className="px-2 py-1 rounded-md bg-white/10 font-bold text-white border border-white/20">Grade: {a.grade || 'N/A'}</span>
                                                            </span>
                                                            {a.feedback && <span className="text-slate-400 italic flex-1">"{a.feedback}"</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {a.status === 'submitted' && (
                                                    <div className="flex flex-col gap-2 shrink-0">
                                                        {gradingId === a._id ? (
                                                            <div className="bg-slate-900/50 border border-violet-500/30 rounded-xl p-4 flex flex-col gap-3 min-w-[240px] animate-in slide-in-from-right duration-300">
                                                                <div>
                                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Score (0-100)</label>
                                                                    <input 
                                                                        type="number" 
                                                                        value={gradeForm.score}
                                                                        onChange={e => setGradeForm({...gradeForm, score: e.target.value})}
                                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                                                                        placeholder="85"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Feedback</label>
                                                                    <textarea 
                                                                        value={gradeForm.feedback}
                                                                        onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})}
                                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
                                                                        placeholder="Great work on the..."
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleGradeAssignment(a._id)}
                                                                        className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all"
                                                                    >
                                                                        Submit
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setGradingId(null)}
                                                                        className="px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-400 text-xs font-bold rounded-lg transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => {
                                                                    setGradingId(a._id);
                                                                    setGradeForm({ score: '', feedback: '' });
                                                                }} 
                                                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:scale-105 active:scale-95 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-500/25"
                                                            >
                                                                Grade Submission
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-5">
                        {/* Calendar */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-violet-400" /> Session Calendar
                            </h2>
                            <MiniCalendar bookingDates={bookingDates} />
                        </div>

                        {/* Pending requests */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-400" /> Pending Requests
                                </h2>
                                {pending.length > 0 && <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">{pending.length}</span>}
                            </div>
                            <div className="space-y-3">
                                {pending.length === 0 ? (
                                    <div className="bg-white/5 border border-white/8 rounded-xl p-5 text-center text-slate-500 text-sm">No pending requests.</div>
                                ) : (
                                    pending.map(b => (
                                        <div key={b._id} className="bg-white/5 border border-white/8 rounded-xl p-4">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold uppercase text-slate-400 text-sm shrink-0">
                                                    {b.mentee?.firstName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white text-sm">{b.mentee?.firstName} {b.mentee?.lastName}</p>
                                                    <p className="text-xs text-slate-500">{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {b.time}</p>
                                                </div>
                                            </div>
                                            {b.notes && <p className="text-xs text-slate-400 italic bg-white/5 p-2 rounded-lg mb-3">&quot;{b.notes}&quot;</p>}
                                            <div className="flex gap-2">
                                                <button onClick={() => handleRespond(b._id, 'accepted')}
                                                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all">Accept</button>
                                                <button onClick={() => handleRespond(b._id, 'rejected')}
                                                    className="flex-1 py-2 rounded-lg border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all">Decline</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
