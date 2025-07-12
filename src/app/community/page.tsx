
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Community</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Users className="w-6 h-6 text-primary" />
                           Join the Conversation
                        </CardTitle>
                        <CardDescription>
                            This feature is coming soon. Connect with other travelers, share your experiences, and discover new adventures together.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground p-8">
                            <p>Stay tuned for updates!</p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppShell>
    )
}
