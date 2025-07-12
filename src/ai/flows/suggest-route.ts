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
    .string()
    .describe('A string describing the user interests and wants for their trip.'),
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
  prompt: `You are an expert ecotourism guide for the province of Pangasinan in the Philippines. Your task is to create an optimal travel itinerary based on a user's request.

You will be given the user's general location, a list of available points of interest (POIs) spread across Pangasinan, and their request in their own words.

**Context:**
- User's General Location: {{{currentLocation}}}
- Available POIs: {{#each availablePois}} - {{{this}}} {{/each}}
- User's Request: {{{interests}}}

**Your Goal:**
Suggest an optimal, logical route that connects 2-4 of the available POIs for a well-paced trip that directly addresses the user's request.

**Instructions:**
1.  **Analyze Request:** Carefully read the user's request to understand their desires. They might mention specific activities (e.g., "swimming," "taking photos"), vibes ("relaxing," "adventurous"), or types of places ("beaches," "churches," "hidden gems").
2.  **Match to POIs:** Select POIs that best match the user's stated interests. For example, if they say "I want to see the most famous beach and lighthouse," you should prioritize Patar Beach and Cape Bolinao Lighthouse. If they say "I want to go island hopping," Hundred Islands is the obvious choice.
3.  **Create a Logical Path:** The POIs are in different towns. Arrange the selected POIs in a sequence that makes geographical sense for travel. Grouping spots in Bolinao and Anda together is logical. Jumping from Alaminos to Tayug and back to Bolinao is not efficient.
4.  **Provide Reasoning:** In the 'reasoning' field, briefly explain *why* you chose this specific route. Mention how it aligns with their request and the geographical flow. For example: "This route focuses on the coastal beauty of western Pangasinan, starting with the iconic Hundred Islands for your island hopping adventure and then moving to the serene Patar beach for a relaxing afternoon, fulfilling your request for both adventure and relaxation."

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
