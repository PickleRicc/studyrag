import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { testDocumentsTable } from '../utils/testDocuments';

export default function TestDocuments() {
    const { user } = useAuth();
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        if (!user) {
            setTestResult('No user logged in');
            return;
        }

        setLoading(true);
        try {
            const result = await testDocumentsTable(user.id);
            setTestResult(result ? 'Test passed successfully!' : 'Test failed. Check console for details.');
        } catch (error) {
            console.error('Test error:', error);
            setTestResult('Test failed with error. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold mb-4">Test Documents Table</h1>
                
                {user ? (
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="mb-4">Current User ID: {user.id}</p>
                        <button
                            onClick={runTest}
                            disabled={loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Running Test...' : 'Run Test'}
                        </button>
                        
                        {testResult && (
                            <div className={`mt-4 p-4 rounded ${
                                testResult.includes('passed') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                                {testResult}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded">
                        Please sign in to run the test.
                    </div>
                )}
            </div>
        </div>
    );
}
