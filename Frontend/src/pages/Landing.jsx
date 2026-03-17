import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, PlayCircle, Users, CheckCircle, TrendingUp, Star, Zap, Shield, MessageCircle, HelpCircle, ChevronDown } from 'lucide-react';

const Landing = () => {
    const [stats, setStats] = useState({
        totalSessions: '15K+',
        activeMentors: '4.9/5',
        totalUsers: '92%',
        partners: '200+'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/stats');
                const data = await res.json();
                if (data.success) {
                    setStats({
                        totalSessions: data.data.totalSessions + '+',
                        activeMentors: data.data.activeMentors + '+',
                        totalUsers: data.data.totalUsers + '+',
                        partners: '200+'
                    });
                }
            } catch (error) {
                console.error("Could not fetch live stats:", error);
            }
        };
        fetchStats();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
        const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
        mouseX.set(x);
        mouseY.set(y);
    };

    const springConfig = { damping: 25, stiffness: 150 };
    const bgX = useSpring(useTransform(mouseX, [-1, 1], [15, -15]), springConfig);
    const bgY = useSpring(useTransform(mouseY, [-1, 1], [15, -15]), springConfig);

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 overflow-x-hidden pt-8">
            {/* ── Hero Section (Full Width Interactive) ── */}
            <section 
                onMouseMove={handleMouseMove}
                className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
            >
                {/* Interactive Background Image */}
                <motion.div 
                    className="absolute inset-[-2%] w-[104%] h-[104%] z-0 bg-contain lg:bg-cover bg-no-repeat bg-[center_20%]"
                    style={{ 
                        backgroundImage: "url('/hero_bg.png')",
                        x: bgX,
                        y: bgY
                    }}
                />
                
                {/* Gradient Overlays for readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/95 via-white/80 to-[#f6f6f8] dark:from-[#020617]/95 dark:via-[#020617]/80 dark:to-[#020617] pointer-events-none" />

                {/* Content Overlay */}
                <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl pt-20">
                    <motion.div 
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="flex flex-col items-center"
                    >
                        <motion.h1 variants={fadeInUp} className="font-['Outfit'] text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tighter text-slate-900 dark:text-white mb-8">
                            Unlock Your Potential with <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">Expert Guidance</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-slate-700 dark:text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12">
                            Experience high-end mentorship tailored to your professional career path. Connect with industry leaders who have walked the path you desire.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
                            <Link to="/mentors">
                                <button className="flex items-center justify-center gap-2 rounded-2xl h-16 px-10 bg-violet-600 hover:bg-violet-700 text-white text-lg font-bold shadow-xl shadow-violet-600/25 active:scale-95 transition-all w-full sm:w-auto">
                                    Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="flex items-center justify-center gap-2 rounded-2xl h-16 px-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-500 text-slate-700 dark:text-slate-200 text-lg font-bold shadow-lg active:scale-95 transition-all w-full sm:w-auto">
                                    <PlayCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Watch Demo
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div 
                            variants={fadeInUp} 
                            className="mt-16 flex items-center gap-6 justify-center"
                        >
                            <div className="flex -space-x-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <p className="text-slate-900 dark:text-white font-bold text-lg">Join {stats.totalUsers}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">ambitious professionals today</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Stats Highlight ── */}
            <section className="py-12 bg-white/40 dark:bg-white/5 border-y border-slate-200/50 dark:border-white/5 backdrop-blur-md">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl bg-white dark:bg-slate-900 p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
                            <h2 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-black font-['Outfit'] leading-tight">
                                Access the <span className="text-violet-600 dark:text-violet-400">Top 1%</span> Elite Mentor Network
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-md mx-auto md:mx-0">
                                Get exclusive access to verified experts from leading tech giants and innovative startups worldwide.
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div 
                                className="w-48 h-24 lg:w-64 lg:h-32 bg-contain bg-center bg-no-repeat rounded-xl filter dark:brightness-90 opacity-80 mix-blend-darken dark:mix-blend-lighten" 
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8dXRT_aEXqiacJor2eaufycrQsQiZ9k2Lnj5Bj7aJawCUE7G6iNTlAlddDB9S-hLvyTeZeV61hrwJ2HbvWsjp2el-OYzkyw15MXeBfdvw0i7l-x_eQNy5al63bmf-TmsXj_q5jrXhhWJRNAVebWphkZsBx8Hn3-PP1QlQ5AB1mJE73jdrxYqrB0MAN_nqGWvHA97EXelntxHhRbH0vd1XVxJ7ceFBkEdO7ZvVqAMzE1188O_yFaQkLzHE6p2nXvdeafUwu6t2yAA")' }}
                                aria-label="Grid of diverse professional mentor portraits"
                            />
                        </div>
                        <div className="flex-shrink-0 w-full md:w-auto mt-6 md:mt-0">
                             <Link to="/mentors">
                                <button className="w-full sm:w-auto flex items-center justify-center rounded-xl h-12 px-8 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 font-bold transition-colors">
                                    View All Mentors
                                </button>
                             </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How it Works Step-by-Step ── */}
            <section className="py-24 bg-[#f6f6f8] dark:bg-[#020617]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="font-['Outfit'] text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">How It Works</h2>
                        <div className="h-2 w-16 bg-gradient-to-r from-violet-600 to-blue-500 rounded-full mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-violet-200 via-blue-200 to-emerald-200 dark:from-violet-800 dark:via-blue-800 dark:to-emerald-800 z-0" />

                        {/* Step 1 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
                            className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 relative z-10"
                        >
                            <div className="w-20 h-20 mx-auto rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 shadow-inner">
                                <span className="font-['Outfit'] font-black text-3xl">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Define Your Goal</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">Share your career aspirations and we'll map out a personalized, actionable curriculum for your professional growth.</p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 relative z-10"
                        >
                            <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-inner">
                                <span className="font-['Outfit'] font-black text-3xl">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Match with Expert</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">Our advanced AI matching connects you instantly with a mentor who has successfully navigated the path you desire.</p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 relative z-10"
                        >
                            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-inner">
                                <span className="font-['Outfit'] font-black text-3xl">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Accelerate Growth</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">Through weekly 1-on-1 sessions, project reviews, and direct chat, unlock your true potential and achieve your goals.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Platform Features ── */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-black uppercase tracking-widest mb-6">
                            <Zap className="w-3.5 h-3.5" /> Powered by AI
                        </span>
                        <h2 className="font-['Outfit'] text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
                            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">Grow Faster</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">GuideMe is packed with intelligent features so you spend less time searching and more time learning.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <Zap className="w-7 h-7" />,
                                color: 'from-violet-500 to-purple-600',
                                title: 'AI Mentor Matching',
                                desc: 'Gemini AI analyzes your skills, goals, and experience to find your most compatible mentors in seconds.'
                            },
                            {
                                icon: <MessageCircle className="w-7 h-7" />,
                                color: 'from-blue-500 to-cyan-600',
                                title: 'Real-time Chat',
                                desc: 'Chat directly with your mentor anytime. Ask questions, share code, discuss ideas — no scheduling needed.'
                            },
                            {
                                icon: <Users className="w-7 h-7" />,
                                color: 'from-emerald-500 to-teal-600',
                                title: 'Live Video Sessions',
                                desc: 'HD video calls with screen sharing built right into the platform. No Zoom links needed.'
                            },
                            {
                                icon: <Shield className="w-7 h-7" />,
                                color: 'from-pink-500 to-rose-600',
                                title: 'Smart Resume Parser',
                                desc: 'Upload your resume and our AI extracts your skills, experience, and languages to build your profile instantly.'
                            },
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feat.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Student Reviews ── */}
            <section className="py-24 bg-[#f6f6f8] dark:bg-[#020617]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-6">
                            <Star className="w-3.5 h-3.5 fill-current" /> Student Reviews
                        </span>
                        <h2 className="font-['Outfit'] text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
                            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Thousands</span> of Students
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">Real feedback from mentees who accelerated their careers through GuideMe.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Rushikesh Tarpe',
                                role: 'Final Year CSE Student → Intern at TCS',
                                mentor: 'Dr. Emily Chen',
                                mentorRole: 'AI Researcher @ Google DeepMind',
                                review: "Dr. Emily completely changed how I approach Machine Learning. Within 3 months of sessions on GuideMe, I landed my first internship at TCS Digital. Her patience and real-world examples made complex concepts click instantly.",
                                rating: 5,
                                avatar: '👨‍💻',
                            },
                            {
                                name: 'Ananya Iyer',
                                role: 'B.Tech Graduate → PM at Zomato',
                                mentor: "Sarah O'Connor",
                                mentorRole: 'Senior PM @ Microsoft',
                                review: "I had zero product management experience. Sarah helped me build a portfolio, prep for interviews, and gave me frameworks that are still my daily tools. GuideMe's AI match was spot on — Sarah was exactly who I needed.",
                                rating: 5,
                                avatar: '👩‍💼',
                            },
                            {
                                name: 'Karan Mehta',
                                role: 'MCA Student → Full Stack Dev',
                                mentor: 'David Kim',
                                mentorRole: 'Full Stack Lead @ Meta',
                                review: "David reviewed my code live on video calls and showed me how real production systems are built. The assignment feature on GuideMe kept me accountable. I went from beginner React to building full apps in 8 weeks!",
                                rating: 5,
                                avatar: '👨‍🎓',
                            },
                        ].map((review, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-7 flex flex-col gap-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-1.5">
                                    {[...Array(review.rating)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">"{review.review}"</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{review.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-100 dark:border-violet-800/30 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400 mt-2">
                                    <span className="font-bold text-violet-700 dark:text-violet-400">Mentored by {review.mentor}</span>
                                    <br />
                                    <span className="text-slate-400">{review.mentorRole}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why Choose Mentorship? (Benefits) ── */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -top-12 -left-12 w-64 h-64 bg-violet-200/40 dark:bg-violet-500/10 rounded-full blur-3xl" />
                            <img 
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                                alt="Collaborative Mentorship" 
                                className="rounded-[3rem] shadow-2xl relative z-10 border-8 border-slate-50 dark:border-slate-900"
                            />
                            <div className="absolute -bottom-8 -right-8 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl z-20 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">40%</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Faster Growth</p>
                                </div>
                            </div>
                        </motion.div>

                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
                                The GuideMe Advantage
                            </span>
                            <h2 className="font-['Outfit'] text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                                Why Mentorship is the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Ultimate Shortcut</span>
                            </h2>
                            
                            <div className="space-y-8">
                                {[
                                    {
                                        title: 'For Mentees: Fast-Track Success',
                                        items: [
                                            'Avoid common rookie mistakes that waste months',
                                            'Get direct access to "insider" industry knowledge',
                                            'Build a network that opens doors to top companies'
                                        ],
                                        icon: <Sparkles className="w-5 h-5 text-amber-500" />
                                    },
                                    {
                                        title: 'For Mentors: Give Back & Lead',
                                        items: [
                                            'Strengthen your leadership and coaching skills',
                                            'Build your personal brand as an industry authority',
                                            'Help shape the next generation of tech talent'
                                        ],
                                        icon: <Users className="w-5 h-5 text-violet-500" />
                                    }
                                ].map((benefit, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            {benefit.icon}
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{benefit.title}</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {benefit.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ Section ── */}
            <section className="py-24 bg-[#f6f6f8] dark:bg-[#020617]">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-6">
                            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
                        </span>
                        <h2 className="font-['Outfit'] text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
                            Got Questions? <span className="text-violet-600">We Got Answers</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How does the AI Matching work?",
                                a: "Our system uses Google Gemini AI to analyze your profile (skills, goals, interests) and matches you with mentors whose expertise and background perfectly align with your career path."
                            },
                            {
                                q: "Is GuideMe free for students?",
                                a: "Yes! You can sign up, build your profile, and browse mentors for free. Many mentors offer free introductory sessions, while others may have hourly rates for long-term guidance."
                            },
                            {
                                q: "Can I be both a mentor and a mentee?",
                                a: "Currently, you choose a primary role during signup. However, we believe everyone has something to teach and something to learn, and we're working on cross-over roles for the future!"
                            },
                            {
                                q: "What happens after I match with a mentor?",
                                a: "Once you match, you can immediately send them a message to introduce yourself. From there, you can schedule video sessions, share resources, and start your growth journey."
                            }
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 hover:shadow-lg transition-all"
                            >
                                <div className="flex justify-between items-center gap-4 cursor-pointer">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{faq.q}</h4>
                                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                                </div>
                                <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-[2.5rem] p-12 lg:p-16 text-white shadow-2xl shadow-violet-500/30"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-widest mb-8">
                            <Sparkles className="w-3.5 h-3.5" /> Start for Free
                        </div>
                        <h2 className="font-['Outfit'] text-3xl md:text-5xl font-black mb-6 leading-tight">
                            Your Career Breakthrough<br />Starts With One Session
                        </h2>
                        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                            Join over thousands of students already accelerating their careers with expert mentors on GuideMe. Sign up free — no credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup">
                                <button className="flex items-center justify-center gap-2 rounded-2xl h-14 px-10 bg-white text-violet-700 font-bold text-lg hover:bg-violet-50 transition-colors shadow-lg active:scale-95 w-full sm:w-auto">
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <Link to="/mentors">
                                <button className="flex items-center justify-center gap-2 rounded-2xl h-14 px-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg transition-all active:scale-95 w-full sm:w-auto">
                                    Browse Mentors
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
