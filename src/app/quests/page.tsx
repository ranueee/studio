'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { suggestOptimalEcoRoute, type SuggestOptimalEcoRouteOutput } from '@/ai/flows/suggest-route';
import { Loader, Wand2, Route, Trees, CheckCircle, MapPin } from 'lucide-react';

const availablePois = [
    'Hundred Islands National Park (Alaminos)',
    'Patar Beach (Bolinao)',
    'Enchanted Cave (Bolinao)',
    'Bolinao Falls 1',
    'Cape Bolinao Lighthouse',
    'Lingayen Gulf Beach',
    'Manaoag Church',
    'Tayug Sunflower Maze',
    'Dasol Salt Farms',
    'Tondol Beach (Anda)',
    'Death Pool (Cabongaoan Beach, Burgos)'
];

export default function ItineraryPage() {
  const [interests, setInterests] = useState('');
  const [suggestedRoute, setSuggestedRoute] = useState<SuggestOptimalEcoRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestRoute = async () => {
    if (interests.trim().length === 0) return;
    setIsLoading(true);
    setSuggestedRoute(null);
    try {
      const result = await suggestOptimalEcoRoute({
        currentLocation: 'Pangasinan, Philippines',
        availablePois,
        interests: interests,
      });
      setSuggestedRoute(result);
    } catch (error) {
      console.error('Error suggesting route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">AI Itinerary Planner</h1>
        <p className="text-muted-foreground">Let our AI guide suggest the perfect eco-adventure. Just tell us what you're looking for!</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trees className="w-6 h-6 text-primary" />
              Describe your ideal trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="interests">
                For example: "I want a relaxing day at a beautiful beach, maybe see a waterfall if it's nearby."
              </Label>
              <Textarea 
                placeholder="Type your interests here..." 
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>
            <Button onClick={handleSuggestRoute} disabled={isLoading || interests.trim().length === 0} className="w-full mt-6">
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Create Route
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center p-8">
            <Loader className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Crafting your perfect adventure...</p>
          </div>
        )}

        {suggestedRoute && (
          <Card className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-6 h-6 text-primary" />
                Your Suggested Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                  {suggestedRoute.optimalRoute.map(poi => (
                    <li key={poi} className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary"/>
                        <span>{poi}</span>
                    </li>
                  ))}
                </ol>
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Why this route?</h4>
                  <p className="text-sm text-muted-foreground mt-2">{suggestedRoute.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
