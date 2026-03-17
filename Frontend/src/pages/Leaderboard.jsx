import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Target, TrendingUp, Award, ChevronUp, Users, BookOpen } from 'lucide-react';
import { Card } from '../components/ui/Card';

const topMentors = [
    { rank: 1, name: 'Dr. Emily Chen', role: 'Senior AI Researcher', company: 'Google DeepMind', points: 4850, sessions: 124, rating: 4.9, badge: 'Diamond', trend: 'up', speciality: 'Machine Learning' },
    { rank: 2, name: 'Marcus Johnson', role: 'Staff Engineer', company: 'Google', points: 4210, sessions: 98, rating: 4.8, badge: 'Platinum', trend: 'up', speciality: 'System Design' },
    { rank: 3, name: 'Priya Sharma', role: 'Frontend Architect', company: 'Airbnb', points: 3890, sessions: 85, rating: 4.8, badge: 'Gold', trend: 'stable', speciality: 'React & UX' },
    { rank: 4, name: 'David Kim', role: 'Full Stack Lead', company: 'Meta', points: 3450, sessions: 72, rating: 4.7, badge: 'Gold', trend: 'up', speciality: 'Node.js & React' },
    { rank: 5, name: "Sarah O'Connor", role: 'Senior PM', company: 'Microsoft', points: 3120, sessions: 64, rating: 4.7, badge: 'Gold', trend: 'stable', speciality: 'Product Strategy' },
    { rank: 6, name: 'Arun Patel', role: 'Data Scientist', company: 'Netflix', points: 2890, sessions: 58, rating: 4.6, badge: 'Silver', trend: 'up', speciality: 'Python & ML' },
    { rank: 7, name: 'Lena Fischer', role: 'DevOps Lead', company: 'AWS', points: 2540, sessions: 51, rating: 4.6, badge: 'Silver', trend: 'stable', speciality: 'Cloud & Kubernetes' },
];

const topMentees = [
    { rank: 1, name: 'Rushikesh Tarpe', role: 'Final Year CSE Student', college: 'SPPU', points: 3200, sessions: 32, badge: 'Rising Star', trend: 'up', goal: 'Full Stack Dev' },
    { rank: 2, name: 'Ananya Iyer', role: 'B.Tech CS Graduate', college: 'IIT Bombay', points: 2850, sessions: 28, badge: 'Achiever', trend: 'up', goal: 'Product Management' },
    { rank: 3, name: 'Karan Mehta', role: 'MCA Student', college: 'DU', points: 2640, sessions: 24, badge: 'Achiever', trend: 'up', goal: 'Data Science' },
    { rank: 4, name: 'Divya Nair', role: 'CS Undergraduate', college: 'NIT Trichy', points: 2310, sessions: 21, badge: 'Explorer', trend: 'stable', goal: 'Machine Learning' },
    { rank: 5, name: 'Sahil Gupta', role: 'BSc IT Graduate', college: 'Mumbai University', points: 2100, sessions: 19, badge: 'Explorer', trend: 'up', goal: 'Cloud Engineering' },
    { rank: 6, name: 'Pooja Reddy', role: 'Engineering Student', college: 'JNTU', points: 1870, sessions: 16, badge: 'Starter', trend: 'up', goal: 'Frontend Dev' },
    { rank: 7, name: 'Ajay Verma', role: 'B.Tech ECE', college: 'VIT', points: 1590, sessions: 14, badge: 'Starter', trend: 'stable', goal: 'IoT & Embedded' },
];

const RankIcon = ({ rank }) => {
    if (rank === 1) return <div className="w-11 h-11 bg-amber-400/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-amber-400/30"><Trophy className="w-6 h-6" /></div>;
    if (rank === 2) return <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center ring-1 ring-slate-400/20"><Medal className="w-6 h-6 text-slate-400" /></div>;
    if (rank === 3) return <div className="w-11 h-11 bg-orange-600/10 text-orange-600 rounded-2xl flex items-center justify-center ring-1 ring-orange-600/20"><Medal className="w-6 h-6 text-orange-700/70" /></div>;
    return <div className="w-11 h-11 rounded-2xl flex items-center justify-center"><span className="font-black text-slate-300 dark:text-slate-700 text-xl">{rank}</span></div>;
};

const badgeColors = {
    Diamond: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Platinum: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    Gold: 'bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20',
    Silver: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    'Rising Star': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
    Achiever: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    Explorer: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    Starter: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

const Leaderboard = () => {
    const [tab, setTab] = useState('mentors');

    const data = tab === 'mentors' ? topMentors : topMentees;

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors duration-500 py-12 px-4 md:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-8"
                    >
                        <Trophy className="w-4 h-4" />
                        Platform Excellence
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">GuideMe</span> Rankings
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Celebrating the top performers on GuideMe — expert mentors and driven mentees accelerating careers together.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <button
                            onClick={() => setTab('mentors')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${tab === 'mentors'
                                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-md'
                                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Award className="w-4 h-4" />
                            Top Mentors
                        </button>
                        <button
                            onClick={() => setTab('mentees')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${tab === 'mentees'
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Top Mentees
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Stats Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-all" />
                                <div className="flex items-center gap-5 mb-8 relative z-10">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${tab === 'mentors' ? 'from-violet-600 to-blue-600' : 'from-emerald-600 to-teal-600'} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Your Standing</h3>
                                        <p className={`text-sm font-black ${tab === 'mentors' ? 'text-violet-600 dark:text-violet-400' : 'text-emerald-600 dark:text-emerald-400'} uppercase tracking-widest mt-1`}>New Member — 0 XP</p>
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Current XP</p>
                                            <span className="text-3xl font-black text-slate-900 dark:text-white">0</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">To First Rank</p>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">100 pts</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '2%' }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full bg-gradient-to-r ${tab === 'mentors' ? 'from-violet-500 to-blue-500' : 'from-emerald-500 to-teal-500'} rounded-full`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">Complete your first session to earn XP and climb the ranks!</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-xl">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Earn XP Points
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
                                    ]).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl bg-slate-50 dark:bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">{item.icon}</span>
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
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl rounded-[2rem]">
                                    <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                        {tab === 'mentors' ? (
                                            <><Award className="w-5 h-5 text-violet-500" /><span className="font-black text-slate-900 dark:text-white">Top Mentors by Impact</span></>
                                        ) : (
                                            <><BookOpen className="w-5 h-5 text-emerald-500" /><span className="font-black text-slate-900 dark:text-white">Top Mentees by Progress</span></>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                                    <th className="px-8 py-5 text-center w-20">Rank</th>
                                                    <th className="px-8 py-5">{tab === 'mentors' ? 'Mentor' : 'Mentee'}</th>
                                                    <th className="px-8 py-5 text-center hidden sm:table-cell">Badge</th>
                                                    <th className="px-8 py-5 text-right">Impact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                                                {data.map((person) => (
                                                    <tr key={person.rank} className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all">
                                                        <td className="px-8 py-6">
                                                            <div className="flex justify-center">
                                                                <RankIcon rank={person.rank} />
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 overflow-hidden flex-shrink-0">
                                                                    <span className="text-lg">{person.name[0]}</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm">
                                                                        {person.name}
                                                                        {person.rank <= 3 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                                                                    </h4>
                                                                    <p className="text-xs text-slate-500 font-medium">{person.role}</p>
                                                                    <p className="text-xs text-slate-400 font-medium">{tab === 'mentors' ? person.company : person.college}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 hidden sm:table-cell">
                                                            <div className="flex justify-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${badgeColors[person.badge] || badgeColors['Starter']}`}>
                                                                    <Award className="w-3 h-3" />
                                                                    {person.badge}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex flex-col items-end gap-0.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    {person.trend === 'up' && <ChevronUp className="w-4 h-4 text-emerald-500" />}
                                                                    <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{person.points.toLocaleString()}</span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{person.sessions} Sessions</span>
                                                                {tab === 'mentors' && <span className="text-[10px] text-amber-500 font-bold">⭐ {person.rating}</span>}
                                                                {tab === 'mentees' && <span className="text-[10px] text-blue-400 font-bold">🎯 {person.goal}</span>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 text-center">
                                        <p className="text-xs font-bold text-slate-400">Rankings update in real-time based on sessions completed, ratings, and engagement.</p>
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
