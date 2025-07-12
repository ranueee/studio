
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { VictionLogo } from '@/components/icons/viction-logo';
import { TokenIcon } from '@/components/icons/token-icon';
import { useApp } from '@/hooks/use-app';
import { Award, Send, Wallet, WalletCards } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { level, xp, balance, unlockedBadges, visitedPois } = useApp();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const xpForNextLevel = 100;
  const currentXp = xp % xpForNextLevel;

  const badges = [
    { id: 'Pangasinan Pioneer', name: 'Pangasinan Pioneer', unlocked: unlockedBadges.includes('Pangasinan Pioneer') },
    { id: 'Coral Caretaker', name: 'Coral Caretaker', unlocked: false },
    { id: 'Mountain Mover', name: 'Mountain Mover', unlocked: false },
    { id: 'River Guardian', name: 'River Guardian', unlocked: false },
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && Array.isArray(accounts)) {
            const account = accounts[0];
            setWalletAddress(account);
            toast({
                title: "Wallet Connected",
                description: "Your MetaMask wallet has been successfully connected.",
            });
        }
      } catch (error) {
        console.error("User rejected the request.");
        toast({
            variant: "destructive",
            title: "Connection Failed",
            description: "You rejected the wallet connection request.",
        });
      }
    } else {
       toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install the MetaMask extension to connect your wallet.",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        {/* User Info */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Image src="https://placehold.co/80x80.png" alt="User profile" width={80} height={80} className="rounded-full border-4 border-primary" data-ai-hint="profile picture"/>
          <h1 className="text-2xl font-bold">Eco-Explorer</h1>
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-bold">Lvl {level}</span>
              <span className="text-muted-foreground">{currentXp}/{xpForNextLevel} XP</span>
            </div>
            <Progress value={currentXp} className="h-2 w-48" />
          </div>
        </div>

        <Separator />

        {/* Eco-Wallet */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletCards className="w-6 h-6 text-primary" />
              My Eco-Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {walletAddress ? (
                <div className='space-y-4'>
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div>
                            <p className="text-xs text-muted-foreground">Connected Address</p>
                            <p className="font-mono text-sm font-bold">{formatAddress(walletAddress)}</p>
                        </div>
                        <VictionLogo className="h-6" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="flex items-center gap-2">
                            <TokenIcon className="w-8 h-8"/>
                            <span className="text-3xl font-bold">{balance.toFixed(2)}</span>
                            <span className="text-lg font-semibold text-muted-foreground">$ECLB</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setWalletAddress(null)}>Disconnect Wallet</Button>
                </div>

            ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <Wallet className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Connect your wallet to see your balance and manage your assets.</p>
                    <Button onClick={connectWallet} className="w-full">
                        Connect MetaMask
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary"/>
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              {badges.map(badge => (
                <div key={badge.id} className={`flex flex-col items-center gap-1 ${badge.unlocked ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-accent' : 'bg-muted'}`}>
                    <Award className={`w-8 h-8 ${badge.unlocked ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <span className="text-xs font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* My Journey */}
        <Card>
            <CardHeader>
                <CardTitle>My Journey</CardTitle>
            </CardHeader>
            <CardContent>
                {visitedPois.length > 0 ? (
                    <ul className="space-y-2">
                        {visitedPois.map(poiId => {
                            const poiName = poiId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            return <li key={poiId} className="text-sm p-2 bg-secondary rounded-md">Visited {poiName}</li>;
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">Your adventure is just beginning! Visit a location to see it here.</p>
                )}
            </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
