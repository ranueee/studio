
'use client';

import Image from 'next/image';
import { useApp } from '@/hooks/use-app';

export function TopBar() {
  const { level, xp } = useApp();

  return (
    <header className="flex items-center p-3 gap-3 bg-background/80 backdrop-blur-sm border-b z-10">
      <Image
        src="https://placehold.co/40x40.png"
        alt="User profile picture"
        width={40}
        height={40}
        className="rounded-full"
        data-ai-hint="profile picture"
      />
      <div className="flex-1">
        <p className="font-semibold text-sm">Eco-Explorer</p>
      </div>
    </header>
  );
}
