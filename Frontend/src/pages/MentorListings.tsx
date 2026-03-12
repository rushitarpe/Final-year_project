import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MentorListings = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [mentors, setMentors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await api.get('/mentors');
                setMentors(res.data.data);
            } catch (error) {
                console.error('Error fetching mentors:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const filteredMentors = mentors.filter((mentor) => {
        const query = searchTerm.toLowerCase();
        return (
            mentor.firstName?.toLowerCase().includes(query) ||
            mentor.lastName?.toLowerCase().includes(query) ||
            mentor.jobTitle?.toLowerCase().includes(query) ||
            mentor.company?.toLowerCase().includes(query) ||
            mentor.skills?.some((s: string) => s.toLowerCase().includes(query))
        );
    });

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Search Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">
                    Find Your Perfect Match
                </h1>
                <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                            <Search className="text-slate-500 w-5 h-5" />
                        </div>
                        <Input
                            placeholder="Search by name, role, company or skill..."
                            className="pl-12 h-14 text-base w-full relative z-0 bg-white dark:bg-slate-900/80 backdrop-blur-md"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-14 px-6 flex items-center gap-2 shrink-0">
                        <Filter className="w-5 h-5" /> Filters
                    </Button>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mt-6">
                    {['Software Engineering', 'Product Management', 'Design', 'Data Science', 'Marketing'].map(tag => (
                        <span
                            key={tag}
                            onClick={() => setSearchTerm(tag)}
                            className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-colors"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading mentors...</div>
            ) : filteredMentors.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mentor Not Available</h3>
                    <p className="text-slate-500">We couldn't find any mentors matching your current search criteria.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSearchTerm('')}>Clear Search</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMentors.map((mentor, i) => (
                        <motion.div
                            key={mentor._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card className="overflow-hidden group hover:border-primary-500/50 transition-colors">
                                <div className="relative h-48 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    {mentor.profileImage && mentor.profileImage !== 'default.jpg' ? (
                                        <img
                                            src={mentor.profileImage}
                                            alt={`${mentor.firstName} ${mentor.lastName}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-500 dark:text-primary-400 text-6xl font-bold group-hover:scale-105 transition-transform duration-500 uppercase">
                                            {mentor.firstName?.[0]}
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <h3 className="text-xl font-bold text-white mb-1">{mentor.firstName} {mentor.lastName}</h3>
                                        <p className="text-white/80 text-sm">{mentor.jobTitle} @ {mentor.company}</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2 mb-6 min-h-[56px]">
                                        {(mentor.skills || []).slice(0, 3).map((skill: string) => (
                                            <span key={skill} className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-semibold h-fit">
                                                {skill}
                                            </span>
                                        ))}
                                        {(mentor.skills?.length || 0) > 3 && (
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold h-fit">
                                                +{(mentor.skills?.length || 0) - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mb-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold text-slate-900 dark:text-white">{mentor.rating || 'New'}</span>
                                            <span className="text-sm text-slate-500">({mentor.reviews || 0} reviews)</span>
                                        </div>
                                        <div className="font-semibold text-slate-900 dark:text-white">${mentor.hourlyRate}/hr</div>
                                    </div>

                                    <Link to={`/mentors/${mentor._id}`}>
                                        <Button className="w-full">View Profile</Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentorListings;
