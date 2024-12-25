'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignUp() {
    const router = useRouter();
    const { signUp, signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // First sign up
            await signUp(formData.email, formData.password, formData.name);
            
            // Then sign in automatically
            await signIn(formData.email, formData.password);
            
            // Navigate to the main app
            router.push('/');
        } catch (err) {
            setError(err.message || 'Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[400px] w-full max-w-md p-8 rounded-lg bg-[var(--card-dark)] border border-[#3a3a3a] glass-effect">
            <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text-primary)]">Create Account</h2>
            
            {error && (
                <div className="mb-4 p-3 rounded bg-red-500 bg-opacity-10 border border-red-500 text-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[var(--background-dark)] text-[var(--text-primary)]
                                 border border-[#3a3a3a] focus:border-[var(--accent-green)] focus:ring-1 
                                 focus:ring-[var(--accent-green)] transition-colors duration-200 glow-focus"
                        required
                    />
                </div>

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

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
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
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
}
