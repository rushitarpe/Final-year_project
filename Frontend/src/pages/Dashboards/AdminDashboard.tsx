import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Users, BookOpen, Activity, TrendingUp, Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';

const userGrowthData = [
    { name: 'Jan', mentees: 400, mentors: 240 },
    { name: 'Feb', mentees: 550, mentors: 290 },
    { name: 'Mar', mentees: 700, mentors: 350 },
    { name: 'Apr', mentees: 950, mentors: 410 },
    { name: 'May', mentees: 1200, mentors: 520 },
    { name: 'Jun', mentees: 1600, mentors: 680 },
];

const sessionData = [
    { name: 'Week 1', completed: 120, cancelled: 15 },
    { name: 'Week 2', completed: 180, cancelled: 22 },
    { name: 'Week 3', completed: 250, cancelled: 18 },
    { name: 'Week 4', completed: 310, cancelled: 25 },
];

const TopMentors = [
    { name: 'Sarah Chen', rating: 4.9, sessions: 450, revenue: '$54k' },
    { name: 'David Kumar', rating: 4.8, sessions: 310, revenue: '$27k' },
    { name: 'Elena Rodriguez', rating: 5.0, sessions: 890, revenue: '$133k' },
];

const AdminDashboard = () => {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Admin Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Platform performance and analytics at a glance.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Total Users', value: '12,840', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { title: 'Active Sessions', value: '842', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { title: 'Total Revenue', value: '$840.5k', icon: TrendingUp, color: 'text-primary-500', bg: 'bg-primary-500/10' },
                    { title: 'Course Completions', value: '4,520', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((kpi, i) => (
                    <Card key={i} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* User Growth Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Growth Overview</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMentees" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMentors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="mentees" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMentees)" />
                                <Area type="monotone" dataKey="mentors" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMentors)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Session Stats Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Session Completion Rates</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sessionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Tables & Lists */}
            <div className="grid grid-cols-1 gap-8">
                <Card className="overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Performing Mentors</h3>
                        <button className="text-sm text-primary-500 font-medium hover:text-primary-600">View All Report</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm">
                                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Rank</th>
                                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Mentor Name</th>
                                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Sessions Completed</th>
                                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Avg Rating</th>
                                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {TopMentors.map((mentor, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="p-4"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : 'bg-amber-100/50 text-amber-900'}`}>{i + 1}</span></td>
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">{mentor.name}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">{mentor.sessions}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 group">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold text-slate-900 dark:text-white">{mentor.rating}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-green-600 dark:text-green-400">{mentor.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

        </div>
    );
};

export default AdminDashboard;
