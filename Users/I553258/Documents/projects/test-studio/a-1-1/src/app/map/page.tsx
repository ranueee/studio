
'use client';

import { AppShell } from '@/components/app-shell';
import { Map } from 'lucide-react';

export default function MapPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Map className="w-16 h-16 mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Map Feature Coming Soon</h1>
        <p className="text-muted-foreground mt-2">
          We're currently working on an exciting new map experience. Please check back later!
        </p>
      </div>
    </AppShell>
  );
}
