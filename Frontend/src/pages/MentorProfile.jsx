import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, CheckCircle, Play, MessageSquare, Video, Calendar, ChevronLeft, Briefcase, GraduationCap, Award, Target, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import UserAvatar from '../components/ui/UserAvatar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const MentorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mentor, setMentor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Booking state
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Review state
    const [reviews, setReviews] = useState([]);
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchMentorProfile = async () => {
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    api.get(`/mentors/${id}`),
                    api.get(`/reviews/${id}`)
                ]);
                setMentor(profileRes.data.data);
                setReviews(reviewsRes.data.data || []);
            } catch (error) {
                console.error('Failed to fetch mentor profile', error);
                toast.error('Could not load mentor profile');
                navigate('/mentors');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchMentorProfile();
    }, [id, navigate]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to book a session');
            navigate('/login');
            return;
        }
        if (user.role !== 'mentee') {
            toast.error('Only mentees can book sessions.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await api.post('/bookings', {
                mentorId: id,
                date: bookingDate,
                time: bookingTime,
                notes: bookingNotes
            });
            toast.success('Booking requested successfully!');
            setIsBookingModalOpen(false);
            setBookingDate('');
            setBookingTime('');
            setBookingNotes('');
        } catch (error) {
            console.error('Booking failed', error);
            toast.error(error.response?.data?.message || 'Failed to book session. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMessageMentor = async () => {
        if (!user) {
            toast.error('Please login to message mentors.');
            navigate('/login');
            return;
        }
        try {
            await api.post('/chat', { userId: id });
            navigate('/chat');
        } catch (error) {
            console.error('Failed to initiate chat', error);
            toast.error('Failed to start a chat.');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user || user.role !== 'mentee') return;

        setIsSubmittingReview(true);
        try {
            const res = await api.post('/reviews', {
                mentorId: id,
                rating: newReviewRating,
                comment: newReviewComment
            });
            setReviews([res.data.data, ...reviews]);
            setNewReviewComment('');
            setNewReviewRating(5);

            setMentor((prev) => ({
                ...prev,
                reviews: (prev.reviews || 0) + 1
            }));
            toast.success('Review submitted successfully!');
        } catch (error) {
            console.error('Failed to submit review', error);
            toast.error(error.response?.data?.error || 'Failed to submit review.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div className="p-12 text-center text-slate-500">
                <p>Mentor not found.</p>
                <Link to="/mentors" className="text-primary-500 hover:underline mt-4 inline-block">Back to listings</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 text-slate-900 dark:text-white">
            <Link to="/mentors" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors mb-8 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Mentors
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-0 relative overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
                        <div className="h-40 bg-gradient-to-r from-primary-600 to-indigo-700" />
                        <div className="px-8 pb-8">
                            <div className="relative -mt-16 flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-6">
                                <UserAvatar
                                    src={mentor.profileImage}
                                    firstName={mentor.firstName}
                                    lastName={mentor.lastName}
                                    size="w-32 h-32"
                                    shape="rounded-2xl"
                                    className="border-4 border-white dark:border-slate-800 shadow-xl text-5xl"
                                />
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold flex items-center gap-2">
                                        {mentor.firstName} {mentor.lastName}
                                        <CheckCircle className="w-6 h-6 text-primary-500" />
                                    </h1>
                                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{mentor.jobTitle} @ {mentor.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                    <MapPin className="w-4 h-4" /> {mentor.location?.city ? `${mentor.location.city}, ${mentor.location.state || ''}` : 'Remote'}
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-slate-900 dark:text-white">{(mentor.averageRating || mentor.rating || 0).toFixed(1)}</span>
                                    <span>({Array.isArray(mentor.reviews) ? mentor.reviews.length : mentor.reviews || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                    <Clock className="w-4 h-4" /> {mentor.yearsOfExperience || 0}+ years experience
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* About Section */}
                    <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-xl">
                        <h2 className="text-2xl font-bold mb-6">About</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 whitespace-pre-wrap text-lg">
                            {mentor.bio || "No bio provided."}
                        </p>

                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-4 text-white dark:text-white">Expertise</h3>
                        <div className="flex flex-wrap gap-2 mb-8">
                            {(mentor.skills || mentor.expertise || []).map((skill) => (
                                <span key={skill} className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-semibold border border-primary-500/10">
                                    {skill}
                                </span>
                            ))}
                        </div>

                        {(mentor.languages || []).length > 0 && (
                            <>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">Languages</h3>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {mentor.languages.map((lang) => (
                                        <span key={lang} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-500/10">
                                            🌐 {lang}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}

                        {(mentor.mentorshipTypes || []).length > 0 && (
                            <>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-4 mt-4">Mentorship Types</h3>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {mentor.mentorshipTypes.map((type) => (
                                        <span key={type} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-500/10">
                                            <Target className="w-4 h-4 inline-block mr-1 align-text-bottom" /> {type}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}

                        {(mentor.targetMenteeLevel || []).length > 0 && (
                            <>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-4 mt-4">Targeted Mentees</h3>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {mentor.targetMenteeLevel.map((level) => (
                                        <span key={level} className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-semibold border border-purple-500/10">
                                            <Users className="w-4 h-4 inline-block mr-1 align-text-bottom" /> {level}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}

                        {(mentor.introVideoUrl || mentor.introVideo) && (
                            <div 
                                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg aspect-video"
                                onClick={() => setIsVideoModalOpen(true)}
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" 
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                    <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center shadow-2xl shadow-primary-500/50 scale-90 group-hover:scale-100 transition-transform">
                                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <h4 className="text-white font-bold text-lg">Watch Introduction</h4>
                                    <p className="text-white/80 text-sm">Press to play video</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Professional Background Section */}
                    {((mentor.employment?.length > 0) || (mentor.education?.length > 0) || (mentor.certifications?.length > 0)) && (
                        <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-xl">
                            <h2 className="text-2xl font-bold mb-8">Professional Background</h2>

                            {mentor.employment?.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                                        <Briefcase className="w-5 h-5 text-primary-500" />
                                        Experience
                                    </h3>
                                    <div className="space-y-6">
                                        {mentor.employment.map((job, idx) => (
                                            <div key={idx} className="relative pl-8 before:absolute before:left-3 before:top-2 before:w-0.5 before:h-full before:bg-slate-200 dark:before:bg-slate-800 last:before:hidden">
                                                <div className="absolute left-1 top-1.5 w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/50 border-2 border-primary-500 z-10" />
                                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h4>
                                                <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">{job.company}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                                    {job.startDate ? new Date(job.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Unknown'} - {job.current ? 'Present' : (job.endDate ? new Date(job.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present')}
                                                </p>
                                                {job.description && <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{job.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mentor.education?.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                                        <GraduationCap className="w-5 h-5 text-primary-500" />
                                        Education
                                    </h3>
                                    <div className="space-y-6">
                                        {mentor.education.map((edu, idx) => (
                                            <div key={idx} className="relative pl-8 before:absolute before:left-3 before:top-2 before:w-0.5 before:h-full before:bg-slate-200 dark:before:bg-slate-800 last:before:hidden">
                                                <div className="absolute left-1 top-1.5 w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/50 border-2 border-primary-500 z-10" />
                                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{edu.institution}</h4>
                                                <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">{edu.degree} in {edu.fieldOfStudy}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                                    {edu.startYear} - {edu.currentlyEnrolled ? 'Present' : edu.endYear}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mentor.certifications?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                                        <Award className="w-5 h-5 text-primary-500" />
                                        Certifications
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {mentor.certifications.map((cert, idx) => (
                                            <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                <h4 className="font-bold text-slate-900 dark:text-white">{cert.name}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{cert.issuingBody}</p>
                                                {cert.credentialUrl && (
                                                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 text-sm font-medium hover:underline inline-flex items-center gap-1">
                                                        View Credential <ChevronLeft className="w-3 h-3 rotate-180" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Reviews Section */}
                    <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                                Student Reviews ({Array.isArray(mentor.reviews) ? mentor.reviews.length : mentor.reviews || 0})
                            </h2>
                        </div>

                        {/* Submit Review Form for Mentees */}
                        {user && user.role === 'mentee' && (
                            <form onSubmit={handleReviewSubmit} className="mb-10 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <h4 className="font-bold text-lg mb-4">Leave a Review</h4>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-sm font-medium text-slate-500">Your Rating:</span>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setNewReviewRating(star)}
                                                className={`transform hover:scale-110 transition-transform ${newReviewRating >= star ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-700'}`}
                                            >
                                                <Star className={`w-8 h-8 ${newReviewRating >= star ? 'fill-yellow-500' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-white mb-4"
                                    placeholder="Tell us what you learned from this mentor..."
                                    value={newReviewComment}
                                    onChange={(e) => setNewReviewComment(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="px-8 py-3 rounded-xl font-bold" disabled={isSubmittingReview || !newReviewComment.trim()}>
                                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                                </Button>
                            </form>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-8">
                            {reviews.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                                    <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="pb-8 border-b border-slate-100 dark:border-slate-800 last:border-none">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <UserAvatar
                                                    src={review.student?.profileImage}
                                                    firstName={review.student?.firstName}
                                                    lastName={review.student?.lastName}
                                                    size="w-12 h-12"
                                                    shape="rounded-full"
                                                    className="text-base"
                                                />
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                                        {review.student?.firstName} {review.student?.lastName}
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-0.5 text-yellow-500">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500' : 'text-slate-300'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                            &quot;{review.comment}&quot;
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column & Actions */}
                <div className="space-y-6">
                    <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-xl sticky top-24">
                        <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white">{(mentor.sessionPrice || mentor.hourlyRate || 0) === 0 ? 'Free' : `₹${(mentor.sessionPrice || mentor.hourlyRate || 0).toLocaleString('en-IN')}`}</span>
                                <span className="text-slate-500 font-medium">/ session ({mentor.sessionDuration || 60} min)</span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                    <Video className="w-5 h-5 text-primary-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">1:1 Session</p>
                                    <p className="text-xs text-slate-500">Face-to-face video mentoring</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Messaging Access</p>
                                    <p className="text-xs text-slate-500">Unlimited chat support</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 text-lg font-bold mb-4 rounded-xl shadow-xl shadow-primary-500/20"
                            onClick={() => setIsBookingModalOpen(true)}
                        >
                            <Calendar className="w-5 h-5 mr-2" /> Book Now
                        </Button>
                        <Button variant="outline" className="w-full h-14 font-bold rounded-xl" onClick={handleMessageMentor}>
                            Send Message
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Booking Modal */}
            <Modal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title={`Schedule Session with ${mentor.firstName}`}
            >
                <form onSubmit={handleBooking} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Preference Date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                        />
                        <Input
                            type="time"
                            label="Start Time"
                            required
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Learning Goals</label>
                        <textarea
                            className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none text-slate-900 dark:text-white"
                            placeholder="What would you like to achieve in this session?"
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending Request...' : 'Confirm Booking'}
                    </Button>
                </form>
            </Modal>

            {/* Video Player Modal */}
            <Modal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                title={`${mentor.firstName}'s Introduction`}
            >
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    {(mentor.introVideoUrl || mentor.introVideo) ? (
                        <video
                            src={mentor.introVideoUrl || mentor.introVideo}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            Video not available.
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default MentorProfile;
