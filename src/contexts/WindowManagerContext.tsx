import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  maximized: boolean;
}

interface WindowManagerContextType {
  windows: WindowState[];
  openWindow: (id: string, title: string, component: string, url?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [highestZ, setHighestZ] = useState(10);

  const openWindow = (id: string, title: string, component: string, url?: string) => {
    setWindows(prev => {
      if (prev.find(w => w.id === id)) {
        focusWindow(id);
        return prev;
      }
      const newZ = highestZ + 1;
      setHighestZ(newZ);
      return [...prev, {
        id, title, component, url,
        x: 100 + (prev.length * 30),
        y: 100 + (prev.length * 30),
        width: 800,
        height: 600,
        zIndex: newZ,
        maximized: false
      }];
    });
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => {
      const win = prev.find(w => w.id === id);
      if (!win || win.zIndex === highestZ) return prev;
      
      const newZ = highestZ + 1;
      setHighestZ(newZ);
      return prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w);
    });
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  return (
    <WindowManagerContext.Provider value={{ windows, openWindow, closeWindow, focusWindow, updateWindow }}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) throw new Error("useWindowManager must be used within WindowManagerProvider");
  return context;
}
