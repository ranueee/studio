'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const QRCodeSVG = () => (
    <svg width="100%" height="100%" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
        <path fill="#000" d="M110,110h36v36h-36Z M122,122h12v12h-12Z M0,0v256h256V0Zm244,244H12V12h232Z M48,48v72H36V36h84v12Zm-12,96v12h12v12h12v12h12V156h12v12h12V156h12V144h12V132h12v12h12v24h-12v12h12v12h12v12h-12v12h-12v12h-12v12h-24v-12h-12v12h-12v-12h-12v12h-12v-12h-12v12h-12v-12h-12v-12h12v-12h-12v-12h12v-12Zm12-36h12v12H48Zm12,12h12v12H60Zm12,0h12v12H72Zm12,12h12v12H84Zm12,0h12v12H96Zm24,24h12v12h-12Zm-12,12h12v12h-12Zm-12,12h12v12h-12Zm0-24h12v12h-12Zm12-12h12v12h-12Zm12,0h12v12h-12Zm12,0h12v12h-12Zm12-12h12v12h-12Zm-36-36h12v12h-12Zm12,12h12v12h-12Zm-24-24h12v12h-12Zm0,12h12v12h-12Zm-12,12h12v12h-12Zm12,12h12v12h-12Zm12-36h12v12h-12Zm-48-24h12v12h-12Zm120,0h12v12h-12Zm0,12h12v12h-12Zm0,12h12v12h-12Zm0,12h12v12h-12Zm0,12h12v12h-12Zm0,12h12v12h-12Zm-12-60h12v12h-12Zm0,12h12v12h-12Zm0,12h12v12h-12Zm0,12h12v12h-12Zm0,12h12v12h-12Zm-12,12h12v12h-12Zm-12-12h12v12h-12Zm-12,0h12v12h-12Zm-12,0h12v12h-12Zm-12,0h12v12h-12Zm-12,0h12v12h-12Zm-12,0h12v12h-12Zm-12,0h12v12h-12Zm-12,12h12v12h-12Zm-12-24h12v12h-12Zm0,12h12v12h-12Zm0-24h12v12h-12Zm0-12h12v12h-12Zm0-12h12v12h-12Zm0-12h12v12h-12Zm0-12h12v12h-12Zm24,60h12v12h-12Zm12,12h12v12h-12Zm-12,12h12v12h-12Zm12,0h12v12h-12Zm12,0h12v12h-12Zm12,0h12v12h-12Zm-60,0h12v12h-12Zm-12-12h12v12h-12Zm0,24h12v12h-12Zm24,0h12v12h-12Zm0,12h12v12h-12Zm-12-36h12v12h-12Zm24,0h12v12h-12Zm24-12h12v12h-12Zm0,12h12v12h-12Zm-12,12h12v12h-12Zm0,12h12v12h-12Z"/>
    </svg>
);

export default function QRCodePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-full max-w-xs bg-white p-4 rounded-lg shadow-xl">
          <QRCodeSVG />
        </div>
        <div className="mt-8">
            <h1 className="text-xl font-bold">Show this to the vendor</h1>
            <p className="text-muted-foreground mt-2">to complete your purchase.</p>
        </div>
        
        <p className="mt-8 text-sm text-foreground/80">Redeeming 1x Sundowners Mango Jam</p>
        
        <Button asChild size="lg" className="mt-8 w-full max-w-sm">
          <Link href="/marketplace">Done</Link>
        </Button>
      </div>
    </AppShell>
  );
}
