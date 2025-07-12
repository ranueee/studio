'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Skeleton } from '@/components/ui/skeleton';

const initialDiaryPosts = [
  {
    id: 1,
    user: {
      name: 'Wanderlust an',
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

type DiaryPost = typeof initialDiaryPosts[0];

export default function CommunityPage() {
  const [diaryPosts, setDiaryPosts] = useState<DiaryPost[]>(initialDiaryPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const updatedPosts = await Promise.all(
        initialDiaryPosts.map(async (post) => {
          try {
            const result = await generateImage({ prompt: post.imageHint });
            return { ...post, image: result.imageUrl };
          } catch (error) {
            console.error(`Failed to generate image for: ${post.imageHint}`, error);
            // Fallback to a placeholder if generation fails
            return { ...post, image: 'https://placehold.co/600x400.png' };
          }
        })
      );
      setDiaryPosts(updatedPosts);
      setLoading(false);
    };

    fetchImages();
  }, []);


  return (
    <AppShell>
      <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Community Diary</h1>
        <p className="text-muted-foreground">See the latest eco-adventures from fellow explorers.</p>

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
                    <div>
                      <p className="font-semibold">{post.user.name}</p>
                      <p className="text-sm text-muted-foreground">{post.location}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Image
                      src={post.image}
                      alt={post.caption}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                      data-ai-hint={post.imageHint}
                    />
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
    </AppShell>
  );
}
