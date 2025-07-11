'use client';

import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-container">
      <TopBar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
      <BottomNav />
    </main>
  );
}
