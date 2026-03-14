import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Target, TrendingUp, Award, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';

const topMentors = [
    { rank: 1, name: 'Elena Rodriguez', role: 'Lead UX @ Airbnb', points: 4850, sessions: 124, badge: 'Diamond', trend: 'up' },
    { rank: 2, name: 'Sarah Chen', role: 'Staff Eng @ Google', points: 4210, sessions: 98, badge: 'Platinum', trend: 'up' },
    { rank: 3, name: 'David Kumar', role: 'Product @ Stripe', points: 3890, sessions: 85, badge: 'Gold', trend: 'down' },
    { rank: 4, name: 'Michael Chang', role: 'Data Sci @ Meta', points: 3450, sessions: 72, badge: 'Gold', trend: 'up' },
    { rank: 5, name: 'Jessica Smith', role: 'Engineering Mgr', points: 3120, sessions: 64, badge: 'Gold', trend: 'stable' }
];

const Leaderboard = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors duration-500 py-12 px-4 md:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header section with glassmorphism */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-8"
                    >
                        <Trophy className="w-4 h-4" />
                        Platform Excellence
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">Mentorship</span> Rankings
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Honoring the top 1% of experts who are accelerating careers and defining the next generation of tech talent.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Stats Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-all" />
                                
                                <div className="flex items-center gap-5 mb-8 relative z-10">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Your Standing</h3>
                                        <p className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-1">Top 15% Worldwide</p>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Current XP</p>
                                            <span className="text-3xl font-black text-slate-900 dark:text-white">2,450</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">To Next Level</p>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">550 pts</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: '80%' }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            <span>Pro Tier</span>
                                            <span>Elite Tier</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-xl">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Growth Engine
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Session Completion', pts: '+100', icon: '⚡' },
                                        { label: 'Perfect Rating', pts: '+50', icon: '⭐' },
                                        { label: 'Response Speed', pts: '+25', icon: '🚀' },
                                        { label: 'Full Profile', pts: '+500', icon: '💎' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center group cursor-default">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg opacity-80 group-hover:scale-125 transition-transform">{item.icon}</span>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors group-hover:text-slate-900 dark:group-hover:text-white">{item.label}</span>
                                            </div>
                                            <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">{item.pts}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Main Leaderboard */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl rounded-[2rem]">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                                <th className="px-8 py-6 text-center w-24">Rank</th>
                                                <th className="px-8 py-6">Mentor</th>
                                                <th className="px-8 py-6 text-center">Identity</th>
                                                <th className="px-8 py-6 text-right">Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                                            {topMentors.map((mentor) => (
                                                <tr key={mentor.rank} className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all">
                                                    <td className="px-8 py-7">
                                                        <div className="flex justify-center">
                                                            {mentor.rank === 1 ? (
                                                                <div className="w-11 h-11 bg-amber-400/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-amber-400/30">
                                                                    <Trophy className="w-6 h-6" />
                                                                </div>
                                                            ) : mentor.rank === 2 ? (
                                                                <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center ring-1 ring-slate-400/20">
                                                                    <Medal className="w-6 h-6 text-slate-400" />
                                                                </div>
                                                            ) : mentor.rank === 3 ? (
                                                                <div className="w-11 h-11 bg-orange-600/10 text-orange-600 rounded-2xl flex items-center justify-center ring-1 ring-orange-600/20">
                                                                    <Medal className="w-6 h-6 text-orange-700/70" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center">
                                                                    <span className="font-black text-slate-300 dark:text-slate-700 text-xl">{mentor.rank}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-slate-400 dark:text-slate-600 overflow-hidden ring-4 ring-transparent group-hover:ring-primary-500/10 transition-all">
                                                                <span className="text-xl">{mentor.name[0]}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                                    {mentor.name}
                                                                    {mentor.rank <= 3 && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{mentor.role}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="flex justify-center">
                                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${
                                                                mentor.badge === 'Diamond' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                                mentor.badge === 'Platinum' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' :
                                                                'bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20'
                                                            }`}>
                                                                <Award className="w-3.5 h-3.5" />
                                                                {mentor.badge}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2">
                                                                {mentor.trend === 'up' && <ChevronUp className="w-4 h-4 text-emerald-500" />}
                                                                <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{mentor.points.toLocaleString()}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">{mentor.sessions} SESSIONS</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-8 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 text-center">
                                    <button className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary-500 transition-colors">
                                        View Full Global Rankings
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

