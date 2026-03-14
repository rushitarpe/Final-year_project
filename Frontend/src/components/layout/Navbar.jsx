import { Link, useLocation } from 'react-router-dom';
import { ThemeToggler } from '../ui/ThemeToggler';
import { Button } from '../ui/Button';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Find Mentors', path: '/mentors' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'About', path: '/about' },
    ];

    const getDashboardPath = () => {
        if (!user) return '/';
        return `/dashboard/${user.role}`;
    };

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 border-b ${
                scrolled 
                    ? 'py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-lg shadow-black/5' 
                    : 'py-5 bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                        Guide<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500">Me</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all relative group ${
                                location.pathname === link.path
                                    ? 'text-violet-600 dark:text-violet-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                        >
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div 
                                    layoutId="nav-underline"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500"
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="hidden md:flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-4">
                    <ThemeToggler />

                    {isAuthenticated && user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl transition-all border ${
                                    isProfileOpen 
                                        ? 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/20' 
                                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold overflow-hidden ring-2 ring-violet-500/20">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} />
                                    )}
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{user.firstName}</span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden py-2 z-50 backdrop-blur-xl"
                                    >
                                        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
                                            <p className="text-sm font-black text-slate-900 dark:text-white capitalize leading-none mb-1">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                                            >
                                                <User size={18} className="text-slate-400" /> My Profile
                                            </Link>
                                            <Link
                                                to={getDashboardPath()}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                                            >
                                                <LayoutDashboard size={18} className="text-slate-400" /> Dashboard
                                            </Link>
                                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsProfileOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-left"
                                                >
                                                    <LogOut size={18} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="font-bold">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="sm" className="rounded-xl px-6 bg-gradient-to-r from-violet-600 to-blue-600 border-none shadow-lg shadow-violet-500/20">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-3">
                    <ThemeToggler />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 px-6 py-6 overflow-hidden shadow-2xl"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-bold text-slate-700 dark:text-slate-300"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {isAuthenticated && user && (
                                <Link
                                    to={getDashboardPath()}
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-bold text-violet-600 dark:text-violet-400 flex items-center gap-2"
                                >
                                    <LayoutDashboard size={20} /> Dashboard
                                </Link>
                            )}
                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                                {isAuthenticated ? (
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 border-red-100 dark:border-red-900/20 rounded-xl"
                                        onClick={() => { logout(); setIsOpen(false); }}
                                    >
                                        <LogOut size={18} className="mr-2" /> Sign Out
                                    </Button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                                            <Button variant="outline" className="w-full rounded-xl">Login</Button>
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full">
                                            <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 border-none shadow-lg shadow-violet-500/20">Sign Up</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

