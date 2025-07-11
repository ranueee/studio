'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/hooks/use-app';
import { Star, Binoculars, HelpCircle, CheckCircle2, Check, Award } from 'lucide-react';
import { TokenIcon } from '@/components/icons/token-icon';

const pois = [
  { id: 'hundred-islands', name: 'Hundred Islands National Park', icon: Star, top: '40%', left: '55%', rewards: { xp: 50, eclb: 10 }, challenge: { text: 'Collect 1 bag of trash', xp: 100, eclb: 25 }, desc: 'A protected area featuring 124 islands at high tide. A perfect spot for island hopping and snorkeling.', image: 'https://placehold.co/600x400.png', hint: 'philippines islands' },
  { id: 'patar-beach', name: 'Patar Beach', icon: Binoculars, top: '65%', left: '30%', rewards: { xp: 30, eclb: 5 }, challenge: { text: 'Spot 3 native birds', xp: 60, eclb: 15 }, desc: 'Known for its creamy-white sand and clear waters, a beautiful community-managed beach.', image: 'https://placehold.co/600x400.png', hint: 'philippines beach' },
  { id: 'enchanted-cave', name: 'Enchanted Cave', icon: HelpCircle, top: '50%', left: '20%', rewards: { xp: 40, eclb: 8 }, challenge: { text: 'Photo documentation of cave formations', xp: 80, eclb: 20 }, desc: 'A hidden underground cave with a natural freshwater pool.', image: 'https://placehold.co/600x400.png', hint: 'philippines cave' },
];

type POI = typeof pois[0];

export default function MapPage() {
  const { visitedPois, addXp, addBalance, addBadge, addVisitedPoi } = useApp();
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [isRewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [rewardsGiven, setRewardsGiven] = useState(false);

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

  return (
    <AppShell>
      <div className="relative w-full h-full bg-gray-300">
        <Image src="https://placehold.co/400x800.png" layout="fill" objectFit="cover" alt="Map of Pangasinan" data-ai-hint="map philippines" />
        
        {pois.map((poi) => {
          const isVisited = visitedPois.includes(poi.id);
          return (
            <button
              key={poi.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ top: poi.top, left: poi.left }}
              onClick={() => handlePinClick(poi)}
              aria-label={`Open details for ${poi.name}`}
            >
              <div className={`p-2 rounded-full shadow-lg ${isVisited ? 'bg-green-500' : 'bg-accent'}`}>
                {isVisited ? <CheckCircle2 className="w-6 h-6 text-white" /> : <poi.icon className="w-6 h-6 text-white" />}
              </div>
              <span className="text-xs font-bold bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md mt-1 shadow">{poi.name}</span>
            </button>
          );
        })}
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
            <div className="flex justify-center items-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-16 h-16 text-primary-foreground"/>
                </div>
            </div>
          <h2 className="text-2xl font-bold mt-6">Welcome to {selectedPoi?.name}!</h2>
          <DialogFooter className="mt-6 sm:justify-center">
            <Button size="lg" onClick={handleCheckIn} className="w-full">CHECK-IN & CLAIM REWARDS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rewards Modal */}
      <Dialog open={isRewardsModalOpen} onOpenChange={setRewardsModalOpen}>
        <DialogContent className="max-w-sm text-center p-8">
            <h2 className="text-2xl font-bold">Rewards Claimed!</h2>
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
