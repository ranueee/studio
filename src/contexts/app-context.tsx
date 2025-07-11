'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useCallback } from 'react';

export interface AppState {
  xp: number;
  level: number;
  balance: number;
  unlockedBadges: string[];
  visitedPois: string[];
}

export interface AppContextType extends AppState {
  addXp: (amount: number) => void;
  addBalance: (amount: number) => void;
  redeemItem: (cost: number) => boolean;
  addBadge: (badge: string) => void;
  addVisitedPoi: (poi: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    xp: 20,
    level: 1,
    balance: 0,
    unlockedBadges: [],
    visitedPois: [],
  });

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

  const redeemItem = useCallback((cost: number) => {
    if (state.balance >= cost) {
      setState(prevState => ({ ...prevState, balance: prevState.balance - cost }));
      return true;
    }
    return false;
  }, [state.balance]);

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

  return (
    <AppContext.Provider value={{ ...state, addXp, addBalance, redeemItem, addBadge, addVisitedPoi }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
