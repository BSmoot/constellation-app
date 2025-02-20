// src/lib/llm.ts

export async function generateFollowUpQuestion(input: string): Promise<string> {
    const prompt = `
      You are a coach, a centered stone, and a risk-assessment officer. Help guide the user to provide the required information: birth timeframe and geography.
      User's input: ${input}
      Generate a follow-up question to gather the required information in a kind, fair, and direct manner.
    `;
  
    // Replace this with your actual LLM service call
    const response = await fakeLlmService(prompt);
    return response.question;
  }
  
  // Simulated LLM service for demonstration purposes
  async function fakeLlmService(prompt: string): Promise<{ question: string }> {
    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { question: "Can you please provide your birth year and city?" };
  }