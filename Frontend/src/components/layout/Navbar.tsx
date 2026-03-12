import { Link, useLocation } from 'react-router-dom';
import { ThemeToggler } from '../ui/ThemeToggler';
import { Button } from '../ui/Button';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    const navLinks = [
        { name: 'Find Mentors', path: '/mentors' },
        { name: 'About', path: '/about' },
        { name: 'Blog', path: '/blog' },
    ];

    const getDashboardPath = () => {
        if (!user) return '/';
        return `/dashboard/${user.role}`;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl saturate-150 shadow-sm border-b border-slate-200 dark:border-white/5 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="GuideMe" className="h-14 md:h-16 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
                    <span className="text-2xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-blue-500 to-teal-400 drop-shadow-sm hover:from-primary-500 hover:via-blue-400 hover:to-teal-300 transition-all duration-300">
                        GuideMe
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-primary-500 ${location.pathname === link.path
                                    ? 'text-primary-500'
                                    : 'text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-4">
                        <ThemeToggler />

                        {isAuthenticated && user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold overflow-hidden ring-2 ring-primary-500/20">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 overflow-hidden py-1 z-50">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <User size={16} /> My Profile
                                        </Link>
                                        <Link
                                            to={getDashboardPath()}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <LayoutDashboard size={16} /> Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-left"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggler />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-slate-600 dark:text-slate-300"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex flex-col gap-4 shadow-xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="text-slate-600 dark:text-slate-300 hover:text-primary-500 font-medium py-2"
                        >
                            {link.name}
                        </Link>
                    ))}
                    {isAuthenticated && user && (
                        <Link
                            to={getDashboardPath()}
                            onClick={() => setIsOpen(false)}
                            className="text-slate-600 dark:text-slate-300 hover:text-primary-500 font-medium py-2 flex items-center gap-2"
                        >
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                    )}
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {isAuthenticated ? (
                            <Button
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/10"
                                onClick={() => { logout(); setIsOpen(false); }}
                            >
                                <LogOut size={18} className="mr-2" /> Sign Out
                            </Button>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
