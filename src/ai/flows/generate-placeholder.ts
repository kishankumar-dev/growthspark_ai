'use server';

/**
 * @fileOverview Implements a Genkit flow for generating a context-aware placeholder for a chat input.
 *
 * - `generatePlaceholder`: A function that takes the last AI message and returns a relevant placeholder.
 * - `GeneratePlaceholderInput`: The input type for the `generatePlaceholder` function.
 * - `GeneratePlaceholderOutput`: The return type for the `generatePlaceholder` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlaceholderInputSchema = z.object({
  lastMessage: z.string().describe('The last message from the AI assistant.'),
});
export type GeneratePlaceholderInput = z.infer<typeof GeneratePlaceholderInputSchema>;

const GeneratePlaceholderOutputSchema = z.object({
  placeholder: z.string().describe('A short, relevant follow-up question to be used as a placeholder.'),
});
export type GeneratePlaceholderOutput = z.infer<typeof GeneratePlaceholderOutputSchema>;

export async function generatePlaceholder(input: GeneratePlaceholderInput): Promise<GeneratePlaceholderOutput> {
  return generatePlaceholderFlow(input);
}

const generatePlaceholderPrompt = ai.definePrompt({
  name: 'generatePlaceholderPrompt',
  input: {schema: GeneratePlaceholderInputSchema},
  output: {schema: GeneratePlaceholderOutputSchema},
  prompt: `Given the following AI assistant message, generate a short, relevant follow-up question that can be used as a placeholder in a chat input. The placeholder should be a concise question and encourage further discussion on the topic. Make it feel like a natural next step in the conversation.

Assistant Message:
"{{{lastMessage}}}"

Placeholder:`,
});

const generatePlaceholderFlow = ai.defineFlow(
  {
    name: 'generatePlaceholderFlow',
    inputSchema: GeneratePlaceholderInputSchema,
    outputSchema: GeneratePlaceholderOutputSchema,
  },
  async input => {
    // If the last message is the initial greeting, return a default placeholder.
    if (input.lastMessage.startsWith("Hello! I'm your GrowthSpark AI assistant.")) {
        return { placeholder: "How can we increase Q3 revenue?" };
    }
    const {output} = await generatePlaceholderPrompt(input);
    return output!;
  }
);
