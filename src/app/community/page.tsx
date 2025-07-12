
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useApp } from '@/hooks/use-app';
import { PlusCircle, Image as ImageIcon, MapPin, Book, Edit, ThumbsUp, MessageSquare, Share2, Globe, Lock, Trash2, Camera, Video, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
        if (!mediaPreview || !location) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please add a photo/video and location.' });
            return;
        }

        let albumId = '';
        let albumName = '';

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
            albumName = albums.find(a => a.id === existingAlbumId)?.name || '';
        }

        addPost({
            albumId,
            albumName,
            location,
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

                {albums.length > 0 ? (
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
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <Sparkles className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">Your journey log is empty.</h3>
                        <p className="mt-2">Create your first post to start an album!</p>
                    </div>
                )}
            </div>

            <Dialog open={isCreatePostOpen} onOpenChange={(isOpen) => !isOpen && resetForm()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create a New Post</DialogTitle>
                        <DialogDescription>Share your latest adventure with the community.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {mediaPreview ? (
                            <div className="relative">
                                <Image src={mediaPreview} alt="Preview" width={400} height={300} className="rounded-lg w-full object-cover" />
                                <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => setMediaPreview(null)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full">
                                <Label htmlFor="media-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-1 text-sm text-muted-foreground">Click to upload</p>
                                        <p className="text-xs text-muted-foreground">Photo or Video</p>
                                    </div>
                                    <Input id="media-upload" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                </Label>
                            </div>
                        )}
                        
                        <Textarea placeholder="Write a caption..." value={caption} onChange={e => setCaption(e.target.value)} />
                        
                        <div className="relative">
                           <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="Tag Location" className="pl-9" value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                        
                        <Separator />

                        <div>
                            <Label>Album</Label>
                             <RadioGroup value={albumSelection} onValueChange={(val) => setAlbumSelection(val)} className="flex mt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="new" id="new-album" />
                                    <Label htmlFor="new-album">Create New</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="existing" id="existing-album" disabled={albums.length === 0} />
                                    <Label htmlFor="existing-album" className={albums.length === 0 ? 'text-muted-foreground' : ''}>Add to Existing</Label>
                                </div>
                            </RadioGroup>

                            {albumSelection === 'new' ? (
                                <div className="relative mt-2">
                                    <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="New Album Name" className="pl-9" value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} />
                                </div>
                            ) : (
                                <Select onValueChange={setExistingAlbumId} value={existingAlbumId}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select an album" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {albums.map(album => (
                                            <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                         <div>
                            <Label>Visibility</Label>
                            <RadioGroup defaultValue="public" className="flex mt-2 gap-4" onValueChange={(val: 'public' | 'private') => setVisibility(val)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="public" id="public" />
                                    <Label htmlFor="public" className="flex items-center gap-2"><Globe className="h-4 w-4"/> Public</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="private" id="private" />
                                    <Label htmlFor="private" className="flex items-center gap-2"><Lock className="h-4 w-4"/> Private</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleCreatePost}>Post</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
