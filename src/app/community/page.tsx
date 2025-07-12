
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, ImagePlus, Video, Globe, Lock, Send, MoreVertical, Trash2, Heart, MessageCircle, Share2, Edit } from 'lucide-react';
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


export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
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

    const processPosts = () => {
      setLoading(true);
      const sortedPosts = [...initialPosts].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
      setPosts(sortedPosts);
      setLoading(false);
    };

    useEffect(() => {
        processPosts();
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
        processPosts();
        
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
    
    const getLocationName = (locationId: string) => {
        const poi = pois.find(p => p.id === locationId);
        return poi ? poi.name : locationId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Community Feed</h1>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <PlusCircle className="mr-2" />
                        Create Post
                    </Button>
                </div>
                
                <div className="space-y-4">
                    {(loading ? Array.from({ length: 3 }) : posts).map((post: Post | undefined, index) => (
                        <Card key={post?.id ?? index} className="overflow-hidden">
                        {post ? (
                            <>
                            <CardHeader className="flex flex-row items-center gap-3 p-4">
                                <Avatar>
                                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{post.user.name}</p>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <span>{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(post.timestamp)}</span>
                                        <span>&middot;</span>
                                        <Link href={`/community/album/${post.locationId}`} className="hover:underline">
                                           <span>{getLocationName(post.locationId)}</span>
                                        </Link>
                                    </div>
                                </div>
                                <Badge variant={post.visibility === 'Public' ? 'secondary' : 'outline'}>
                                    {post.visibility === 'Public' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                    {post.visibility}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {post.image && (
                                    <Image
                                        src={post.image}
                                        alt={post.caption}
                                        width={600}
                                        height={400}
                                        className="w-full h-auto object-cover"
                                        data-ai-hint={post.imageHint || "community post image"}
                                    />
                                )}
                                {post.video && (
                                     <div className="w-full aspect-video bg-black flex items-center justify-center text-white">
                                        <video src={post.video} controls className="w-full h-full" />
                                    </div>
                                )}
                                <p className="p-4 text-sm">{post.caption}</p>
                            </CardContent>
                            <CardFooter className="p-2 border-t">
                                <div className="flex w-full justify-around">
                                    <Button variant="ghost" className="flex-1">
                                        <Heart className="mr-2" />
                                        Like
                                    </Button>
                                    <Button variant="ghost" className="flex-1">
                                        <MessageCircle className="mr-2" />
                                        Comment
                                    </Button>
                                    <Button variant="ghost" className="flex-1">
                                        <Share2 className="mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </CardFooter>
                            </>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[150px]" />
                                        <Skeleton className="h-4 w-[100px]" />
                                    </div>
                                </div>
                                <Skeleton className="h-[250px] w-full rounded-lg" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        )}
                        </Card>
                    ))}
                     {!loading && posts.length === 0 && (
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

    