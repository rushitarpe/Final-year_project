import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Star, ChevronDown, X, Zap, Clock, Globe, BookOpen, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import UserAvatar from '../components/ui/UserAvatar';
import {
    MENTOR_CATEGORIES, SKILL_OPTIONS, LANGUAGES, EXPERIENCE_LEVELS,
    AVAILABLE_DAYS, SESSION_DURATIONS
} from '../utils/constants';


const BUDGET_MAX = 10000;

const MentorListings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [mentors, setMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [matchMode, setMatchMode] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [total, setTotal] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        category: '', skills: [], language: '', experienceLevel: '',
        maxBudget: BUDGET_MAX, sessionDuration: '', availableDays: [],
    });

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    const activeFiltersCount = [
        filters.category, filters.language, filters.experienceLevel,
        filters.maxBudget < BUDGET_MAX ? filters.maxBudget : null,
        filters.sessionDuration,
        ...filters.skills, ...filters.availableDays
    ].filter(Boolean).length;

    const fetchMentors = useCallback(async () => {
        setIsLoading(true);
        setMatchMode(false);
        try {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (filters.category) params.category = filters.category;
            if (filters.skills.length) params.skills = filters.skills.join(',');
            if (filters.language) params.language = filters.language;
            if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
            if (filters.maxBudget < BUDGET_MAX) params.maxBudget = filters.maxBudget;
            if (filters.sessionDuration) params.sessionDuration = filters.sessionDuration;
            if (filters.availableDays.length) params.availableDays = filters.availableDays.join(',');

            const res = await api.get('/mentors', { params });
            if (res.data.success) {
                setMentors(res.data.data);
                setTotal(res.data.total || res.data.data.length);
            }
        } catch (err) {
            toast.error('Failed to load mentors');
        } finally {
            setIsLoading(false);
        }
    }, [search, filters]);

    const aiMatch = async () => {
        if (!user || user.role !== 'mentee') {
            toast.error('Log in as a mentee to use AI matching');
            return;
        }
        setIsMatching(true);
        setIsLoading(true);
        try {
            const res = await api.get('/mentors/recommendations');
            if (res.data.success) {
                // New AI matching returns FLAT objects — mentor data + matchScore + matchReasons + tag merged in
                const matched = res.data.data.map(m => {
                    // Handle both old nested shape ({ mentor: {...}, matchScore }) and new flat shape
                    if (m.mentor && typeof m.mentor === 'object') {
                        return { ...m.mentor, matchScore: m.matchScore, matchReasons: m.matchReasons, tag: m.tag };
                    }
                    // New flat shape
                    return { ...m };
                }).filter(m => m._id); // drop any invalid entries
                setMentors(matched);
                setMatchMode(true);
                setTotal(matched.length);
                if (matched.length === 0) {
                    toast('No AI matches found yet — showing all mentors instead', { icon: 'ℹ️' });
                    fetchMentors();
                }
            }
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Matching failed. Try again.');
        } finally {
            setIsMatching(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchMentors, 350);
        return () => clearTimeout(t);
    }, [fetchMentors]);

    const clearAllFilters = () => {
        setFilters({ category: '', skills: [], language: '', experienceLevel: '', maxBudget: BUDGET_MAX, sessionDuration: '', availableDays: [] });
        setSearch('');
        setMatchMode(false);
    };

    const toggleArrayFilter = (key, val) =>
        setFilter(key, filters[key].includes(val) ? filters[key].filter(v => v !== val) : [...filters[key], val]);

    const price = (m) => m.sessionPrice || m.hourlyRate || 0;
    const rating = (m) => m.averageRating || m.rating || 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] pt-10 pb-20 px-4 md:px-8">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-black uppercase tracking-widest mb-5">
                        🔍 Browse Mentors
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">Perfect Mentor</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">{total} mentors ready to guide you</p>
                </div>

                {/* Search + AI Match */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-base font-medium shadow-sm"
                            placeholder="Search by name, skill, company..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={aiMatch} disabled={isMatching}
                        className="flex items-center justify-center gap-2 h-14 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/25 disabled:opacity-60 transition-all text-sm whitespace-nowrap">
                        <Zap className="w-4 h-4" />
                        {isMatching ? 'Matching...' : 'AI Match Me'}
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 h-14 px-5 rounded-2xl border font-bold text-sm transition-all ${showFilters ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}>
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-black flex items-center justify-center">{activeFiltersCount}</span>}
                    </button>
                </div>

                {/* Quick category pills */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {MENTOR_CATEGORIES.slice(0, 10).map(cat => (
                        <button key={cat} onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${filters.category === cat ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-violet-400'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex gap-8">
                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.aside initial={{ opacity: 0, x: -20, width: 0 }} animate={{ opacity: 1, x: 0, width: '280px' }} exit={{ opacity: 0, x: -20, width: 0 }} transition={{ duration: 0.3 }}
                                className="flex-shrink-0 w-[280px] overflow-hidden">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xl sticky top-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">Filters</h3>
                                        {activeFiltersCount > 0 && (
                                            <button onClick={clearAllFilters} className="text-xs text-violet-600 font-bold hover:text-violet-500">Clear all</button>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</p>
                                        <select className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 outline-none focus:ring-2 focus:ring-violet-500"
                                            value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                                            <option value="">All Categories</option>
                                            {MENTOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Language</p>
                                        <select className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 outline-none focus:ring-2 focus:ring-violet-500"
                                            value={filters.language} onChange={e => setFilter('language', e.target.value)}>
                                            <option value="">Any Language</option>
                                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>

                                    {/* Experience Level */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mentee Level</p>
                                        <div className="flex flex-col gap-1.5">
                                            {EXPERIENCE_LEVELS.map(lvl => (
                                                <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="expLevel" checked={filters.experienceLevel === lvl}
                                                        onChange={() => setFilter('experienceLevel', filters.experienceLevel === lvl ? '' : lvl)}
                                                        className="accent-violet-600 w-3.5 h-3.5" />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{lvl}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Session Duration */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Session Duration</p>
                                        <select className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 outline-none focus:ring-2 focus:ring-violet-500"
                                            value={filters.sessionDuration} onChange={e => setFilter('sessionDuration', e.target.value)}>
                                            <option value="">Any Duration</option>
                                            {SESSION_DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                                        </select>
                                    </div>

                                    {/* Budget Slider */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Max Budget (₹/session)</p>
                                        <input type="range" min="0" max={BUDGET_MAX} step="500" value={filters.maxBudget}
                                            onChange={e => setFilter('maxBudget', parseInt(e.target.value))}
                                            className="w-full accent-violet-600" />
                                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                                            <span>₹0</span><span className="font-bold text-violet-600">₹{filters.maxBudget.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {/* Available Days */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Available Days</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {AVAILABLE_DAYS.map(d => (
                                                <button key={d} onClick={() => toggleArrayFilter('availableDays', d)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${filters.availableDays.includes(d) ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'}`}>
                                                    {d.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Mentor Cards Grid */}
                    <div className="flex-1 min-w-0">
                        {matchMode && (
                            <div className="mb-6 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-500/30 rounded-2xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <Zap className="w-4 h-4 text-violet-600" />
                                    <p className="text-sm font-bold text-violet-700 dark:text-violet-300">Showing your AI-matched mentors, ranked by compatibility score</p>
                                </div>
                                <button onClick={fetchMentors} className="text-xs font-bold text-violet-600 hover:text-violet-500 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                ))}
                            </div>
                        ) : mentors.length === 0 ? (
                            <div className="text-center py-24">
                                <Search className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No mentors found</p>
                                <button onClick={clearAllFilters} className="mt-3 text-sm text-violet-600 font-bold hover:text-violet-500">Clear filters</button>
                            </div>
                        ) : (
                            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {mentors.map((mentor, i) => (
                                    <motion.div key={mentor._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                        <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                                            {/* Top color bar */}
                                            <div className="h-1.5 bg-gradient-to-r from-violet-600 to-blue-500 w-full" />

                                            {/* Match score badge */}
                                            {matchMode && mentor.matchScore != null && (
                                                <div className="absolute top-5 right-3 z-10">
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-600 text-white text-xs font-black shadow-lg">
                                                        <Zap className="w-3 h-3" /> {mentor.matchScore}% match
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-6 flex-1 flex flex-col">
                                                {/* Avatar + Name */}
                                                <div className="flex items-start gap-4 mb-5">
                                                    <UserAvatar
                                                        src={mentor.profileImage}
                                                        firstName={mentor.firstName}
                                                        lastName={mentor.lastName}
                                                        size="w-14 h-14"
                                                        shape="rounded-2xl"
                                                        className="text-xl"
                                                    />
                                                    <div className="min-w-0">
                                                        <h3 className="font-black text-slate-900 dark:text-white truncate text-base">
                                                            {mentor.firstName} {mentor.lastName}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{mentor.jobTitle}</p>
                                                        {mentor.company && (
                                                            <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold truncate">{mentor.company}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {mentor.category && (
                                                        <span className="px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold">{mentor.category}</span>
                                                    )}
                                                    {(mentor.skills || mentor.expertise || []).slice(0, 2).map(s => (
                                                        <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">{s}</span>
                                                    ))}
                                                    {(mentor.skills || mentor.expertise || []).length > 2 && (
                                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold">+{(mentor.skills || mentor.expertise || []).length - 2}</span>
                                                    )}
                                                </div>

                                                {/* Match reasons */}
                                                {matchMode && mentor.matchReasons?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {mentor.matchReasons.map(r => (
                                                            <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">{r}</span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Stats row */}
                                                <div className="mt-auto grid grid-cols-3 gap-0 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="text-center">
                                                        <p className="text-xs text-slate-400 mb-0.5">Price</p>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{price(mentor) === 0 ? 'Free' : `₹${price(mentor).toLocaleString('en-IN')}`}</p>
                                                    </div>
                                                    <div className="text-center border-x border-slate-100 dark:border-slate-800">
                                                        <p className="text-xs text-slate-400 mb-0.5">Rating</p>
                                                        <p className="text-sm font-black text-amber-500">{rating(mentor) > 0 ? `⭐ ${rating(mentor).toFixed(1)}` : '—'}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-slate-400 mb-0.5">Sessions</p>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{mentor.completedSessions || mentor.totalSessions || 0}</p>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={() => navigate(`/mentors/${mentor._id}`)}
                                                        className="flex-1 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:from-violet-500 hover:to-blue-500 transition-all shadow shadow-violet-500/20">
                                                        View Profile <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorListings;
