import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Zap } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MentorListings = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [mentors, setMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMatching, setIsMatching] = useState(false);
    const [aiMatches, setAiMatches] = useState(null);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await api.get('/mentors');
                setMentors(res.data.data || []);
            } catch (error) {
                console.error('Error fetching mentors:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const handleAiMatch = async () => {
        if (!user || user.role !== 'mentee') {
            return toast.error('You must be logged in as a student to use AI Matching.');
        }
        
        setIsMatching(true);
        toast.loading('Analyzing your skills with Gemini AI...', { id: 'ai-match' });
        
        try {
            const res = await api.get('/mentors/recommendations');
            if (res.data.success && res.data.data.length > 0) {
                setAiMatches(res.data.data);
                toast.success('AI found your best matches!', { id: 'ai-match' });
            } else {
                toast.error('No strong matches found at this time.', { id: 'ai-match' });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to get AI recommendations.', { id: 'ai-match' });
        } finally {
            setIsMatching(false);
        }
    };

    const clearAiMatch = () => {
        setAiMatches(null);
        setSearchTerm('');
    };

    const filteredMentors = mentors.filter((mentor) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        const skillsArr = [...(mentor.skills || []), ...(mentor.expertise || [])];
        return (
            mentor.firstName?.toLowerCase().includes(query) ||
            mentor.lastName?.toLowerCase().includes(query) ||
            mentor.jobTitle?.toLowerCase().includes(query) ||
            mentor.company?.toLowerCase().includes(query) ||
            mentor.category?.toLowerCase().includes(query) ||
            mentor.bio?.toLowerCase().includes(query) ||
            skillsArr.some((s) => s.toLowerCase().includes(query))
        );
    });

    // Determine the list to render format
    const displayList = aiMatches 
        ? aiMatches.map(m => ({ ...m.mentor, matchScore: m.matchScore }))
        : filteredMentors;

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Search Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">
                    {aiMatches ? 'Your AI Matches ⚡' : 'Find Your Perfect Match'}
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!!aiMatches}
                        />
                    </div>
                    {aiMatches ? (
                        <Button variant="outline" onClick={clearAiMatch} className="h-14 px-6 flex items-center gap-2 shrink-0 border-slate-300 dark:border-slate-700">
                            Clear AI Results
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleAiMatch} 
                            disabled={isMatching}
                            className="h-14 px-6 flex items-center gap-2 shrink-0 bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-500 hover:to-primary-500 text-white shadow-lg shadow-violet-500/25 border-0 transition-all font-bold"
                        >
                            <Zap className={`w-5 h-5 ${isMatching ? 'animate-pulse' : ''}`} /> 
                            {isMatching ? 'Analyzing...' : 'AI Match'}
                        </Button>
                    )}
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mt-6">
                    {['Software Engineering', 'Product Management', 'Design', 'Data Science', 'Marketing'].map(tag => (
                        <span
                            key={tag}
                            onClick={() => setSearchTerm(tag)}
                            className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 cursor-pointer transition-colors"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading mentors...</div>
            ) : displayList.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mentor Not Available</h3>
                    <p className="text-slate-500">We couldn&apos;t find any mentors matching your current search criteria.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSearchTerm('')}>Clear Search</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayList.map((mentor, i) => (
                        <motion.div
                            key={mentor._id || i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`overflow-hidden group hover:border-primary-500/50 transition-colors ${mentor.matchScore ? 'border-violet-500/50 shadow-lg shadow-violet-500/10 relative overflow-visible' : ''}`}>
                                {mentor.matchScore !== undefined && (
                                    <div className="absolute -top-3 -right-3 z-50 bg-gradient-to-br from-violet-500 to-primary-600 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-xl shadow-violet-500/30 flex items-center gap-1 border border-white/20">
                                        <Zap className="w-3.5 h-3.5 fill-current" /> {mentor.matchScore}% Match
                                    </div>
                                )}
                                
                                <div className="relative h-48 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden rounded-t-[1.3rem]">
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
                                        {(mentor.expertise || []).slice(0, 3).map((skill) => (
                                            <span key={skill} className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-semibold h-fit">
                                                {skill}
                                            </span>
                                        ))}
                                        {(mentor.expertise?.length || 0) > 3 && (
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold h-fit">
                                                +{(mentor.expertise?.length || 0) - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mb-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold text-slate-900 dark:text-white">{mentor.rating || 'New'}</span>
                                            <span className="text-sm text-slate-500">({mentor.reviews || 0} reviews)</span>
                                        </div>
                                        <div className="font-semibold text-slate-900 dark:text-white">₹{mentor.hourlyRate}/hr</div>
                                    </div>

                                    <Link to={`/mentors/${mentor._id}`}>
                                        <Button className="w-full relative z-10">View Profile</Button>
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
