import SignUp from '../../components/Auth/SignUp';
import Link from 'next/link';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background-dark)] p-4">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left side - Welcome content */}
                    <div className="space-y-6">
                        <div className="text-center lg:text-left space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)]">
                                Welcome to LabRag
                            </h1>
                            <div className="space-y-3">
                                <p className="text-lg lg:text-xl text-[var(--text-primary)]">
                                    Your AI-powered research companion
                                </p>
                                <p className="text-[var(--text-secondary)] lg:text-lg">
                                    Upload your pdf files or audio files, then chat with an AI that understands your content.
                                    Get instant answers, explanations, and insights from your documents or audio files.
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">📚 Smart Research</div>
                                <p className="text-[var(--text-secondary)]">Upload PDFs and get AI-powered insights</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">💬 Natural Chat</div>
                                <p className="text-[var(--text-secondary)]">Ask questions in plain language</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">🎯 Precise Answers</div>
                                <p className="text-[var(--text-secondary)]">Get responses based on your content</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#3a3a3a] bg-[var(--card-dark)]">
                                <div className="text-[var(--accent-green)] mb-2 text-lg">⚡ Instant Help</div>
                                <p className="text-[var(--text-secondary)]">Research smarter, not harder</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Sign up form */}
                    <div className="lg:pl-8">
                        <SignUp />
                        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-[var(--accent-green)] hover:text-[var(--accent-green-bright)]">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}