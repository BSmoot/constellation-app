'use client';

import React, { useState, useEffect } from 'react';

// Add this function to remove the attribute
function removeShortcutListener() {
  // Remove the attribute from any elements that might have it
  const elements = document.querySelectorAll('[cz-shortcut-listen]');
  elements.forEach(el => {
    el.removeAttribute('cz-shortcut-listen');
  });
}

// Separate loading component to avoid hydration issues
const LoadingState = () => (
  <main className="min-h-screen bg-[#E9F1F7] p-8">
    <div className="max-w-4xl mx-auto">
      <div className="text-center text-gray-600">
        Loading debug data...
      </div>
    </div>
  </main>
);

// Separate content component
const DebugContent = ({ debugData, onProcess }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#E9F1F7] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-dark">LLM Flow Debug</h1>
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-dark">Step One Responses</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-gray-800">
              {JSON.stringify(debugData.stepOneResponses, null, 2)}
            </pre>
          </section>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onProcess}
              disabled={!mounted || debugData.isProcessing}
              className={`px-6 py-3 bg-[#F3522F] text-white rounded-lg
                ${debugData.isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f4633f]'}
                transition-colors duration-200`}
            >
              {debugData.isProcessing ? 'Processing...' : 'Process with LLM'}
            </button>
            {debugData.error && (
              <p className="text-red-600">{debugData.error}</p>
            )}
          </div>

          {(debugData.llmPrompt || debugData.isProcessing) && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-dark">Processing Flow</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-dark">1. Prepared Prompt</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-gray-800">
                  {debugData.llmPrompt || 'Preparing prompt...'}
                </pre>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-dark">2. Raw LLM Response</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-gray-800">
                  {debugData.llmResponse
                    ? JSON.stringify(debugData.llmResponse, null, 2)
                    : debugData.isProcessing
                      ? 'Waiting for LLM response...'
                      : 'No response yet'}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-dark">3. Parsed Result</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-gray-800">
                  {debugData.parsedData
                    ? JSON.stringify(debugData.parsedData, null, 2)
                    : debugData.isProcessing
                      ? 'Processing parsed data...'
                      : 'No parsed data yet'}
                </pre>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

// Main component
function LLMFlowDebugPage() {
  const [mounted, setMounted] = useState(false);
  const [debugData, setDebugData] = useState({
    stepOneResponses: {},
    llmPrompt: '',
    llmResponse: null,
    parsedData: null,
    isProcessing: false,
    error: null
  });

  useEffect(() => {
    const storedData = localStorage.getItem('onboarding-responses');
    if (storedData) {
      setDebugData(prev => ({
        ...prev,
        stepOneResponses: JSON.parse(storedData)
      }));
    }
    setMounted(true);

    // Add cleanup function
    return () => {
      removeShortcutListener();
    };
  }, []);
  
  const sendToLLM = async () => {
    if (!debugData.stepOneResponses) return;

    setDebugData(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      llmPrompt: '',
      llmResponse: null,
      parsedData: null
    }));

    try {
      const response = await fetch('/api/debug/llm-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: debugData.stepOneResponses })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unknown error');
      }

      setDebugData(prev => ({
        ...prev,
        llmPrompt: data.prompt || '',
        llmResponse: data.response || null,
        parsedData: data.parsed || null,
        isProcessing: false,
        error: null
      }));
    } catch (error: any) {
      console.error('Debug LLM flow error:', error);
      setDebugData(prev => ({
        ...prev,
        error: error.message || 'An unexpected error occurred',
        isProcessing: false
      }));
    }
  };

  if (!mounted) {
    return <LoadingState />;
  }

// Update DebugContent to include type="button" on all buttons
return mounted ? (
  <DebugContent 
    debugData={debugData} 
    onProcess={(e) => {
      e?.preventDefault?.();
      sendToLLM();
    }} 
  />
) : <LoadingState />;
}

export default LLMFlowDebugPage;