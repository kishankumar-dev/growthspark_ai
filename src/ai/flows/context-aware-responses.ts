'use server';

/**
 * @fileOverview Implements a Genkit flow for providing context-aware responses related to business growth, revenue, churn, market, and strategy.
 *
 * - `provideContextAwareResponse`: A function that takes a user query and returns an AI response tailored to business growth contexts.
 * - `ContextAwareResponseInput`: The input type for the `provideContextAwareResponse` function.
 * - `ContextAwareResponseOutput`: The return type for the `provideContextAwareResponse` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextAwareResponseInputSchema = z.object({
  query: z.string().describe('The user query related to business growth, revenue, churn, market, or strategy.'),
});
export type ContextAwareResponseInput = z.infer<typeof ContextAwareResponseInputSchema>;

const ContextAwareResponseOutputSchema = z.object({
  response: z.string().describe('The AI response tailored to the business growth context.'),
});
export type ContextAwareResponseOutput = z.infer<typeof ContextAwareResponseOutputSchema>;

export async function provideContextAwareResponse(input: ContextAwareResponseInput): Promise<ContextAwareResponseOutput> {
  return contextAwareResponseFlow(input);
}

const contextAwareResponsePrompt = ai.definePrompt({
  name: 'contextAwareResponsePrompt',
  input: {schema: ContextAwareResponseInputSchema},
  output: {schema: ContextAwareResponseOutputSchema},
  prompt: `You are a business growth strategist. Provide a helpful and informative response to the following query related to business growth, revenue, churn, market, or strategy.

Format your response using markdown, including lists, code blocks, and other formatting as appropriate.

Query: {{{query}}}`,
});

const contextAwareResponseFlow = ai.defineFlow(
  {
    name: 'contextAwareResponseFlow',
    inputSchema: ContextAwareResponseInputSchema,
    outputSchema: ContextAwareResponseOutputSchema,
  },
  async input => {
    const {output} = await contextAwareResponsePrompt(input);
    return output!;
  }
);
