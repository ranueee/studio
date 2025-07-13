
'use client';

import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/hooks/use-app';

export function TopBar() {
  const { level, xp } = useApp();
  const xpForNextLevel = 100;
  const currentXp = xp % xpForNextLevel;

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
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold text-sm">Lvl {level}</p>
          <span className="text-xs text-muted-foreground">{currentXp}/{xpForNextLevel} XP</span>
        </div>
        <Progress value={currentXp} className="h-2" />
      </div>
    </header>
  );
}
