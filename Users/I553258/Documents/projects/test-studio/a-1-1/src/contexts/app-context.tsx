
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useEffect } from 'react';
import type { Item } from '@/lib/marketplace-data';

// Types
export type RedeemedVoucher = Item & {
    redeemedAt: string;
    voucherCode: string;
};

export type Post = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    albumId: string;
    albumName: string;
    location: string;
    mediaUrls: string[];
    mediaType: 'image' | 'video';
    caption: string;
    visibility: 'public' | 'private';
    likes: string[]; // array of userIds
    comments: Comment[];
    createdAt: string;
};

export type Comment = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: string;
};

export type Album = {
    id: string;
    name: string;
    location: string;
    postCount: number;
    coverImage: string;
};

export type Quest = {
  id: string;
  category: 'daily' | 'weekly' | 'monthly';
  title: string;
  description: string;
  reward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  link?: string;
};


export interface AppState {
  xp: number;
  level: number;
  balance: number;
  unlockedBadges: string[];
  visitedPois: string[];
  redeemedVouchers: RedeemedVoucher[];
  posts: Post[];
  albums: Album[];
  quests: Quest[];
}

export interface AppContextType extends AppState {
  addXp: (amount: number) => void;
  addBalance: (amount: number) => void;
  redeemItemForVoucher: (item: Item) => boolean;
  useVoucher: (voucherCode: string) => void;
  addBadge: (badge: string) => void;
  addVisitedPoi: (poi: string) => void;
  addPost: (postData: Omit<Post, 'id' | 'userId' | 'userName' | 'userAvatar' | 'likes' | 'comments' | 'createdAt'>) => void;
  editPost: (postId: string, newCaption: string, newVisibility: 'public' | 'private') => void;
  deletePost: (postId: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  claimQuestReward: (questId: string) => void;
}

function generateVoucherCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock initial data
const initialPosts: Post[] = [
    {
        id: 'post1',
        albumId: 'album1',
        albumName: 'Bolinao Adventures',
        location: 'Patar Beach',
        userId: 'user1',
        userName: 'Eco-Explorer',
        userAvatar: 'https://placehold.co/80x80.png',
        mediaUrls: ['https://placehold.co/600x400.png'],
        mediaType: 'image',
        caption: 'First time seeing the famous white sand of Patar Beach! It was breathtaking. #Pangasinan #BeachLife',
        visibility: 'public',
        likes: ['user2', 'user3'],
        comments: [
            { id: 'comment1', userId: 'user2', userName: 'JaneDoe', userAvatar: 'https://placehold.co/40x40.png', text: 'Looks amazing!', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 'comment2', userId: 'user3', userName: 'JohnSmith', userAvatar: 'https://placehold.co/40x40.png', text: 'I was there last year, loved it!', createdAt: new Date(Date.now() - 1800000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString()
    }
];

const initialAlbums: Album[] = [
    { id: 'album1', name: 'Bolinao Adventures', location: 'Bolinao, Pangasinan', postCount: 1, coverImage: 'https://placehold.co/600x400.png' }
];

const initialQuests: Quest[] = [
    { id: 'daily-login', category: 'daily', title: 'Daily Check-in', description: 'Log in to the app to claim your daily reward.', reward: 10, isCompleted: true, isClaimed: false },
    { id: 'visit-poi', category: 'daily', title: 'Visit a Tourist Spot', description: 'Visit any point of interest on the map and check in.', reward: 25, isCompleted: false, isClaimed: false, link: '/map' },
    { id: 'post-community', category: 'weekly', title: 'Share Your Adventure', description: 'Create a new post in the community tab to share your journey with others.', reward: 50, isCompleted: false, isClaimed: false, link: '/community' },
    { id: 'redeem-voucher', category: 'weekly', title: 'Support Local', description: 'Redeem any item from the marketplace to support local businesses.', reward: 75, isCompleted: false, isClaimed: false, link: '/marketplace' },
    { id: 'pioneer-badge', category: 'monthly', title: 'Become a Pioneer', description: 'Visit 5 different tourist spots in Pangasinan to earn the "Pangasinan Pioneer" badge.', reward: 200, isCompleted: false, isClaimed: false }
];


const defaultState: AppState = {
    xp: 20,
    level: 1,
    balance: 50,
    unlockedBadges: [],
    visitedPois: [],
    redeemedVouchers: [],
    posts: initialPosts,
    albums: initialAlbums,
    quests: initialQuests,
};


const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Effect to hydrate state from localStorage on client-side
  useEffect(() => {
    try {
        const saved = localStorage.getItem('appState');
        if (saved) {
            const parsed = JSON.parse(saved);
             // Ensure initial data is present if local storage is empty
            if (!parsed.posts || parsed.posts.length === 0) parsed.posts = initialPosts;
            if (!parsed.albums || parsed.albums.length === 0) parsed.albums = initialAlbums;
            if (!parsed.quests || parsed.quests.length === 0) parsed.quests = initialQuests;

            // Logic to update quest completion status based on other state
            const completedQuestIds = new Set<string>();
            if (parsed.visitedPois?.length > 0) completedQuestIds.add('visit-poi');
            if (parsed.posts?.length > initialPosts.length) completedQuestIds.add('post-community');
            if (parsed.redeemedVouchers?.length > 0) completedQuestIds.add('redeem-voucher');
            if (parsed.visitedPois?.length >= 5) completedQuestIds.add('pioneer-badge');
            
            parsed.quests.forEach((q: Quest) => {
                if(completedQuestIds.has(q.id)) {
                    q.isCompleted = true;
                }
            });

            setState(parsed);
        } else {
            setState(defaultState);
        }
    } catch (e) {
        console.error("Failed to parse saved state, using default.", e);
        setState(defaultState);
    }
    setIsHydrated(true);
  }, []);

  // Effect to save state to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('appState', JSON.stringify(state));
    }
  }, [state, isHydrated]);

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
    let success = false;
    setState(prevState => {
        if (prevState.balance >= item.price) {
            const newVoucher: RedeemedVoucher = {
                ...item,
                redeemedAt: new Date().toISOString(),
                voucherCode: generateVoucherCode(),
            };
            success = true;
            return { 
              ...prevState, 
              balance: prevState.balance - item.price,
              redeemedVouchers: [...prevState.redeemedVouchers, newVoucher],
              quests: prevState.quests.map(q => q.id === 'redeem-voucher' ? {...q, isCompleted: true} : q),
            };
        }
        return prevState;
    });
    return success;
  }, []);

  const useVoucher = useCallback((voucherCode: string) => {
      setState(prevState => ({
          ...prevState,
          redeemedVouchers: prevState.redeemedVouchers.filter(v => v.voucherCode !== voucherCode)
      }));
  }, []);

  const addBadge = useCallback((badge: string) => {
    setState(prevState => {
      if (prevState.unlockedBadges.includes(badge)) return prevState;
      return { ...prevState, unlockedBadges: [...prevState.unlockedBadges, badge] };
    });
  }, []);

  const addVisitedPoi = useCallback((poi: string) => {
    setState(prevState => {
      if (prevState.visitedPois.includes(poi)) return prevState;
      const newVisitedPois = [...prevState.visitedPois, poi];
      const newQuests = prevState.quests.map(q => {
          if (q.id === 'visit-poi' || (q.id === 'pioneer-badge' && newVisitedPois.length >= 5)) {
              return { ...q, isCompleted: true };
          }
          return q;
      });
      return { ...prevState, visitedPois: newVisitedPois, quests: newQuests };
    });
  }, []);

  const addPost = useCallback((postData: Omit<Post, 'id' | 'userId' | 'userName' | 'userAvatar' | 'likes' | 'comments' | 'createdAt'>) => {
      setState(prevState => {
          const newPost: Post = {
              ...postData,
              id: `post_${Date.now()}`,
              userId: 'user1',
              userName: 'Eco-Explorer',
              userAvatar: 'https://placehold.co/80x80.png',
              likes: [],
              comments: [],
              createdAt: new Date().toISOString(),
          };

          const posts = [newPost, ...prevState.posts];
          let albums = [...prevState.albums];
          
          let album = albums.find(a => a.id === newPost.albumId);

          if (album) {
              albums = albums.map(a => 
                  a.id === newPost.albumId 
                  ? { ...a, postCount: a.postCount + 1, coverImage: newPost.mediaUrls[0] || a.coverImage }
                  : a
              );
          } else {
              album = {
                  id: newPost.albumId,
                  name: newPost.albumName,
                  location: newPost.location,
                  postCount: 1,
                  coverImage: newPost.mediaUrls[0] || 'https://placehold.co/600x400.png',
              };
              albums = [album, ...albums];
          }

          const newQuests = prevState.quests.map(q => q.id === 'post-community' ? { ...q, isCompleted: true } : q);

          return { ...prevState, posts, albums, quests: newQuests };
      });
  }, []);

  const editPost = useCallback((postId: string, newCaption: string, newVisibility: 'public' | 'private') => {
      setState(prevState => ({
          ...prevState,
          posts: prevState.posts.map(p => p.id === postId ? { ...p, caption: newCaption, visibility: newVisibility } : p)
      }));
  }, []);
  
  const deletePost = useCallback((postId: string) => {
    setState(prevState => {
        const postToDelete = prevState.posts.find(p => p.id === postId);
        if (!postToDelete) return prevState;

        const newPosts = prevState.posts.filter(p => p.id !== postId);
        const newAlbums = prevState.albums.map(album => {
            if (album.id === postToDelete.albumId) {
                const remainingPostsInAlbum = newPosts.filter(p => p.albumId === album.id);
                return {
                    ...album,
                    postCount: album.postCount - 1,
                    coverImage: remainingPostsInAlbum.length > 0 ? remainingPostsInAlbum[0].mediaUrls[0] : 'https://placehold.co/600x400.png'
                };
            }
            return album;
        }).filter(album => album.postCount > 0);

        return {
            ...prevState,
            posts: newPosts,
            albums: newAlbums,
        };
    });
  }, []);

  const toggleLike = useCallback((postId: string) => {
    const currentUserId = 'user1'; // Mock current user
    setState(prevState => ({
      ...prevState,
      posts: prevState.posts.map(post => {
        if (post.id === postId) {
          const newLikes = post.likes.includes(currentUserId)
            ? post.likes.filter(id => id !== currentUserId)
            : [...post.likes, currentUserId];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    }));
  }, []);

  const addComment = useCallback((postId: string, commentText: string) => {
      const newComment: Comment = {
          id: `comment_${Date.now()}`,
          userId: 'user1',
          userName: 'Eco-Explorer',
          userAvatar: 'https://placehold.co/80x80.png',
          text: commentText,
          createdAt: new Date().toISOString(),
      };
      setState(prevState => ({
          ...prevState,
          posts: prevState.posts.map(post => 
              post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
          )
      }));
  }, []);

  const claimQuestReward = useCallback((questId: string) => {
    setState(prevState => {
        const questToClaim = prevState.quests.find(q => q.id === questId);
        if (!questToClaim || !questToClaim.isCompleted || questToClaim.isClaimed) {
            return prevState;
        }

        return {
            ...prevState,
            balance: prevState.balance + questToClaim.reward,
            quests: prevState.quests.map(q => 
                q.id === questId ? { ...q, isClaimed: true } : q
            ),
        };
    });
  }, []);


  return (
    <AppContext.Provider value={{ ...state, addXp, addBalance, redeemItemForVoucher, useVoucher, addBadge, addVisitedPoi, addPost, editPost, deletePost, toggleLike, addComment, claimQuestReward }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
