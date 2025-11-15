'use server';

/**
 * @fileOverview Generates contextually relevant responses from the chatbot.
 *
 * - generateAiResponse - A function that generates AI responses based on user input and conversation history.
 * - GenerateAiResponseInput - The input type for the generateAiResponse function.
 * - GenerateAiResponseOutput - The return type for the generateAiResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getTonePrompt} from './update-tone-prompt';

const GenerateAiResponseInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  conversationHistory: z.array(z.string()).optional().describe('The previous messages in the conversation.'),
  tonePrompt: z.string().optional().describe('The tone prompt for the AI response.'),
});
export type GenerateAiResponseInput = z.infer<typeof GenerateAiResponseInputSchema>;

const GenerateAiResponseOutputSchema = z.object({
  aiResponse: z.string().describe('The AI generated response.'),
});
export type GenerateAiResponseOutput = z.infer<typeof GenerateAiResponseOutputSchema>;

export async function generateAiResponse(input: GenerateAiResponseInput): Promise<GenerateAiResponseOutput> {
  return generateAiResponseFlow(input);
}

const generateResponsePrompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {schema: GenerateAiResponseInputSchema},
  output: {schema: GenerateAiResponseOutputSchema},
  prompt: `{{{tonePrompt}}}

User Input: {{{userInput}}}
Conversation History: {{{conversationHistory}}}
AI Response:`,
});

const generateAiResponseFlow = ai.defineFlow(
  {
    name: 'generateAiResponseFlow',
    inputSchema: GenerateAiResponseInputSchema,
    outputSchema: GenerateAiResponseOutputSchema,
  },
  async input => {
    const tonePrompt = await getTonePrompt();
    const {output} = await generateResponsePrompt({...input, tonePrompt});
    return output!;
  }
);
