import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import { HeroGlobe } from '../components/3d/HeroGlobe';
import { Particles } from '../components/3d/Particles';
import { Link } from 'react-router-dom';
import {
    Zap, Video, Calendar, Star, ArrowRight, CheckCircle, Globe,
    TrendingUp, Users, Shield, ChevronRight, Sparkles, User
} from 'lucide-react';

const words = ['Mentor', 'Builder', 'Success', 'Network'];

const TypingWord = () => {
    const [idx, setIdx] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const word = words[idx];
        if (!deleting && displayed.length < word.length) {
            const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 100);
            return () => clearTimeout(t);
        }
        if (!deleting && displayed.length === word.length) {
            const t = setTimeout(() => setDeleting(true), 2000);
            return () => clearTimeout(t);
        }
        if (deleting && displayed.length > 0) {
            const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 50);
            return () => clearTimeout(t);
        }
        if (deleting && displayed.length === 0) {
            setDeleting(false);
            setIdx((i) => (i + 1) % words.length);
        }
    }, [idx, displayed, deleting]);

    return (
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            {displayed}<span className="animate-pulse text-violet-500">|</span>
        </span>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, gradient, delay = 0, large = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className={`group relative p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-violet-500/30 transition-all duration-500 overflow-hidden ${large ? 'lg:col-span-2' : ''}`}
    >
        <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
        <div className={`inline-flex p-4 rounded-3xl mb-6 ${gradient} shadow-lg shadow-black/20`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm font-medium">{desc}</p>
        <div className="mt-8 flex items-center text-violet-400 font-bold text-xs uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
            Learn More <ChevronRight className="w-4 h-4" />
        </div>
    </motion.div>
);

const Landing = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const [stats, setStats] = useState({
        totalSessions: '15K+',
        activeMentors: '4.9/5', // Repurposing labels for now
        totalUsers: '92%',
        partners: '200+'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Dynamically fetch stats, fallback to hardcoded if server unreachable
                const res = await fetch('http://localhost:5000/api/stats');
                const data = await res.json();
                if (data.success) {
                    setStats({
                        totalSessions: data.data.totalSessions + '+',
                        activeMentors: data.data.activeMentors + '+',
                        totalUsers: data.data.totalUsers + '+',
                        partners: '200+' // keeping partner static
                    });
                }
            } catch (error) {
                console.error("Could not fetch live stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div ref={containerRef} className="bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white selection:bg-violet-500/30 transition-colors duration-500">
            {/* ── Hero Section ── */}
            <section className="relative min-h-[95vh] flex items-center overflow-hidden">
                {/* Hero Glows */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/20 dark:bg-violet-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 dark:bg-cyan-600/5 rounded-full blur-[100px]" />
                </div>

                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <Suspense fallback={null}>
                            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                                <HeroGlobe />
                            </Float>
                            <Particles count={500} />
                            <Environment preset="city" />
                            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                        </Suspense>
                    </Canvas>
                </div>

                <div className="container mx-auto px-6 relative z-10 pt-20">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                        >
                            <Sparkles className="w-3 h-3" />
                            Intelligence-Driven Mentorship
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-7xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.85]"
                        >
                            Accelerate <br /> Your <TypingWord />
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mb-12 leading-relaxed font-medium"
                        >
                            Connect with world-class mentors, build high-impact skills, and navigate your professional journey with precision-engineered AI guidance.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-5"
                        >
                            <Link to="/mentors">
                                <button className="group h-16 px-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl font-black text-white shadow-2xl shadow-violet-500/20 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                    Start Exploring <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="h-16 px-10 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center">
                                    Join Lab
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-24 border-y border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm">
                <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    {[
                        { val: stats.totalSessions, label: 'Sessions Hosted' },
                        { val: stats.activeMentors, label: 'Active Mentors' },
                        { val: stats.totalUsers, label: 'Total Users' },
                        { val: stats.partners, label: 'Partner Tech Orgs' }
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{stat.val}</p>
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 dark:text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section className="py-32 px-6 bg-slate-50 dark:bg-[#030712]">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">The Arsenal</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Equipping you with the tools for total domain mastery.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            large 
                            icon={Zap} 
                            title="AI Matchmaking" 
                            desc="Our neural network analyzes your career trajectory to match you with the 1% of experts who can actually move the needle." 
                            gradient="bg-gradient-to-br from-violet-600 to-purple-800" 
                        />
                        <FeatureCard 
                            icon={Video} 
                            title="Live Workspaces" 
                            desc="Real-time HD video, integrated whiteboards, and shared coding environments for deep collaboration." 
                            gradient="bg-gradient-to-br from-blue-600 to-indigo-800" 
                        />
                        <FeatureCard 
                            icon={Calendar} 
                            title="Smart Schedule" 
                            desc="Zero-friction bookings with automatic time-zone detection and calendar sync for global reach." 
                            gradient="bg-gradient-to-br from-emerald-600 to-teal-800" 
                        />
                        <FeatureCard 
                            icon={TrendingUp} 
                            title="Skill Progression" 
                            desc="Track your growth with visual learning paths, verifiable badges, and direct mentor feedback loops." 
                            gradient="bg-gradient-to-br from-cyan-600 to-blue-800" 
                        />
                        <FeatureCard 
                            large 
                            icon={Users} 
                            title="Global Collective" 
                            desc="Access a worldwide network of developers, designers, and founders who are shaping the future of technology." 
                            gradient="bg-gradient-to-br from-rose-600 to-pink-800" 
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
