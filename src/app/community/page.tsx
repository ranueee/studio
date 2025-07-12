
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, ImagePlus, Video, Globe, Lock, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
    coverImage: string;
    coverImageHint: string;
    postCount: number;
    posts: Post[];
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
    const [createAlbumSwitch, setCreateAlbumSwitch] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState('');
    const { toast } = useToast();
    
    const getLocationName = (locationId: string) => {
        const poi = pois.find(p => p.id === locationId);
        return poi ? poi.name : locationId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const processPostsIntoAlbums = () => {
      setLoading(true);
      const postsByLocation: { [key: string]: Post[] } = {};
      initialPosts.forEach(post => {
          if (!postsByLocation[post.locationId]) {
              postsByLocation[post.locationId] = [];
          }
          postsByLocation[post.locationId].push(post);
      });
      
      const createdAlbums = Object.entries(postsByLocation).map(([locationId, posts]) => {
          const sortedPosts = posts.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
          const coverPost = sortedPosts[0];
          return {
              locationId: locationId,
              locationName: getLocationName(locationId),
              coverImage: coverPost.image || 'https://placehold.co/600x400.png',
              coverImageHint: coverPost.imageHint || 'community album cover',
              postCount: posts.length,
              posts: sortedPosts,
          };
      });

      setAlbums(createdAlbums.sort((a, b) => b.posts[0].timestamp.getTime() - a.posts[0].timestamp.getTime()));
      setLoading(false);
    };

    useEffect(() => {
        processPostsIntoAlbums();
    }, []);

    const resetCreateModal = () => {
        setNewPostContent('');
        setNewPostLocation('');
        setNewPostVisibility('Public');
        setNewPostMedia(null);
        setMediaTypeToAdd(null);
        setIsPosting(false);
        setCreateAlbumSwitch(false);
        setNewAlbumName('');
        setCreateModalOpen(false);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !newPostLocation.trim()) {
            toast({ variant: 'destructive', title: 'Missing information', description: 'Please add content and a location.' });
            return;
        }
        if (createAlbumSwitch && !newAlbumName.trim()) {
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
        
        const poiToUse = createAlbumSwitch ? newAlbumName.trim() : newPostLocation.trim();
        const existingPoi = pois.find(p => p.id === locationSlug);

        if (createAlbumSwitch) {
            if (existingPoi) {
                // If a POI with this slug exists, just update its name for the new album
                existingPoi.name = poiToUse;
                existingPoi.isAlbum = true;
            } else {
                // Otherwise, create a new POI entry for the album
                pois.push({ id: locationSlug, name: poiToUse, isAlbum: true });
            }
        } else if (!existingPoi) {
             // If not creating a specific album and the location is new, add it as a general POI
             pois.push({ id: locationSlug, name: poiToUse, isAlbum: false });
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
        processPostsIntoAlbums();
        
        resetCreateModal();
        toast({ title: 'Post Created!', description: 'Your adventure has been shared.' });
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
                    <h1 className="text-3xl font-bold">Community Albums</h1>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <PlusCircle className="mr-2" />
                        Create Post
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {(loading ? Array.from({ length: 3 }) : albums).map((album: Album | undefined, index) => (
                        <Link href={album ? `/community/album/${album.locationId}` : '#'} key={album?.locationId ?? index}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            {album ? (
                                <>
                                    <CardHeader className="p-0 relative">
                                        <Image
                                            src={album.coverImage}
                                            alt={album.locationName}
                                            width={600}
                                            height={250}
                                            className="w-full h-40 object-cover"
                                            data-ai-hint={album.coverImageHint}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-4">
                                            <h2 className="text-2xl font-bold text-white">{album.locationName}</h2>
                                            <p className="text-sm text-white/90">{album.postCount} {album.postCount > 1 ? 'posts' : 'post'}</p>
                                        </div>
                                    </CardHeader>
                                </>
                            ) : (
                                <div className="p-4 space-y-4">
                                    <Skeleton className="h-40 w-full" />
                                    <Skeleton className="h-6 w-3/5" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            )}
                            </Card>
                        </Link>
                    ))}
                     {!loading && albums.length === 0 && (
                        <div className="text-center text-muted-foreground py-16">
                            <h3 className="text-lg font-semibold">The Feed is Quiet...</h3>
                            <p className="mt-2">Be the first to share an adventure!</p>
                            <Button variant="default" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                                Create Post
                            </Button>
                        </div>
                    )}
                </div>
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
                            <Switch id="create-album-switch" checked={createAlbumSwitch} onCheckedChange={setCreateAlbumSwitch} />
                            <Label htmlFor="create-album-switch">Create a new album for this location</Label>
                        </div>

                        {createAlbumSwitch && (
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
