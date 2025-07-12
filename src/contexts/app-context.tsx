
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


export interface AppState {
  xp: number;
  level: number;
  balance: number;
  unlockedBadges: string[];
  visitedPois: string[];
  redeemedVouchers: RedeemedVoucher[];
  posts: Post[];
  albums: Album[];
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


const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    let savedState: AppState | null = null;
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('appState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure initial posts/albums are present if local storage is empty on that front
                if (!parsed.posts || parsed.posts.length === 0) {
                    parsed.posts = initialPosts;
                    parsed.albums = initialAlbums;
                }
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
        redeemedVouchers: [],
        posts: initialPosts,
        albums: initialAlbums,
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
      if (prevState.unlockedBadges.includes(badge)) return prevState;
      return { ...prevState, unlockedBadges: [...prevState.unlockedBadges, badge] };
    });
  }, []);

  const addVisitedPoi = useCallback((poi: string) => {
    setState(prevState => {
      if (prevState.visitedPois.includes(poi)) return prevState;
      return { ...prevState, visitedPois: [...prevState.visitedPois, poi] };
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
              // Update existing album
              albums = albums.map(a => 
                  a.id === newPost.albumId 
                  ? { ...a, postCount: a.postCount + 1, coverImage: newPost.mediaUrls[0] }
                  : a
              );
          } else {
              // Create new album
              album = {
                  id: newPost.albumId,
                  name: newPost.albumName,
                  location: newPost.location,
                  postCount: 1,
                  coverImage: newPost.mediaUrls[0],
              };
              albums = [album, ...albums];
          }

          return { ...prevState, posts, albums };
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


  return (
    <AppContext.Provider value={{ ...state, addXp, addBalance, redeemItemForVoucher, useVoucher, addBadge, addVisitedPoi, addPost, editPost, deletePost, toggleLike, addComment }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
