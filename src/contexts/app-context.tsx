
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useEffect } from 'react';
import type { Item } from '@/lib/marketplace-data';

// Types
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
  redeemedVouchers: RedeemedVoucher[];
}

export interface AppContextType extends AppState {
  addXp: (amount: number) => void;
  addBalance: (amount: number) => void;
  redeemItemForVoucher: (item: Item) => boolean;
  useVoucher: (voucherCode: string) => void;
  addBadge: (badge: string) => void;
  addVisitedPoi: (poi: string) => void;
}

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
                savedState = JSON.parse(saved);
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


  return (
    <AppContext.Provider value={{ ...state, addXp, addBalance, redeemItemForVoucher, useVoucher, addBadge, addVisitedPoi }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
