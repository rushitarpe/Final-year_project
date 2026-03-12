import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { HeroGlobe } from '../components/3d/HeroGlobe';
import { Particles } from '../components/3d/Particles';
import { FloatingFeatureCard } from '../components/3d/FloatingFeatureCard';
import { ConnectionVisual } from '../components/3d/ConnectionVisual';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="relative min-h-screen w-full">
            {/* Fixed 3D Background */}
            <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <Suspense fallback={null}>
                        <Environment preset="city" />
                        <Particles count={1000} />
                        <HeroGlobe />
                        <ConnectionVisual count={20} />

                        <FloatingFeatureCard position={[-4, 2, 0]} title="Expert Guidance" delay={0} color="#0ea5e9" />
                        <FloatingFeatureCard position={[4, 1.5, 0]} title="Career Growth" delay={1.5} color="#8b5cf6" />
                        <FloatingFeatureCard position={[-3, -2, 1]} title="Global Network" delay={0.8} color="#10b981" />
                        <FloatingFeatureCard position={[3, -1.5, 2]} title="Skill Building" delay={2.2} color="#f59e0b" />

                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            autoRotate
                            autoRotateSpeed={0.5}
                            maxPolarAngle={Math.PI / 2 + 0.2}
                            minPolarAngle={Math.PI / 2 - 0.2}
                        />
                    </Suspense>
                </Canvas>

                {/* Overlay gradient to ensure text readability */}
                <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-[2px]" />
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 w-full">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center pt-20 pb-32 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 tracking-tight text-slate-900 dark:text-white">
                            Find Your Perfect <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-600">Mentor</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Connect with industry experts, accelerate your career, and achieve your goals with GuideMe.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/mentors">
                                <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary-500/20 text-lg px-8 py-6 rounded-full">
                                    Browse Mentors
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                    Become a Mentor
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="py-24 px-6 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">Why GuideMe?</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We provide all the tools you need for a successful mentorship journey.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI-Powered Matching</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Our smart algorithm connects you with the ideal mentor based on your skills, goals, and industry.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Seamless Video Calls</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Built-in high-quality video infrastructure means you never have to leave the platform for your sessions.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Easy Scheduling</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Sync your calendar, set your availability, and let mentees book sessions effortlessly.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call To Action */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary-600 dark:bg-primary-900 skew-y-3 origin-bottom-left -z-10 bg-opacity-10 dark:bg-opacity-20" />
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">Ready to Accelerate Your Career?</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">Join thousands of professionals already accelerating their careers on GuideMe.</p>
                        <Link to="/signup">
                            <Button size="lg" className="shadow-lg text-lg px-10 py-6 rounded-full">
                                Create Free Account
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Landing;
