
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useApp } from '@/hooks/use-app';
import { Star, Binoculars, HelpCircle, Check, Award, MapPin, Mountain, Anchor, Waves, Sailboat, Building, History, Sprout, Utensils } from 'lucide-react';
import { TokenIcon } from '@/components/icons/token-icon';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const pois = [
  // Bolinao
  { id: 'patar-beach', name: 'Patar Beach', pos: { lat: 16.3263, lng: 119.7834 }, icon: Waves, rewards: { xp: 30, eclb: 5 }, challenge: { text: 'Spot 3 native birds', xp: 60, eclb: 15 }, desc: 'Known for its creamy-white sand and clear waters, a beautiful community-managed beach.', image: 'https://placehold.co/600x400.png', hint: 'philippines beach' },
  { id: 'enchanted-cave', name: 'Enchanted Cave', pos: { lat: 16.3683, lng: 119.8210 }, icon: HelpCircle, rewards: { xp: 40, eclb: 8 }, challenge: { text: 'Photo documentation of cave formations', xp: 80, eclb: 20 }, desc: 'A hidden underground cave with a natural freshwater pool.', image: 'https://placehold.co/600x400.png', hint: 'philippines cave' },
  { id: 'bolinao-falls', name: 'Bolinao Falls', pos: { lat: 16.345, lng: 119.865 }, icon: Waves, rewards: { xp: 35, eclb: 7 }, challenge: { text: 'Take a plastic-free picnic', xp: 70, eclb: 18 }, desc: 'A series of three beautiful waterfalls with refreshing turquoise waters.', image: 'https://placehold.co/600x400.png', hint: 'philippines waterfall' },
  { id: 'cape-bolinao', name: 'Cape Bolinao Lighthouse', pos: { lat: 16.313, lng: 119.780 }, icon: Building, rewards: { xp: 25, eclb: 4 }, challenge: { text: 'Learn about its history', xp: 50, eclb: 12 }, desc: 'One of the tallest lighthouses in the Philippines, offering panoramic views.', image: 'https://placehold.co/600x400.png', hint: 'philippines lighthouse' },
  { id: 'sungayan-grill', name: 'Sungayan Grill', pos: { lat: 16.3888, lng: 119.9234 }, icon: Utensils, rewards: { xp: 20, eclb: 3 }, challenge: { text: 'Try the "inihaw na sungayan"', xp: 40, eclb: 10 }, desc: 'A floating restaurant on the Balingasay River, famous for its fresh seafood and unique dining experience.', image: 'https://placehold.co/600x400.png', hint: 'floating restaurant philippines' },


  // Alaminos
  { id: 'hundred-islands', name: 'Hundred Islands', pos: { lat: 16.1953, lng: 119.9831 }, icon: Star, rewards: { xp: 50, eclb: 10 }, challenge: { text: 'Collect 1 bag of trash', xp: 100, eclb: 25 }, desc: 'A protected area featuring 124 islands at high tide. A perfect spot for island hopping and snorkeling.', image: 'https://placehold.co/600x400.png', hint: 'philippines islands' },
  
  // Anda
  { id: 'tara-falls', name: 'Tara Falls', pos: { lat: 16.291, lng: 120.038 }, icon: Waves, rewards: { xp: 30, eclb: 6 }, challenge: { text: 'Identify local flora', xp: 60, eclb: 15 }, desc: 'A serene waterfall nestled in the forest, perfect for a quiet retreat.', image: 'https://placehold.co/600x400.png', hint: 'serene waterfall' },
  { id: 'tadel-beach', name: 'Tondol Beach', pos: { lat: 16.3262, lng: 120.0373 }, icon: Waves, rewards: { xp: 30, eclb: 5 }, challenge: { text: 'Build a sandcastle', xp: 60, eclb: 15 }, desc: 'Dubbed the "Little Boracay" of the North, known for its long sandbar and shallow waters.', image: 'https://placehold.co/600x400.png', hint: 'white sandbar beach' },


  // San Fabian
  { id: 'san-fabian-beach', name: 'San Fabian Beach', pos: { lat: 16.136, lng: 120.407 }, icon: Waves, rewards: { xp: 20, eclb: 3 }, challenge: { text: 'Participate in a beach cleanup', xp: 40, eclb: 10 }, desc: 'A long stretch of grey sand beach popular with locals.', image: 'https://placehold.co/600x400.png', hint: 'grey sand beach' },
  
  // Manaoag
  { id: 'manaoag-church', name: 'Manaoag Church', pos: { lat: 16.044, lng: 120.489 }, icon: History, rewards: { xp: 15, eclb: 2 }, challenge: { text: 'Observe a moment of silence', xp: 30, eclb: 8 }, desc: 'A major Roman Catholic pilgrimage site, home to the image of Our Lady of Manaoag.', image: 'https://placehold.co/600x400.png', hint: 'historic church' },

  // San Nicolas
  { id: 'ampucao-dike', name: 'Ampucao Dike Eco-Park', pos: { lat: 16.083, lng: 120.784 }, icon: Sprout, rewards: { xp: 25, eclb: 5 }, challenge: { text: 'Plant a tree seedling', xp: 50, eclb: 15 }, desc: 'A man-made dike turned into a park, offering views of the Caraballo Mountains.', image: 'https://placehold.co/600x400.png', hint: 'eco park mountain' },

  // Tayug
  { id: 'tayug-sunflower-maze', name: 'Tayug Sunflower Maze', pos: { lat: 16.027, lng: 120.750 }, icon: Sprout, rewards: { xp: 20, eclb: 4 }, challenge: { text: 'Learn about sunflower farming', xp: 40, eclb: 10 }, desc: 'A seasonal attraction featuring a maze made of sunflowers.', image: 'https://placehold.co/600x400.png', hint: 'sunflower field' },

  // Lingayen
  { id: 'lingayen-gulf', name: 'Lingayen Gulf', pos: { lat: 16.033, lng: 120.233 }, icon: Anchor, rewards: { xp: 20, eclb: 3 }, challenge: { text: 'Learn about the WWII landings', xp: 40, eclb: 10 }, desc: 'A historic gulf known for its beach park and as a WWII landing site.', image: 'https://placehold.co/600x400.png', hint: 'calm gulf beach' },
  { id: 'pangasinan-capitol', name: 'Pangasinan Provincial Capitol', pos: { lat: 16.038, lng: 120.333 }, icon: Building, rewards: { xp: 10, eclb: 1 }, challenge: { text: 'Appreciate the neo-classical architecture', xp: 20, eclb: 5 }, desc: 'An impressive government building and a historical landmark in Lingayen.', image: 'https://placehold.co/600x400.png', hint: 'government building' },

  // Dasol
  { id: 'tambo-tambo-beach', name: 'Tambo-Tambo Beach', pos: { lat: 15.933, lng: 119.866 }, icon: Waves, rewards: { xp: 25, eclb: 5 }, challenge: { text: 'Find a unique seashell', xp: 50, eclb: 12 }, desc: 'A quiet and pristine beach with golden sand, perfect for relaxation.', image: 'https://placehold.co/600x400.png', hint: 'golden sand beach' },
  
  // Burgos
  { id: 'cabongaoan-beach', name: 'Cabongaoan Beach (Death Pool)', pos: { lat: 16.059, lng: 119.837 }, icon: Waves, rewards: { xp: 35, eclb: 7 }, challenge: { text: 'Safely take a photo of the "Death Pool"', xp: 70, eclb: 18 }, desc: 'Famous for its white sand and a natural tidal pool known as the "Death Pool".', image: 'https://placehold.co/600x400.png', hint: 'natural tidal pool' },

  // Urbiztondo
  { id: 'binongey-farm', name: 'Binongey Farm & Park', pos: { lat: 15.823, lng: 120.370 }, icon: Sprout, rewards: { xp: 20, eclb: 4 }, challenge: { text: 'Try their fresh carabao milk', xp: 40, eclb: 10 }, desc: 'An agri-tourism park offering fresh produce, farm activities, and a relaxing environment.', image: 'https://placehold.co/600x400.png', hint: 'farm park philippines' },
  
  // Dagupan
  { id: 'dagupan-river-cruise', name: 'Dagupan River Cruise', pos: { lat: 16.045, lng: 120.336 }, icon: Sailboat, rewards: { xp: 25, eclb: 5 }, challenge: { text: 'Spot a local fishing boat', xp: 50, eclb: 12 }, desc: 'Explore the city\'s river systems and see the bangus (milkfish) farms up close.', image: 'https://placehold.co/600x400.png', hint: 'river cruise boat' },
  { id: 'matutinas-seafood', name: 'Matutina\'s Seafood Restaurant', pos: { lat: 16.090, lng: 120.336 }, icon: Utensils, rewards: { xp: 20, eclb: 3 }, challenge: { text: 'Taste the famous "pigar-pigar"', xp: 40, eclb: 10 }, desc: 'A highly-rated restaurant in Dagupan serving classic Pangasinan dishes and fresh seafood.', image: 'https://placehold.co/600x400.png', hint: 'seafood restaurant table' },
  { id: 'dagupeña-restaurant', name: 'Dagupeña Restaurant', pos: { lat: 16.042, lng: 120.338 }, icon: Utensils, rewards: { xp: 20, eclb: 3 }, challenge: { text: 'Try their Kaleskes soup', xp: 40, eclb: 10 }, desc: 'A beloved local eatery famous for authentic Pangasinan comfort food like Kaleskes and Pigar-Pigar.', image: 'https://placehold.co/600x400.png', hint: 'local filipino restaurant' },

];


type POI = typeof pois[0];

const mapandanCenter = {
  lat: 16.0203,
  lng: 120.4478
};

const UserLocationMarker = () => (
  <div className="relative">
      <svg width="48" height="58" viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 58C24 58 48 38.6667 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 38.6667 24 58 24 58Z" fill="#FBBF24"/>
          <circle cx="24" cy="24" r="16" fill="#34D399"/>
          <path d="M24 16C26.2091 16 28 17.7909 28 20C28 22.2091 26.2091 24 24 24C21.7909 24 20 22.2091 20 20C20 17.7909 21.7909 16 24 16ZM24 26C30 26 30 30 30 30V32H18V30C18 30 18 26 24 26Z" fill="white"/>
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center w-32">
          {/* Text can be added here if needed, but the prompt shows text outside the marker */}
      </div>
  </div>
);


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function MapPage() {
  const { visitedPois, addXp, addBalance, addBadge, addVisitedPoi } = useApp();
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [isRewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [rewardsGiven, setRewardsGiven] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: 120.3,
    latitude: 16.2,
    zoom: 9
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
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Marker longitude={mapandanCenter.lng} latitude={mapandanCenter.lat}>
          <UserLocationMarker />
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
                <div className="relative">
                    <MapPin className={`w-8 h-8 drop-shadow-lg ${isVisited ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
            </Marker>
          );
        })}
      </Map>
    );
  }

  return (
    <AppShell>
      <div className="relative w-full h-full bg-black">
        {renderMap()}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,rgba(0,0,0,0.8)_20%,rgba(0,0,0,1)_50%)]" />
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
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center w-full">Welcome to {selectedPoi?.name}!</DialogTitle>
                <DialogDescription className="text-center">You've discovered a new point of interest!</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center py-4">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-16 h-16 text-primary-foreground"/>
                </div>
            </div>
          <DialogFooter className="mt-2 sm:justify-center">
            <Button size="lg" onClick={handleCheckIn} className="w-full">CHECK-IN & CLAIM REWARDS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rewards Modal */}
      <Dialog open={isRewardsModalOpen} onOpenChange={setRewardsModalOpen}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Rewards Claimed!</DialogTitle>
                <DialogDescription className="text-center">Congratulations on your find!</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-6 animate-in fade-in duration-500">
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
            <DialogFooter className="mt-2 sm:justify-center">
                <Button size="lg" onClick={() => setRewardsModalOpen(false)} className="w-full">Awesome!</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
