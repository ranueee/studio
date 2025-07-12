
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { TokenIcon } from '@/components/icons/token-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Utensils, Gift, List, Wand2, Loader2 } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import type { Item } from '@/lib/marketplace-data';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


async function fetchItems(): Promise<Item[]> {
    const res = await fetch('/api/marketplace/items');
    if (!res.ok) {
        throw new Error('Failed to fetch items');
    }
    return res.json();
}

type Category = 'all' | 'voucher' | 'food' | 'souvenir';
type SortOption = 'newest' | 'price-asc' | 'price-desc';

const categoryFilters: { name: string, value: Category, icon: React.ElementType }[] = [
    { name: 'All', value: 'all', icon: List },
    { name: 'Vouchers', value: 'voucher', icon: Ticket },
    { name: 'Food', value: 'food', icon: Utensils },
    { name: 'Souvenirs', value: 'souvenir', icon: Gift },
];

export default function MarketplacePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
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
                      const result = await generateImage({ prompt: item.description });
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

  const filteredAndSortedItems = useMemo(() => {
    let processedItems = items.filter(item => !redeemedVouchers.find(v => v.id === item.id));

    if (activeCategory !== 'all') {
        processedItems = processedItems.filter(item => item.category === activeCategory);
    }

    switch(sortOption) {
        case 'newest':
            processedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        case 'price-asc':
            processedItems.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            processedItems.sort((a, b) => b.price - a.price);
            break;
    }
    
    return processedItems;
  }, [items, redeemedVouchers, activeCategory, sortOption]);


  const displayItems = loading ? Array.from({ length: 4 }).map((_, i) => ({ id: i })) : filteredAndSortedItems;

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground text-sm">Redeem $ECLB for local goods!</p>
        </div>
        
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {categoryFilters.map(({ name, value, icon: Icon }) => (
                    <Button 
                        key={value}
                        variant={activeCategory === value ? 'default' : 'outline'}
                        className={cn(
                            "flex-shrink-0",
                            activeCategory === value && "text-primary-foreground"
                        )}
                        onClick={() => setActiveCategory(value)}
                    >
                        <Icon className="mr-2 h-4 w-4" />
                        {name}
                    </Button>
                ))}
            </div>
            <div className="flex items-center justify-between gap-2">
                 <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
                 <Button size="icon" variant="outline" onClick={handleGenerateImages} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                </Button>
            </div>
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
         { !loading && filteredAndSortedItems.length === 0 && (
            <div className="text-center text-muted-foreground py-10 col-span-2">
                <p>No items found for this category.</p>
            </div>
        )}
      </div>
    </AppShell>
  );
}
