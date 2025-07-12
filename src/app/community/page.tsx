
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, ImagePlus, Video, Globe, Lock, Send, MoreVertical, Trash2 } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Mock POIs for location tagging
const pois = [
  { id: 'hundred-islands', name: 'Hundred Islands' },
  { id: 'patar-beach', name: 'Patar Beach' },
  { id: 'enchanted-cave', name: 'Enchanted Cave' },
  { id: 'bolinao-falls', name: 'Bolinao Falls' },
  { id: 'cape-bolinao', name: 'Cape Bolinao Lighthouse' },
];

const initialPosts = [
    {
        id: 1,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: '',
        imageHint: 'philippines beach sunset',
        caption: 'Sunsets in Pangasinan are unreal!',
        locationId: 'patar-beach',
        visibility: 'Public',
        timestamp: new Date('2023-10-26T18:25:43.511Z'),
    },
    {
        id: 2,
        user: { name: 'Trailblazer Tom', avatar: 'https://placehold.co/40x40.png' },
        image: '',
        imageHint: 'philippines islands boat',
        caption: 'Island hopping day was a success!',
        locationId: 'hundred-islands',
        visibility: 'Public',
        timestamp: new Date('2023-10-25T12:10:11.511Z'),
    },
    {
        id: 3,
        user: { name: 'Explorer Cathy', avatar: 'https://placehold.co/40x40.png' },
        image: '',
        imageHint: 'philippines cave water',
        caption: 'Took a dip in the Enchanted Cave.',
        locationId: 'enchanted-cave',
        visibility: 'Private',
        timestamp: new Date('2023-10-24T09:30:00.511Z'),
    },
    {
        id: 4,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: '',
        imageHint: 'philippines lighthouse coast',
        caption: 'The view from the top is worth the climb!',
        locationId: 'cape-bolinao',
        visibility: 'Public',
        timestamp: new Date('2023-10-23T15:00:21.511Z'),
    },
     {
        id: 5,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: '',
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
  postCount: number;
};

export default function CommunityPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState<string | null>(null);
    const [newPostVisibility, setNewPostVisibility] = useState<'Public' | 'Private'>('Public');
    const [isPosting, setIsPosting] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const processPosts = async (posts: Post[]) => {
      setLoading(true);
      const postsWithImages = await Promise.all(
        posts.map(async (post) => {
          if (post.imageHint && !post.image) {
            try {
              const result = await generateImage({ prompt: post.imageHint });
              return { ...post, image: result.imageUrl };
            } catch (error) {
              console.error(`Failed to generate image for: ${post.imageHint}`, error);
              return { ...post, image: 'https://placehold.co/600x400.png' };
            }
          }
          return post;
        })
      );
  
      const groupedByLocation = postsWithImages.reduce((acc, post) => {
        (acc[post.locationId] = acc[post.locationId] || []).push(post);
        return acc;
      }, {} as Record<string, Post[]>);
  
      const createdAlbums: Album[] = Object.keys(groupedByLocation).map(locationId => {
        const locationPosts = groupedByLocation[locationId].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
        return {
          locationId,
          locationName: pois.find(p => p.id === locationId)?.name || 'Unknown Location',
          posts: locationPosts,
          coverImage: locationPosts[0]?.image || 'https://placehold.co/300x300.png',
          postCount: locationPosts.length,
        };
      });
      
      setAlbums(createdAlbums);
      setLoading(false);
    };

    useEffect(() => {
        processPosts(initialPosts);
    }, []);

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !newPostLocation) {
            toast({ variant: 'destructive', title: 'Missing information', description: 'Please add content and select a location.' });
            return;
        }

        setIsPosting(true);
        toast({ title: 'Creating Post...', description: 'Your AI image is being generated.' });

        let imageUrl: string | undefined = 'https://placehold.co/600x400.png';
        try {
            const result = await generateImage({ prompt: newPostContent.substring(0, 50) });
            imageUrl = result.imageUrl;
        } catch (error) {
            toast({ variant: 'destructive', title: 'Image Generation Failed', description: 'Could not generate an image.' });
            setIsPosting(false);
            return;
        }

        const newPost: Post = {
            id: Date.now(),
            user: { name: 'Eco-Explorer', avatar: 'https://placehold.co/40x40.png' },
            image: imageUrl,
            caption: newPostContent,
            locationId: newPostLocation,
            visibility: newPostVisibility,
            timestamp: new Date(),
        };

        const allPosts = [...initialPosts, newPost]; // In a real app, this would come from the state that holds all posts
        initialPosts.push(newPost); // Mutating for demo purposes
        processPosts(allPosts);
        
        setCreateModalOpen(false);
        setNewPostContent('');
        setNewPostLocation(null);
        setIsPosting(false);
        toast({ title: 'Post Created!', description: 'Your adventure has been added to the album.' });
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
                
                <h2 className="text-xl font-semibold">Albums</h2>
                
                {loading ? (
                     <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-full h-48 rounded-lg" />)}
                     </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                    {albums.map((album) => (
                        <Link href={`/community/album/${album.locationId}`} key={album.locationId}>
                            <Card className="overflow-hidden h-48 flex flex-col group hover:shadow-lg transition-shadow">
                                <div className="relative h-full">
                                    <Image src={album.coverImage} alt={album.locationName} fill className="object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-3 text-white">
                                        <h3 className="font-bold">{album.locationName}</h3>
                                        <p className="text-xs">{album.postCount} {album.postCount > 1 ? 'posts' : 'post'}</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
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
                        <Select onValueChange={setNewPostLocation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tag a location" />
                            </SelectTrigger>
                            <SelectContent>
                                {pois.map(poi => (
                                    <SelectItem key={poi.id} value={poi.id}>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {poi.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Select value={newPostVisibility} onValueChange={(v) => setNewPostVisibility(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Public"><div className="flex items-center gap-2"><Globe className="w-4 h-4"/>Public</div></SelectItem>
                                <SelectItem value="Private"><div className="flex items-center gap-2"><Lock className="w-4 h-4"/>Private</div></SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ImagePlus className="text-primary"/>
                            <span>An AI-generated image will be created for your post.</span>
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
