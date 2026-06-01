import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    Calendar, Clock, Video, Star, BookOpen, ChevronRight,
    Search, CheckCircle, ExternalLink, Zap, TrendingUp,
    AlertCircle, MessageSquare, X, Bot, Send, Trash2, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';

// ─── Session helpers ───────────────────────────────────────────────────────────
const getSessionWindow = (b) => {
    const [h, m] = (b.time || '00').split(':').map(Number);
    const start = new Date(b.date); start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end };
};
const isActive = (b) => { const { start, end } = getSessionWindow(b); const now = new Date(); return now >= start && now <= end; };
const isExpired = (b) => { const { end } = getSessionWindow(b); return new Date() > end; };

// ─── Active Session Live Banner ────────────────────────────────────────────────
const LiveBanner = ({ booking, onJoin }) => {
    const getLeft = () => {
        const { end } = getSessionWindow(booking);
        const ms = end.getTime() - Date.now();
        if (ms <= 0) return null;
        const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
        return `${m}m ${s}s`;
    };
    const [left, setLeft] = useState(getLeft());
    useEffect(() => { const t = setInterval(() => setLeft(getLeft()), 1000); return () => clearInterval(t); }, [booking]);

    return (
        <div className="relative overflow-hidden rounded-2xl mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-500/30 backdrop-blur-sm" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl" />
            <div className="relative z-10 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Session Live Now</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">with {booking.mentor?.firstName} {booking.mentor?.lastName}</h3>
                        {left && <p className="text-emerald-300/80 text-sm mt-0.5">⏱ {left} remaining</p>}
                    </div>
                    <button onClick={onJoin}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-emerald-500/30 shrink-0">
                        <Video className="w-4 h-4" /> Join Now
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <p className="text-[11px] font-semibold text-emerald-400/70 mb-2 uppercase tracking-wider">Quick Resources</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Take Notes', href: 'https://docs.google.com/document/create', icon: '📝' },
                            { label: 'Code Editor', href: 'https://codesandbox.io/', icon: '💻' },
                            { label: 'Whiteboard', href: 'https://excalidraw.com/', icon: '✏️' },
                            { label: 'Timer', href: 'https://cuckoo.team/', icon: '⏰' },
                        ].map(r => (
                            <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-emerald-400/30 rounded-lg text-xs text-white font-medium transition-all">
                                {r.icon} {r.label} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Tag colour map ───────────────────────────────────────────────────────────
const TAG_STYLES = {
    'Best Match':              'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Top Rated':               'bg-violet-500/20 text-violet-400 border-violet-500/30',
    'Budget Friendly':         'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Same Field':              'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Highly Experienced':      'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Career Switcher Friendly':'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

// ─── Mentor Card ──────────────────────────────────────────────────────────────
const MentorCard = ({ mentor }) => {
    const navigate = useNavigate();
    const score    = mentor.matchScore;
    const reasons  = mentor.matchReasons || [];
    const tag      = mentor.tag;
    const tagStyle = TAG_STYLES[tag] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';

    return (
        <div className="bg-white/5 border border-white/8 rounded-xl p-4 hover:bg-violet-500/10 transition-all group relative overflow-hidden">
            {/* Tag badge */}
            {tag && (
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyle}`}>
                    {tag}
                </span>
            )}

            <div className="flex items-start gap-3 mb-3">
                {/* Avatar with match score ring */}
                <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-white uppercase text-sm shadow-lg shadow-violet-500/20">
                        {mentor.profileImage && mentor.profileImage !== 'default.jpg'
                            ? <img src={mentor.profileImage} alt="" className="w-full h-full object-cover rounded-xl" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${mentor.firstName}+${mentor.lastName}&background=random`; }} />
                            : (mentor.firstName?.[0] || '?')}
                    </div>
                    {score != null && (
                        <span className="absolute -bottom-1.5 -right-1.5 text-[10px] font-black bg-violet-600 text-white rounded-full px-1.5 py-px shadow">
                            {score}%
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0 pr-14">
                    <p className="font-semibold text-white text-sm truncate">{mentor.firstName} {mentor.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{mentor.jobTitle || mentor.category || 'Mentor'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-slate-400">{(mentor.averageRating || mentor.rating || 0).toFixed(1)}</span>
                        {mentor.sessionPrice != null && (
                            <span className="text-xs text-slate-600 ml-2">
                                {mentor.sessionPrice === 0 ? '🆓 Free' : `₹${mentor.sessionPrice}`}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Match Reasons */}
            {reasons.length > 0 && (
                <ul className="mb-3 space-y-0.5">
                    {reasons.slice(0, 3).map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                            <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            {r}
                        </li>
                    ))}
                </ul>
            )}

            <button onClick={() => navigate(`/mentors/${mentor._id}`)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/20 text-xs font-semibold text-violet-300 transition-all">
                View Profile <ChevronRight className="w-3 h-3" />
            </button>
        </div>
    );
};

// ─── AI Chat Widget ───────────────────────────────────────────────────────────
const QUICK_REPLIES = [
    'How does AI Matching work?',
    'How do I book a session?',
    'Tips for my first session',
    'How to write a good goal?',
];

const AIChatWidget = ({ user }) => {
    const storageKey = `mentorbot_chat_${user?._id || 'guest'}`;

    const loadHistory = () => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    };

    const [isOpen, setIsOpen]       = useState(false);
    const [messages, setMessages]   = useState(loadHistory);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping]   = useState(false);
    const [error, setError]         = useState('');
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    // Persist messages
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40))); }
        catch { /* storage full */ }
    }, [messages, storageKey]);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
    }, [isOpen]);

    const sendMessage = useCallback(async (text) => {
        const trimmed = (text || inputText).trim();
        if (!trimmed || isTyping) return;

        setError('');
        setInputText('');

        const newMessages = [...messages, { role: 'user', content: trimmed }];
        setMessages(newMessages);
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chatbot/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ messages: newMessages.slice(-10), context: 'general' }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.');
                setMessages(newMessages); // remove user message on error? No — keep it
            } else {
                setMessages([...newMessages, { role: 'assistant', content: data.message }]);
            }
        } catch {
            setError('Network error — please check your connection.');
        } finally {
            setIsTyping(false);
        }
    }, [inputText, isTyping, messages]);

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem(storageKey);
        setError('');
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="border border-violet-500/20 rounded-2xl overflow-hidden bg-[#0d1117]">
            {/* Header — always visible */}
            <button
                onClick={() => setIsOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-500/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow shadow-violet-500/30">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white leading-none">MentorBot</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                            AI Assistant · Always online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hasMessages && (
                        <button
                            onClick={e => { e.stopPropagation(); clearChat(); }}
                            className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </div>
            </button>

            {/* Expandable Chat Body */}
            {isOpen && (
                <div className="border-t border-white/5">
                    {/* Messages area */}
                    <div className="h-64 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                        {!hasMessages && (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-xs text-slate-400 font-medium">Hi {user?.firstName || 'there'}! 👋</p>
                                <p className="text-[11px] text-slate-600 max-w-[180px]">I'm MentorBot — ask me anything about mentorship or your career goals.</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role !== 'user' && (
                                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mr-1.5 mt-0.5 shrink-0">
                                        <Bot className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                                    msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-sm'
                                        : 'bg-white/8 text-slate-200 border border-white/5 rounded-bl-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start items-end gap-1.5">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0">
                                    <Bot className="w-3 h-3 text-white" />
                                </div>
                                <div className="bg-white/8 border border-white/5 rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-[11px] text-red-400 flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Quick replies — only when no messages */}
                    {!hasMessages && !isTyping && (
                        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                            {QUICK_REPLIES.map(q => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    className="text-[10px] px-2.5 py-1 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 rounded-full transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input row */}
                    <div className="px-3 pb-3 flex items-center gap-2 border-t border-white/5 pt-2">
                        <input
                            ref={inputRef}
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder="Ask MentorBot..."
                            disabled={isTyping}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!inputText.trim() || isTyping}
                            className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow shadow-violet-500/20 shrink-0"
                        >
                            <Send className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const MenteeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [recommendedMentors, setRecommendedMentors] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mentorSearch, setMentorSearch] = useState('');

    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [complaintMentorId, setComplaintMentorId] = useState('');
    const [complaintSubject, setComplaintSubject] = useState('');
    const [complaintDesc, setComplaintDesc] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch all data points
                const [up, hist, chats, ment, recs, assign] = await Promise.all([
                    api.get('/bookings/upcoming').catch(() => ({ data: { data: [] } })),
                    api.get('/bookings/history').catch(() => ({ data: { data: [] } })),
                    api.get('/chat').catch(() => ({ data: [] })),
                    api.get('/mentors').catch(() => ({ data: { data: [] } })),
                    api.get('/mentors/recommendations').catch(() => ({ data: { data: [] } })),
                    api.get('/assignments').catch(() => ({ data: { data: [] } }))
                ]);

                setUpcomingBookings(up.data?.data || []);
                setSessions(hist.data?.data || []);
                setRecentChats(Array.isArray(chats.data) ? chats.data : []);
                setMentors(ment.data?.data || ment.data || []);
                // New AI matching returns flat objects with matchScore/matchReasons/tag already merged
                const recsData = recs.data?.data || [];
                setRecommendedMentors(recsData.map(m => m.mentor ? { ...m.mentor, matchScore: m.matchScore, matchReasons: m.matchReasons, tag: m.tag } : m));
                setAssignments(assign.data?.data || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this session?')) return;
        await api.put(`/bookings/${id}/cancel`);
        const res = await api.get('/bookings/upcoming');
        setUpcomingBookings(res.data.data || []);
    };

    const submitComplaint = async () => {
        if (!complaintMentorId || !complaintSubject || !complaintDesc) {
            return alert('Please fill all fields');
        }
        try {
            await api.post('/complaints', { 
                mentor: complaintMentorId, 
                subject: complaintSubject, 
                description: complaintDesc 
            });
            alert('Complaint submitted successfully to administration.');
            setIsComplaintModalOpen(false);
            setComplaintSubject('');
            setComplaintDesc('');
        } catch (err) {
            alert(err.response?.data?.message || 'Error submitting complaint. Ensure you have the right mentor ID.');
        }
    };

    const [submittingId, setSubmittingId] = useState(null);
    const [submissionVal, setSubmissionVal] = useState('');

    const handleAssignmentSubmit = async (assignmentId) => {
        if (!submissionVal) return alert('Please enter submission details or link');
        try {
            await api.put(`/assignments/${assignmentId}/submit`, { submissionDetails: submissionVal });
            alert('Assignment submitted successfully!');
            setAssignments(assignments.map(a => a._id === assignmentId ? { ...a, status: 'submitted', submissionDetails: submissionVal } : a));
            setSubmittingId(null);
            setSubmissionVal('');
        } catch (err) {
            alert(err.response?.data?.message || 'Error submitting assignment');
        }
    };

    const activeSession = upcomingBookings.find(b => b.status === 'accepted' && isActive(b));
    const futureBookings = upcomingBookings.filter(b => !isExpired(b));
    const completedCount = sessions.length + upcomingBookings.filter(b => isExpired(b) && b.status === 'accepted').length;
    const availableMentors = useMemo(() => {
        const q = mentorSearch.toLowerCase();
        return mentors.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || m.expertise?.join(' ').toLowerCase().includes(q));
    }, [mentors, mentorSearch]);

    // Calculate Rank based on rankScore or completed sessions
    const rankScore = user?.rankScore || 0;
    let rankBadge = { label: 'Bronze', color: 'text-amber-600', gradient: 'from-amber-600 to-amber-800', icon: '🥉' };
    if (rankScore >= 50 || completedCount > 5) rankBadge = { label: 'Silver', color: 'text-slate-300', gradient: 'from-slate-400 to-slate-600', icon: '🥈' };
    if (rankScore >= 150 || completedCount > 15) rankBadge = { label: 'Gold', color: 'text-amber-400', gradient: 'from-amber-400 to-yellow-600', icon: '🥇' };
    if (rankScore >= 300) rankBadge = { label: 'Platinum', color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500', icon: '💎' };

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading your journey...</p>
            </div>
        </div>
    );

    return (
        <div className="text-white">
            <div className="max-w-7xl mx-auto">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-700 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-violet-500/20">
                            {user?.firstName?.[0] || 'S'}
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">Student Dashboard</p>
                            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName} 👋</h1>
                        </div>
                    </div>
                    <Link to="/mentors">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-violet-500/20">
                            <Zap className="w-4 h-4" /> Find a Mentor
                        </button>
                    </Link>
                </div>

                {/* ── Live session banner ── */}
                {activeSession && (
                    <LiveBanner booking={activeSession} onJoin={() => navigate(`/video-call?room=${activeSession._id}&name=${encodeURIComponent(activeSession.mentor?.firstName || 'Mentor')}`)} />
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: 'Sessions Done',
                            value: completedCount,
                            icon: CheckCircle,
                            gradient: 'from-violet-500 to-purple-700',
                            glow: 'violet',
                            delta: completedCount > 0 ? `+${completedCount}` : null,
                        },
                        {
                            label: 'XP Points',
                            value: rankScore,
                            icon: Zap,
                            gradient: 'from-amber-400 to-orange-600',
                            glow: 'amber',
                            delta: rankScore > 0 ? 'earned' : null,
                        },
                        {
                            label: 'Rank',
                            value: `${rankBadge.icon} ${rankBadge.label}`,
                            icon: TrendingUp,
                            gradient: rankBadge.gradient,
                            glow: 'emerald',
                            delta: null,
                        },
                        {
                            label: 'Upcoming',
                            value: futureBookings.length,
                            icon: Calendar,
                            gradient: 'from-blue-500 to-indigo-700',
                            glow: 'blue',
                            delta: futureBookings.length > 0 ? 'scheduled' : 'none',
                        },
                    ].map(({ label, value, icon: Icon, gradient, glow, delta }) => (
                        <div key={label} className="relative overflow-hidden bg-[#0d1117] border border-white/8 rounded-2xl p-5 hover:border-white/20 transition-all group cursor-default">
                            {/* Glow orb */}
                            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-500`} />
                            <div className="relative z-10">
                                <div className={`inline-flex p-2.5 rounded-xl mb-3 bg-gradient-to-br ${gradient} shadow-lg`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider mb-1">{label}</p>
                                <p className="text-2xl font-black text-white leading-none">{value}</p>
                                {delta && (
                                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                                        ↑ {delta}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Main ── */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Upcoming */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-violet-400" /> Upcoming Sessions
                            </h2>
                            {futureBookings.length === 0 ? (
                                <div className="bg-white/5 border border-white/8 rounded-2xl p-10 text-center">
                                    <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm mb-3">No upcoming sessions scheduled.</p>
                                    <Link to="/mentors">
                                        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold text-white transition-all">Book a Session</button>
                                    </Link>
                                </div>
                            ) : (
                                futureBookings.map(b => {
                                    const live = isActive(b);
                                    return (
                                        <div key={b._id} className={`bg-white/5 border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 transition-all ${live ? 'border-emerald-500/40 bg-emerald-900/10' : 'border-white/8 hover:bg-violet-500/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg uppercase shrink-0 shadow-lg ${live ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-gradient-to-br from-violet-500 to-purple-700 shadow-violet-500/20'}`}>
                                                    {b.mentor?.firstName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-sm">
                                                        {live && <span className="text-xs text-emerald-400 font-bold mr-1.5 animate-pulse">🟢 LIVE</span>}
                                                        with {b.mentor?.firstName} {b.mentor?.lastName}
                                                    </h3>
                                                    <p className="text-xs text-slate-400">{new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {b.time} · 1 hr</p>
                                                    <span className={`text-[11px] font-medium ${b.status === 'accepted' ? 'text-emerald-400' : 'text-amber-400'}`}>{b.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {b.status === 'accepted' && (
                                                    <button onClick={() => navigate(`/video-call?room=${b._id}&name=${encodeURIComponent(b.mentor?.firstName || 'Mentor')}`)}
                                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all ${live ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/20'}`}>
                                                        <Video className="w-3.5 h-3.5" /> {live ? 'Rejoin' : 'Join'}
                                                    </button>
                                                )}
                                                {b.status === 'pending' && (
                                                    <button onClick={() => handleCancel(b._id)}
                                                        className="px-3 py-2 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all">
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Assignments */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-400" /> My Assignments
                            </h2>
                            {assignments.length === 0 ? (
                                <div className="bg-white/5 border border-white/8 rounded-2xl p-6 text-center">
                                    <p className="text-slate-500 text-sm">No assignments from your mentors right now.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {assignments.map(a => (
                                        <div key={a._id} className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-violet-500/10 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${a.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : a.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                        {a.status}
                                                    </span>
                                                    <h3 className="font-bold text-white leading-none">{a.title}</h3>
                                                </div>
                                                <p className="text-sm text-slate-400 mb-2">{a.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span>By: {a.mentor?.firstName} {a.mentor?.lastName}</span>
                                                    <span>Due: <span className="text-amber-400 font-medium">{new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
                                                    {a.score !== undefined && (
                                                        <span className="flex items-center gap-1.5 focus:outline-none">
                                                            <span className="text-emerald-400 font-bold">Score: {a.score}/100</span>
                                                            <span className="px-2 py-0.5 rounded bg-white/10 font-bold text-white border border-white/20">Grade {a.grade || 'N/A'}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {a.status === 'pending' && (
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    {submittingId === a._id ? (
                                                        <div className="bg-slate-900/50 border border-violet-500/30 rounded-xl p-4 flex flex-col gap-3 min-w-[240px] animate-in slide-in-from-right duration-300">
                                                            <div>
                                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Submission Link / Details</label>
                                                                <textarea 
                                                                    value={submissionVal}
                                                                    onChange={e => setSubmissionVal(e.target.value)}
                                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
                                                                    placeholder="Enter your GitHub link or solution..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => handleAssignmentSubmit(a._id)}
                                                                    className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all"
                                                                >
                                                                    Submit
                                                                </button>
                                                                <button 
                                                                    onClick={() => setSubmittingId(null)}
                                                                    className="px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-400 text-xs font-bold rounded-lg transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setSubmittingId(a._id);
                                                                setSubmissionVal('');
                                                            }} 
                                                            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-violet-500/20"
                                                        >
                                                            Submit Work
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past sessions */}
                        {sessions.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Completed Sessions
                                </h2>
                                <div className="bg-white/5 border border-white/8 rounded-2xl divide-y divide-white/5">
                                    {sessions.slice(0, 4).map(s => (
                                        <div key={s._id} className="p-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center font-bold uppercase text-slate-500 text-sm shrink-0">
                                                {s.mentor?.firstName?.[0] || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white">with {s.mentor?.firstName} {s.mentor?.lastName}</p>
                                                <p className="text-xs text-slate-500">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">✓ Done</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-5">
                        {/* Recommended Mentors */}
                        {recommendedMentors.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    AI Recommended
                                    <span className="text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30 px-1.5 py-0.5 rounded-full font-bold">AI</span>
                                </h2>
                                <div className="space-y-3">
                                    {recommendedMentors.slice(0, 3).map(m => <MentorCard key={m._id} mentor={m} />)}
                                </div>
                                <Link to="/mentors" className="block mt-2">
                                    <button className="w-full py-2 border border-violet-500/20 rounded-xl text-xs text-violet-400 hover:bg-violet-500/10 transition-colors">Browse All Mentors</button>
                                </Link>
                            </div>
                        )}

                        {/* Available Mentors */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-violet-400" /> Available Mentors
                            </h2>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                                <input value={mentorSearch} onChange={e => setMentorSearch(e.target.value)}
                                    placeholder="Search mentors..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors" />
                            </div>
                            <div className="space-y-3">
                                {availableMentors.length === 0 ? (
                                    <div className="bg-white/5 border border-white/8 rounded-xl p-5 text-center">
                                        <p className="text-slate-500 text-sm">{mentorSearch ? 'No mentors match your search.' : 'No mentors available.'}</p>
                                        <Link to="/mentors" className="block mt-2">
                                            <button className="w-full py-2 border border-white/10 rounded-lg text-xs text-slate-400 hover:bg-white/5 transition-colors">Browse All Mentors</button>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {availableMentors.slice(0, 3).map(m => <MentorCard key={m._id} mentor={m} />)}
                                        {availableMentors.length > 3 && (
                                            <Link to="/mentors">
                                                <button className="w-full py-2.5 border border-violet-500/20 rounded-xl text-xs font-semibold text-violet-400 hover:bg-violet-500/10 transition-all">
                                                    View All {availableMentors.length} Mentors
                                                </button>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent messages */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-300 mb-2">Recent Messages</h2>
                            <div className="bg-white/5 border border-white/8 rounded-xl divide-y divide-white/5">
                                {recentChats.length === 0 ? (
                                    <div className="p-5 text-center text-sm text-slate-500">No messages yet.</div>
                                ) : (
                                    recentChats.slice(0, 3).map(chat => {
                                        const other = chat.users?.find((u) => u._id !== user?._id);
                                        return (
                                            <div key={chat._id} className="p-3 flex items-center gap-2.5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate('/chat')}>
                                                <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-slate-400 uppercase text-sm overflow-hidden">
                                                    {other?.profileImage ? <img src={other.profileImage} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${other.firstName}+${other.lastName}&background=random`; }} /> : (other?.firstName?.[0] || '?')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">{other?.firstName || 'User'} {other?.lastName || ''}</p>
                                                    <p className="text-xs text-slate-500 truncate">{chat.latestMessage?.content || 'Say hello!'}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div className="p-3 text-center">
                                    <Link to="/chat">
                                        <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">View All Messages →</button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ── AI MentorBot Chat Widget ── */}
                        <AIChatWidget user={user} />

                        {/* Complaint Box */}
                        <div className="pt-2 border-t border-white/10">
                            <button onClick={() => setIsComplaintModalOpen(true)} className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-semibold text-red-400 transition-all flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Report an Issue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaint Modal */}
            {isComplaintModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> File a Complaint</h3>
                            <button onClick={() => setIsComplaintModalOpen(false)} className="p-1 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <p className="text-slate-400">Complaints are strictly confidential and only visible to Administrative staff.</p>
                            <div>
                                <label className="block text-slate-300 mb-1">Select Mentor</label>
                                <select value={complaintMentorId} onChange={e => setComplaintMentorId(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500">
                                    <option value="">-- Choose Mentor --</option>
                                    {mentors.map(m => (
                                        <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1">Subject</label>
                                <input value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)} placeholder="E.g., Inappropriate behavior" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1">Description</label>
                                <textarea value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} placeholder="Provide detailed information..." rows={4} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 resize-none"></textarea>
                            </div>
                            <button onClick={submitComplaint} className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20 mt-2">
                                Submit Complaint
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenteeDashboard;
