
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/use-app';
import { TokenIcon } from '@/components/icons/token-icon';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { generateImage } from '@/ai/flows/generate-image-flow';

const item = {
  id: 'mango-jam',
  title: 'Sundowners Mango Jam',
  price: 5,
  image: 'https://placehold.co/600x400.png',
  hint: 'jar of delicious mango jam',
  description: 'Sweet and tangy mango jam made from fresh, locally sourced mangoes from Pangasinan. Perfect for toast, pastries, or as a glaze.'
};

export default function RedemptionPage() {
  const router = useRouter();
  const { balance, redeemItem } = useApp();
  const { toast } = useToast();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      setLoadingImage(true);
      try {
        const result = await generateImage({ prompt: item.hint });
        setGeneratedImage(result.imageUrl);
      } catch (error) {
        console.error("Failed to generate image", error);
        // Keep placeholder on error
      } finally {
        setLoadingImage(false);
      }
    };
    fetchImage();
  }, []);

  const handleRedeem = () => {
    const success = redeemItem(item.price);
    if (success) {
      toast({
        title: "Success!",
        description: `You've redeemed ${item.title}.`,
      });
      router.push('/marketplace/redeem/mango-jam/qr');
    } else {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "You don't have enough $ECLB to redeem this item.",
      });
    }
  };

  return (
    <AppShell>
      <div className="p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute top-16 left-2">
            <ArrowLeft />
        </Button>
        <div className="mt-12">
            {loadingImage ? (
              <Skeleton className="h-[250px] w-full rounded-lg mb-4" />
            ) : (
              <Image 
                src={generatedImage || item.image} 
                alt={item.title} 
                data-ai-hint={item.hint} 
                width={600} 
                height={400} 
                className="rounded-lg mb-4 w-full object-cover shadow-lg" 
              />
            )}
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
