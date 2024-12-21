import { useState } from 'react';

export default function QueryInterface({ processedFiles }) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

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
                    fileNames: processedFiles.map(file => file.fileName),
                    topK: 5
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
                        disabled={!query.trim() || isLoading || processedFiles.length === 0}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            'Ask Question'
                        )}
                    </button>
                </div>
            </form>

            {result && (
                <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                        <span className="text-xs font-medium text-gray-500">
                            {result.queryType === 'specific' ? '🎯 Specific Query' : '🔍 General Overview'}
                        </span>
                    </div>
                    
                    <div className="px-4 py-5 sm:p-6">
                        <div className="prose max-w-none">
                            <div className="text-gray-900 whitespace-pre-wrap">
                                {result.answer}
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900">Sources:</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {result.sources.map((source, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                        {source.fileName}
                                        {source.score && 
                                            <span className="ml-1 text-blue-600">
                                                ({(source.score * 100).toFixed(0)}%)
                                            </span>
                                        }
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
