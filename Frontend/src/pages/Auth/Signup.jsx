import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('mentee');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (role === 'mentor') {
            navigate('/mentor/apply', { state: { firstName, lastName, email, password } });
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', { firstName, lastName, email, password, role });
            if (res.data.success) {
                login(res.data.token, res.data.user);
                navigate('/dashboard/mentee');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-slate-500 dark:text-slate-400">Join GuideMe today</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                            <Input label="Last Name" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                        </div>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        <div className="pt-2">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-widest text-[10px]">I want to:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('mentee')}
                                    className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${role === 'mentee' ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                    Be Mentee
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('mentor')}
                                    className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${role === 'mentor' ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                    Be a Mentor
                                </button>
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full mt-6 h-12 text-lg font-bold">
                            {role === 'mentor' ? 'Continue to Application' : (isLoading ? 'Creating Account...' : 'Create Account')}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-500 font-bold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Signup;
