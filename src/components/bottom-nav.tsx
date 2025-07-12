'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Zap, Store, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/map', label: 'Map', icon: Map },
  { href: '/quests', label: 'Itinerary', icon: Zap },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-5 items-center p-2 bg-background/80 backdrop-blur-sm border-t">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link href={item.href} key={item.href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <item.icon className={cn('w-6 h-6', isActive && 'text-primary')} />
            <span className={cn('text-xs font-medium', isActive && 'text-primary')}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
