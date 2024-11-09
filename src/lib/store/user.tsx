import { type User } from '../types/user';
import { type StateCreator } from 'zustand'

export interface UserSlice {
    user: User | null,
    setUser: (user: User) => void,
    getUser: () => User | null,
  
    token: string | null,
    setToken: (str: string) => void,
    getToken: () => string | null,
    
    walletBalance: number,
    setWalletBalance: (balance: number) => void,
  }
  
  export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
    user: null,
    getUser: () => {
      return get().user;
    },
    setUser: (user: User) => {
      return set({ user: user });
    },
  
    token: null,
    setToken: (str: string) => {
      return set({ token: str });
    },
    getToken: () => {
      return get().token;
    },
  
    walletBalance: 0,
    setWalletBalance: (balance) => {
      set({  walletBalance: balance});
    }
  });