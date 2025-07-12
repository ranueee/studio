
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
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

let pois = [
  { id: 'hundred-islands', name: 'Hundred Islands', isAlbum: true },
  { id: 'patar-beach', name: 'Patar Beach', isAlbum: true },
  { id: 'enchanted-cave', name: 'Enchanted Cave', isAlbum: true },
  { id: 'bolinao-falls', name: 'Bolinao Falls', isAlbum: false },
  { id: 'cape-bolinao', name: 'Cape Bolinao Lighthouse', isAlbum: true },
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
        user: { name: 'Explorer Cathy', avatar: 'https://placehold.co/40x40.png' },
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
    const [mediaTypeToAdd, setMediaTypeToAdd] = useState<'image' | 'video' | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [createAlbum, setCreateAlbum] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState('');
    const { toast } = useToast();

    const processPosts = async (postsToProcess: Post[]) => {
      setLoading(true);
      
      const groupedByLocation = postsToProcess.reduce((acc, post) => {
        (acc[post.locationId] = acc[post.locationId] || []).push(post);
        return acc;
      }, {} as Record<string, Post[]>);
  
      const createdAlbums: Album[] = Object.keys(groupedByLocation)
        .filter(locationId => pois.some(p => p.id === locationId && p.isAlbum))
        .map(locationId => {
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
        }).filter(album => album.postCount > 0);
      
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
        setMediaTypeToAdd(null);
        setIsPosting(false);
        setCreateAlbum(false);
        setNewAlbumName('');
        setCreateModalOpen(false);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !newPostLocation.trim()) {
            toast({ variant: 'destructive', title: 'Missing information', description: 'Please add content and a location.' });
            return;
        }
        if (createAlbum && !newAlbumName.trim()) {
            toast({ variant: 'destructive', title: 'Missing Album Name', description: 'Please provide a name for the new album.' });
            return;
        }

        setIsPosting(true);
        
        let mediaUrl: string | undefined;
        let imageHint: string | undefined;
        
        if (mediaTypeToAdd === 'image') {
          mediaUrl = 'https://placehold.co/600x400.png';
          imageHint = 'newly created post';
        } else if (mediaTypeToAdd === 'video') {
          mediaUrl = 'placeholder_video_url';
        }
        
        const locationSlug = newPostLocation.trim().toLowerCase().replace(/\s+/g, '-');
        const existingPoi = pois.find(p => p.id === locationSlug);

        if (createAlbum) {
            if (existingPoi) {
                existingPoi.name = newAlbumName;
                existingPoi.isAlbum = true;
            } else {
                pois.push({ id: locationSlug, name: newAlbumName.trim(), isAlbum: true });
            }
        } else if (!existingPoi) {
            pois.push({ id: locationSlug, name: newPostLocation.trim(), isAlbum: false });
        }


        const newPost: Post = {
            id: Date.now(),
            user: { name: 'Eco-Explorer', avatar: 'https://placehold.co/40x40.png' },
            caption: newPostContent,
            locationId: locationSlug,
            visibility: newPostVisibility,
            timestamp: new Date(),
            ...(mediaTypeToAdd === 'image' && { image: mediaUrl, imageHint: imageHint }),
            ...(mediaTypeToAdd === 'video' && { video: mediaUrl }),
        };

        initialPosts.unshift(newPost);
        await processPosts([...initialPosts]);
        
        resetCreateModal();
        toast({ title: 'Post Created!', description: 'Your adventure has been shared.' });
    };
    
    const handleDeleteAlbum = (locationId: string) => {
        initialPosts = initialPosts.filter(p => p.locationId !== locationId);
        const poiIndex = pois.findIndex(p => p.id === locationId);
        if (poiIndex > -1) {
            pois[poiIndex].isAlbum = false; // Keep location, but remove from album view
        }
        processPosts([...initialPosts]);
        toast({
            title: 'Album Deleted',
            description: 'The album has been removed from your profile.',
        })
    };

    const handleAddMedia = (type: 'image' | 'video') => {
        if (mediaTypeToAdd === type) {
            setMediaTypeToAdd(null);
        } else {
            setMediaTypeToAdd(type);
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
                    <h2 className="text-xl font-semibold">My Albums</h2>
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
                                            This action cannot be undone. This will permanently delete this album from your profile.
                                            The posts will still exist but will be un-albumed.
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
                        <p className="mt-2">Create your first post and make an album to see it here!</p>
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

                         <div className="flex items-center space-x-2">
                            <Switch id="create-album-switch" checked={createAlbum} onCheckedChange={setCreateAlbum} />
                            <Label htmlFor="create-album-switch">Create a new album for this location</Label>
                        </div>

                        {createAlbum && (
                            <div className="pl-2 animate-in fade-in">
                                <Input
                                    placeholder="Enter album name"
                                    value={newAlbumName}
                                    onChange={(e) => setNewAlbumName(e.target.value)}
                                />
                            </div>
                        )}

                         <Select value={newPostVisibility} onValueChange={(v) => setNewPostVisibility(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Public"><div className="flex items-center gap-2"><Globe className="w-4 h-4"/>Public</div></SelectItem>
                                <SelectItem value="Private"><div className="flex items-center gap-2"><Lock className="w-4 h-4"/>Private</div></SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span>Add to your post:</span>
                            <Button variant="ghost" size="icon" onClick={() => handleAddMedia('image')} className={mediaTypeToAdd === 'image' ? 'bg-accent' : ''}>
                                <ImagePlus className="text-primary"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleAddMedia('video')} className={mediaTypeToAdd === 'video' ? 'bg-accent' : ''}>
                                <Video className="text-primary"/>
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost" onClick={resetCreateModal}>Cancel</Button>
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

    