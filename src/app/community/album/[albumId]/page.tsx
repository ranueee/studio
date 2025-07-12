
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Globe, Lock, ArrowLeft, Copy, Trash2, MoreVertical, Edit, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';


const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;

// In a real app, this data would be fetched from a database
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

export default function AlbumDetailPage() {
    const params = useParams();
    const router = useRouter();
    const albumId = params.albumId as string;

    const [posts, setPosts] = useState<Post[]>([]);
    const [albumName, setAlbumName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editedCaption, setEditedCaption] = useState('');
    const { toast } = useToast();

    const fetchAlbumData = () => {
        setLoading(true);
        const albumPosts = initialPosts.filter(p => p.locationId === albumId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setPosts(albumPosts);
        const location = pois.find(p => p.id === albumId);
        const friendlyAlbumName = location?.name || albumId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        setAlbumName(friendlyAlbumName);
        setLoading(false);
    };

    useEffect(() => {
        if (!albumId) return;
        fetchAlbumData();
    }, [albumId]);
    
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
    }

    const handleDeletePost = (postId: number) => {
        initialPosts = initialPosts.filter(p => p.id !== postId);
        setPosts(posts.filter(p => p.id !== postId));
        toast({
            title: "Post Deleted",
            description: "The post has been removed from the album.",
        });
    }

    const openEditModal = (post: Post) => {
        setEditingPost(post);
        setEditedCaption(post.caption);
        setEditModalOpen(true);
    }

    const handleEditPost = () => {
        if (!editingPost) return;

        const postIndex = initialPosts.findIndex(p => p.id === editingPost.id);
        if (postIndex > -1) {
            initialPosts[postIndex].caption = editedCaption;
        }

        setPosts(posts.map(p => p.id === editingPost.id ? { ...p, caption: editedCaption } : p));
        
        setEditModalOpen(false);
        setEditingPost(null);
        setEditedCaption('');
        toast({
            title: "Post Updated",
            description: "Your post caption has been updated.",
        });
    }

    return (
        <AppShell>
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-2xl font-bold">{albumName}</h1>
                </div>

                <div className="space-y-4">
                    {(loading ? Array.from({ length: 2 }) : posts).map((post: Post | undefined, index) => (
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
                                        {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(post.timestamp)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={post.visibility === 'Public' ? 'secondary' : 'outline'}>
                                        {post.visibility === 'Public' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                        {post.visibility}
                                    </Badge>
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
                                </div>
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
                                    <Button variant="ghost" className="flex-1" onClick={() => setShareModalOpen(true)}>
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
                        <div className="text-center text-muted-foreground py-10">
                            <p>This album is empty.</p>
                            <Button variant="link" onClick={() => router.push('/community')}>Go back to albums</Button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isShareModalOpen} onOpenChange={setShareModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share this Post</DialogTitle>
                        <DialogDescription>
                            Share this eco-adventure with your friends!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('Facebook')}>
                            <FacebookIcon className="w-8 h-8"/>
                            <span>Facebook</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('X')}>
                            <XIcon className="w-8 h-8"/>
                            <span>X</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('Instagram')}>
                            <InstagramIcon className="w-8 h-8"/>
                            <span>Instagram</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('WhatsApp')}>
                            <WhatsAppIcon className="w-8 h-8"/>
                            <span>WhatsApp</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleShare('Copy Link')}>
                            <Copy className="w-8 h-8"/>
                            <span>Copy Link</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                        <DialogDescription>
                            Make changes to your post caption.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                            className="min-h-[120px]"
                            placeholder="Write your new caption..."
                        />
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
