'use client';

import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';

const diaryPosts = [
  {
    id: 1,
    user: {
      name: 'Wanderlust an',
      avatar: 'https://placehold.co/40x40.png',
      avatarHint: 'profile picture woman'
    },
    image: 'https://placehold.co/600x400.png',
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
    image: 'https://placehold.co/600x400.png',
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
    image: 'https://placehold.co/600x400.png',
    imageHint: 'philippines cave water',
    location: 'Enchanted Cave',
    caption: 'Took a dip in the Enchanted Cave. The water was so clear and refreshing!',
    likes: 18,
    comments: 5,
  },
];

export default function CommunityPage() {
  return (
    <AppShell>
      <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Community Diary</h1>
        <p className="text-muted-foreground">See the latest eco-adventures from fellow explorers.</p>

        <div className="space-y-4">
          {diaryPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
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
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
