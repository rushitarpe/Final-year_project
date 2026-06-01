import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/ui/UserAvatar';
import {
    LayoutDashboard, Users, MessageSquare, Trophy, Settings,
    LogOut, ChevronLeft, Menu, X, Search, Bell, Shield,
    BarChart2, FileText, Star, User, Home, BookOpen,
    Calendar, UserCheck, ClipboardList
} from 'lucide-react';


// ── Role-based nav config ────────────────────────────────────────
const NAV = {
    mentee: [
        {
            section: 'MAIN',
            items: [
                { to: '/dashboard/mentee', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/mentors',          icon: Search,           label: 'Find Mentors' },
                { to: '/chat',             icon: MessageSquare,    label: 'Messages' },
            ]
        },
        {
            section: 'EXPLORE',
            items: [
                { to: '/leaderboard',      icon: Trophy,    label: 'Leaderboard' },
            ]
        },
        {
            section: 'ACCOUNT',
            items: [
                { to: '/profile',          icon: User,      label: 'My Profile' },
                { to: '/profile',          icon: Settings,  label: 'Settings' },
            ]
        },
    ],
    mentor: [
        {
            section: 'MAIN',
            items: [
                { to: '/dashboard/mentor', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/chat',             icon: MessageSquare,   label: 'Messages' },
            ]
        },
        {
            section: 'EXPLORE',
            items: [
                { to: '/leaderboard',      icon: Trophy,   label: 'Leaderboard' },
            ]
        },
        {
            section: 'ACCOUNT',
            items: [
                { to: '/profile',          icon: User,     label: 'My Profile' },
                { to: '/profile',          icon: Settings, label: 'Settings' },
            ]
        },
    ],
    admin: [
        {
            section: 'OVERVIEW',
            items: [
                { to: '/dashboard/admin',               icon: LayoutDashboard, label: 'Dashboard' },
            ]
        },
        {
            section: 'MANAGE',
            items: [
                { to: '/dashboard/admin?tab=mentees',   icon: Users,         label: 'Users' },
                { to: '/dashboard/admin?tab=mentors',   icon: UserCheck,     label: 'Mentors' },
                { to: '/dashboard/admin?tab=sessions',  icon: Calendar,      label: 'Sessions' },
            ]
        },
        {
            section: 'ANALYTICS',
            items: [
                { to: '/dashboard/admin?tab=analytics', icon: BarChart2,     label: 'Analytics' },
                { to: '/dashboard/admin?tab=reports',   icon: FileText,      label: 'Reports' },
            ]
        },
        {
            section: 'ACCOUNT',
            items: [
                { to: '/profile',                       icon: Settings,      label: 'Settings' },
            ]
        },
    ],
};

const ROLE_BADGE = {
    mentee: { label: 'Student', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    mentor: { label: 'Mentor',  color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    admin:  { label: 'Admin',   color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

// ── Single nav link ──────────────────────────────────────────────
const SideLink = ({ item, collapsed, onClick }) => (
    <NavLink
        to={item.to}
        state={item.state}
        onClick={onClick}
        end={item.to === '/dashboard/mentee' || item.to === '/dashboard/mentor' || item.to === '/dashboard/admin'}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
             ${isActive
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/6 border border-transparent'
            } ${collapsed ? 'justify-center' : ''}`
        }
    >
        {({ isActive }) => (
            <>
                {/* Active left-border accent */}
                {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-400" />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-white'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {/* Tooltip when collapsed */}
                {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0d1117] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl transition-opacity">
                        {item.label}
                    </div>
                )}
            </>
        )}
    </NavLink>
);

// ── Section label ────────────────────────────────────────────────
const SectionLabel = ({ label, collapsed }) =>
    collapsed ? <div className="my-2 border-t border-white/8" /> : (
        <p className="px-3 pt-4 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 select-none">
            {label}
        </p>
    );

// ── Logo component ───────────────────────────────────────────────
const SidebarLogo = ({ collapsed }) => (
    <Link to="/" className="flex items-center gap-2.5 group min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/35 transition-shadow">
            <img src="/logo.png" alt="GuideMe" className="w-5 h-5 object-contain filter invert opacity-90" />
        </div>
        {!collapsed && (
            <span className="text-lg font-black tracking-tighter text-white truncate">
                Guide<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Me</span>
            </span>
        )}
    </Link>
);

// ── Main Layout ──────────────────────────────────────────────────
const DashboardLayout = () => {
    const { user, logout, isInitializing } = useAuth();
    const navigate   = useNavigate();
    const location   = useLocation();
    const [collapsed, setCollapsed]   = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    // Show spinner while auth is resolving
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    const role      = user?.role || 'mentee';
    const sections  = NAV[role] || NAV.mentee;
    const badge     = ROLE_BADGE[role] || ROLE_BADGE.mentee;
    const initials  = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';

    // ── Sidebar content (shared desktop + mobile) ────────────────
    const SidebarContent = ({ mobile = false }) => (
        <div className="flex flex-col h-full">
            {/* Logo + collapse button */}
            <div className={`flex items-center ${collapsed && !mobile ? 'justify-center' : 'justify-between'} px-4 py-4 border-b border-white/8`}>
                <SidebarLogo collapsed={collapsed && !mobile} />
                {!mobile && (
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="p-1.5 rounded-lg hover:bg-white/8 text-slate-500 hover:text-white transition-colors flex-shrink-0 ml-2"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                )}
                {mobile && (
                    <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Nav sections */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
                {sections.map((section, si) => (
                    <div key={si}>
                        <SectionLabel label={section.section} collapsed={collapsed && !mobile} />
                        {section.items.map((item, ii) => (
                            <SideLink
                                key={ii}
                                item={item}
                                collapsed={collapsed && !mobile}
                                onClick={mobile ? () => setMobileOpen(false) : undefined}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom: user card + home + logout */}
            <div className="border-t border-white/8 px-3 py-3 space-y-1">
                {/* User info card */}
                <div
                    className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}
                    onClick={() => navigate('/profile')}
                >
                    <UserAvatar
                        src={user?.profileImage}
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        size="w-9 h-9"
                        shape="rounded-full"
                        className="ring-2 ring-violet-500/20 text-xs cursor-pointer"
                    />
                    {(!collapsed || mobile) && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${badge.color}`}>
                                {badge.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Go to Home */}
                <Link
                    to="/"
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-colors border border-transparent hover:border-white/10 ${collapsed && !mobile ? 'justify-center' : ''}`}
                    title="Go to Home"
                >
                    <Home className="w-4 h-4 flex-shrink-0" />
                    {(!collapsed || mobile) && <span>Go to Home</span>}
                </Link>

                {/* Logout */}
                <button
                    onClick={logout}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {(!collapsed || mobile) && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#080c14] text-white flex">

            {/* ── Desktop Sidebar ── */}
            <motion.aside
                animate={{ width: collapsed ? 68 : 240 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col flex-shrink-0 bg-[#0d1117] border-r border-white/8 fixed top-0 left-0 h-full z-30 overflow-hidden"
            >
                <SidebarContent />
            </motion.aside>

            {/* ── Mobile Sidebar Overlay ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="fixed top-0 left-0 h-full w-64 bg-[#0d1117] border-r border-white/8 z-50 lg:hidden flex flex-col"
                        >
                            <SidebarContent mobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main Content (desktop) ── */}
            <motion.div
                animate={{ marginLeft: collapsed ? 68 : 240 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col flex-1 min-w-0"
            >
                {/* Desktop top bar */}
                <header className="sticky top-0 z-20 bg-[#080c14]/80 backdrop-blur-xl border-b border-white/8 px-6 py-3.5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black capitalize">{role} Portal</p>
                        <h2 className="text-sm font-bold text-white leading-none mt-0.5">Welcome back, {user?.firstName} 👋</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-white/8 text-slate-500 hover:text-white transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                        </button>
                            <UserAvatar
                                src={user?.profileImage}
                                firstName={user?.firstName}
                                lastName={user?.lastName}
                                size="w-8 h-8"
                                shape="rounded-full"
                                className="ring-2 ring-violet-500/20 hover:ring-violet-500/40 transition-all cursor-pointer text-xs"
                            />
                    </div>
                </header>
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </motion.div>

            {/* ── Mobile layout ── */}
            <div className="flex flex-col flex-1 min-w-0 lg:hidden">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-20 bg-[#080c14]/90 backdrop-blur-xl border-b border-white/8 px-4 py-3 flex items-center justify-between gap-3">
                    <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                    <SidebarLogo collapsed={false} />
                    <UserAvatar
                        src={user?.profileImage}
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        size="w-8 h-8"
                        shape="rounded-full"
                        className="cursor-pointer text-xs"
                    />
                </header>

                <main className="flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>

                {/* Mobile bottom navigation */}
                <nav className="border-t border-white/8 bg-[#0d1117] px-2 py-2 flex justify-around">
                    {(sections[0]?.items || []).slice(0, 4).map((item, i) => (
                        <NavLink
                            key={i}
                            to={item.to}
                            end={item.to.includes('dashboard')}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'}`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[9px] font-bold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default DashboardLayout;
