
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/use-app';
import { TokenIcon } from '@/components/icons/token-icon';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Item } from '@/lib/marketplace-data';


export default function RedemptionPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;

  const { balance, redeemItemForVoucher } = useApp();
  const { toast } = useToast();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/marketplace/items/${itemId}`);
        if (!res.ok) {
            throw new Error('Item not found');
        }
        const fetchedItem: Item = await res.json();
        setItem(fetchedItem);

      } catch (error) {
        console.error("Failed to fetch item", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load the requested item.",
        });
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, router, toast]);

  const handleRedeem = () => {
    if (!item) return;

    const success = redeemItemForVoucher(item);
    if (success) {
      toast({
        title: "Success!",
        description: `${item.title} has been added to your voucher pocket.`,
      });
      router.push(`/profile/vouchers`);
    } else {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "You don't have enough $ECLB to redeem this item.",
      });
    }
  };

  if (loading || !item) {
    return (
        <AppShell>
            <div className="p-4">
                 <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute top-16 left-2 z-10">
                    <ArrowLeft />
                </Button>
                <div className="mt-12">
                    <Skeleton className="h-[250px] w-full rounded-lg mb-4" />
                    <Skeleton className="h-8 w-3/4 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-full rounded-lg mb-2" />
                    <Skeleton className="h-4 w-full rounded-lg mb-6" />
                    <Skeleton className="h-16 w-full rounded-lg mb-6" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>
            </div>
        </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute top-16 left-2">
            <ArrowLeft />
        </Button>
        <div className="mt-12">
            <Image 
                src={item.image} 
                alt={item.title} 
                data-ai-hint={item.hint} 
                width={600} 
                height={400} 
                className="rounded-lg mb-4 w-full object-cover shadow-lg" 
            />
            <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
            <p className="text-muted-foreground mb-6">{item.description}</p>
            
            <div className="bg-secondary p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <div className="flex items-center gap-2 text-2xl font-bold">
                    <TokenIcon className="w-6 h-6" />
                    <span>{balance.toFixed(2)} $ECLB</span>
                </div>
            </div>

            <Button size="lg" className="w-full text-lg" onClick={handleRedeem} disabled={balance < item.price}>
                Redeem with <TokenIcon className="w-5 h-5 mx-1.5"/> {item.price} $ECLB
            </Button>
        </div>
      </div>
    </AppShell>
  );
}
