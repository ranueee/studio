
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useApp } from '@/hooks/use-app';
import { Star, Binoculars, HelpCircle, Check, Award, MapPin as MapPinIcon } from 'lucide-react';
import { TokenIcon } from '@/components/icons/token-icon';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const pois = [
  { id: 'hundred-islands', name: 'Hundred Islands', pos: { lat: 16.1953, lng: 119.9831 }, icon: Star, rewards: { xp: 50, eclb: 10 }, challenge: { text: 'Collect 1 bag of trash', xp: 100, eclb: 25 }, desc: 'A protected area featuring 124 islands at high tide. A perfect spot for island hopping and snorkeling.', image: 'https://placehold.co/600x400.png', hint: 'philippines islands' },
  { id: 'patar-beach', name: 'Patar Beach', pos: { lat: 16.3263, lng: 119.7834 }, icon: Binoculars, rewards: { xp: 30, eclb: 5 }, challenge: { text: 'Spot 3 native birds', xp: 60, eclb: 15 }, desc: 'Known for its creamy-white sand and clear waters, a beautiful community-managed beach.', image: 'https://placehold.co/600x400.png', hint: 'philippines beach' },
  { id: 'enchanted-cave', name: 'Enchanted Cave', pos: { lat: 16.3683, lng: 119.8210 }, icon: HelpCircle, rewards: { xp: 40, eclb: 8 }, challenge: { text: 'Photo documentation of cave formations', xp: 80, eclb: 20 }, desc: 'A hidden underground cave with a natural freshwater pool.', image: 'https://placehold.co/600x400.png', hint: 'philippines cave' },
];

type POI = typeof pois[0];

const mapandanCenter = {
  lat: 16.0203,
  lng: 120.4478
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function MapPage() {
  const { visitedPois, addXp, addBalance, addBadge, addVisitedPoi } = useApp();
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [isRewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [rewardsGiven, setRewardsGiven] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: mapandanCenter.lng,
    latitude: mapandanCenter.lat,
    zoom: 17
  });

  const handlePinClick = (poi: POI) => {
    if (visitedPois.includes(poi.id)) return;
    setSelectedPoi(poi);
  };

  const handleStartJourney = () => {
    if (!selectedPoi) return;
    const poiToVisit = selectedPoi;
    setSelectedPoi(null);
    setTimeout(() => {
      setRewardsGiven(false);
      setSelectedPoi(poiToVisit);
      setCheckInModalOpen(true);
    }, 1000);
  };

  const handleCheckIn = () => {
    if (!selectedPoi) return;
    setCheckInModalOpen(false);
    setTimeout(() => {
      if (!rewardsGiven) {
        addXp(selectedPoi.rewards.xp);
        addBalance(selectedPoi.rewards.eclb);
        addBadge('Pangasinan Pioneer');
        addVisitedPoi(selectedPoi.id);
        setRewardsGiven(true);
      }
      setRewardsModalOpen(true);
    }, 500);
  };
  
  const renderMap = () => {
    if (!MAPBOX_TOKEN) {
      return (
        <div className="flex items-center justify-center h-full text-center p-4 bg-red-900/20 text-red-200 rounded-lg">
          <div className="max-w-md">
              <h2 className="font-bold text-lg text-white">Map Configuration Error</h2>
              <p className="mt-2 text-sm">Could not load Mapbox. Please add your access token.</p>
              <ul className="text-xs list-disc list-inside text-left mt-2 space-y-1">
                  <li>Create or open the `.env` file in the root of your project.</li>
                  <li>Add the following line: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN='your_token_here'`</li>
                  <li>Replace `'your_token_here'` with your actual token from mapbox.com.</li>
                  <li>Restart your development server to apply the changes.</li>
              </ul>
          </div>
        </div>
      );
    }

    return (
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Marker longitude={mapandanCenter.lng} latitude={mapandanCenter.lat}>
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
        </Marker>
        {pois.map((poi) => {
          const isVisited = visitedPois.includes(poi.id);
          return (
            <Marker
              key={poi.id}
              longitude={poi.pos.lng}
              latitude={poi.pos.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handlePinClick(poi);
              }}
              style={{ cursor: isVisited ? 'default' : 'pointer' }}
            >
              <MapPinIcon className={`w-10 h-10 ${isVisited ? 'text-green-500' : 'text-yellow-600'}`} />
            </Marker>
          );
        })}
      </Map>
    );
  }

  return (
    <AppShell>
      <div className="relative w-full h-full bg-gray-900">
        {renderMap()}
      </div>

      {/* Location Details Bottom Sheet */}
      <Sheet open={!!selectedPoi} onOpenChange={(isOpen) => !isOpen && setSelectedPoi(null)}>
        <SheetContent side="bottom" className="h-[85%] flex flex-col">
          {selectedPoi && (
            <>
              <SheetHeader className="p-4">
                <SheetTitle className="text-2xl font-bold">{selectedPoi.name}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <Image src={selectedPoi.image} data-ai-hint={selectedPoi.hint} alt={selectedPoi.name} width={600} height={400} className="rounded-lg mb-4 w-full object-cover" />
                <SheetDescription className="text-base text-foreground mb-6">{selectedPoi.desc}</SheetDescription>
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Rewards</h3>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="font-semibold">Visit: +{selectedPoi.rewards.xp} XP, +{selectedPoi.rewards.eclb} $ECLB</p>
                  </div>
                  <div className="bg-accent/20 p-4 rounded-lg">
                    <p className="font-semibold">Eco-Challenge: {selectedPoi.challenge.text}</p>
                    <p>+{selectedPoi.challenge.xp} XP, +{selectedPoi.challenge.eclb} $ECLB</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t">
                <Button onClick={handleStartJourney} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Start Journey</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Check-In Modal */}
      <Dialog open={isCheckInModalOpen} onOpenChange={setCheckInModalOpen}>
        <DialogContent className="max-w-sm text-center p-8">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold mt-6 text-center w-full">Welcome to {selectedPoi?.name}!</DialogTitle>
                <DialogDescription>You've discovered a new point of interest!</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center py-4">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-16 h-16 text-primary-foreground"/>
                </div>
            </div>
          <DialogFooter className="mt-6 sm:justify-center">
            <Button size="lg" onClick={handleCheckIn} className="w-full">CHECK-IN & CLAIM REWARDS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rewards Modal */}
      <Dialog open={isRewardsModalOpen} onOpenChange={setRewardsModalOpen}>
        <DialogContent className="max-w-sm text-center p-8">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Rewards Claimed!</DialogTitle>
                <DialogDescription>Congratulations on your find!</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-8 animate-in fade-in duration-500">
                <div className="bg-secondary p-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2">
                    +{selectedPoi?.rewards.xp} XP
                </div>
                <div className="bg-secondary p-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2">
                    <TokenIcon className="w-6 h-6" /> +{selectedPoi?.rewards.eclb} $ECLB
                </div>
                <div className="bg-accent p-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 text-accent-foreground">
                    <Award className="w-6 h-6" /> New Badge: Pangasinan Pioneer
                </div>
            </div>
            <DialogFooter className="mt-6 sm:justify-center">
                <Button size="lg" onClick={() => setRewardsModalOpen(false)} className="w-full">Awesome!</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
