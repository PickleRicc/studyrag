import SignIn from '../../components/Auth/SignIn';
import Link from 'next/link';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background-dark)] p-4">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left side - Welcome content */}
                    <div className="space-y-6">
                        <div className="text-center lg:text-left space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)]">
                                Welcome Back
                            </h1>
                            <div className="space-y-3">
                                <p className="text-lg lg:text-xl text-[var(--text-primary)]">
                                    Continue Your Research Journey
                                </p>
                                <p className="text-[var(--text-secondary)] lg:text-lg">
                                    Sign in to access your documents and continue getting AI-powered insights from your content.
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">🔒 Secure Access</div>
                                <p className="text-[var(--text-secondary)]">Your data is safe and private</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">📚 Your Library</div>
                                <p className="text-[var(--text-secondary)]">Access all your documents</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">💬 Chat History</div>
                                <p className="text-[var(--text-secondary)]">Resume your conversations</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">⚡ Quick Start</div>
                                <p className="text-[var(--text-secondary)]">Pick up right where you left off</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Sign in form */}
                    <div className="lg:pl-8">
                        <SignIn />
                        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-[var(--accent-green)] hover:text-[var(--accent-green-bright)]">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}