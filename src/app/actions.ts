"use server";

import { provideContextAwareResponse } from '@/ai/flows/context-aware-responses';
import { suggestBusinessStrategies } from '@/ai/flows/suggest-business-strategies';
import { generatePlaceholder } from '@/ai/flows/generate-placeholder';
import { z } from 'zod';

const chatSchema = z.object({
  userInput: z.string().min(1, { message: "Message cannot be empty." }).max(4096),
});

const strategySchema = z.object({
  topic: z.string().min(1).max(4096),
});

const placeholderSchema = z.object({
    message: z.string().min(1).max(8192),
});

export async function getAiResponse(formData: FormData) {
  try {
    const validatedData = chatSchema.safeParse({
      userInput: formData.get('userInput'),
    });

    if (!validatedData.success) {
      const errorMessage = validatedData.error.errors.map(e => e.message).join(', ');
      return { error: errorMessage };
    }
    
    const { userInput } = validatedData.data;
    const response = await provideContextAwareResponse({ query: userInput });
    return { response: response.response };

  } catch (error) {
    console.error("AI response error:", error);
    return { error: "An unexpected error occurred while contacting the AI. Please try again later." };
  }
}

export async function getStrategySuggestion(formData: FormData) {
  try {
    const validatedData = strategySchema.safeParse({
      topic: formData.get('topic'),
    });

    if (!validatedData.success) {
      const errorMessage = validatedData.error.errors.map(e => e.message).join(', ');
      return { error: errorMessage };
    }

    const { topic } = validatedData.data;

    const response = await suggestBusinessStrategies({ query: topic });
    return { response: response.strategies };
  } catch (error) {
    console.error("Strategy suggestion error:", error);
    return { error: "An unexpected error occurred while generating strategies. Please try again later." };
  }
}


export async function getNewPlaceholder(formData: FormData) {
    try {
        const validatedData = placeholderSchema.safeParse({
            message: formData.get('message'),
        });

        if (!validatedData.success) {
            return { placeholder: "What's our next move?" };
        }
        
        const { message } = validatedData.data;

        const response = await generatePlaceholder({ lastMessage: message });
        return { placeholder: response.placeholder };

    } catch (error) {
        console.error("Placeholder generation error:", error);
        // Return a generic placeholder on error
        return { placeholder: "What's our next move?" };
    }
}
