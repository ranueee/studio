
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useApp } from '@/hooks/use-app';
import { PlusCircle, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatePostDialog } from '@/components/create-post-dialog';

export default function CommunityPage() {
    const { albums } = useApp();
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const renderAlbumGrid = () => {
        if (!isClient) {
             return (
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                         <Card key={i} className="overflow-hidden">
                            <Skeleton className="w-full h-32" />
                            <CardContent className="p-2">
                                <Skeleton className="h-4 w-3/4 mb-1" />
                                <Skeleton className="h-3 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (albums && albums.length > 0) {
            return (
                <div className="grid grid-cols-2 gap-4">
                    {albums.map(album => (
                        <Link href={`/community/album/${album.id}`} key={album.id}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="p-0 relative">
                                    <Image
                                        src={album.coverImage}
                                        alt={album.name}
                                        width={200}
                                        height={200}
                                        className="w-full h-32 object-cover"
                                        data-ai-hint="travel album"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-2 left-2 text-white">
                                        <h3 className="font-bold text-sm leading-tight drop-shadow-md">{album.name}</h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                    <span>{album.postCount} {album.postCount > 1 ? 'posts' : 'post'}</span> &middot; <span>{album.location}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )
        }

        return (
             <div className="text-center text-muted-foreground py-16">
                <Sparkles className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Your journey log is empty.</h3>
                <p className="mt-2">Create your first post to start an album!</p>
            </div>
        );
    }
    
    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Community</h1>
                    <Button onClick={() => setCreatePostOpen(true)}>
                        <PlusCircle className="mr-2" /> Create Post
                    </Button>
                </div>

                {renderAlbumGrid()}
            </div>

            <CreatePostDialog 
                isOpen={isCreatePostOpen}
                onOpenChange={setCreatePostOpen}
            />

        </AppShell>
    );
}
