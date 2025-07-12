'use server';

/**
 * @fileOverview AI-powered itinerary generation for ecotourism in Pangasinan.
 *
 * - suggestOptimalEcoRoute - A function that generates a detailed travel itinerary.
 * - SuggestOptimalEcoRouteInput - The input type for the suggestOptimalEcoRoute function.
 * - SuggestOptimalEcoRouteOutput - The return type for the suggestOptimalEcoRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalEcoRouteInputSchema = z.object({
  interests: z
    .string()
    .describe('A string describing the user interests and what they want to experience during their trip.'),
  duration: z.number().describe('The number of days for the trip.'),
  budget: z.enum(['budget-friendly', 'mid-range', 'luxury']).describe('The user\'s budget preference.'),
});
export type SuggestOptimalEcoRouteInput = z.infer<typeof SuggestOptimalEcoRouteInputSchema>;

const ItineraryDaySchema = z.object({
    day: z.number().describe('The day number of the itinerary (e.g., 1, 2, 3).'),
    title: z.string().describe('A catchy title for the day\'s activities (e.g., "Coastal Wonders & Sunset").'),
    activities: z.array(z.string()).describe('A list of activities and destinations for the day, in a logical sequence.'),
    accommodation: z.string().optional().describe('A specific recommendation for where to stay overnight.'),
    dining: z.string().optional().describe('A specific recommendation for where to eat for the day (e.g., restaurant name).'),
});

const SuggestOptimalEcoRouteOutputSchema = z.object({
    itineraryTitle: z.string().describe('A creative and engaging title for the entire trip.'),
    overallSummary: z.string().describe('A brief, one-paragraph summary of the trip plan.'),
    itinerary: z.array(ItineraryDaySchema).describe('An array of daily plans.'),
    estimatedBudget: z.string().describe('An estimated cost for the trip, formatted as a string (e.g., "₱5,000 - ₱8,000 per person").'),
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
  prompt: `You are an expert travel agent and ecotourism guide specializing in Pangasinan, Philippines. Your task is to create a detailed, logical, and inspiring travel itinerary based on a user's request. You have deep knowledge of all tourist spots, restaurants, and accommodations in the entire province.

**User's Request:**
- **Interests:** {{{interests}}}
- **Trip Duration:** {{{duration}}} day(s)
- **Budget:** {{{budget}}}

**Your Goal:**
Create a comprehensive, multi-day itinerary that is perfectly tailored to the user's request. The itinerary must be practical, geographically logical, and provide specific, actionable recommendations.

**Instructions:**
1.  **Analyze the Request:** Deeply understand the user's interests, desired duration, and budget.
2.  **Select Destinations:** Choose the most relevant tourist spots, activities, and hidden gems from across Pangasinan that match the user's request.
3.  **Structure the Itinerary:**
    -   Create a day-by-day plan. Each day should have a clear theme or focus.
    -   Arrange activities in a geographically logical order to minimize travel time. For example, group activities in Bolinao and Anda together.
    -   For each day, provide a list of activities. Be descriptive (e.g., "Island hopping tour at Hundred Islands, visit Governor's Island viewpoint").
4.  **Recommend Accommodation:** Based on the itinerary's location for the night and the user's budget, suggest a specific place to stay (e.g., "Sundowners Vacation Villas in Bolinao"). Provide one recommendation per day where an overnight stay is implied.
5.  **Recommend Dining:** Suggest a specific, well-regarded local restaurant for each day that fits the budget and location (e.g., "Sungayan Grill in Bolinao for fresh seafood").
6.  **Estimate Budget:** Provide a realistic estimated cost range for the entire trip (per person), considering accommodation, food, tours, and entrance fees, aligned with the user's specified budget. Express this as a string like "₱X,XXX - ₱Y,YYY per person".
7.  **Create Title & Summary:** Write a catchy title for the whole trip and a short summary paragraph that gets the user excited.

Generate a complete response that strictly follows the output schema.
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
