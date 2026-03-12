import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, DollarSign, TrendingUp, Calendar, MessageSquare, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MentorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [upcomingRes, historyRes] = await Promise.all([
                    api.get('/bookings/upcoming'),
                    api.get('/bookings/history')
                ]);
                setUpcomingBookings(upcomingRes.data.data);
                setSessions(historyRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleRespond = async (id: string, status: 'accepted' | 'rejected') => {
        try {
            await api.put(`/bookings/${id}/respond`, { status });
            // Refresh
            const [upcomingRes] = await Promise.all([
                api.get('/bookings/upcoming')
            ]);
            setUpcomingBookings(upcomingRes.data.data);
        } catch (error) {
            console.error('Failed to respond to booking', error);
            alert('Failed to respond to booking request');
        }
    };

    const handleMessage = async (menteeId: string) => {
        try {
            await api.post('/chat', { userId: menteeId });
            navigate('/chat');
        } catch (error) {
            console.error('Failed to initiate chat', error);
            alert('Failed to start a chat with the mentee.');
        }
    };

    const pendingBookings = upcomingBookings.filter(b => b.status === 'pending');
    const acceptedBookings = upcomingBookings.filter(b => b.status === 'accepted');

    const totalSessions = sessions.length;
    // Mock calculation for earnings: $120 per session avg
    const totalEarnings = totalSessions * 120;
    // Calculate active mentees by finding unique mentee IDs in the sessions/bookings
    const uniqueMentees = new Set([...upcomingBookings, ...sessions].map(b => b.mentee?._id || b.mentee)).size;

    if (isLoading) {
        return <div className="p-12 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome, {user?.firstName} 👋</h1>
                    <p className="text-slate-500 dark:text-slate-400">Overview of your mentoring activities and earnings.</p>
                </div>
                <Link to="/profile">
                    <Button variant="outline">Edit Profile</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Sessions</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSessions}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Earnings</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalEarnings.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Mentees</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueMentees}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Rating</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">4.9/5</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Sessions</h2>
                        <Button variant="ghost" size="sm">View Calendar</Button>
                    </div>

                    <div className="space-y-4">
                        {acceptedBookings.length === 0 ? (
                            <Card className="p-6 text-center text-slate-500">No accepted upcoming sessions.</Card>
                        ) : (
                            acceptedBookings.map((booking) => (
                                <Card key={booking._id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-primary-500/50 transition-colors">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xl text-slate-400 uppercase">
                                            {booking.mentee?.firstName?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{booking.mentee?.firstName} {booking.mentee?.lastName}</h3>
                                            <p className="text-sm text-slate-500 capitalize">Mentoring Session - {booking.status}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                        <div className="text-center sm:text-right w-full sm:w-auto">
                                            <p className="font-semibold text-slate-900 dark:text-white">{new Date(booking.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-slate-500">{booking.time}</p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleMessage(booking.mentee?._id)}><MessageSquare className="w-4 h-4" /></Button>
                                            <Button size="sm" onClick={() => navigate('/video-call')} className="w-full sm:w-auto flex items-center justify-center gap-2"><Video className="w-4 h-4" /> Start</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Requests</h2>
                    <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {pendingBookings.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm">No new requests pending.</div>
                        ) : (
                            pendingBookings.map((booking) => (
                                <div key={booking._id} className="p-5">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 uppercase">
                                            {booking.mentee?.firstName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                                {booking.mentee?.firstName} {booking.mentee?.lastName}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Requested session for {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                            </p>
                                            {booking.notes && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg italic">
                                                    "{booking.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="w-full" onClick={() => handleRespond(booking._id, 'accepted')}>Accept</Button>
                                        <Button size="sm" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400" onClick={() => handleRespond(booking._id, 'rejected')}>Decline</Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
