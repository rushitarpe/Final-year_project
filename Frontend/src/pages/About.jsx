import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Github, Linkedin, Twitter, Users, Zap, Award, User, Globe } from 'lucide-react';

const TEAM = [
    {
        name: 'Rushikesh Tarpe',
        role: 'Fullstack Lead',
        image: null,
        bio: 'Dedicated to democratizing mentorship and building scalable platforms.',
    },
    {
        name: 'Alex Rivera',
        role: 'Frontend Architect',
        image: null,
        bio: 'Crafting intuitive and immersive user interfaces for the modern web.',
    },
    {
        name: 'Sarah Chen',
        role: 'Backend Engineer',
        image: null,
        bio: 'Building secure, robust, and scalable architectures for real-time services.',
    },
    {
        name: 'David Kim',
        role: 'Product Designer',
        image: null,
        bio: 'Creating beautiful, accessible, and intuitive user experiences.',
    },
    {
        name: 'Jordan Smith',
        role: 'Growth Lead',
        image: null,
        bio: 'Ensuring global reach and community success for our mentees.',
    }
];

const STATS = [
    { icon: <Users className="w-6 h-6 text-primary-500" />, value: '10K+', label: 'Active Users' },
    { icon: <Globe className="w-6 h-6 text-blue-500" />, value: '50+', label: 'Countries' },
    { icon: <Zap className="w-6 h-6 text-yellow-500" />, value: '100K+', label: 'Sessions' },
    { icon: <Award className="w-6 h-6 text-emerald-500" />, value: '4.9/5', label: 'Avg Rating' },
];

const About = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-16 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-8 border border-primary-100 dark:border-primary-800"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                        Our Vision
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">
                        Mentorship for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-600">Next Generation</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        We built MentorConnect to bridge the gap between ambitious learners and experienced leaders. Our mission is to make quality guidance accessible to everyone, everywhere.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                    {STATS.map((stat, i) => (
                        <Card key={i} className="p-8 text-center border-none bg-slate-50 dark:bg-slate-900/50 rounded-3xl group hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2">
                            <div className="w-14 h-14 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Mission Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="order-2 lg:order-1">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary-500/10 rounded-[3rem] blur-2xl" />
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                                alt="Team Working"
                                className="relative rounded-[2.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 space-y-8">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
                        <div className="space-y-6 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p>
                                We believe that talent is everywhere, but opportunities are not. Our platform breaks down geographical barriers, connecting the brightest minds regardless of where they are.
                            </p>
                            <p>
                                Every mentorship session is a step towards a more collaborative and innovative world. Whether you're starting your career or looking to give back, you belong here.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Meet the Team</h2>
                        <p className="text-slate-500 dark:text-slate-400">The passionate individuals behind the platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {TEAM.map((member, i) => (
                            <Card key={i} className="p-6 text-center border-none bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] group">
                                <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-slate-400" />
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                                <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-4">{member.role}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{member.bio}</p>
                                <div className="flex justify-center gap-4">
                                    <button className="text-slate-300 hover:text-primary-500 transition-colors"><Twitter className="w-4 h-4" /></button>
                                    <button className="text-slate-300 hover:text-primary-500 transition-colors"><Linkedin className="w-4 h-4" /></button>
                                    <button className="text-slate-300 hover:text-primary-500 transition-colors"><Github className="w-4 h-4" /></button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
