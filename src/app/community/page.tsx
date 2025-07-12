
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, ImagePlus, Globe, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';


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

export default function CommunityPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // Create Post State
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [newPostVisibility, setNewPostVisibility] = useState<'Public' | 'Private'>('Public');
    const [newPostMedia, setNewPostMedia] = useState<{type: 'image' | 'video', url: string, file: File} | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [albumSelectionMode, setAlbumSelectionMode] = useState<'existing' | 'new' | null>(null);
    const [newAlbumName, setNewAlbumName] = useState('');
    const [selectedAlbum, setSelectedAlbum] = useState('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    const [existingAlbumNames, setExistingAlbumNames] = useState<string[]>([]);

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
      setExistingAlbumNames([...new Set(initialPosts.filter(p => p.albumName).map(p => p.albumName))]);
      setLoading(false);
    };

    useEffect(() => {
        processPostsIntoAlbums();
    }, []);
    
    const handleDeleteAlbum = (albumNameToDelete: string) => {
        initialPosts = initialPosts.filter(p => p.albumName !== albumNameToDelete);
        processPostsIntoAlbums();
        toast({
            title: "Album Deleted",
            description: `The album "${albumNameToDelete}" and all its posts have been removed.`,
        });
    };

    const resetCreateModal = () => {
        setNewPostContent('');
        setNewPostLocation('');
        setNewPostVisibility('Public');
        setNewPostMedia(null);
        setIsPosting(false);
        setAlbumSelectionMode(null);
        setNewAlbumName('');
        setSelectedAlbum('');
        setCreateModalOpen(false);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !newPostMedia) {
            toast({ variant: 'destructive', title: 'Missing content', description: 'Please add a caption or media.' });
            return;
        }

        let finalAlbumName = '';
        if (newPostMedia) {
            if (albumSelectionMode === 'new') {
                if (!newAlbumName.trim()) {
                     toast({ variant: 'destructive', title: 'Missing Album Name', description: 'Please enter a name for your new album.' });
                     return;
                }
                finalAlbumName = newAlbumName.trim();
            } else if (albumSelectionMode === 'existing') {
                 if (!selectedAlbum) {
                     toast({ variant: 'destructive', title: 'Missing Album', description: 'Please select an existing album.' });
                     return;
                }
                finalAlbumName = selectedAlbum;
            }
        }
        
        setIsPosting(true);
        
        let mediaData: {image?: string, video?: string, imageHint?: string} = {};
        if (newPostMedia) {
            mediaData = newPostMedia.type === 'image' 
                ? { image: newPostMedia.url, imageHint: 'newly created post' } 
                : { video: newPostMedia.url };
        }
        
        const locationSlug = newPostLocation.trim().toLowerCase().replace(/\s+/g, '-') || 'general';
        
        const newPost: Post = {
            id: Date.now(),
            user: { name: 'Eco-Explorer', avatar: 'https://placehold.co/40x40.png' },
            caption: newPostContent,
            locationId: locationSlug,
            visibility: newPostVisibility,
            timestamp: new Date(),
            albumName: finalAlbumName || undefined,
            ...mediaData,
        };
        
        initialPosts.unshift(newPost);
        processPostsIntoAlbums();
        
        resetCreateModal();
        toast({ title: 'Post Created!', description: 'Your adventure has been shared.' });
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            setNewPostMedia({ type, url, file });
        }
    };

    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">My Albums</h1>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <PlusCircle className="mr-2" />
                        Create Post
                    </Button>
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
                        <Button variant="default" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                           <PlusCircle className="mr-2"/> Start a Journey
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={(isOpen) => !isOpen && resetCreateModal()}>
                <DialogContent className="max-h-[90svh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Create a New Post</DialogTitle>
                        <DialogDescription>Share your latest adventure, thoughts, or media.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mx-6">
                        <div className="space-y-4 py-4 px-6">
                            <Textarea 
                                placeholder="What's on your mind?" 
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="min-h-[100px]"
                            />

                            {newPostMedia && (
                                <div className="relative">
                                    {newPostMedia.type === 'image' && <Image src={newPostMedia.url} alt="Preview" width={200} height={200} className="rounded-md w-full max-h-64 object-cover" />}
                                    {newPostMedia.type === 'video' && <video src={newPostMedia.url} controls className="rounded-md w-full max-h-64" />}
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setNewPostMedia(null)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            )}
                            
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Tag a location (optional)"
                                    value={newPostLocation}
                                    onChange={(e) => setNewPostLocation(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {newPostMedia && (
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <Label>Album</Label>
                                    <RadioGroup value={albumSelectionMode || ''} onValueChange={(value) => setAlbumSelectionMode(value as any)} className="flex pt-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="existing" id="r-existing" />
                                            <Label htmlFor="r-existing">Add to Existing</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="new" id="r-new" />
                                            <Label htmlFor="r-new">Create New</Label>
                                        </div>
                                    </RadioGroup>

                                    {albumSelectionMode === 'new' && (
                                        <Input 
                                            placeholder="Enter new album name..."
                                            value={newAlbumName}
                                            onChange={(e) => setNewAlbumName(e.target.value)}
                                        />
                                    )}

                                    {albumSelectionMode === 'existing' && (
                                        <Select onValueChange={setSelectedAlbum} value={selectedAlbum} disabled={existingAlbumNames.length === 0}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={existingAlbumNames.length === 0 ? "No albums yet" : "Select an album"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {existingAlbumNames.map(name => (
                                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" style={{ display: 'none' }} />
                                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        <ImagePlus className="mr-2"/> Add Media
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch 
                                        id="visibility-switch" 
                                        checked={newPostVisibility === 'Public'} 
                                        onCheckedChange={(checked) => setNewPostVisibility(checked ? 'Public' : 'Private')} 
                                    />
                                    <Label htmlFor="visibility-switch" className="flex items-center gap-1.5">
                                        {newPostVisibility === 'Public' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        {newPostVisibility}
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
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
