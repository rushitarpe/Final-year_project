import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setIsLoading(true);

        try {
            await api.put(`/auth/resetpassword/${token}`, { password });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired reset token');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">New Password</h2>
                        <p className="text-slate-500 dark:text-slate-400">Please enter your new password below</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 bg-green-100/10 border border-green-500/20 text-green-600 rounded-xl text-sm text-center font-medium">
                            {message}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={isLoading || !!message} className="w-full mt-6 h-12 text-lg font-bold">
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
