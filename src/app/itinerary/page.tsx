
'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suggestOptimalEcoRoute, type SuggestOptimalEcoRouteOutput } from '@/ai/flows/suggest-route';
import { Loader, Wand2, Route, Trees, BedDouble, Utensils, PiggyBank, CalendarDays, Coffee, Sun, Moon, Bus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ItineraryPage() {
    const [interests, setInterests] = useState('');
    const [duration, setDuration] = useState('2');
    const [budget, setBudget] = useState<'budget-friendly' | 'mid-range' | 'luxury'>('mid-range');
    const [suggestedRoute, setSuggestedRoute] = useState<SuggestOptimalEcoRouteOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSuggestRoute = async () => {
        if (interests.trim().length === 0) return;
        setIsLoading(true);
        setSuggestedRoute(null);
        try {
        const result = await suggestOptimalEcoRoute({
            interests: interests,
            duration: parseInt(duration, 10),
            budget: budget,
        });
        setSuggestedRoute(result);
        } catch (error) {
        console.error('Error suggesting route:', error);
        } finally {
        setIsLoading(false);
        }
    };

    const isFormInvalid = interests.trim().length === 0 || isLoading;
    
    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">AI Itinerary Planner</h1>
                    <p className="text-muted-foreground">Let our AI guide suggest the perfect eco-adventure in Pangasinan. Just tell us what you're looking for!</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Trees className="w-6 h-6 text-primary" />
                        Describe Your Dream Trip
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid w-full gap-2">
                        <Label htmlFor="interests">
                            What are your interests?
                        </Label>
                        <Textarea 
                            id="interests"
                            placeholder="e.g., 'I want a relaxing trip. I love quiet beaches, sunsets, and fresh seafood. Maybe a little bit of history.'" 
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            className="min-h-[100px]"
                        />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="duration">How many days?</Label>
                                <Select value={duration} onValueChange={setDuration}>
                                    <SelectTrigger id="duration">
                                        <SelectValue placeholder="Select days" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Day</SelectItem>
                                        <SelectItem value="2">2 Days</SelectItem>
                                        <SelectItem value="3">3 Days</SelectItem>
                                        <SelectItem value="4">4 Days</SelectItem>
                                        <SelectItem value="5">5 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid w-full gap-2">
                                <Label>What's your budget?</Label>
                                <RadioGroup value={budget} onValueChange={(value) => setBudget(value as any)} className="flex pt-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="budget-friendly" id="r1" />
                                        <Label htmlFor="r1">Budget</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="mid-range" id="r2" />
                                        <Label htmlFor="r2">Mid</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="luxury" id="r3" />
                                        <Label htmlFor="r3">Luxury</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSuggestRoute} disabled={isFormInvalid} className="w-full">
                        {isLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Create My Itinerary
                        </Button>
                    </CardFooter>
                </Card>
                {isLoading && (
                <div className="text-center p-8">
                    <Loader className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Crafting your perfect adventure... please wait.</p>
                </div>
                )}

                {suggestedRoute && (
                <Card className="animate-in fade-in">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Route className="w-7 h-7 text-primary" />
                        {suggestedRoute.itineraryTitle}
                    </CardTitle>
                    <CardDescription>{suggestedRoute.overallSummary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-secondary rounded-lg flex items-center justify-center gap-2">
                            <PiggyBank className="w-5 h-5 text-primary"/>
                            <span className="font-semibold">Estimated Budget: {suggestedRoute.estimatedBudget}</span>
                        </div>
                    
                        {suggestedRoute.itinerary.map((day, dayIndex) => (
                            <div key={day.day}>
                                {dayIndex > 0 && <Separator className="my-6"/>}
                                <h3 className="font-bold text-xl flex items-center gap-2 mb-4">
                                    <CalendarDays className="w-6 h-6 text-muted-foreground"/>
                                    Day {day.day}: {day.title}
                                </h3>

                                <div className="relative pl-6 space-y-4 border-l-2 border-primary/20">
                                    {day.activities.map((activity, index) => (
                                        <div key={index} className="relative pb-4">
                                            <div className="absolute -left-[35px] top-1.5 h-4 w-4 bg-primary rounded-full" />
                                            <p className="font-semibold text-primary">{activity.time}</p>
                                            <p className="font-medium text-foreground">{activity.description}</p>
                                            
                                            {activity.transportation && (
                                                <div className="mt-2 bg-primary/5 p-3 rounded-lg flex gap-3">
                                                    <Bus className="w-5 h-5 text-primary/80 shrink-0 mt-0.5"/>
                                                    <p className="text-sm text-muted-foreground">{activity.transportation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 space-y-4">
                                    {day.accommodation && (
                                        <div className="bg-primary/10 p-4 rounded-lg">
                                            <p className="font-bold flex items-center gap-2 mb-2"><BedDouble className="w-5 h-5"/> Accommodation</p>
                                            <p className="text-muted-foreground pl-7">{day.accommodation}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                                            <Utensils className="w-5 h-5" />
                                            Dining Plan
                                        </h4>
                                        <div className="space-y-3 pl-7">
                                            {day.dining.breakfast && (
                                                <div className="flex gap-4">
                                                    <Coffee className="w-5 h-5 mt-0.5 text-amber-600 shrink-0"/>
                                                    <div>
                                                        <p className="font-semibold">{day.dining.breakfast.restaurant} <span className="text-sm text-muted-foreground">({day.dining.breakfast.time})</span></p>
                                                        {day.dining.breakfast.notes && <p className="text-xs text-muted-foreground">{day.dining.breakfast.notes}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            {day.dining.lunch && (
                                                <div className="flex gap-4">
                                                    <Sun className="w-5 h-5 mt-0.5 text-yellow-500 shrink-0"/>
                                                    <div>
                                                        <p className="font-semibold">{day.dining.lunch.restaurant} <span className="text-sm text-muted-foreground">({day.dining.lunch.time})</span></p>
                                                        {day.dining.lunch.notes && <p className="text-xs text-muted-foreground">{day.dining.lunch.notes}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            {day.dining.dinner && (
                                                <div className="flex gap-4">
                                                    <Moon className="w-5 h-5 mt-0.5 text-indigo-400 shrink-0"/>
                                                    <div>
                                                        <p className="font-semibold">{day.dining.dinner.restaurant} <span className="text-sm text-muted-foreground">({day.dining.dinner.time})</span></p>
                                                        {day.dining.dinner.notes && <p className="text-xs text-muted-foreground">{day.dining.dinner.notes}</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                )}
            </div>
        </AppShell>
    );
}
