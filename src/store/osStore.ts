import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WindowStatus = 'normal' | 'maximized' | 'minimized' | 'snapped-left' | 'snapped-right';

export interface WindowState {
  id: string;
  title: string;
  component: string;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  status: WindowStatus;
  previousState?: { x: number; y: number; width: number; height: number };
}

interface OSStore {
  windows: WindowState[];
  overviewMode: boolean;
  wallpaper: string;
  setWallpaper: (url: string) => void;
  setOverviewMode: (active: boolean) => void;
  openWindow: (id: string, title: string, component: string, url?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
}

export const useOSStore = create<OSStore>()(
  persist(
    (set, get) => ({
      windows: [],
      overviewMode: false,
      wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      
      setWallpaper: (url) => set({ wallpaper: url }),
      
      setOverviewMode: (active) => set({ overviewMode: active }),
      
      openWindow: (id, title, component, url) => set((state) => {
        const existing = state.windows.find(w => w.id === id);
        if (existing) {
          const currentHighestZ = Math.max(10, ...state.windows.map(w => w.zIndex));
          const newZ = currentHighestZ + 1;
          return {
            windows: state.windows.map(w => 
              w.id === id ? { ...w, zIndex: newZ, status: w.status === 'minimized' ? 'normal' : w.status } : w
            )
          };
        }
        
        const currentHighestZ = Math.max(10, ...state.windows.map(w => w.zIndex));
        const newZ = currentHighestZ + 1;
        
        const { width: screenW, height: screenH } = Dimensions.get('window');
        
        const width = Math.min(800, screenW * 0.9);
        const height = Math.min(600, screenH * 0.8);
        
        const x = Math.max(0, (screenW - width) / 2) + (state.windows.length * 20);
        const y = Math.max(0, (screenH - height) / 2) + (state.windows.length * 20);
        
        return {
          windows: [...state.windows, {
            id, title, component, url,
            x, y, width, height,
            zIndex: newZ,
            status: 'normal'
          }]
        };
      }),
      
      closeWindow: (id) => set((state) => ({
        windows: state.windows.filter(w => w.id !== id)
      })),
      
      focusWindow: (id) => set((state) => {
        const win = state.windows.find(w => w.id === id);
        if (!win) return state;
        
        const currentHighestZ = Math.max(10, ...state.windows.map(w => w.zIndex));
        let newWindows = [...state.windows];
        
        if (win.status === 'minimized') {
          newWindows = newWindows.map(w => w.id === id ? { ...w, status: 'normal' } : w);
        }

        if (win.zIndex === currentHighestZ && win.status !== 'minimized') return { windows: newWindows };
        
        const newZ = currentHighestZ + 1;
        return { windows: newWindows.map(w => w.id === id ? { ...w, zIndex: newZ } : w) };
      }),
      
      updateWindow: (id, updates) => set((state) => ({
        windows: state.windows.map(w => w.id === id ? { ...w, ...updates } : w)
      })),
      
      minimizeWindow: (id) => set((state) => ({
        windows: state.windows.map(w => w.id === id ? { ...w, status: 'minimized' } : w)
      })),
      
      restoreWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(w => w.id === id ? { ...w, status: 'normal' } : w)
        }));
        get().focusWindow(id);
      },
      
      toggleMaximize: (id) => {
        set((state) => ({
          windows: state.windows.map(w => {
            if (w.id !== id) return w;
            if (w.status === 'maximized') {
              return { ...w, status: 'normal' };
            } else {
              return { ...w, status: 'maximized', previousState: { x: w.x, y: w.y, width: w.width, height: w.height } };
            }
          })
        }));
        get().focusWindow(id);
      }
    }),
    {
      name: 'os-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ wallpaper: state.wallpaper, windows: state.windows.filter(w => w.status !== 'minimized') }), // Don't persist overviewMode
    }
  )
);
