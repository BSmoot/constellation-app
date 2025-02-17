// src/config/questions.ts

export const onboardingQuestions = [
    {
        id: 'birthDate',
        prompt: "Where and when were you born?",
        placeholder: "I was born in Ohio in 1979...",
        small: true
    },
    {
        id: 'background',
        prompt: "Describe how you grew up in a few words:",
        placeholder: "I grew up working-class suburb outside of Detroit..."
    },
    {
        id: 'influences',
        prompt: "What historic events made a lasting impression on you?",
        placeholder: "The rise of the cell phone changed everything for me..."
    },
    {
        id: 'currentFocus',
        prompt: "What is most often on your mind today?",
        placeholder: "I think a lot about how technology is changing society..."
    }
] as const;

export type QuestionId = typeof onboardingQuestions[number]['id'];