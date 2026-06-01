import { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Activity, TrendingUp, BookOpen, ArrowUp, ArrowDown,
    Star, MoreHorizontal, Search, Bell, Settings, Download, UserCheck, Clock, Trash2, AlertTriangle, FileText
} from 'lucide-react';
import api from '../../services/api';

// ─── Static data ──────────────────────────────────────────────────────────────
const userGrowthData = [
    { month: 'Jan', mentees: 400, mentors: 240 },
    { month: 'Feb', mentees: 300, mentors: 139 },
    { month: 'Mar', mentees: 200, mentors: 980 },
    { month: 'Apr', mentees: 278, mentors: 390 },
    { month: 'May', mentees: 189, mentors: 480 },
    { month: 'Jun', mentees: 239, mentors: 380 },
    { month: 'Jul', mentees: 349, mentors: 430 },
];

const sessionData = [
    { week: 'W1', completed: 65, cancelled: 12 },
    { week: 'W2', completed: 88, cancelled: 18 },
    { week: 'W3', completed: 72, cancelled: 9 },
    { week: 'W4', completed: 95, cancelled: 15 },
];

const pieData = [
    { name: 'Technology', value: 45, color: '#6366f1' },
    { name: 'Business', value: 25, color: '#10b981' },
    { name: 'Design', value: 20, color: '#f59e0b' },
    { name: 'Other', value: 10, color: '#8b5cf6' },
];

const recentActivity = [
    { text: 'New mentor registered', time: '2m ago', color: 'bg-purple-500' },
    { text: 'Session completed by John', time: '15m ago', color: 'bg-green-500' },
    { text: 'New report flagged for review', time: '32m ago', color: 'bg-red-500' },
    { text: 'Revenue milestone: ₹8.4L reached', time: '1h ago', color: 'bg-amber-500' },
    { text: 'New student batch joined', time: '2h ago', color: 'bg-blue-500' },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 shadow-2xl border border-slate-800 rounded-xl p-3 backdrop-blur-md">
            <p className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-widest">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-4 mt-1">
                    <span className="text-slate-300 text-sm">{p.name}:</span>
                    <span className="text-white text-sm font-bold" style={{ color: p.color }}>{p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, change, icon: Icon, gradient }) => (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-slate-800/40 border border-white/5 backdrop-blur-sm group hover:bg-slate-800/60 transition-all duration-300">
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity`} />
        <div className="relative z-10">
            <div className={`inline-flex p-3 rounded-xl ${gradient} mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(change)}% vs last month
            </div>
        </div>
    </div>
);

// ─── Main Admin Dashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [realStats, setRealStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [mentors, setMentors] = useState([]);
    const [mentees, setMentees] = useState([]);
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mentorsRes, menteesRes, complaintsRes, analyticsRes] = await Promise.all([
                    api.get('/mentors').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/mentees').catch(() => ({ data: { data: [] } })),
                    api.get('/complaints').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/analytics').catch(() => ({ data: { data: {} } }))
                ]);
                setMentors(mentorsRes.data?.data || []);
                setMentees(menteesRes.data?.data || []);
                setComplaints(complaintsRes.data?.data || []);
                setRealStats(analyticsRes.data?.data || {});
            } catch (err) {
                console.error('Error fetching admin data', err);
            }
        };
        fetchData();
    }, []);

    const handleWarnMentor = async (id) => {
        const message = window.prompt("Enter warning message for mentor:");
        if (!message) return;
        try {
            await api.post(`/admin/mentors/${id}/warn`, { message });
            alert('Warning sent successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error warning mentor');
        }
    };

    const handleDeleteMentor = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this mentor?")) return;
        try {
            await api.delete(`/admin/mentors/${id}`);
            alert('Mentor deleted');
            setMentors(mentors.filter(m => m._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting mentor');
        }
    };

    return (
        <div className="text-white selection:bg-indigo-500/30">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2 uppercase tracking-[0.2em] font-bold">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            Live System Status
                        </div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Platform Analytics</h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                placeholder="Search everything..." 
                                className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none w-64 transition-all" 
                            />
                        </div>
                        <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors relative">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-3 mb-10 border-b border-slate-800/50 pb-6">
                    {['overview', 'mentors', 'mentees', 'complaints'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setActiveTab(t)}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl capitalize transition-all duration-300 ${
                                activeTab === t 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95' 
                                : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard title="Total Users" value={(realStats?.totalUsers || 0).toLocaleString()} change={12} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
                            <KPICard title="Total Mentors" value={(realStats?.totalMentors || 0).toLocaleString()} change={8} icon={Activity} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
                            <KPICard title="Total Sessions" value={(realStats?.totalSessions || 0).toLocaleString()} change={15} icon={TrendingUp} gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
                            <KPICard title="Revenue" value={`₹${(realStats?.revenue || 0).toLocaleString('en-IN')}`} change={22} icon={TrendingUp} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-slate-800/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold">User Acquisition</h3>
                                        <p className="text-slate-500 text-sm">Monthly growth metrics</p>
                                    </div>
                                    <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
                                        <Download className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={userGrowthData}>
                                            <defs>
                                                <linearGradient id="gMentees" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gMentors" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="mentees" stroke="#6366f1" strokeWidth={3} fill="url(#gMentees)" />
                                            <Area type="monotone" dataKey="mentors" stroke="#10b981" strokeWidth={3} fill="url(#gMentors)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-xl font-bold mb-1">Topic Distribution</h3>
                                <p className="text-slate-500 text-sm mb-8">Popular categories</p>
                                <div className="h-60">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={pieData} 
                                                innerRadius={60} 
                                                outerRadius={85} 
                                                paddingAngle={8} 
                                                dataKey="value" 
                                                stroke="none"
                                            >
                                                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3 mt-4">
                                    {pieData.map(item => (
                                        <div key={item.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                                <span className="text-sm text-slate-400">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-bold">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Table Preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-slate-800/20 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                                <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="text-xl font-bold">Top Mentors</h3>
                                    <button onClick={() => setActiveTab('mentors')} className="text-indigo-400 text-sm font-bold hover:underline">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-slate-500 uppercase text-[10px] tracking-[0.2em] font-black border-b border-slate-800">
                                                <th className="px-8 py-4 text-left">Mentor</th>
                                                <th className="px-8 py-4 text-left">Category</th>
                                                <th className="px-8 py-4 text-left">Sessions</th>
                                                <th className="px-8 py-4 text-left">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {mentors.slice(0, 4).map((m, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
                                                                {m.firstName?.[0]}
                                                            </div>
                                                            <span className="font-bold">{m.firstName} {m.lastName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-slate-400">{m.category || 'Engineering'}</td>
                                                    <td className="px-8 py-5 font-medium">{m.totalSessions || 0}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                            <span className="font-black text-white">{m.rating || '5.0'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-xl font-bold mb-6">System Log</h3>
                                <div className="space-y-6">
                                    {recentActivity.map((item, i) => (
                                        <div key={i} className="flex gap-4 relative group">
                                            {i !== recentActivity.length - 1 && (
                                                <div className="absolute top-8 left-1.5 w-0.5 h-10 bg-slate-800" />
                                            )}
                                            <div className={`w-3 h-3 rounded-full ${item.color} mt-1 blur-[2px]`} />
                                            <div className="space-y-1">
                                                <p className="text-slate-300 text-sm font-medium">{item.text}</p>
                                                <p className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mentors' && (
                    <div className="bg-slate-800/20 border border-slate-800 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                        <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-2xl font-bold">Mentor Directory</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{mentors.length} Total</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 uppercase text-[10px] tracking-[0.2em] font-black border-b border-slate-800">
                                        <th className="px-8 py-4 text-left">Basic info</th>
                                        <th className="px-8 py-4 text-left">Professional</th>
                                        <th className="px-8 py-4 text-left">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {mentors.map((m) => (
                                        <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white">{m.firstName} {m.lastName}</span>
                                                    <span className="text-xs text-slate-500">{m.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{m.jobTitle}</span>
                                                    <span className="text-xs text-indigo-400">{m.company}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {m.warnings?.length > 0 ? (
                                                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                                                        {m.warnings.length} Warnings
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleWarnMentor(m._id)}
                                                        className="p-2 hover:bg-amber-500/10 text-slate-500 hover:text-amber-500 rounded-xl border border-transparent hover:border-amber-500/20 transition-all"
                                                        title="Warn Mentor"
                                                    >
                                                        <AlertTriangle className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteMentor(m._id)}
                                                        className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                                                        title="Delete Mentor"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'mentees' && (
                    <div className="bg-slate-800/20 border border-slate-800 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                        <div className="p-8 border-b border-slate-800">
                            <h3 className="text-2xl font-bold">Student Directory</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 uppercase text-[10px] tracking-[0.2em] font-black border-b border-slate-800">
                                        <th className="px-8 py-4 text-left">Student</th>
                                        <th className="px-8 py-4 text-left">Email</th>
                                        <th className="px-8 py-4 text-left">Registration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {mentees.map((m) => (
                                        <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5 font-bold text-white">{m.firstName} {m.lastName}</td>
                                            <td className="px-8 py-5 text-slate-400">{m.email}</td>
                                            <td className="px-8 py-5 text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'complaints' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <div className="p-4 flex items-center justify-between">
                            <h3 className="text-2xl font-bold">Unresolved Complaints</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full" />
                                <span className="text-sm font-bold text-red-500 uppercase tracking-widest">{complaints.length} Priority</span>
                            </div>
                        </div>
                        
                        {complaints.length === 0 ? (
                            <div className="p-20 bg-slate-800/10 border border-dashed border-slate-800 rounded-3xl text-center">
                                <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">All clear! No pending complaints found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {complaints.map((c, i) => (
                                    <div key={i} className="bg-slate-800/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm hover:border-red-500/30 transition-all">
                                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                                        Urgent
                                                    </span>
                                                    <h4 className="text-xl font-bold text-white">{c.subject}</h4>
                                                </div>
                                                <p className="text-slate-400 text-sm leading-relaxed">{c.description}</p>
                                            </div>
                                            <div className="shrink-0">
                                                <button 
                                                    onClick={() => setActiveTab('mentors')}
                                                    className="px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                                                >
                                                    Audit Mentor
                                                </button>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Reporter</p>
                                                <p className="text-xs font-bold">{c.mentee?.firstName} {c.mentee?.lastName}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Target Mentor</p>
                                                <p className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-amber-400">
                                                    {c.mentor?.firstName} {c.mentor?.lastName}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Timestamp</p>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
