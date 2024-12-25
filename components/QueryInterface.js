'use client';

import { useState } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';

export default function QueryInterface() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { activeFiles } = useActiveFiles();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    activeFiles
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to process query');
            }
            
            setResult(data);
        } catch (error) {
            console.error('Query error:', error);
            setError(error.message || 'An error occurred while processing your query');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    name="query"
                    id="query"
                    className="w-full p-4 pr-12 rounded-lg bg-[var(--card-dark)] text-[var(--text-primary)] 
                             placeholder-[var(--text-secondary)] border border-[#3a3a3a] 
                             focus:border-[var(--accent-green)] focus:ring-1 focus:ring-[var(--accent-green)]
                             transition-colors duration-200"
                    placeholder="Ask a question about your documents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md
                              ${isLoading || !query.trim() 
                                ? 'text-[var(--text-secondary)]' 
                                : 'text-[var(--accent-green)] hover:text-[var(--accent-green-bright)]'
                              } transition-colors duration-200`}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </button>
            </form>

            {error && (
                <div className="p-4 rounded-lg bg-red-500 bg-opacity-10 border border-red-500">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {result && (
                <div className="p-6 rounded-lg bg-[var(--card-dark)] border border-[#3a3a3a]">
                    <pre className="whitespace-pre-wrap text-[var(--text-primary)]">{result.answer}</pre>
                </div>
            )}
        </div>
    );
}
