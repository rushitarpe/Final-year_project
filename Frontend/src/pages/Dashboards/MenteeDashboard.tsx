import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Video, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const MenteeDashboard = () => {
    const { user } = useAuth();
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [upcomingRes, historyRes, chatsRes] = await Promise.all([
                    api.get('/bookings/upcoming'),
                    api.get('/bookings/history'),
                    api.get('/chat')
                ]);
                setUpcomingBookings(upcomingRes.data.data);
                setSessions(historyRes.data.data);
                setRecentChats(chatsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleCancel = async (id: string) => {
        if (!window.confirm('Are you sure you want to cancel this session?')) return;
        try {
            await api.put(`/bookings/${id}/cancel`);
            // Refresh data
            const res = await api.get('/bookings/upcoming');
            setUpcomingBookings(res.data.data);
        } catch (error) {
            console.error('Failed to cancel booking', error);
            alert('Failed to cancel session');
        }
    };

    const totalHours = sessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60;

    if (isLoading) {
        return <div className="p-12 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome back, {user?.firstName} 👋</h1>
                    <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your learning journey.</p>
                </div>
                <Link to="/mentors">
                    <Button>Find a Mentor</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Mentoring Hours</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalHours.toFixed(1)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed Sessions</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Current Rank</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.length > 5 ? 'Gold' : 'Silver'}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Sessions</h2>

                    {upcomingBookings.length === 0 ? (
                        <Card className="p-6 text-center text-slate-500">No upcoming sessions. Book a mentor to get started!</Card>
                    ) : (
                        upcomingBookings.map((booking) => (
                            <Card key={booking._id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-l-primary-500 mb-4">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xl text-slate-400 uppercase">
                                        {booking.mentor?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Mentoring Session</h3>
                                        <p className="text-sm text-slate-500">with {booking.mentor?.firstName} {booking.mentor?.lastName}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                    <div className="text-center sm:text-right w-full sm:w-auto">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {new Date(booking.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-slate-500">{booking.time}</p>
                                        <p className="text-xs text-slate-400 mt-1 capitalize">Status: {booking.status}</p>
                                    </div>
                                    {booking.status === 'accepted' && (
                                        <Button className="w-full sm:w-auto flex items-center justify-center gap-2" onClick={() => window.open(booking.meetingLink || '/video-call', '_blank')}>
                                            <Video className="w-4 h-4" /> Join Call
                                        </Button>
                                    )}
                                    {booking.status === 'pending' && (
                                        <Button variant="outline" className="w-full sm:w-auto text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleCancel(booking._id)}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Messages</h2>
                    <Card className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentChats.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm">No recent messages.</div>
                        ) : (
                            recentChats.slice(0, 3).map((chat) => {
                                const otherUser = chat.users?.find((u: any) => u._id !== user?._id);
                                return (
                                    <div key={chat._id} className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => window.location.href = '/chat'}>
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 uppercase overflow-hidden">
                                            {otherUser?.profileImage ? (
                                                <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                otherUser?.firstName?.[0] || '?'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                    {chat.isGroupChat ? chat.chatName : `${otherUser?.firstName || 'User'} ${otherUser?.lastName || ''}`}
                                                </p>
                                                {chat.latestMessage && (
                                                    <p className="text-xs text-slate-500 shrink-0 ml-2">
                                                        {new Date(chat.latestMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {chat.latestMessage?.content || 'Started a new chat'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
                            <Link to="/chat">
                                <Button variant="ghost" size="sm" className="w-full text-primary-500">View All Messages</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MenteeDashboard;
