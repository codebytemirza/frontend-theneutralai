'use server';
/**
 * @fileOverview Manages the AI's tone prompt.
 *
 * - updateTonePrompt - Saves a new tone prompt.
 * - getTonePrompt - Retrieves the current tone prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Using a simple in-memory store. In a real application, you'd use a database.
let savedPrompt = 'You are a helpful chatbot. Your goal is to be as neutral as possible in your responses. Avoid taking sides or expressing opinions. Stick to the facts and be objective.';

const UpdateTonePromptInputSchema = z.string().describe("The new system prompt for the AI's tone and personality.");
export type UpdateTonePromptInput = z.infer<typeof UpdateTonePromptInputSchema>;

export async function updateTonePrompt(input: UpdateTonePromptInput): Promise<void> {
  return updateTonePromptFlow(input);
}

export async function getTonePrompt(): Promise<string> {
    return savedPrompt;
}

const updateTonePromptFlow = ai.defineFlow(
  {
    name: 'updateTonePromptFlow',
    inputSchema: UpdateTonePromptInputSchema,
    outputSchema: z.void(),
  },
  async (prompt) => {
    savedPrompt = prompt;
  }
);
