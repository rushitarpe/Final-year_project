import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Github, Linkedin, Twitter, Globe, Users, Zap, Award, User } from 'lucide-react';

const TEAM = [
    {
        name: 'Rushikesh Tarpe',
        role: 'Fullstack Developer',
        image: '/rushikesh.jpg', // Place your image in Frontend/public/rushikesh.jpg
        bio: 'Dedicated to democratizing mentorship and building scalable platforms.',
    },
    {
        name: 'Frontend Developer',
        role: 'Frontend Developer',
        image: null,
        bio: 'Crafting intuitive and immersive user interfaces.',
    },
    {
        name: 'Backend Developer',
        role: 'Backend Developer',
        image: null,
        bio: 'Building secure, robust, and scalable architectures.',
    },
    {
        name: 'UI/UX Designer',
        role: 'UI/UX Designer',
        image: null,
        bio: 'Creating beautiful, accessible, and intuitive user experiences.',
    },
    {
        name: 'Project Manager',
        role: 'Project Manager',
        image: null,
        bio: 'Ensuring smooth delivery and agile team coordination.',
    }
];

const STATS = [
    { icon: <Users className="w-6 h-6 text-primary-500" />, value: '10K+', label: 'Active Users' },
    { icon: <Globe className="w-6 h-6 text-blue-500" />, value: '50+', label: 'Countries' },
    { icon: <Zap className="w-6 h-6 text-yellow-500" />, value: '100K+', label: 'Sessions Hosted' },
    { icon: <Award className="w-6 h-6 text-emerald-500" />, value: '4.9/5', label: 'Average Rating' },
];

const About = () => {
    return (
        <div className="min-h-screen py-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold text-sm mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        Our Story
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 text-slate-900 dark:text-white tracking-tight">
                        Empowering the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-600">Industry Leaders</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
                        We built <span className="font-semibold text-primary-500">GuideMe</span> to solve a critical gap: connecting passionate learners with experienced professionals who genuinely want to give back and foster growth.
                    </p>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32"
                >
                    {STATS.map((stat, i) => (
                        <Card key={i} className="p-6 text-center hover:-translate-y-1 transition-transform duration-300 border-none shadow-lg shadow-slate-200/50 dark:shadow-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                            <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                {stat.icon}
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        </Card>
                    ))}
                </motion.div>

                {/* Mission Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">Our Mission</h2>
                        <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            <p>
                                We believe that <strong className="text-slate-900 dark:text-slate-200">talent is equally distributed, but opportunity is not.</strong> By leveraging technology, we're actively breaking down geographical, cultural, and socio-economic barriers to mentorship.
                            </p>
                            <p>
                                Whether you're a student looking to break into the tech industry, or a senior engineer wanting to guide the next wave of innovators, our platform provides the tools, structure, and community to make those connections deeply meaningful.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-blue-600 rounded-3xl transform rotate-3 opacity-20 dark:opacity-40 blur-xl" />
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Team Collaboration"
                            className="relative rounded-3xl shadow-2xl object-cover aspect-video"
                        />
                    </motion.div>
                </div>

                {/* Team Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">Meet The Team</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        We are a group of educators, engineers, and designers who are passionate about scaling mentorship to everyone who needs it.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-20">
                    {TEAM.map((member, i) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card className="overflow-hidden group hover:border-primary-500/30 transition-colors border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm">
                                <div className="aspect-square overflow-hidden relative flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10" />
                                    {member.image ? (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-slate-400 dark:text-slate-600 group-hover:scale-105 transition-transform duration-700" />
                                    )}
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{member.name}</h3>
                                    <p className="text-primary-500 font-medium text-xs mb-3 line-clamp-1">{member.role}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2">
                                        {member.bio}
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <a href="#" className="text-slate-400 hover:text-primary-500 transition-colors">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                        <a href="#" className="text-slate-400 hover:text-primary-500 transition-colors">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                        <a href="#" className="text-slate-400 hover:text-primary-500 transition-colors">
                                            <Github className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default About;
