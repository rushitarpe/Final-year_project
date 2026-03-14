import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ResetPassword from '../pages/Auth/ResetPassword';
import MentorRegistration from '../pages/Auth/MentorRegistration';
import About from '../pages/About';
import Blog from '../pages/Blog';
import MentorListings from '../pages/MentorListings';
import MentorProfile from '../pages/MentorProfile';
import MenteeDashboard from '../pages/Dashboards/MenteeDashboard';
import MentorDashboard from '../pages/Dashboards/MentorDashboard';
import AdminDashboard from '../pages/Dashboards/AdminDashboard';
import Chat from '../pages/Chat';
import VideoCall from '../pages/VideoCall';
import Leaderboard from '../pages/Leaderboard';
import Profile from '../pages/Profile';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Landing />,
            },
            {
                path: 'about',
                element: <About />,
            },
            {
                path: 'blog',
                element: <Blog />,
            },
            {
                path: 'mentors',
                element: <MentorListings />,
            },
            {
                path: 'mentors/:id',
                element: <MentorProfile />,
            },
            {
                path: 'dashboard/mentee',
                element: <MenteeDashboard />,
            },
            {
                path: 'dashboard/mentor',
                element: <MentorDashboard />,
            },
            {
                path: 'dashboard/admin',
                element: <AdminDashboard />,
            },
            {
                path: 'chat',
                element: <Chat />,
            },
            {
                path: 'video-call',
                element: <VideoCall />,
            },
            {
                path: 'leaderboard',
                element: <Leaderboard />,
            },
            {
                path: 'login',
                element: <Login />,
            },
            {
                path: 'signup',
                element: <Signup />,
            },
            {
                path: 'reset-password/:token',
                element: <ResetPassword />,
            },
            {
                path: 'mentor/apply',
                element: <MentorRegistration />,
            },
            {
                path: 'profile',
                element: <Profile />,
            },
        ],
    },
]);
