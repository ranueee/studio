
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Send, Share2, Trash2, Edit, PlusCircle, Copy } from 'lucide-react';
import type { Post, Comment, Album } from '@/contexts/app-context';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CreatePostDialog } from '@/components/create-post-dialog';

const PostCard = ({ post, onLike, onComment }: { post: Post, onLike: (postId: string) => void, onComment: (postId: string, text: string) => void }) => {
    const { toast } = useToast();
    const [commentText, setCommentText] = useState('');
    const [isShareOpen, setShareOpen] = useState(false);
    const { deletePost } = useApp();

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            onComment(post.id, commentText);
            setCommentText('');
        }
    };

    const handleShare = (platform: string) => {
        if (platform === 'copy') {
            const postUrl = `${window.location.origin}/community/post/${post.id}`;
            navigator.clipboard.writeText(postUrl);
            toast({ title: 'Link Copied!', description: 'Post link copied to clipboard.' });
        } else {
            toast({ title: 'Shared!', description: `Your post has been shared to ${platform}.` });
        }
        setShareOpen(false);
    };

    const handleDelete = () => {
        deletePost(post.id);
        toast({ title: 'Post Deleted', description: 'Your post has been removed.' });
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-3 p-4">
                <Avatar>
                    <AvatarImage src={post.userAvatar} />
                    <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold">{post.userName}</p>
                    <p className="text-xs text-muted-foreground">
                        {post.location} &middot; {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit Post</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-0">
                 <Carousel className="w-full">
                    <CarouselContent>
                        {post.mediaUrls.map((url, index) => (
                             <CarouselItem key={index}>
                                <Image src={url} alt={`${post.caption} - ${index+1}`} width={500} height={500} className="w-full object-cover aspect-square" />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {post.mediaUrls.length > 1 && (
                        <>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                        </>
                    )}
                </Carousel>
                <div className="p-4 space-y-2">
                    <p className="text-sm">{post.caption}</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 flex-col items-start gap-3">
                <div className="flex items-center gap-4 text-muted-foreground">
                    <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Heart className={`w-5 h-5 ${post.likes.includes('user1') ? 'text-red-500 fill-current' : ''}`} />
                        <span className="text-sm font-medium">{post.likes.length}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments.length}</span>
                    </div>
                    <button onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 ml-auto hover:text-primary transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
                <Separator />
                <div className="w-full space-y-2">
                    {post.comments.slice(0, 2).map(comment => (
                        <div key={comment.id} className="text-sm">
                            <span className="font-semibold">{comment.userName}</span>
                            <span className="ml-2">{comment.text}</span>
                        </div>
                    ))}
                    {post.comments.length > 2 && (
                         <p className="text-sm text-muted-foreground">View all {post.comments.length} comments</p>
                    )}
                </div>
                <form onSubmit={handleCommentSubmit} className="w-full flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src="https://placehold.co/80x80.png" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Input 
                        placeholder="Add a comment..." 
                        className="h-9" 
                        value={commentText} 
                        onChange={e => setCommentText(e.target.value)}
                    />
                    <Button type="submit" size="icon" variant="ghost" disabled={!commentText.trim()}>
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </CardFooter>
            <Dialog open={isShareOpen} onOpenChange={setShareOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Share Post</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button variant="outline" onClick={() => handleShare('Facebook')}>Facebook</Button>
                        <Button variant="outline" onClick={() => handleShare('Twitter')}>Twitter</Button>
                        <Button variant="outline" onClick={() => handleShare('WhatsApp')}>WhatsApp</Button>
                        <Button variant="outline" onClick={() => handleShare('Instagram')}>Instagram</Button>
                        <Button variant="outline" className="col-span-2" onClick={() => handleShare('copy')}>
                           <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default function AlbumDetailPage() {
    const router = useRouter();
    const params = useParams();
    const albumId = params.albumId as string;
    const { albums, posts, toggleLike, addComment } = useApp();

    const [album, setAlbum] = useState<Album | null>(null);
    const [albumPosts, setAlbumPosts] = useState<Post[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const currentAlbum = albums.find(a => a.id === albumId);
        if (currentAlbum) {
            setAlbum(currentAlbum);
            const postsInAlbum = posts.filter(p => p.albumId === albumId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setAlbumPosts(postsInAlbum);
        } else {
             if (isClient) {
                router.push('/community');
            }
        }
    }, [albumId, albums, posts, router, isClient]);

    if (!isClient || !album) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-full">
                    <p>Loading album...</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{album.name}</h1>
                            <p className="text-sm text-muted-foreground">{album.location}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                             <Avatar>
                                <AvatarImage src="https://placehold.co/80x80.png" />
                                <AvatarFallback>E</AvatarFallback>
                            </Avatar>
                            <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => setCreatePostOpen(true)}>
                                Create Another Post...
                            </Button>
                        </CardContent>
                    </Card>

                    {albumPosts.length > 0 ? (
                        albumPosts.map(post => <PostCard key={post.id} post={post} onLike={toggleLike} onComment={addComment} />)
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No posts in this album yet.</p>
                            <Button variant="outline" className="mt-4" onClick={() => setCreatePostOpen(true)}>Add the first post</Button>
                        </div>
                    )}
                </div>
            </div>
             <CreatePostDialog 
                isOpen={isCreatePostOpen}
                onOpenChange={setCreatePostOpen}
                preselectedAlbum={{id: album.id, name: album.name}}
            />
        </AppShell>
    );
}
