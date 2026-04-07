import React, { ReactNode } from 'react';
import { useOSStore, WindowState, WindowStatus } from '../store/osStore';

export type { WindowState, WindowStatus };

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useWindowManager() {
  return useOSStore();
}
