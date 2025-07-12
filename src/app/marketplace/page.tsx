
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenIcon } from '@/components/icons/token-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { generateImage } from '@/ai/flows/generate-image-flow';
import type { GenerateImageOutput } from '@/ai/flows/generate-image-flow';

type Item = {
  id: string;
  title: string;
  price: number;
  image: string;
  hint: string;
  description: string;
  generatedImage?: string;
};

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

  useEffect(() => {
    const loadItemsAndImages = async () => {
      setLoading(true);
      try {
        const fetchedItems = await fetchItems();
        
        // Set initial items to show placeholders while images generate
        setItems(fetchedItems);

        const imagePromises = fetchedItems.map(item => 
            generateImage({ prompt: item.hint }).catch(e => {
                console.error(`Failed to generate image for ${item.title}`, e);
                return { imageUrl: item.image }; // Fallback to placeholder
            })
        );
        const imageResults = await Promise.all(imagePromises);
        
        const updatedItems = fetchedItems.map((item, index) => ({
          ...item,
          generatedImage: imageResults[index].imageUrl,
        }));
        
        setItems(updatedItems);
      } catch (error) {
        console.error(error);
        // In case of error, still show items with placeholders
        const fetchedItems = await fetchItems().catch(() => []);
        setItems(fetchedItems);
      } finally {
        setLoading(false);
      }
    };

    loadItemsAndImages();
  }, []);

  const displayItems = loading && items.length === 0 ? Array.from({ length: 4 }).map((_, i) => ({ id: i })) : items;

  return (
    <AppShell>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
        <p className="text-muted-foreground mb-6">Redeem your $ECLB for local products and experiences!</p>
        <div className="grid grid-cols-2 gap-4">
          {displayItems.map((item: Partial<Item> & { id: any }, index) => (
            <div key={item?.id ?? index}>
             {item.title ? (
                <Link href={`/marketplace/redeem/${item.id}`}>
                  <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      {item.generatedImage ? (
                        <Image 
                          src={item.generatedImage} 
                          alt={item.title!} 
                          data-ai-hint={item.hint} 
                          width={300} 
                          height={300} 
                          className="w-full h-32 object-cover" 
                        />
                      ) : (
                        <Skeleton className="w-full h-32" />
                      )}
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
      </div>
    </AppShell>
  );
}
