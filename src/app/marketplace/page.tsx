
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenIcon } from '@/components/icons/token-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { generateImage } from '@/ai/flows/generate-image-flow';

const initialItems = [
  {
    id: 'mango-jam',
    title: 'Sundowners Mango Jam',
    price: 5,
    image: 'https://placehold.co/300x300.png',
    hint: 'mango jam',
  },
  {
    id: 'coffee-voucher',
    title: 'Kape-tan Coffee Voucher',
    price: 8,
    image: 'https://placehold.co/300x300.png',
    hint: 'cup of coffee on a cafe table',
  },
   {
    id: 'bamboo-straws',
    title: 'Eco-Friendly Bamboo Straws',
    price: 3,
    image: 'https://placehold.co/300x300.png',
    hint: 'reusable bamboo straws',
  },
   {
    id: 'local-keychain',
    title: 'Hand-woven Keychain',
    price: 2,
    image: 'https://placehold.co/300x300.png',
    hint: 'colorful hand-woven keychain',
  },
];

type Item = typeof initialItems[0] & { generatedImage?: string };

export default function MarketplacePage() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const imagePromises = initialItems.map(item => generateImage({ prompt: item.hint }));
      const imageResults = await Promise.all(imagePromises);
      
      const updatedItems = initialItems.map((item, index) => ({
        ...item,
        generatedImage: imageResults[index].imageUrl,
      }));
      
      setItems(updatedItems);
      setLoading(false);
    };

    fetchImages();
  }, []);

  return (
    <AppShell>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
        <p className="text-muted-foreground mb-6">Redeem your $ECLB for local products and experiences!</p>
        <div className="grid grid-cols-2 gap-4">
          {(loading ? Array.from({ length: 4 }) : items).map((item: Item | undefined, index) => (
            <div key={item?.id ?? index}>
             {item ? (
                <Link href={`/marketplace/redeem/${item.id}`}>
                  <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <Image 
                        src={item.generatedImage || item.image} 
                        alt={item.title} 
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
      </div>
    </AppShell>
  );
}
