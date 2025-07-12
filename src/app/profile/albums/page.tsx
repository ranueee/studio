
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

let initialPosts: any[] = [
    {
        id: 1,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines beach sunset',
        caption: 'Sunsets in Pangasinan are unreal!',
        locationId: 'patar-beach',
        albumName: 'Patar Beach Adventures',
        visibility: 'Public',
        timestamp: new Date('2023-10-26T18:25:43.511Z'),
    },
    {
        id: 2,
        user: { name: 'Trailblazer Tom', avatar: 'https://placehold.co/40x40.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines islands boat',
        caption: 'Island hopping day was a success!',
        locationId: 'hundred-islands',
        albumName: 'Hundred Islands Trip',
        visibility: 'Public',
        timestamp: new Date('2023-10-25T12:10:11.511Z'),
    },
    {
        id: 3,
        user: { name: 'Explorer Cathy', avatar: 'https://placehold.co/40x40.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines cave water',
        caption: 'Took a dip in the Enchanted Cave.',
        locationId: 'enchanted-cave',
        albumName: 'Bolinao Getaway',
        visibility: 'Private',
        timestamp: new Date('2023-10-24T09:30:00.511Z'),
    },
    {
        id: 4,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines lighthouse coast',
        caption: 'The view from the top is worth the climb!',
        locationId: 'cape-bolinao',
        albumName: 'Bolinao Getaway',
        visibility: 'Public',
        timestamp: new Date('2023-10-23T15:00:21.511Z'),
    },
     {
        id: 5,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines white sand beach',
        caption: 'Another beautiful day at the beach.',
        locationId: 'patar-beach',
        albumName: 'Patar Beach Adventures',
        visibility: 'Public',
        timestamp: new Date('2023-10-27T11:45:00.511Z'),
    },
];

type Post = {
  id: number;
  user: { name: string; avatar: string; };
  image?: string;
  imageHint?: string;
  video?: string;
  caption: string;
  locationId: string;
  albumName?: string;
  visibility: 'Public' | 'Private';
  timestamp: Date;
};

type Album = {
    albumId: string;
    albumName: string;
    coverImage: string;
    coverImageHint: string;
    postCount: number;
};

export default function MyAlbumsPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const processPostsIntoAlbums = () => {
      setLoading(true);
      const albumsByName: { [key: string]: Post[] } = {};
      
      initialPosts.forEach(post => {
          if (post.albumName) {
              if (!albumsByName[post.albumName]) {
                  albumsByName[post.albumName] = [];
              }
              albumsByName[post.albumName].push(post);
          }
      });
      
      const createdAlbums = Object.entries(albumsByName).map(([albumName, posts]) => {
          const sortedPosts = posts.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
          const coverPost = sortedPosts[0];
          return {
              albumId: albumName.toLowerCase().replace(/\s+/g, '-'),
              albumName: albumName,
              coverImage: coverPost.image || 'https://placehold.co/600x400.png',
              coverImageHint: coverPost.imageHint || 'community album cover',
              postCount: posts.length,
          };
      });

      setAlbums(createdAlbums.sort((a, b) => a.albumName.localeCompare(b.albumName)));
      setLoading(false);
    };

    useEffect(() => {
        processPostsIntoAlbums();
    }, []);
    
    const handleDeleteAlbum = (albumNameToDelete: string) => {
        // Simulate deleting from the "database"
        initialPosts = initialPosts.filter(p => p.albumName !== albumNameToDelete);
        // Update the state to re-render
        processPostsIntoAlbums();
        toast({
            title: "Album Deleted",
            description: `The album "${albumNameToDelete}" and all its posts have been removed.`,
        });
    };

    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-3xl font-bold">My Albums</h1>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {(loading ? Array.from({ length: 2 }) : albums).map((album: Album | undefined, index) => (
                        <Card key={album?.albumId ?? index} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group relative">
                        {album ? (
                            <>
                                <Link href={`/community/album/${album.albumId}`} className="contents">
                                    <CardHeader className="p-0 relative h-32">
                                        <Image
                                            src={album.coverImage}
                                            alt={album.albumName}
                                            width={300}
                                            height={300}
                                            className="w-full h-full object-cover"
                                            data-ai-hint={album.coverImageHint}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                    </CardHeader>
                                    <div className="p-3 flex-1">
                                        <h2 className="font-bold text-md truncate">{album.albumName}</h2>
                                        <p className="text-sm text-muted-foreground">{album.postCount} {album.postCount > 1 ? 'items' : 'item'}</p>
                                    </div>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="destructive" 
                                            size="icon" 
                                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the album "{album.albumName}" and all of its photos. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteAlbum(album!.albumName)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        ) : (
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-5 w-4/5" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        )}
                        </Card>
                    ))}
                </div>
                 {!loading && albums.length === 0 && (
                    <div className="text-center text-muted-foreground py-16 col-span-2">
                        <h3 className="text-lg font-semibold">You haven't started any journey yet.</h3>
                        <p className="mt-2">Create albums to organize your adventures.</p>
                        <Button variant="default" className="mt-4" onClick={() => router.push('/community')}>
                           <PlusCircle className="mr-2"/> Start a Journey
                        </Button>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
