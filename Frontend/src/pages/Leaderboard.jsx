import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Target, TrendingUp, Award, ChevronUp, Users, BookOpen, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import UserAvatar from '../components/ui/UserAvatar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RankIcon = ({ rank }) => {
    if (rank === 1) return <div className="w-11 h-11 bg-amber-400/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-amber-400/30"><Trophy className="w-6 h-6" /></div>;
    if (rank === 2) return <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center ring-1 ring-slate-400/20"><Medal className="w-6 h-6 text-slate-400" /></div>;
    if (rank === 3) return <div className="w-11 h-11 bg-orange-600/10 text-orange-600 rounded-2xl flex items-center justify-center ring-1 ring-orange-600/20"><Medal className="w-6 h-6 text-orange-700/70" /></div>;
    return <div className="w-11 h-11 rounded-2xl flex items-center justify-center"><span className="font-black text-slate-300 dark:text-slate-700 text-xl">{rank}</span></div>;
};

const rankRowCls = (rank, isMe) => {
    if (isMe) return 'bg-emerald-50/80 dark:bg-emerald-900/20 border-l-4 border-emerald-500';
    if (rank === 1) return 'bg-amber-50/60 dark:bg-amber-900/10';
    if (rank === 2) return 'bg-slate-50/80 dark:bg-slate-800/30';
    if (rank === 3) return 'bg-orange-50/60 dark:bg-orange-900/10';
    return '';
};


const Leaderboard = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('mentors');
    const [mentorData, setMentorData] = useState([]);
    const [menteeData, setMenteeData] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [mRes, eRes] = await Promise.all([
                    api.get('/leaderboard?role=mentor'),
                    api.get('/leaderboard?role=mentee'),
                ]);
                if (mRes.data.success) setMentorData(mRes.data.data);
                if (eRes.data.success) setMenteeData(eRes.data.data);

                if (user) {
                    const rRes = await api.get('/leaderboard/rank');
                    if (rRes.data.success) setMyRank(rRes.data.data);
                }
            } catch (err) {
                console.error('Leaderboard fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    const data = tab === 'mentors' ? mentorData : menteeData;
    const accentColor = tab === 'mentors' ? 'violet' : 'emerald';

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors duration-500 py-12 px-4 md:px-8 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-8">
                        <Trophy className="w-4 h-4" /> Platform Excellence
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">MentorConnect</span> Rankings
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Real rankings based on sessions, ratings, and engagement — updated live from our database.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <button onClick={() => setTab('mentors')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${tab === 'mentors' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            <Award className="w-4 h-4" /> Top Mentors
                        </button>
                        <button onClick={() => setTab('mentees')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${tab === 'mentees' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            <Users className="w-4 h-4" /> Top Mentees
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* My standing */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="flex items-center gap-5 mb-8 relative z-10">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${tab === 'mentors' ? 'from-violet-600 to-blue-600' : 'from-emerald-600 to-teal-600'} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Standing</h3>
                                        {myRank ? (
                                            <p className={`text-sm font-black ${tab === 'mentors' ? 'text-violet-600 dark:text-violet-400' : 'text-emerald-600 dark:text-emerald-400'} uppercase tracking-widest mt-1`}>
                                                Rank #{myRank.rank} · Level {myRank.level}
                                            </p>
                                        ) : (
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">
                                                {user ? 'Loading...' : 'Login to see your rank'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">XP Points</p>
                                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                                {myRank ? myRank.xpPoints.toLocaleString('en-IN') : '0'}
                                            </span>
                                        </div>
                                        {data.length > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Top Score</p>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                    {data[0]?.xpPoints?.toLocaleString('en-IN') || 0} pts
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${data.length > 0 && myRank ? Math.min((myRank.xpPoints / Math.max(data[0]?.xpPoints || 1, 1)) * 100, 100) : 2}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full bg-gradient-to-r ${tab === 'mentors' ? 'from-violet-500 to-blue-500' : 'from-emerald-500 to-teal-500'} rounded-full`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {user ? 'Complete sessions to earn XP and climb the ranks!' : 'Login to track your progress'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Earn XP */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-xl">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Earn XP Points
                                </h3>
                                <div className="space-y-6">
                                    {(tab === 'mentors' ? [
                                        { label: 'Complete a Session', pts: '+100', icon: '⚡' },
                                        { label: 'Get 5-Star Rating', pts: '+50', icon: '⭐' },
                                        { label: 'Quick Response (<1hr)', pts: '+25', icon: '🚀' },
                                        { label: 'Complete Profile', pts: '+500', icon: '💎' },
                                        { label: 'Grade an Assignment', pts: '+30', icon: '📝' },
                                    ] : [
                                        { label: 'Complete a Session', pts: '+100', icon: '⚡' },
                                        { label: 'Submit Assignment', pts: '+40', icon: '📝' },
                                        { label: 'Upload Resume', pts: '+50', icon: '📄' },
                                        { label: 'Give Feedback', pts: '+20', icon: '💬' },
                                        { label: 'Complete Profile', pts: '+200', icon: '💎' },
                                    ]).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl bg-slate-50 dark:bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center">{item.icon}</span>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                                            </div>
                                            <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${tab === 'mentors' ? 'text-violet-600 bg-violet-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>{item.pts}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Main Table */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                <Card className="overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl rounded-[2rem]">
                                    <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                        {tab === 'mentors'
                                            ? <><Award className="w-5 h-5 text-violet-500" /><span className="font-black text-slate-900 dark:text-white">Top Mentors by Impact</span></>
                                            : <><BookOpen className="w-5 h-5 text-emerald-500" /><span className="font-black text-slate-900 dark:text-white">Top Mentees by Progress</span></>}
                                        <span className="ml-auto text-xs font-bold text-slate-400">Live Data</span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>

                                    {isLoading ? (
                                        <div className="py-20 text-center">
                                            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-slate-400 text-sm">Loading rankings...</p>
                                        </div>
                                    ) : data.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <Zap className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">No rankings yet</p>
                                            <p className="text-slate-400 text-sm mt-1">Complete sessions to earn XP and appear here!</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                                        <th className="px-6 py-5 text-center w-16">Rank</th>
                                                        <th className="px-6 py-5">{tab === 'mentors' ? 'Mentor' : 'Mentee'}</th>
                                                        {tab === 'mentors' && <th className="px-6 py-5 text-center hidden md:table-cell">Category</th>}
                                                        {tab === 'mentors' && <th className="px-6 py-5 text-center hidden sm:table-cell">Rating</th>}
                                                        <th className="px-6 py-5 text-center hidden sm:table-cell">Sessions</th>
                                                        <th className="px-6 py-5 text-center hidden lg:table-cell">Streak</th>
                                                        <th className="px-6 py-5 text-right">XP</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                                                    {data.map((person) => {
                                                        const isMe = user && person._id?.toString() === user._id?.toString();
                                                        return (
                                                            <tr key={person._id || person.rank}
                                                                className={`group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all ${rankRowCls(person.rank, isMe)}`}>
                                                                <td className="px-6 py-5">
                                                                    <div className="flex justify-center"><RankIcon rank={person.rank} /></div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <UserAvatar
                                                                            src={person.profileImage}
                                                                            firstName={person.firstName}
                                                                            lastName={person.lastName}
                                                                            size="w-11 h-11"
                                                                            shape="rounded-2xl"
                                                                            className="text-sm"
                                                                        />
                                                                        <div>
                                                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                                                                {person.firstName} {person.lastName}
                                                                                {person.rank <= 3 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                                                                                {isMe && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black">YOU</span>}
                                                                            </h4>
                                                                            <p className="text-xs text-slate-400 font-medium">Level {person.level} · {person.badgesCount} badge{person.badgesCount !== 1 ? 's' : ''}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {tab === 'mentors' && (
                                                                    <td className="px-6 py-5 text-center hidden md:table-cell">
                                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{person.category || '—'}</span>
                                                                    </td>
                                                                )}
                                                                {tab === 'mentors' && (
                                                                    <td className="px-6 py-5 text-center hidden sm:table-cell">
                                                                        <span className="text-xs font-bold text-amber-600">
                                                                            {person.averageRating > 0 ? `⭐ ${person.averageRating.toFixed(1)}` : '—'}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                <td className="px-6 py-5 text-center hidden sm:table-cell">
                                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{person.completedSessions}</span>
                                                                </td>
                                                                <td className="px-6 py-5 text-center hidden lg:table-cell">
                                                                    <span className="text-sm font-bold text-orange-500">🔥 {person.streak}</span>
                                                                </td>
                                                                <td className="px-6 py-5 text-right">
                                                                    <span className={`font-black text-lg text-slate-900 dark:text-white`}>
                                                                        {person.xpPoints.toLocaleString('en-IN')}
                                                                    </span>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">XP</p>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 text-center">
                                        <p className="text-xs font-bold text-slate-400">Rankings are based on XP points earned from sessions, ratings, and engagement.</p>
                                    </div>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
