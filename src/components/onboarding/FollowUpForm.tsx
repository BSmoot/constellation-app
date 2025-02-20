// src/components/onboarding/FollowUpForm.tsx
'use client';

interface FollowUpFormProps {
  initialData: Record<string, string>;
  onComplete: (data: Record<string, string>) => void;
}

export default function FollowUpForm({ initialData, onComplete }: FollowUpFormProps) {
  const [attempts, setAttempts] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [responses, setResponses] = useState<Record<string, string>>(initialData);

  useEffect(() => {
    generateFollowUpQuestion();
  }, []);

  const generateFollowUpQuestion = async () => {
    const response = await fetch('/api/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses, attempts })
    });
    const data = await response.json();
    setCurrentQuestion(data.question);
  };

  const handleSubmit = async (response: string) => {
    if (attempts >= 4) {
      onComplete(responses);
      return;
    }

    setResponses(prev => ({...prev, [`followUp${attempts}`]: response}));
    setAttempts(prev => prev + 1);
    await generateFollowUpQuestion();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-xl font-medium text-dark mb-4">
          Let's get a few more details...
        </h2>
        <p className="text-text-light mb-6">{currentQuestion}</p>
        <textarea
          className="w-full px-4 py-3 border border-[#232C33] border-opacity-50 
                   rounded-lg focus:outline-none focus:border-[#232C33] 
                   transition-colors duration-200"
          rows={4}
          onChange={/* ... */}
        />
        <div className="flex justify-between mt-4">
          <span className="text-sm text-text-light">
            {4 - attempts} questions remaining
          </span>
          <button
            onClick={/* ... */}
            className="px-6 py-2 bg-[#F3522F] text-white rounded-lg
                     hover:bg-[#f4633f] transition-colors duration-200"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}