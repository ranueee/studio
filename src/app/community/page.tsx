
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/hooks/use-app';
import { PlusCircle, Image as ImageIcon, MapPin, Book, Edit, ThumbsUp, MessageSquare, Share2, Globe, Lock, Trash2, Camera, Video, Sparkles, BookPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
    const { albums, addPost } = useApp();
    const { toast } = useToast();
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [albumSelection, setAlbumSelection] = useState('new');
    const [newAlbumName, setNewAlbumName] = useState('');
    const [existingAlbumId, setExistingAlbumId] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');

    const [isClient, setIsClient] = useState(false);
    const [activeSection, setActiveSection] = useState<'location' | 'album' | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCreatePost = () => {
        if (!mediaPreview) {
            toast({ variant: 'destructive', title: 'Missing Photo/Video', description: 'Please add a photo or video to your post.' });
            return;
        }

        let albumId = '';
        let albumName = '';
        let finalLocation = location || "Unknown Location";

        if (albumSelection === 'new') {
            if (!newAlbumName) {
                toast({ variant: 'destructive', title: 'Missing Album Name', description: 'Please provide a name for your new album.' });
                return;
            }
            albumId = `album_${Date.now()}`;
            albumName = newAlbumName;
        } else {
            if (!existingAlbumId) {
                toast({ variant: 'destructive', title: 'No Album Selected', description: 'Please select an existing album.' });
                return;
            }
            albumId = existingAlbumId;
            const existingAlbum = albums.find(a => a.id === existingAlbumId);
            albumName = existingAlbum?.name || '';
            finalLocation = existingAlbum?.location || finalLocation;
        }

        addPost({
            albumId,
            albumName,
            location: finalLocation,
            mediaUrl: mediaPreview,
            mediaType: 'image', // simplified for now
            caption,
            visibility,
        });

        toast({ title: 'Post Created!', description: 'Your memory has been successfully shared.' });
        resetForm();
    };

    const resetForm = () => {
        setCreatePostOpen(false);
        setCaption('');
        setLocation('');
        setMediaPreview(null);
        setAlbumSelection('new');
        setNewAlbumName('');
        setExistingAlbumId('');
        setVisibility('public');
        setActiveSection(null);
    };

    const renderAlbumGrid = () => {
        if (!isClient) {
             return (
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                         <Card key={i} className="overflow-hidden">
                            <Skeleton className="w-full h-32" />
                            <CardContent className="p-2">
                                <Skeleton className="h-4 w-3/4 mb-1" />
                                <Skeleton className="h-3 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (albums && albums.length > 0) {
            return (
                <div className="grid grid-cols-2 gap-4">
                    {albums.map(album => (
                        <Link href={`/community/album/${album.id}`} key={album.id}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="p-0 relative">
                                    <Image
                                        src={album.coverImage}
                                        alt={album.name}
                                        width={200}
                                        height={200}
                                        className="w-full h-32 object-cover"
                                        data-ai-hint="travel album"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-2 left-2 text-white">
                                        <h3 className="font-bold text-sm leading-tight drop-shadow-md">{album.name}</h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 text-xs text-muted-foreground">
                                    <span>{album.postCount} {album.postCount > 1 ? 'posts' : 'post'}</span> &middot; <span>{album.location}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )
        }

        return (
             <div className="text-center text-muted-foreground py-16">
                <Sparkles className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Your journey log is empty.</h3>
                <p className="mt-2">Create your first post to start an album!</p>
            </div>
        );
    }
    
    const handleSectionToggle = (section: 'location' | 'album') => {
        setActiveSection(prev => prev === section ? null : section);
    };

    return (
        <AppShell>
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Community</h1>
                    <Button onClick={() => setCreatePostOpen(true)}>
                        <PlusCircle className="mr-2" /> Create Post
                    </Button>
                </div>

                {renderAlbumGrid()}
            </div>

            <Dialog open={isCreatePostOpen} onOpenChange={(isOpen) => !isOpen && resetForm()}>
                <DialogContent className="max-w-lg p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-center text-xl font-bold">Create Post</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="https://placehold.co/80x80.png" />
                                    <AvatarFallback>E</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Eco-Explorer</p>
                                    <Select value={visibility} onValueChange={(v: 'public' | 'private') => setVisibility(v)}>
                                        <SelectTrigger className="h-7 px-2 text-xs w-auto gap-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public"><div className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Public</div></SelectItem>
                                            <SelectItem value="private"><div className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Private</div></SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Textarea 
                                placeholder="What's on your mind, Eco-Explorer?" 
                                value={caption} 
                                onChange={e => setCaption(e.target.value)} 
                                className="min-h-[120px] text-base border-none focus-visible:ring-0 shadow-none p-0"
                            />
                            
                            {mediaPreview && (
                                <div className="relative border rounded-lg overflow-hidden">
                                    <Image src={mediaPreview} alt="Preview" width={400} height={300} className="w-full object-cover" />
                                    <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => setMediaPreview(null)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="border rounded-lg p-2 flex justify-between items-center">
                                    <span className="text-sm font-medium">Add to your post</span>
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="media-upload-fb" className="cursor-pointer p-2 rounded-full hover:bg-secondary">
                                            <ImageIcon className="h-5 w-5 text-green-500" />
                                        </Label>
                                        <Input id="media-upload-fb" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                        
                                        <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-secondary" onClick={() => handleSectionToggle('location')}>
                                            <MapPin className="h-5 w-5 text-red-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-secondary" onClick={() => handleSectionToggle('album')}>
                                            <BookPlus className="h-5 w-5 text-blue-500" />
                                        </Button>
                                    </div>
                                </div>

                                {activeSection === 'location' && (
                                     <div className="relative pt-2">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Tag Location" className="pl-9" value={location} onChange={e => setLocation(e.target.value)} />
                                    </div>
                                )}

                                {activeSection === 'album' && (
                                    <div className="space-y-2 pt-2">
                                        <Select onValueChange={(val) => {
                                            const isNew = val === "new-album-option";
                                            setAlbumSelection(isNew ? 'new' : 'existing');
                                            if (!isNew) {
                                                setExistingAlbumId(val);
                                            } else {
                                                setExistingAlbumId('');
                                            }
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose an album for your post" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new-album-option">
                                                    <div className="flex items-center gap-2"><PlusCircle className="h-4 w-4" />Create New Album</div>
                                                </SelectItem>
                                                {albums && albums.map(album => (
                                                    <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {albumSelection === 'new' && (
                                            <div className="relative mt-2">
                                                <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="New Album Name" className="pl-9" value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-4 pt-0 border-t">
                        <Button onClick={handleCreatePost} className="w-full" disabled={!mediaPreview}>Post</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
