import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Target, TrendingUp, Award } from 'lucide-react';
import { Card } from '../components/ui/Card';

const topMentors = [
    { rank: 1, name: 'Elena Rodriguez', role: 'Lead UX @ Airbnb', points: 14500, sessions: 890, badge: 'Diamond' },
    { rank: 2, name: 'Sarah Chen', role: 'Staff Eng @ Google', points: 12400, sessions: 450, badge: 'Platinum' },
    { rank: 3, name: 'David Kumar', role: 'Product @ Stripe', points: 9800, sessions: 310, badge: 'Gold' },
    { rank: 4, name: 'Michael Chang', role: 'Data Sci @ Meta', points: 8500, sessions: 280, badge: 'Silver' },
    { rank: 5, name: 'Jessica Smith', role: 'Engineering Mgr', points: 7200, sessions: 210, badge: 'Bronze' }
];

const Leaderboard = () => {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-yellow-400/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <Trophy className="w-10 h-10" />
                </motion.div>
                <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
                    Global Leaderboard
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Recognizing our most dedicated mentors who are actively shaping the future of technology.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Stats Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-primary-500/10 to-blue-600/10 border-primary-500/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Your Rank</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Top 15%</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Current Points</span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">2,450</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Next Tier: Gold</span>
                                <span className="font-medium text-slate-900 dark:text-white">3,000</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-primary-500 w-[80%]" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            How to Earn Points
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">Complete 1hr session</span>
                                <span className="font-bold text-green-500">+100</span>
                            </li>
                            <li className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">Receive 5-star rating</span>
                                <span className="font-bold text-green-500">+50</span>
                            </li>
                            <li className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">Respond within 2hrs</span>
                                <span className="font-bold text-green-500">+25</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">Profile completion</span>
                                <span className="font-bold text-green-500">+500</span>
                            </li>
                        </ul>
                    </Card>
                </div>

                {/* Main Leaderboard */}
                <div className="flex-1">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm">
                                        <th className="p-5 font-medium border-b border-slate-200 dark:border-slate-800 w-24 text-center">Rank</th>
                                        <th className="p-5 font-medium border-b border-slate-200 dark:border-slate-800">Mentor</th>
                                        <th className="p-5 font-medium border-b border-slate-200 dark:border-slate-800 text-center">Tier</th>
                                        <th className="p-5 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {topMentors.map((mentor, i) => (
                                        <motion.tr
                                            key={mentor.rank}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                        >
                                            <td className="p-5 text-center">
                                                {mentor.rank === 1 ? (
                                                    <div className="w-10 h-10 mx-auto bg-yellow-400/20 text-yellow-500 rounded-full flex items-center justify-center">
                                                        <Trophy className="w-5 h-5" />
                                                    </div>
                                                ) : mentor.rank === 2 ? (
                                                    <div className="w-10 h-10 mx-auto bg-slate-300/20 text-slate-400 rounded-full flex items-center justify-center">
                                                        <Medal className="w-5 h-5" />
                                                    </div>
                                                ) : mentor.rank === 3 ? (
                                                    <div className="w-10 h-10 mx-auto bg-amber-600/20 text-amber-600 rounded-full flex items-center justify-center">
                                                        <Medal className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-slate-500 text-lg">{mentor.rank}</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src="/mentors/mentor-placeholder.png"
                                                        alt={mentor.name}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary-500 transition-all"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                            {mentor.name}
                                                            {mentor.rank <= 3 && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                                                        </h4>
                                                        <p className="text-sm text-slate-500">{mentor.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${mentor.badge === 'Diamond' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800' :
                                                    mentor.badge === 'Platinum' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-300 dark:border-slate-700' :
                                                        mentor.badge === 'Gold' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-800' :
                                                            'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    <Award className="w-3.5 h-3.5" />
                                                    {mentor.badge}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <span className="font-bold text-xl text-slate-900 dark:text-white mb-0.5 block">{mentor.points.toLocaleString()}</span>
                                                <span className="text-xs text-slate-500">{mentor.sessions} sessions</span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
