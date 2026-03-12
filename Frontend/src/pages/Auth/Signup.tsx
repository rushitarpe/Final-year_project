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
    const [role, setRole] = useState<'mentee' | 'mentor'>('mentee');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (role === 'mentor') {
            // Redirect to dedicated mentor registration logic if they intend to be a mentor
            // We pass their basic initialized state via query params or state
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
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card glass className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-slate-500 dark:text-slate-400">Join GuideMe today</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
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
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I want to:</p>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant={role === 'mentee' ? 'primary' : 'outline'}
                                    className={`w-full ${role === 'mentee' ? '' : 'border-primary-500 text-primary-500 bg-primary-50 dark:bg-primary-900/20'}`}
                                    onClick={() => setRole('mentee')}
                                >
                                    Be Mentee
                                </Button>
                                <Button
                                    type="button"
                                    variant={role === 'mentor' ? 'primary' : 'outline'}
                                    className={`w-full ${role === 'mentor' ? '' : 'border-slate-300 dark:border-slate-700'}`}
                                    onClick={() => setRole('mentor')}
                                >
                                    Be a Mentor
                                </Button>
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full mt-6">
                            {role === 'mentor' ? 'Continue to Application' : (isLoading ? 'Creating Account...' : 'Create Account')}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-500 font-medium hover:text-primary-600 dark:text-primary-400">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Signup;
