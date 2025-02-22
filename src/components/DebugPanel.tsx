// src/components/DebugPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface DebugLog {
    timestamp: string;
    type: string;
    data: any;
}

const DebugPanel: React.FC = () => {
    const [logs, setLogs] = useState<DebugLog[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        const loadLogs = () => {
            if (typeof window !== 'undefined') {
                const storedLogs = JSON.parse(localStorage.getItem('followup-debug-logs') || '[]');
                setLogs(storedLogs);
            }
        };

        loadLogs();
        
        if (autoRefresh) {
            const interval = setInterval(loadLogs, 1000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    return (
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-white border-l border-t shadow-lg overflow-hidden z-50">
            <div className="p-2 border-b flex justify-between items-center bg-gray-100">
                <h3 className="font-semibold">Follow-up System Debug</h3>
                <div className="space-x-2">
                    <button 
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-2 py-1 rounded ${autoRefresh ? 'bg-green-500' : 'bg-gray-500'} text-white text-sm`}
                    >
                        {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
                    </button>
                    <button 
                        onClick={() => {
                            localStorage.setItem('followup-debug-logs', '[]');
                            setLogs([]);
                        }}
                        className="px-2 py-1 rounded bg-red-500 text-white text-sm"
                    >
                        Clear
                    </button>
                </div>
            </div>
            <div className="h-full overflow-auto p-2">
                {logs.map((log, i) => (
                    <div key={i} className="mb-4 border-b pb-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className="font-mono">{log.type}</span>
                        </div>
                        <pre className="text-sm mt-1 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DebugPanel;