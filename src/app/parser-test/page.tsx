// src/app/parser-test/page.tsx
'use client';

import { useState } from 'react';

export default function TestParser() {
    const [questionId, setQuestionId] = useState('birthDate');
    const [response, setResponse] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch('/api/test-parser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ questionId, response }),
            });
            
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            
            setResult(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Parser Test Interface</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 text-gray-900 font-medium">Question Type:</label>
                    <select 
                        value={questionId}
                        onChange={(e) => setQuestionId(e.target.value)}
                        className="w-full p-2 border rounded text-gray-900"
                    >
                        <option value="birthDate">Birth Date</option>
                        <option value="background">Background</option>
                        <option value="influences">Influences</option>
                        <option value="currentFocus">Current Focus</option>
                    </select>
                </div>
                
                <div>
                    <label className="block mb-2 text-gray-900 font-medium">Response:</label>
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="w-full p-2 border rounded h-32 text-gray-900"
                        placeholder="Enter your response here..."
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Parse Response'}
                </button>
            </form>
            
            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {result && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2 text-gray-900">Result:</h2>
                    <pre className="p-4 bg-gray-100 rounded overflow-auto text-gray-900">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}