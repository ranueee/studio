
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, ImagePlus, Video, Globe, Lock, Send, Heart, MessageCircle, Share2, Copy, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// In a real app, this data would be fetched from a database
let pois = [
  { id: 'hundred-islands', name: 'Hundred Islands', isAlbum: true },
  { id: 'patar-beach', name: 'Patar Beach', isAlbum: true },
  { id: 'enchanted-cave', name: 'Enchanted Cave', isAlbum: true },
  { id: 'bolinao-falls', name: 'Bolinao Falls', isAlbum: false },
  { id: 'cape-bolinao', name: 'Cape Bolinao Lighthouse', isAlbum: true },
];

let initialPosts: Post[] = [
    {
        id: 1,
        user: { name: 'Wanderlust Ana', avatar: 'https://placehold.co/40x40.png' },
        image: 'https://placehold.co/600x400.png',
        imageHint: 'philippines beach sunset',
        caption: 'Sunsets in Pangasinan are unreal!',
        locationId: 'patar-beach',
        visibility: 'Public',
        timestamp: new Date('2023-10-26T18:25:43.511Z'),
        likes: 12,
        comments: [],
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
        likes: 25,
        comments: [],
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
        likes: 5,
        comments: [],
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
        likes: 18,
        comments: [],
    },
    {
        id: 5,
        user: { name: 'Storyteller Sam', avatar: 'https://placehold.co/40x40.png' },
        caption: "Just reflecting on my recent trip to Pangasinan. The people are so welcoming, and the landscapes are breathtaking. It's more than just a destination; it's a feeling. Can't wait to go back and explore more hidden gems. #EcoLakbay #Pangasinan",
        locationId: 'pangasinan-general',
        visibility: 'Public',
        timestamp: new Date('2023-10-22T10:00:00.511Z'),
        likes: 30,
        comments: [],
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
  likes: number;
  comments: any[]; // Simplified for now
};


const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;


export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [newPostVisibility, setNewPostVisibility] = useState<'Public' | 'Private'>('Public');
    const [newPostMedia, setNewPostMedia] = useState<{type: 'image' | 'video', url: string, file: File} | null>(null);
    const [mediaTypeToAdd, setMediaTypeToAdd] = useState<'image' | 'video' | 'text' | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [createAlbumSwitch, setCreateAlbumSwitch] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState('');
    const [selectedAlbum, setSelectedAlbum] = useState<string>('');
    
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editedCaption, setEditedCaption] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const fetchPosts = () => {
        setLoading(true);
        // Sort posts by most recent
        const sortedPosts = [...initialPosts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setPosts(sortedPosts);
        setLoading(false);
    }
    
    useEffect(() => {
        fetchPosts();
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
        setSelectedAlbum('');
        setCreateModalOpen(false);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !newPostMedia) {
            toast({ variant: 'destructive', title: 'Missing content', description: 'Please add a caption or media.' });
            return;
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
            likes: 0,
            comments: [],
            ...mediaData
        };

        if (newPostMedia) {
          if (createAlbumSwitch && newAlbumName.trim()) {
            newPost.albumName = newAlbumName.trim();
          } else if (selectedAlbum) {
            const album = pois.find(p => p.id === selectedAlbum);
            newPost.albumName = album?.name;
          }
        }
        
        initialPosts.unshift(newPost);
        fetchPosts();
        
        resetCreateModal();
        toast({ title: 'Post Created!', description: 'Your adventure has been shared.' });
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            setMediaTypeToAdd(type);
            setNewPostMedia({ type, url, file });
        }
    };

    const handleAddMedia = (type: 'image' | 'video') => {
        setMediaTypeToAdd(type);
        fileInputRef.current?.click();
    };

    const handleShare = (platform: string) => {
        setShareModalOpen(false);
        let message = '';
        if (platform === 'Copy Link') {
            navigator.clipboard.writeText(window.location.href);
            message = 'Link copied to clipboard!';
        } else {
            message = `Shared to ${platform}! (simulation)`;
        }
        toast({
            title: "Shared Successfully!",
            description: message,
        });
    };

    const handleDeletePost = (postId: number) => {
        initialPosts = initialPosts.filter(p => p.id !== postId);
        fetchPosts();
        toast({
            title: "Post Deleted",
            description: "The post has been removed.",
        });
    };

    const openEditModal = (post: Post) => {
        setEditingPost(post);
        setEditedCaption(post.caption);
        setEditModalOpen(true);
    };

    const handleEditPost = () => {
        if (!editingPost) return;
        const postIndex = initialPosts.findIndex(p => p.id === editingPost.id);
        if (postIndex > -1) {
            initialPosts[postIndex].caption = editedCaption;
        }
        fetchPosts();
        setEditModalOpen(false);
        setEditingPost(null);
        setEditedCaption('');
        toast({
            title: "Post Updated",
            description: "Your post caption has been updated.",
        });
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
                                    <p className="text-sm text-muted-foreground">
                                      <span>{getLocationName(post.locationId)}</span>
                                      <span className="mx-1">&middot;</span>
                                      <span>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(post.timestamp)}</span>
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openEditModal(post)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="p-0">
                                {post.image && (
                                    <Image src={post.image} alt={post.caption} width={600} height={400} className="w-full h-auto object-cover" data-ai-hint={post.imageHint || "community post image"}/>
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
                                        <Heart className="mr-2" /> {post.likes}
                                    </Button>
                                    <Button variant="ghost" className="flex-1">
                                        <MessageCircle className="mr-2" /> Comment
                                    </Button>
                                    <Button variant="ghost" className="flex-1" onClick={() => setShareModalOpen(true)}>
                                        <Share2 className="mr-2" /> Share
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
                            <h3 className="text-lg font-semibold">Start your journey!</h3>
                            <p className="mt-2">The feed is quiet. Be the first to share an adventure!</p>
                            <Button variant="default" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                                Create Post
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={(isOpen) => !isOpen && resetCreateModal()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Post</DialogTitle>
                        <DialogDescription>Share your latest adventure, thoughts, or media.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
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
                            <>
                                <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an album (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pois.filter(p => p.isAlbum).map(album => (
                                            <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center space-x-2">
                                    <Switch id="create-album-switch" checked={createAlbumSwitch} onCheckedChange={setCreateAlbumSwitch} disabled={!!selectedAlbum} />
                                    <Label htmlFor="create-album-switch">Create a new album for this post</Label>
                                </div>

                                {createAlbumSwitch && (
                                    <div className="pl-2 animate-in fade-in">
                                        <Input
                                            placeholder="Enter new album name"
                                            value={newAlbumName}
                                            onChange={(e) => setNewAlbumName(e.target.value)}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span>Add to your post:</span>
                             <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" style={{ display: 'none' }} />
                            <Button variant="ghost" size="icon" onClick={() => handleAddMedia('image')}>
                                <ImagePlus className="text-primary"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleAddMedia('video')}>
                                <Video className="text-primary"/>
                            </Button>
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

            <Dialog open={isShareModalOpen} onOpenChange={setShareModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share this Post</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                         <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('Facebook')}><FacebookIcon className="w-8 h-8"/><span>Facebook</span></Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('X')}><XIcon className="w-8 h-8"/><span>X</span></Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('Instagram')}><InstagramIcon className="w-8 h-8"/><span>Instagram</span></Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('WhatsApp')}><WhatsAppIcon className="w-8 h-8"/><span>WhatsApp</span></Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('Copy Link')}><Copy className="w-8 h-8"/><span>Copy Link</span></Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea value={editedCaption} onChange={(e) => setEditedCaption(e.target.value)} className="min-h-[120px]" />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditPost}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}

    