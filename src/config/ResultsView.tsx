// src/components/ResultsView.tsx
import React from 'react';

interface ResultsViewProps {
    responses: {
        [key: string]: {
            raw: string;
            parsed: any;
        };
    };
}

export const ResultsView: React.FC<ResultsViewProps> = ({ responses }) => {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Your Generation Profile</h2>
            
            {Object.entries(responses).map(([questionId, data]) => (
                <div key={questionId} className="mb-8 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-3">
                        {questionId.charAt(0).toUpperCase() + questionId.slice(1)}
                    </h3>
                    
                    <div className="mb-4">
                        <p className="text-gray-600 mb-2">Your Response:</p>
                        <p className="text-gray-900">{data.raw}</p>
                    </div>
                    
                    <div>
                        <p className="text-gray-600 mb-2">Analysis:</p>
                        <pre className="bg-gray-50 p-3 rounded overflow-auto">
                            {JSON.stringify(data.parsed, null, 2)}
                        </pre>
                    </div>
                </div>
            ))}
        </div>
    );
};