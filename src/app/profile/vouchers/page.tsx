
'use client';

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/hooks/use-app";
import { ArrowLeft, Ticket, AlertTriangle, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export default function VouchersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { redeemedVouchers, useVoucher } = useApp();

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Code Copied!",
            description: "The voucher code has been copied to your clipboard.",
        });
    };

    const handleUseVoucher = (voucherCode: string) => {
        useVoucher(voucherCode);
        toast({
            title: "Voucher Used",
            description: "The voucher has been removed from your pocket.",
        });
    };

    return (
        <AppShell>
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-2xl font-bold">My Vouchers</h1>
                </div>

                {redeemedVouchers.length > 0 ? (
                    <div className="space-y-4">
                        {redeemedVouchers.map(voucher => (
                            <Card key={voucher.voucherCode} className="overflow-hidden">
                                <CardHeader className="p-0">
                                    <Image
                                        src={voucher.image}
                                        alt={voucher.title}
                                        width={400}
                                        height={150}
                                        className="w-full h-24 object-cover"
                                        data-ai-hint={voucher.hint}
                                    />
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle>{voucher.title}</CardTitle>
                                    <CardDescription>{voucher.description}</CardDescription>
                                    <div className="mt-4 p-3 bg-secondary rounded-lg flex items-center justify-between">
                                        <div className="font-mono text-lg font-bold tracking-widest text-primary">
                                            {voucher.voucherCode}
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleCopyCode(voucher.voucherCode)}>
                                            <Copy className="w-5 h-5"/>
                                        </Button>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full">Mark as Used</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action is irreversible. The voucher will be permanently removed from your pocket.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleUseVoucher(voucher.voucherCode)}>
                                                    Yes, I've used it
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <Ticket className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">Your voucher pocket is empty.</h3>
                        <p className="mt-2">Redeem items from the marketplace to get vouchers.</p>
                        <Button variant="default" className="mt-4" asChild>
                           <Link href="/marketplace">Go to Marketplace</Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppShell>
    )
}
