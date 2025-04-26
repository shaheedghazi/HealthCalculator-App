// src/ai/flows/personalized-health-tips.ts
'use server';
/**
 * @fileOverview Provides personalized health tips based on user's health calculator results.
 *
 * - personalizedHealthTips - A function that generates personalized health tips.
 * - PersonalizedHealthTipsInput - The input type for the personalizedHealthTips function.
 * - PersonalizedHealthTipsOutput - The return type for the personalizedHealthTips function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PersonalizedHealthTipsInputSchema = z.object({
  calculatorType: z.string().describe('The type of health calculator used (e.g., BMI, calorie intake, target heart rate).'),
  calculatorResult: z.string().describe('The result of the health calculator, including units.'),
  userData: z.string().optional().describe('Optional user data such as age, gender, activity level, and health goals.'),
});
export type PersonalizedHealthTipsInput = z.infer<typeof PersonalizedHealthTipsInputSchema>;

const PersonalizedHealthTipsOutputSchema = z.object({
  healthTips: z.array(z.string()).describe('An array of personalized health tips based on the calculator results and user data.'),
  disclaimer: z.string().optional().describe('An optional disclaimer for the health tips.'),
});
export type PersonalizedHealthTipsOutput = z.infer<typeof PersonalizedHealthTipsOutputSchema>;

export async function personalizedHealthTips(input: PersonalizedHealthTipsInput): Promise<PersonalizedHealthTipsOutput> {
  return personalizedHealthTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHealthTipsPrompt',
  input: {
    schema: z.object({
      calculatorType: z.string().describe('The type of health calculator used (e.g., BMI, calorie intake, target heart rate).'),
      calculatorResult: z.string().describe('The result of the health calculator, including units.'),
      userData: z.string().optional().describe('Optional user data such as age, gender, activity level, and health goals.'),
    }),
  },
  output: {
    schema: z.object({
      healthTips: z.array(z.string()).describe('An array of personalized health tips based on the calculator results and user data.'),
      disclaimer: z.string().optional().describe('An optional disclaimer for the health tips.'),
    }),
  },
  prompt: `You are a health and wellness expert. Provide personalized health tips based on the user's calculator results and user data.

  Calculator Type: {{{calculatorType}}}
  Calculator Result: {{{calculatorResult}}}
  User Data: {{{userData}}}

  Provide at least three personalized health tips. Include a disclaimer that the tips are for informational purposes only and not a substitute for professional medical advice.`,
});

const personalizedHealthTipsFlow = ai.defineFlow<
  typeof PersonalizedHealthTipsInputSchema,
  typeof PersonalizedHealthTipsOutputSchema
>({
  name: 'personalizedHealthTipsFlow',
  inputSchema: PersonalizedHealthTipsInputSchema,
  outputSchema: PersonalizedHealthTipsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
