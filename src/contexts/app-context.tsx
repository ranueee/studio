
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useEffect } from 'react';
import type { Item } from '@/lib/marketplace-data';

// Types
export type Comment = {
    id: number;
    user: { name: string; };
    text: string;
};

export type Post = {
    id: number;
    user: { name:string; avatar:string; };
    image?: string;
    imageHint?: string;
    video?: string;
    caption: string;
    locationId: string;
    albumName?: string;
    visibility: 'Public' | 'Private';
    timestamp: Date;
    likes: number;
    comments: Comment[];
};

export type RedeemedVoucher = Item & {
    redeemedAt: string;
    voucherCode: string;
};

export interface AppState {
  xp: number;
  level: number;
  balance: number;
  unlockedBadges: string[];
  visitedPois: string[];
  posts: Post[];
  redeemedVouchers: RedeemedVoucher[];
}

export interface AppContextType extends AppState {
  addXp: (amount: number) => void;
  addBalance: (amount: number) => void;
  redeemItemForVoucher: (item: Item) => boolean;
  useVoucher: (voucherCode: string) => void;
  addBadge: (badge: string) => void;
  addVisitedPoi: (poi: string) => void;
  addPost: (post: Post) => void;
  deletePost: (postId: number) => void;
  editPost: (postId: number, newCaption: string) => void;
  addCommentToPost: (postId: number, comment: Comment) => void;
}

// Initial Data
const initialPosts: Post[] = [
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
        likes: 12,
        comments: [
            { id: 1, user: { name: 'Trailblazer Tom' }, text: 'Amazing shot!' }
        ],
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
        albumName: 'Bolinao Getaway',
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
        albumName: 'Bolinao Getaway',
        visibility: 'Public',
        timestamp: new Date('2023-10-23T15:00:21.511Z'),
        likes: 18,
        comments: [],
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
        likes: 9,
        comments: [],
    },
];

function generateVoucherCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    // Lazy initialization of state
    let savedState: AppState | null = null;
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('appState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Make sure to re-hydrate Date objects
                parsed.posts = parsed.posts.map((p: any) => ({...p, timestamp: new Date(p.timestamp)}));
                savedState = parsed;
            } catch (e) {
                console.error("Failed to parse saved state", e);
            }
        }
    }
    return savedState || {
        xp: 20,
        level: 1,
        balance: 50,
        unlockedBadges: [],
        visitedPois: [],
        posts: initialPosts,
        redeemedVouchers: [],
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('appState', JSON.stringify(state));
    }
  }, [state]);

  const addXp = useCallback((amount: number) => {
    setState(prevState => {
      const newXp = prevState.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      return { ...prevState, xp: newXp, level: newLevel };
    });
  }, []);

  const addBalance = useCallback((amount: number) => {
    setState(prevState => ({ ...prevState, balance: prevState.balance + amount }));
  }, []);

  const redeemItemForVoucher = useCallback((item: Item) => {
    if (state.balance >= item.price) {
        const newVoucher: RedeemedVoucher = {
            ...item,
            redeemedAt: new Date().toISOString(),
            voucherCode: generateVoucherCode(),
        };
      setState(prevState => ({ 
          ...prevState, 
          balance: prevState.balance - item.price,
          redeemedVouchers: [...prevState.redeemedVouchers, newVoucher],
        }));
      return true;
    }
    return false;
  }, [state.balance]);

  const useVoucher = useCallback((voucherCode: string) => {
      setState(prevState => ({
          ...prevState,
          redeemedVouchers: prevState.redeemedVouchers.filter(v => v.voucherCode !== voucherCode)
      }));
  }, []);

  const addBadge = useCallback((badge: string) => {
    setState(prevState => {
      if (prevState.unlockedBadges.includes(badge)) {
        return prevState;
      }
      return { ...prevState, unlockedBadges: [...prevState.unlockedBadges, badge] };
    });
  }, []);

  const addVisitedPoi = useCallback((poi: string) => {
    setState(prevState => {
      if (prevState.visitedPois.includes(poi)) {
        return prevState;
      }
      return { ...prevState, visitedPois: [...prevState.visitedPois, poi] };
    });
  }, []);

  const addPost = useCallback((post: Post) => {
    setState(prevState => ({
        ...prevState,
        posts: [post, ...prevState.posts],
    }));
  }, []);

  const deletePost = useCallback((postId: number) => {
    setState(prevState => ({
        ...prevState,
        posts: prevState.posts.filter(p => p.id !== postId)
    }))
  }, []);

  const editPost = useCallback((postId: number, newCaption: string) => {
      setState(prevState => ({
          ...prevState,
          posts: prevState.posts.map(p => p.id === postId ? {...p, caption: newCaption} : p)
      }))
  }, []);

  const addCommentToPost = useCallback((postId: number, comment: Comment) => {
    setState(prevState => ({
        ...prevState,
        posts: prevState.posts.map(p => {
            if (p.id === postId) {
                return {...p, comments: [...p.comments, comment]};
            }
            return p;
        })
    }))
  }, []);

  return (
    <AppContext.Provider value={{ ...state, addXp, addBalance, redeemItemForVoucher, useVoucher, addBadge, addVisitedPoi, addPost, deletePost, editPost, addCommentToPost }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
