
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Globe, Lock, Send, Copy, ImagePlus, Video, MoreVertical, Trash2 } from 'lucide-react';
import { generateImage, type GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;

const initialDiaryPosts = [
  {
    id: 1,
    user: {
      name: 'Wanderlust Ana',
      avatar: 'https://placehold.co/40x40.png',
      avatarHint: 'profile picture woman'
    },
    image: '', // Will be filled by AI
    imageHint: 'philippines beach sunset',
    location: 'Patar Beach',
    caption: 'Sunsets in Pangasinan are unreal! So glad I got to see this.',
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    user: {
      name: 'Trailblazer Tom',
      avatar: 'https://placehold.co/40x40.png',
      avatarHint: 'profile picture man'
    },
    image: '', // Will be filled by AI
    imageHint: 'philippines islands boat',
    location: 'Hundred Islands National Park',
    caption: 'Island hopping day was a success! Found so many hidden gems.',
    likes: 25,
    comments: 8,
  },
    {
    id: 3,
    user: {
      name: 'Cave Explorer Cathy',
      avatar: 'https://placehold.co/40x40.png',
      avatarHint: 'profile picture explorer'
    },
    image: '', // Will be filled by AI
    imageHint: 'philippines cave water',
    location: 'Enchanted Cave',
    caption: 'Took a dip in the Enchanted Cave. The water was so clear and refreshing!',
    likes: 18,
    comments: 5,
  },
];

type DiaryPost = {
    id: number;
    user: {
        name: string;
        avatar: string;
        avatarHint: string;
    };
    image?: string;
    imageHint?: string;
    video?: string;
    location: string;
    caption: string;
    likes: number;
    comments: number;
};

export default function CommunityPage() {
  const [diaryPosts, setDiaryPosts] = useState<DiaryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [addWithImage, setAddWithImage] = useState(false);
  const [postVisibility, setPostVisibility] = useState('Public');
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const updatedPosts = await Promise.all(
        initialDiaryPosts.map(async (post): Promise<DiaryPost> => {
          if (post.imageHint) {
            try {
              const result: GenerateImageOutput = await generateImage({ prompt: post.imageHint });
              return { ...post, image: result.imageUrl };
            } catch (error) {
              console.error(`Failed to generate image for: ${post.imageHint}`, error);
              return { ...post, image: 'https://placehold.co/600x400.png' };
            }
          }
          return post;
        })
      );
      setDiaryPosts(updatedPosts);
      setLoading(false);
    };

    fetchImages();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;

    let imageUrl: string | undefined = undefined;
    if (addWithImage) {
        try {
            toast({ title: "Generating Image...", description: "Your AI-powered photo is being created."});
            const result = await generateImage({ prompt: newPostContent.substring(0, 50) });
            imageUrl = result.imageUrl;
        } catch (error) {
            toast({ variant: "destructive", title: "Image Generation Failed", description: "Could not generate image. Posting text only."});
        }
    }

    const newPost: DiaryPost = {
      id: Date.now(),
      user: {
        name: 'Eco-Explorer',
        avatar: 'https://placehold.co/40x40.png',
        avatarHint: 'profile picture',
      },
      image: imageUrl,
      location: 'Pangasinan',
      caption: newPostContent,
      likes: 0,
      comments: 0,
    };

    setDiaryPosts([newPost, ...diaryPosts]);
    setNewPostContent('');
    setAddWithImage(false);
    toast({
      title: "Post Created!",
      description: "Your new adventure has been shared with the community.",
    });
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
  }

  const openDeleteModal = (postId: number) => {
    setPostToDelete(postId);
    setDeleteModalOpen(true);
  }

  const handleDeletePost = () => {
    if (postToDelete === null) return;
    setDiaryPosts(diaryPosts.filter(p => p.id !== postToDelete));
    setDeleteModalOpen(false);
    setPostToDelete(null);
    toast({
        title: "Post Deleted",
        description: "Your post has been successfully removed.",
    });
  }

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Community Diary</h1>
        <p className="text-muted-foreground">See the latest eco-adventures from fellow explorers.</p>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Create a Post</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Share your eco-adventure..." 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button 
                        size="icon" 
                        variant={addWithImage ? 'secondary': 'ghost'} 
                        onClick={() => setAddWithImage(!addWithImage)}
                        title="Add AI Generated Image"
                    >
                        <ImagePlus/>
                    </Button>
                     <Button 
                        size="icon" 
                        variant='ghost' 
                        disabled
                        title="Add Video (Coming Soon)"
                    >
                        <Video/>
                    </Button>
                </div>
              <div className="flex items-center gap-2">
                <Select value={postVisibility} onValueChange={setPostVisibility}>
                    <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Public">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4"/> Public
                        </div>
                        </SelectItem>
                    <SelectItem value="Private">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4"/> Private
                        </div>
                    </SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handlePost} disabled={!newPostContent.trim()}>
                    Post <Send className="ml-2"/>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {(loading ? Array.from({ length: 3 }) : diaryPosts).map((post: DiaryPost | undefined, index) => (
            <Card key={post?.id ?? index} className="overflow-hidden">
              {post ? (
                <>
                  <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <Avatar>
                      <AvatarImage src={post.user.avatar} alt={post.user.name} data-ai-hint={post.user.avatarHint} />
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{post.user.name}</p>
                      <p className="text-sm text-muted-foreground">{post.location}</p>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openDeleteModal(post.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-0">
                    {post.image && (
                        <Image
                          src={post.image}
                          alt={post.caption}
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover"
                          data-ai-hint={post.imageHint}
                        />
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
      
      <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Post</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeletePost}>Delete</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

    