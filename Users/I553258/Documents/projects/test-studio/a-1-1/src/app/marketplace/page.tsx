
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenIcon } from '@/components/icons/token-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Ticket, Wand2, Loader2 } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import type { Item } from '@/lib/marketplace-data';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { useToast } from '@/hooks/use-toast';


async function fetchItems(): Promise<Item[]> {
    const res = await fetch('/api/marketplace/items');
    if (!res.ok) {
        throw new Error('Failed to fetch items');
    }
    return res.json();
}

export default function MarketplacePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { redeemedVouchers } = useApp();
  const { toast } = useToast();

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const fetchedItems = await fetchItems();
        setItems(fetchedItems);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);
  
  const handleGenerateImages = async () => {
      setIsGenerating(true);
      toast({ title: 'Generating new images...', description: 'This may take a moment.' });
      
      try {
          const updatedItems = await Promise.all(
              items.map(async (item) => {
                  try {
                      const result = await generateImage({ prompt: `A product photo of ${item.title}, ${item.hint}` });
                      return { ...item, image: result.imageUrl };
                  } catch (e) {
                      console.error(`Failed to generate image for ${item.title}`, e);
                      return item; // return original item on failure
                  }
              })
          );
          setItems(updatedItems);
           toast({ title: 'Images updated!', description: 'The marketplace has a fresh new look.' });
      } catch (e) {
          console.error('An error occurred during image generation', e);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not generate new images.' });
      } finally {
        setIsGenerating(false);
      }
  };


  const availableItems = items.filter(item => !redeemedVouchers.find(v => v.id === item.id));

  const displayItems = loading ? Array.from({ length: 4 }).map((_, i) => ({ id: i })) : availableItems;

  return (
    <AppShell>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4 gap-2">
            <div>
                <h1 className="text-3xl font-bold">Marketplace</h1>
                <p className="text-muted-foreground text-sm">Redeem $ECLB for local goods!</p>
            </div>
            <Button size="icon" onClick={handleGenerateImages} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
            </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {displayItems.map((item: Partial<Item> & { id: any }, index) => (
            <div key={item?.id ?? index}>
             {item.title ? (
                <Link href={`/marketplace/redeem/${item.id}`}>
                  <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <Image 
                        src={item.image!} 
                        alt={item.title!} 
                        data-ai-hint={item.hint} 
                        width={300} 
                        height={300} 
                        className="w-full h-32 object-cover" 
                      />
                    </CardHeader>
                    <CardContent className="p-3 flex-1">
                      <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                    </CardContent>
                    <CardFooter className="p-3 bg-secondary">
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <TokenIcon className="w-4 h-4" />
                        <span>{item.price}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
             ) : (
                <Card className="overflow-hidden h-full flex flex-col">
                    <Skeleton className="w-full h-32" />
                    <CardContent className="p-3 flex-1">
                        <Skeleton className="h-4 w-4/5 mb-2" />
                        <Skeleton className="h-4 w-2/5" />
                    </CardContent>
                    <CardFooter className="p-3 bg-secondary">
                        <Skeleton className="h-5 w-8" />
                    </CardFooter>
                </Card>
             )}
            </div>
          ))}
        </div>
         { !loading && availableItems.length === 0 && (
            <div className="text-center text-muted-foreground py-10 col-span-2">
                <p>You've redeemed all available items!</p>
                <Button variant="link" asChild><Link href="/profile/vouchers">Check your voucher pocket</Link></Button>
            </div>
        )}
      </div>
    </AppShell>
  );
}
