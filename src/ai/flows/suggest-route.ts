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
  prompt: `You are an AI-powered ecotourism route planner.

  Given the user's current location: {{{currentLocation}}},
  available points of interest (POIs): {{#each availablePois}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}},
  and their interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}},

  Suggest an optimal route that maximizes their eco-tourism experience.

  The route should consider:
  - Minimizing travel distance.
  - Maximizing relevance to the user's interests.
  - Highlighting diverse ecological aspects.

  Return the route as an ordered list of POIs, and provide a brief explanation of why this route is optimal.
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
