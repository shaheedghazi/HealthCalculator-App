
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

// Keep input schema general to accommodate different data structures
const PersonalizedHealthTipsInputSchema = z.object({
  calculatorType: z.string().describe('The type of health calculator used (e.g., BMI, Calorie Intake, Target Heart Rate, Body Fat %, Ideal Weight, WHR, Water Intake).'),
  calculatorResult: z.string().describe('The result of the health calculator, including units or category.'),
  userData: z.string().optional().describe('Relevant user data used for the calculation (e.g., age, gender, activity level, measurements, goals).'),
});
export type PersonalizedHealthTipsInput = z.infer<typeof PersonalizedHealthTipsInputSchema>;

// Output schema remains the same
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
    schema: PersonalizedHealthTipsInputSchema,
  },
  output: {
    schema: PersonalizedHealthTipsOutputSchema,
  },
  prompt: `You are a supportive and knowledgeable health and wellness advisor.
  Your goal is to provide actionable, personalized, and encouraging health tips based on the user's health calculator results and the data they provided.

  **Calculation Details:**
  * **Calculator Used:** {{{calculatorType}}}
  * **Result:** {{{calculatorResult}}}
  * **User Data Provided:** {{{userData}}}

  **Instructions:**
  1.  **Analyze the Result:** Interpret the \`calculatorResult\` in the context of the \`calculatorType\` and \`userData\`.
  2.  **Generate Tips:** Provide 3-5 concise, actionable, and personalized health tips.
        *   **BMI:** If overweight/obese, suggest gradual changes like incorporating more vegetables, moderate exercise (walking). If underweight, suggest nutrient-dense foods and consulting a doctor/dietitian. If normal, suggest maintaining healthy habits.
        *   **Calorie Intake:** Compare the estimated needs to general guidelines or potential goals (if implied by activity level). Suggest ways to adjust intake (e.g., portion control, healthier swaps) or maintain based on the result.
        *   **Target Heart Rate:** Explain the significance of the zone for cardiovascular health or fat burning. Suggest types of exercise that fit within this zone (e.g., brisk walking, jogging, cycling).
        *   **Body Fat %:** Explain the category result. Suggest strategies relevant to the category (e.g., strength training and balanced diet for high body fat; maintaining healthy habits for fitness/acceptable ranges).
        *   **Ideal Weight:** Frame the result as a general guideline. If current weight (if provided in userData) is outside the range, suggest healthy approaches towards the range (not rapid loss/gain). Emphasize that healthy weight varies.
        *   **WHR:** Explain the health risk associated with the ratio. Suggest focusing on core exercises and a balanced diet to improve fat distribution if risk is moderate/high.
        *   **Water Intake:** Emphasize the importance of hydration. Suggest practical tips to reach the recommended intake (e.g., carrying a water bottle, setting reminders, eating water-rich foods).
  3.  **Tone:** Be positive, encouraging, and avoid judgmental language. Focus on small, sustainable changes.
  4.  **Disclaimer:** Always include the disclaimer: "These tips are for informational purposes only and not a substitute for professional medical advice. Consult a healthcare provider for personalized guidance."

  **Output Format:**
  Provide the response strictly in the JSON format defined by the output schema, containing 'healthTips' (an array of strings) and the 'disclaimer'.
  `,
});

const personalizedHealthTipsFlow = ai.defineFlow<
  typeof PersonalizedHealthTipsInputSchema,
  typeof PersonalizedHealthTipsOutputSchema
>({
  name: 'personalizedHealthTipsFlow',
  inputSchema: PersonalizedHealthTipsInputSchema,
  outputSchema: PersonalizedHealthTipsOutputSchema,
}, async input => {
    console.log("Genkit Flow Input:", input); // Add logging
    try {
        const {output} = await prompt(input);
        console.log("Genkit Flow Output:", output); // Add logging
        if (!output) {
             throw new Error("Received null output from prompt");
        }
         // Ensure disclaimer is always added if missing
        if (!output.disclaimer) {
          output.disclaimer = "These tips are for informational purposes only and not a substitute for professional medical advice. Consult a healthcare provider for personalized guidance.";
        }
        return output;
    } catch(error) {
        console.error("Error in personalizedHealthTipsFlow:", error);
        // Provide a fallback error response matching the schema
        return {
            healthTips: ["An error occurred while generating tips. Please try again."],
            disclaimer: "These tips are for informational purposes only and not a substitute for professional medical advice. Consult a healthcare provider for personalized guidance.",
        };
    }
});


    