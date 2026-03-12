import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, CheckCircle, Play, MessageSquare, Video, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MentorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mentor, setMentor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Booking state
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Review state
    const [reviews, setReviews] = useState<any[]>([]);
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
                setReviews(reviewsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch mentor profile', error);
                navigate('/mentors'); // fall back if invalid
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchMentorProfile();
    }, [id, navigate]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'mentee') {
            alert('Only mentees can book sessions.');
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
            alert('Booking requested successfully!');
            setIsBookingModalOpen(false);
            setBookingDate('');
            setBookingTime('');
            setBookingNotes('');
        } catch (error) {
            console.error('Booking failed', error);
            alert('Failed to book session. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMessageMentor = async () => {
        if (!user) {
            alert('Please login to message mentors.');
            return;
        }
        try {
            await api.post('/chat', { userId: id });
            navigate('/chat');
        } catch (error) {
            console.error('Failed to initiate chat', error);
            alert('Failed to start a chat.');
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
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

            // Increment local mentor stat safely bounds
            setMentor((prev: any) => ({
                ...prev,
                reviews: (prev.reviews || 0) + 1
            }));
            alert('Review submitted successfully!');
        } catch (error: any) {
            console.error('Failed to submit review', error);
            alert(error.response?.data?.error || 'Failed to submit review. You may have already reviewed this mentor.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading || !mentor) {
        return <div className="p-12 text-center text-slate-500">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Profile Info */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-500/20 to-blue-600/20" />
                            <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center pt-8 px-6 pb-6">
                                {mentor.profileImage && mentor.profileImage !== 'default.jpg' ? (
                                    <img
                                        src={mentor.profileImage}
                                        alt={`${mentor.firstName} ${mentor.lastName}`}
                                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-500 dark:text-primary-400 text-6xl font-bold uppercase overflow-hidden">
                                        {mentor.firstName?.[0]}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                        {mentor.firstName} {mentor.lastName}
                                        <CheckCircle className="w-5 h-5 text-primary-500" />
                                    </h1>
                                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">{mentor.jobTitle} @ {mentor.company}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> Global / Remote
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold text-slate-900 dark:text-white">{mentor.rating || 0}</span>
                                            ({mentor.reviews || 0} reviews)
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> Actively Mentoring
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* About Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
                                {mentor.bio || "No bio provided."}
                            </p>

                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Expertise</h3>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {(mentor.skills || []).map((skill: string) => (
                                    <span key={skill} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {mentor.introVideo && (
                                <Card
                                    className="bg-slate-50 dark:bg-slate-900/50 p-6 border-dashed border-2 flex items-center justify-between group cursor-pointer hover:border-primary-500/50 transition-colors"
                                    onClick={() => setIsVideoModalOpen(true)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors border-2 border-transparent group-hover:border-primary-500/30">
                                            <Play className="w-5 h-5 text-primary-500 ml-1" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">Watch Introduction Video</h4>
                                            <p className="text-sm text-slate-500">Press to play</p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </Card>
                    </motion.div>

                    {/* Reviews Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                Student Reviews ({mentor.reviews || 0})
                            </h2>

                            {/* Submit Review Form for Mentees */}
                            {user && user.role === 'mentee' && (
                                <form onSubmit={handleReviewSubmit} className="mb-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Write a Review</h4>
                                    <div className="flex items-center gap-2 mb-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Rating:</p>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => setNewReviewRating(star)}
                                                    className={`hover:scale-110 transition-transform ${newReviewRating >= star ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-700'}`}
                                                >
                                                    <Star className={`w-6 h-6 ${newReviewRating >= star ? 'fill-yellow-500' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 min-h-[100px] max-h-40 resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white text-sm mb-4"
                                        placeholder="Share your learning experience..."
                                        value={newReviewComment}
                                        onChange={(e) => setNewReviewComment(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" disabled={isSubmittingReview || !newReviewComment.trim()}>
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </form>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <p className="text-center text-slate-500 py-6">No reviews yet for this mentor.</p>
                                ) : (
                                    reviews.map((review: any) => (
                                        <div key={review._id} className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 uppercase overflow-hidden">
                                                        {review.student?.profileImage ? (
                                                            <img src={review.student.profileImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            review.student?.firstName?.[0] || '?'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                                            {review.student?.firstName} {review.student?.lastName}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="flex items-center text-yellow-500">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500' : 'text-slate-300 fill-slate-300 dark:text-slate-700 dark:fill-slate-700'}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-slate-500">
                                                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 whitespace-pre-wrap pl-13">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column: Booking & Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-6"
                >
                    <Card className="p-6 sticky top-24">
                        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${mentor.hourlyRate}</h3>
                            <p className="text-slate-500 text-sm">per 1 hour session</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <Video className="w-5 h-5 text-primary-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">1:1 Video Call</p>
                                    <p className="text-xs text-slate-500">Direct mentoring and guidance</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-primary-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Unlimited Chat</p>
                                    <p className="text-xs text-slate-500">Ask questions anytime</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-lg mb-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                            onClick={() => setIsBookingModalOpen(true)}
                        >
                            <Calendar className="w-5 h-5" /> Book Session
                        </Button>
                        <Button variant="outline" className="w-full h-12" onClick={handleMessageMentor}>
                            Message Mentor
                        </Button>
                    </Card>
                </motion.div>
            </div>

            {/* Booking Modal */}
            <Modal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title={`Book Session with ${mentor.firstName}`}
            >
                <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                        <Input
                            type="date"
                            label="Select Date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            type="time"
                            label="Select Time"
                            required
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            What would you like to discuss?
                        </label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-xl border bg-white/50 dark:bg-slate-900/50 px-4 py-2 text-sm border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 backdrop-blur-sm resize-none"
                            placeholder="Share some topics or goals for this session..."
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                        {isSubmitting ? 'Requesting...' : 'Confirm Request'}
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
                    <video
                        src={mentor.introVideo}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </Modal>
        </div>
    );
};

export default MentorProfile;
