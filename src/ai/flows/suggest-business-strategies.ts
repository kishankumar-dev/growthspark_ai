'use server';

/**
 * @fileOverview An AI agent that suggests business strategies based on user input.
 *
 * - suggestBusinessStrategies - A function that handles the business strategy suggestion process.
 * - SuggestBusinessStrategiesInput - The input type for the suggestBusinessStrategies function.
 * - SuggestBusinessStrategiesOutput - The return type for the suggestBusinessStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBusinessStrategiesInputSchema = z.object({
  query: z
    .string()
    .describe('The user query requesting business advice or strategies.'),
});
export type SuggestBusinessStrategiesInput = z.infer<typeof SuggestBusinessStrategiesInputSchema>;

const SuggestBusinessStrategiesOutputSchema = z.object({
  strategies: z
    .string()
    .describe(
      'A list of actionable business strategies generated based on the user query.'
    ),
});
export type SuggestBusinessStrategiesOutput = z.infer<typeof SuggestBusinessStrategiesOutputSchema>;

export async function suggestBusinessStrategies(
  input: SuggestBusinessStrategiesInput
): Promise<SuggestBusinessStrategiesOutput> {
  return suggestBusinessStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBusinessStrategiesPrompt',
  input: {schema: SuggestBusinessStrategiesInputSchema},
  output: {schema: SuggestBusinessStrategiesOutputSchema},
  prompt: `You are an expert business growth strategist. A user is asking for business advice. Generate a list of actionable business strategies based on the user's query.

Format your response using markdown, including lists, code blocks, and other formatting as appropriate.

User Query: {{{query}}}

Strategies:`,
});

const suggestBusinessStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestBusinessStrategiesFlow',
    inputSchema: SuggestBusinessStrategiesInputSchema,
    outputSchema: SuggestBusinessStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
