
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, MapPin, Globe, Lock, Trash2, PlusCircle, Book, BookPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Album } from '@/contexts/app-context';

interface CreatePostDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    preselectedAlbum?: { id: string, name: string };
}

export function CreatePostDialog({ isOpen, onOpenChange, preselectedAlbum }: CreatePostDialogProps) {
    const { albums, addPost } = useApp();
    const { toast } = useToast();

    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
    const [albumSelection, setAlbumSelection] = useState(preselectedAlbum ? 'existing' : 'new');
    const [newAlbumName, setNewAlbumName] = useState('');
    const [existingAlbumId, setExistingAlbumId] = useState(preselectedAlbum?.id || '');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [activeSection, setActiveSection] = useState<'location' | 'album' | null>(null);

    useEffect(() => {
        if (preselectedAlbum) {
            setExistingAlbumId(preselectedAlbum.id);
            setAlbumSelection('existing');
        }
    }, [preselectedAlbum]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newPreviews: string[] = [];
            let filesToProcess = files.length;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    filesToProcess--;
                    if (filesToProcess === 0) {
                       setMediaPreviews(prev => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };
    
    const removeMedia = (index: number) => {
        setMediaPreviews(previews => previews.filter((_, i) => i !== index));
    };
    
    const resetForm = () => {
        onOpenChange(false);
        setCaption('');
        setLocation('');
        setMediaPreviews([]);
        setAlbumSelection(preselectedAlbum ? 'existing' : 'new');
        setNewAlbumName('');
        setExistingAlbumId(preselectedAlbum?.id || '');
        setVisibility('public');
        setActiveSection(null);
    };

    const handleCreatePost = () => {
        if (mediaPreviews.length === 0 && caption.trim() === '') {
            toast({ variant: 'destructive', title: 'Empty Post', description: 'Please add a caption or media to your post.' });
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
            albumName = existingAlbum?.name || preselectedAlbum?.name || '';
            finalLocation = existingAlbum?.location || finalLocation;
        }

        addPost({
            albumId,
            albumName,
            location: finalLocation,
            mediaUrls: mediaPreviews,
            mediaType: 'image', // simplified for now
            caption,
            visibility,
        });

        toast({ title: 'Post Created!', description: 'Your memory has been successfully shared.' });
        resetForm();
    };

    const handleSectionToggle = (section: 'location' | 'album') => {
        setActiveSection(prev => prev === section ? null : section);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && resetForm()}>
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
                        
                        {mediaPreviews.length > 0 && (
                            <div className="border rounded-lg p-2">
                                <div className={cn(
                                    "grid gap-2",
                                    mediaPreviews.length === 1 ? "grid-cols-1" :
                                    mediaPreviews.length === 2 ? "grid-cols-2" :
                                    "grid-cols-3"
                                )}>
                                    {mediaPreviews.map((src, index) => (
                                        <div key={index} className="relative">
                                            <Image src={src} alt={`Preview ${index + 1}`} width={200} height={200} className="w-full h-auto object-cover rounded-md aspect-square" />
                                            <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeMedia(index)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Label htmlFor="media-upload-add-more" className="mt-2">
                                    <Button variant="outline" className="w-full mt-2" asChild>
                                       <span><PlusCircle className="mr-2 h-4 w-4" /> Add / Edit Photos</span>
                                    </Button>
                                    <Input id="media-upload-add-more" type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
                                </Label>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="border rounded-lg p-2 flex justify-between items-center">
                                <span className="text-sm font-medium">Add to your post</span>
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="media-upload-fb" className="cursor-pointer p-2 rounded-full hover:bg-secondary">
                                        <ImageIcon className="h-5 w-5 text-green-500" />
                                    </Label>
                                    <Input id="media-upload-fb" type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
                                    
                                    <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-secondary" onClick={() => handleSectionToggle('location')}>
                                        <MapPin className="h-5 w-5 text-red-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-secondary" onClick={() => handleSectionToggle('album')} disabled={!!preselectedAlbum}>
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

                            {activeSection === 'album' && !preselectedAlbum && (
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
                                            {albums && albums.map((album: Album) => (
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
                    <Button onClick={handleCreatePost} className="w-full" disabled={mediaPreviews.length === 0 && caption.trim() === ''}>Post</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
