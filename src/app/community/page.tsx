
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, ImagePlus, Video, Globe, Lock, Send, MoreVertical, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
} from "@/components/ui/alert-dialog"

// Mock POIs for location tagging - this will now be used as a base and can grow
let pois = [
  { id: 'hundred-islands', name: 'Hundred Islands' },
  { id: 'patar-beach', name: 'Patar Beach' },
  { id: 'enchanted-cave', name: 'Enchanted Cave' },
  { id: 'bolinao-falls', name: 'Bolinao Falls' },
  { id: 'cape-bolinao', name: 'Cape Bolinao Lighthouse' },
];

let initialPosts = [
    {
        id: 1,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines beach sunset',
        caption: 'Sunsets in Pangasinan are unreal!',
        locationId: 'patar-beach',
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
        visibility: 'Public',
        timestamp: new Date('2023-10-25T12:10:11.511Z'),
    },
    {
        id: 3,
        user: { name: 'Explorer Cathy', avatar: 'https://placehold.co/600x400.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines cave water',
        caption: 'Took a dip in the Enchanted Cave.',
        locationId: 'enchanted-cave',
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
  visibility: 'Public' | 'Private';
  timestamp: Date;
};

type Album = {
  locationId: string;
  locationName: string;
  posts: Post[];
  coverImage: string;
  imageHint?: string;
  postCount: number;
};

export default function CommunityPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [newPostVisibility, setNewPostVisibility] = useState<'Public' | 'Private'>('Public');
    const [newPostMedia, setNewPostMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const processPosts = async (postsToProcess: Post[]) => {
      setLoading(true);
      
      const groupedByLocation = postsToProcess.reduce((acc, post) => {
        (acc[post.locationId] = acc[post.locationId] || []).push(post);
        return acc;
      }, {} as Record<string, Post[]>);
  
      const createdAlbums: Album[] = Object.keys(groupedByLocation).map(locationId => {
        const locationPosts = groupedByLocation[locationId].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
        const locationName = pois.find(p => p.id === locationId)?.name || locationId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const coverPost = locationPosts.find(p => p.image);

        return {
          locationId,
          locationName,
          posts: locationPosts,
          coverImage: coverPost?.image || 'https://placehold.co/300x300.png',
          imageHint: coverPost?.imageHint,
          postCount: locationPosts.length,
        };
      });
      
      setAlbums(createdAlbums.sort((a, b) => b.posts[0].timestamp.getTime() - a.posts[0].timestamp.getTime()));
      setLoading(false);
    };

    useEffect(() => {
        processPosts(initialPosts);
    }, []);

    const resetCreateModal = () => {
        setNewPostContent('');
        setNewPostLocation('');
        setNewPostVisibility('Public');
        setNewPostMedia(null);
        setIsPosting(false);
        setCreateModalOpen(false);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !newPostLocation.trim()) {
            toast({ variant: 'destructive', title: 'Missing information', description: 'Please add content and a location.' });
            return;
        }

        setIsPosting(true);
        
        const locationSlug = newPostLocation.trim().toLowerCase().replace(/\s+/g, '-');
        if (!pois.some(p => p.id === locationSlug)) {
            pois.push({ id: locationSlug, name: newPostLocation.trim() });
        }

        const newPost: Post = {
            id: Date.now(),
            user: { name: 'Eco-Explorer', avatar: 'https://placehold.co/40x40.png' },
            caption: newPostContent,
            locationId: locationSlug,
            visibility: newPostVisibility,
            timestamp: new Date(),
            ...(newPostMedia?.type === 'image' && { image: newPostMedia.url, imageHint: 'community post' }),
            ...(newPostMedia?.type === 'video' && { video: newPostMedia.url }),
        };

        initialPosts.unshift(newPost);
        await processPosts([...initialPosts]);
        
        resetCreateModal();
        toast({ title: 'Post Created!', description: 'Your adventure has been added to the community.' });
    };
    
    const handleDeleteAlbum = (locationId: string) => {
        initialPosts = initialPosts.filter(p => p.locationId !== locationId);
        processPosts([...initialPosts]);
        toast({
            title: 'Album Deleted',
            description: 'The album and all its posts have been removed.',
        })
    };

    const handleAddMedia = (type: 'image' | 'video') => {
        if (type === 'image') {
            // In a real app, this would open a file picker.
            setNewPostMedia({ type: 'image', url: 'https://placehold.co/600x400.png' });
            toast({ title: 'Image Added', description: 'A placeholder image has been added.' });
        }
        if (type === 'video') {
             // In a real app, this would open a file picker.
            setNewPostMedia({ type: 'video', url: 'placeholder_video_url' });
            toast({ title: 'Video Added', description: 'A placeholder video has been added.' });
        }
    };

    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Community</h1>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <PlusCircle className="mr-2" />
                        Create Post
                    </Button>
                </div>
                
                {loading ? (
                     <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-full h-48 rounded-lg" />)}
                     </div>
                ) : albums.length > 0 ? (
                    <>
                    <h2 className="text-xl font-semibold">Albums</h2>
                    <div className="grid grid-cols-2 gap-4">
                    {albums.map((album) => (
                        <div key={album.locationId} className="relative group">
                            <Link href={`/community/album/${album.locationId}`}>
                                <Card className="overflow-hidden h-48 flex flex-col hover:shadow-lg transition-shadow">
                                    <div className="relative h-full">
                                        <Image src={album.coverImage} alt={album.locationName} data-ai-hint={album.imageHint || "philippines album"} fill className="object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-3 text-white">
                                            <h3 className="font-bold">{album.locationName}</h3>
                                            <p className="text-xs">{album.postCount} {album.postCount > 1 ? 'posts' : 'post'}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                            <div className="absolute top-1 right-1">
                                 <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete Album</span>
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the album
                                            and all posts within it.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteAlbum(album.locationId)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                    </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <h3 className="text-lg font-semibold">No Albums Yet</h3>
                        <p className="mt-2">Create your first post to start a new album!</p>
                    </div>
                )}
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Post</DialogTitle>
                        <DialogDescription>Share your latest adventure with the community.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea 
                            placeholder="What's on your mind?" 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Tag a location (e.g., Patar Beach)"
                                value={newPostLocation}
                                onChange={(e) => setNewPostLocation(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                         <Select value={newPostVisibility} onValueChange={(v) => setNewPostVisibility(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Public"><div className="flex items-center gap-2"><Globe className="w-4 h-4"/>Public</div></SelectItem>
                                <SelectItem value="Private"><div className="flex items-center gap-2"><Lock className="w-4 h-4"/>Private</div></SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {newPostMedia && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                {newPostMedia.type === 'image' ? (
                                    <Image src={newPostMedia.url} alt="media preview" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-black flex items-center justify-center text-white">
                                        <Video className="w-12 h-12"/>
                                    </div>
                                )}
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setNewPostMedia(null)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span>Add to your post:</span>
                            <Button variant="ghost" size="icon" onClick={() => handleAddMedia('image')}><ImagePlus className="text-primary"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleAddMedia('video')}><Video className="text-primary"/></Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCreatePost} disabled={isPosting}>
                            {isPosting ? 'Posting...' : 'Post'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}

    