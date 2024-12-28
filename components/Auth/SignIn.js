'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

export default function SignIn() {
    const router = useRouter();
    const { signIn, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn(formData.email, formData.password);
            if (result?.session) {
                router.push('/');
            }
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[400px] w-full max-w-md p-8 rounded-lg bg-[var(--card-dark)] border border-[#3a3a3a] glass-effect">
            <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text-primary)]">Sign In</h2>
            
            {error && (
                <div className="mb-4 p-3 rounded bg-red-500 bg-opacity-10 border border-red-500 text-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[var(--background-dark)] text-[var(--text-primary)]
                                 border border-[#3a3a3a] focus:border-[var(--accent-green)] focus:ring-1 
                                 focus:ring-[var(--accent-green)] transition-colors duration-200 glow-focus"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[var(--background-dark)] text-[var(--text-primary)]
                                 border border-[#3a3a3a] focus:border-[var(--accent-green)] focus:ring-1 
                                 focus:ring-[var(--accent-green)] transition-colors duration-200 glow-focus"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-3 rounded-lg font-medium transition-colors duration-200
                              ${loading 
                                ? 'bg-[var(--accent-green-dim)] text-[var(--text-secondary)]' 
                                : 'bg-[var(--accent-green)] hover:bg-[var(--accent-green-bright)] text-white'}`}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
