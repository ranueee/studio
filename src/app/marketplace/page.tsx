'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenIcon } from '@/components/icons/token-icon';

const items = [
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
    hint: 'cup coffee',
  },
   {
    id: 'bamboo-straws',
    title: 'Eco-Friendly Bamboo Straws',
    price: 3,
    image: 'https://placehold.co/300x300.png',
    hint: 'bamboo straws',
  },
   {
    id: 'local-keychain',
    title: 'Hand-woven Keychain',
    price: 2,
    image: 'https://placehold.co/300x300.png',
    hint: 'woven keychain',
  },
];

export default function MarketplacePage() {
  return (
    <AppShell>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
        <p className="text-muted-foreground mb-6">Redeem your $ECLB for local products and experiences!</p>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <Link href={`/marketplace/redeem/${item.id}`} key={item.id}>
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <Image src={item.image} alt={item.title} data-ai-hint={item.hint} width={300} height={300} className="w-full h-32 object-cover" />
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
          ))}
        </div>
      </div>
    </AppShell>
  );
}
