'use server';

/**
 * @fileOverview AI-powered route suggestion for ecotourism.
 *
 * - suggestOptimalEcoRoute - A function that suggests an optimal route through ecological points of interest.
 * - SuggestOptimalEcoRouteInput - The input type for the suggestOptimalEcoRoute function.
 * - SuggestOptimalEcoRouteOutput - The return type for the suggestOptimalEcoRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalEcoRouteInputSchema = z.object({
  currentLocation: z
    .string()
    .describe('The current location of the user as a string.'),
  availablePois: z
    .array(z.string())
    .describe('An array of available points of interest (POIs).'),
  interests: z
    .array(z.string())
    .describe('An array of user interests related to ecotourism.'),
});
export type SuggestOptimalEcoRouteInput = z.infer<typeof SuggestOptimalEcoRouteInputSchema>;

const SuggestOptimalEcoRouteOutputSchema = z.object({
  optimalRoute: z
    .array(z.string())
    .describe('An array of POIs representing the optimal route.'),
  reasoning: z
    .string()
    .describe('Explanation of why the route is considered optimal.'),
});
export type SuggestOptimalEcoRouteOutput = z.infer<typeof SuggestOptimalEcoRouteOutputSchema>;

export async function suggestOptimalEcoRoute(
  input: SuggestOptimalEcoRouteInput
): Promise<SuggestOptimalEcoRouteOutput> {
  return suggestOptimalEcoRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalEcoRoutePrompt',
  input: {schema: SuggestOptimalEcoRouteInputSchema},
  output: {schema: SuggestOptimalEcoRouteOutputSchema},
  prompt: `You are an expert ecotourism guide for the province of Pangasinan in the Philippines. Your task is to create an optimal travel itinerary.

You will be given the user's general location, a list of available points of interest (POIs) spread across Pangasinan, and their specific interests.

**Context:**
- User's General Location: {{{currentLocation}}}
- Available POIs: {{#each availablePois}} - {{{this}}} {{/each}}
- User's Interests: {{#each interests}} - {{{this}}} {{/each}}

**Your Goal:**
Suggest an optimal, logical route that connects 2-4 of the available POIs for a well-paced trip.

**Instructions:**
1.  **Analyze Interests:** Prioritize POIs that directly match the user's interests. For example, if they like 'Pilgrimage Sites', Manaoag Church is a must. If they like 'Island Hopping', Hundred Islands is the top choice.
2.  **Create a Logical Path:** The POIs are in different towns. Arrange the selected POIs in a sequence that makes geographical sense for travel. For instance, grouping spots in Bolinao and Anda together is logical, while jumping from Alaminos to Tayug and back to Bolinao is not efficient for a single day.
3.  **Provide Reasoning:** In the 'reasoning' field, briefly explain *why* you chose this specific route. Mention how it aligns with the user's interests and the geographical flow of travel. For example: "This route focuses on the coastal beauty of western Pangasinan, starting with the iconic Hundred Islands and then moving to the serene beaches of Bolinao, which aligns with your interests in islands and beaches."

Generate the 'optimalRoute' as an array of POI names and the 'reasoning' as a descriptive string.
  `,
});

const suggestOptimalEcoRouteFlow = ai.defineFlow(
  {
    name: 'suggestOptimalEcoRouteFlow',
    inputSchema: SuggestOptimalEcoRouteInputSchema,
    outputSchema: SuggestOptimalEcoRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
