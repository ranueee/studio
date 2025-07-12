'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { suggestOptimalEcoRoute, type SuggestOptimalEcoRouteOutput } from '@/ai/flows/suggest-route';
import { Loader, Wand2, Route, Trees, CheckCircle, MapPin } from 'lucide-react';

const availableInterests = ['Beaches', 'Island Hopping', 'Waterfalls', 'Cave Exploration', 'Historical Sites', 'Local Food', 'Pilgrimage Sites', 'Nature Parks', 'Farm Tourism'];
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

export default function QuestsPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [suggestedRoute, setSuggestedRoute] = useState<SuggestOptimalEcoRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInterestChange = (interest: string, checked: boolean | 'indeterminate') => {
    setSelectedInterests(prev =>
      checked ? [...prev, interest] : prev.filter(i => i !== interest)
    );
  };

  const handleSuggestRoute = async () => {
    if (selectedInterests.length === 0) return;
    setIsLoading(true);
    setSuggestedRoute(null);
    try {
      const result = await suggestOptimalEcoRoute({
        currentLocation: 'Pangasinan, Philippines',
        availablePois,
        interests: selectedInterests,
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
        <h1 className="text-3xl font-bold">AI Route Planner</h1>
        <p className="text-muted-foreground">Let our AI guide suggest the perfect eco-adventure based on your interests.</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trees className="w-6 h-6 text-primary" />
              What are your interests?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {availableInterests.map(interest => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    onCheckedChange={(checked) => handleInterestChange(interest, checked)}
                  />
                  <Label htmlFor={interest} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
            <Button onClick={handleSuggestRoute} disabled={isLoading || selectedInterests.length === 0} className="w-full mt-6">
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Suggest a Route
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
