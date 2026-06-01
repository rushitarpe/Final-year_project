import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

// ── Lazy-loaded pages ─────────────────────────────────────────────
const Landing           = lazy(() => import('../pages/Landing'));
const Login             = lazy(() => import('../pages/Auth/Login'));
const Signup            = lazy(() => import('../pages/Auth/Signup'));
const ResetPassword     = lazy(() => import('../pages/Auth/ResetPassword'));
const MentorRegistration= lazy(() => import('../pages/Auth/MentorRegistration'));
const About             = lazy(() => import('../pages/About'));
const Blog              = lazy(() => import('../pages/Blog'));
const MentorListings    = lazy(() => import('../pages/MentorListings'));
const MentorProfile     = lazy(() => import('../pages/MentorProfile'));
const MenteeDashboard   = lazy(() => import('../pages/Dashboards/MenteeDashboard'));
const MentorDashboard   = lazy(() => import('../pages/Dashboards/MentorDashboard'));
const AdminDashboard    = lazy(() => import('../pages/Dashboards/AdminDashboard'));
const Chat              = lazy(() => import('../pages/Chat'));
const VideoCall         = lazy(() => import('../pages/VideoCall'));
const Leaderboard       = lazy(() => import('../pages/Leaderboard'));
const Profile           = lazy(() => import('../pages/Profile'));
const MenteeOnboarding  = lazy(() => import('../pages/MenteeOnboarding'));

// ── Loading spinner ───────────────────────────────────────────────
const PageSpinner = () => (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
);

// ── Route guards ──────────────────────────────────────────────────
// These components use hooks so they must be React components, not
// used directly inside createBrowserRouter. We use wrapper elements.
const ProtectedElement = ({ element }) => {
    const { isAuthenticated, isInitializing } = useAuth();
    if (isInitializing) return <PageSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return element;
};

const PublicElement = ({ element }) => {
    const { isAuthenticated, isInitializing, user } = useAuth();
    if (isInitializing) return <PageSpinner />;
    if (isAuthenticated && user) {
        return <Navigate to={`/dashboard/${user.role}`} replace />;
    }
    return element;
};

// ── Router ────────────────────────────────────────────────────────
export const router = createBrowserRouter([

    // ── Public / Marketing (with top nav) ─────────────────────────
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true,                   element: <Suspense fallback={<PageSpinner />}><Landing /></Suspense> },
            { path: 'about',                 element: <Suspense fallback={<PageSpinner />}><About /></Suspense> },
            { path: 'blog',                  element: <Suspense fallback={<PageSpinner />}><Blog /></Suspense> },
            { path: 'mentors',               element: <Suspense fallback={<PageSpinner />}><MentorListings /></Suspense> },
            { path: 'mentors/:id',           element: <Suspense fallback={<PageSpinner />}><MentorProfile /></Suspense> },
            { path: 'leaderboard',           element: <Suspense fallback={<PageSpinner />}><Leaderboard /></Suspense> },
            {
                path: 'login',
                element: <Suspense fallback={<PageSpinner />}>
                    <PublicElement element={<Login />} />
                </Suspense>
            },
            {
                path: 'signup',
                element: <Suspense fallback={<PageSpinner />}>
                    <PublicElement element={<Signup />} />
                </Suspense>
            },
            { path: 'reset-password/:token', element: <Suspense fallback={<PageSpinner />}><ResetPassword /></Suspense> },
            { path: 'mentor/apply',          element: <Suspense fallback={<PageSpinner />}><MentorRegistration /></Suspense> },
        ],
    },

    // ── Protected app pages (sidebar layout, pathless wrapper) ────
    {
        element: <DashboardLayout />,
        children: [
            {
                path: '/dashboard/mentee',
                element: <Suspense fallback={<PageSpinner />}>
                    <ProtectedElement element={<MenteeDashboard />} />
                </Suspense>
            },
            {
                path: '/dashboard/mentor',
                element: <Suspense fallback={<PageSpinner />}>
                    <ProtectedElement element={<MentorDashboard />} />
                </Suspense>
            },
            {
                path: '/dashboard/admin',
                element: <Suspense fallback={<PageSpinner />}>
                    <ProtectedElement element={<AdminDashboard />} />
                </Suspense>
            },
            {
                path: '/chat',
                element: <Suspense fallback={<PageSpinner />}>
                    <ProtectedElement element={<Chat />} />
                </Suspense>
            },
            {
                path: '/profile',
                element: <Suspense fallback={<PageSpinner />}>
                    <ProtectedElement element={<Profile />} />
                </Suspense>
            },
        ],
    },

    // ── Full-screen standalone pages ──────────────────────────────
    { path: '/video-call',         element: <Suspense fallback={<PageSpinner />}><VideoCall /></Suspense> },
    { path: '/mentee/onboarding',  element: <Suspense fallback={<PageSpinner />}><MenteeOnboarding /></Suspense> },
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
});
