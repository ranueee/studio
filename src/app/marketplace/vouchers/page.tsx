
'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useApp } from '@/hooks/use-app';
import type { Voucher } from '@/contexts/app-context';
import { CheckCircle, Ticket, ArrowLeft, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function VoucherPouchPage() {
  const { vouchers, useVoucher } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const handleUseVoucher = (voucher: Voucher) => {
    useVoucher(voucher.id);
    toast({
      title: 'Voucher Used!',
      description: `You have successfully used the "${voucher.title}" voucher.`,
    });
  };
  
  const sortedVouchers = [...vouchers].sort((a, b) => {
      if (a.status === 'available' && b.status === 'used') return -1;
      if (a.status === 'used' && b.status === 'available') return 1;
      return 0;
  });

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold">My Vouchers</h1>
        </div>
        
        {sortedVouchers.length > 0 ? (
          <div className="space-y-4">
            {sortedVouchers.map((voucher) => (
              <Card 
                key={voucher.id}
                className={cn(
                  'overflow-hidden transition-all',
                  voucher.status === 'used' && 'bg-muted/50'
                )}
              >
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10",
                        voucher.status === 'used' && 'bg-muted-foreground/10'
                    )}>
                        <Ticket className={cn("w-6 h-6 text-primary", voucher.status === 'used' && 'text-muted-foreground')} />
                    </div>
                    <div className="flex-1">
                        <CardTitle>{voucher.title}</CardTitle>
                        <CardDescription>{voucher.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardFooter className="bg-secondary/50 py-3 px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="w-3 h-3"/>
                        <span>{voucher.brand}</span>
                    </div>
                    {voucher.status === 'available' ? (
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="sm">Use Now</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Voucher Use</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to use this voucher? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUseVoucher(voucher)}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-600"/>
                            <span>Voucher Used</span>
                       </div>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <Ticket className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Your voucher pouch is empty</h3>
            <p className="mt-2 text-sm">Earn vouchers by completing quests or redeeming items in the marketplace.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
