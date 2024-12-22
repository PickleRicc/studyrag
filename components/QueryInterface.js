import { useState } from 'react';
import { useActiveFiles } from '../hooks/useActiveFiles';

export default function QueryInterface() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { activeFiles } = useActiveFiles();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

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
            setResult(data);
        } catch (error) {
            console.error('Query error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                    <input
                        type="text"
                        name="query"
                        id="query"
                        className="flex-1 min-w-0 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                        placeholder="Ask a question about your documents..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || isLoading || activeFiles.length === 0}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : (
                            'Ask'
                        )}
                    </button>
                </div>
            </form>

            {result && (
                <div className="mt-6">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Answer
                            </h3>
                            <div className="mt-2 max-w-xl text-sm text-gray-500">
                                <p style={{ whiteSpace: 'pre-wrap' }}>{result.answer}</p>
                            </div>
                            {result.sources && result.sources.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-sm font-medium text-gray-900">Sources:</h4>
                                    <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                                        {result.sources.map((source, index) => (
                                            <li key={index}>
                                                {source.fileName}
                                                {source.score !== undefined && (
                                                    <span className="text-gray-400 ml-2">
                                                        (Score: {source.score.toFixed(2)})
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
