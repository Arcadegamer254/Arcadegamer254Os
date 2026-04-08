import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, GestureResponderEvent, Platform } from 'react-native';
import { WebView } from './WebView';
import { useOSStore } from '../store/osStore';
import { Window } from './Window';
import { Settings } from './apps/Settings';
import { AppStore } from './apps/AppStore';
import { ArcadeBrowser } from './apps/ArcadeBrowser';
import { SystemMonitor } from './apps/SystemMonitor';
import { Terminal } from './apps/Terminal';
import { FileExplorer } from './apps/FileExplorer';
import { AppIcon, AppType } from './AppIcon';
import { Taskbar } from './Taskbar';
import { playSound } from '../utils/sounds';
import { getEmbedUrl } from '../utils/url';
import { systemApi } from '../services/system';

interface PersState {
  wallpaper: string;
  font: string;
  theme: string;
  desktopApps: AppType[];
}

export function Desktop() {
  const { windows, openWindow, overviewMode, setOverviewMode } = useOSStore();
  const [pers, setPers] = useState<PersState>({
    wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    font: 'Inter',
    theme: 'dark',
    desktopApps: []
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e: any) => {
      if (e.key === 'F5') {
        e.preventDefault();
        setOverviewMode(!overviewMode);
      }
    };
    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [overviewMode, setOverviewMode]);

  useEffect(() => {
    const fetchPers = async () => {
      try {
        const data = await systemApi.getPersonalization();
        if (data && !data.error) {
          setPers(data);
        }
      } catch (e) { }
    };
    fetchPers();
    const interval = setInterval(fetchPers, 2000);
    if (Platform.OS === 'web') {
      window.addEventListener('pers-updated', fetchPers);
    }
    return () => {
      clearInterval(interval);
      if (Platform.OS === 'web') {
        window.removeEventListener('pers-updated', fetchPers);
      }
    };
  }, []);

  const launchApp = async (app: AppType) => {
    playSound('click');
    if (app.exec.startsWith('internal:')) {
      const component = app.exec.split(':')[1];
      openWindow(component, app.name, component);
      return;
    }
    
    if (app.exec.startsWith('web:')) {
      const url = app.exec.split('web:')[1];
      const embedUrl = getEmbedUrl(url);
      openWindow(`webapp-${app.name}`, app.name, 'webapp', embedUrl);
      return;
    }
    
    try {
      await systemApi.launchApp(app.exec);
    } catch (e) {
      console.error("Failed to launch app", e);
    }
  };

  const removeFromDesktop = async (e: GestureResponderEvent, appToRemove: AppType) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const newDesktopApps = pers.desktopApps.filter((app: AppType) => app.name !== appToRemove.name);
      await systemApi.updatePersonalization({ desktopApps: newDesktopApps });
      setPers({ ...pers, desktopApps: newDesktopApps });
    } catch (e) {
      console.error(e);
    }
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setTimeout(() => setDraggedIndex(index), 0);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (e.preventDefault) e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    if (e.preventDefault) e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newDesktopApps = [...(pers.desktopApps || [])];
    const [draggedApp] = newDesktopApps.splice(draggedIndex, 1);
    newDesktopApps.splice(dropIndex, 0, draggedApp);

    setPers({ ...pers, desktopApps: newDesktopApps });
    setDraggedIndex(null);

    try {
      await systemApi.updatePersonalization({ desktopApps: newDesktopApps });
    } catch (e) {
      console.error(e);
    }
  };

  const renderComponent = (win: any) => {
    if (win.component === 'webapp') {
      return (
        <WebView 
          source={{ uri: win.url }} 
          style={{ flex: 1, backgroundColor: 'white' }}
        />
      );
    }
    switch (win.component) {
      case 'settings': return <Settings />;
      case 'appstore': return <AppStore />;
      case 'browser': return <ArcadeBrowser initialUrl={win.url} />;
      case 'monitor': return <SystemMonitor />;
      case 'terminal': return <Terminal />;
      case 'files': return <FileExplorer />;
      default: return <View style={styles.unknownApp}><Text style={{color: 'white'}}>Unknown App</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Desktop Background */}
      <ImageBackground 
        source={{ uri: pers.wallpaper }} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Desktop Icons */}
      <View style={styles.iconsContainer}>
        {pers.desktopApps?.map((app: AppType, i: number) => (
          <AppIcon
            key={i}
            app={app}
            index={i}
            isDragged={draggedIndex === i}
            isDragOver={dragOverIndex === i}
            onLaunch={launchApp}
            onRemove={removeFromDesktop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        ))}
      </View>

      {/* Desktop Area (Where windows go) */}
      <View style={styles.windowsContainer} pointerEvents="box-none">
        {windows.map((win, index) => (
          <Window key={win.id} window={win} index={index} totalWindows={windows.filter(w => w.status !== 'minimized').length}>
            {renderComponent(win)}
          </Window>
        ))}
      </View>

      {/* Taskbar */}
      <Taskbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  iconsContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    zIndex: 0,
  },
  windowsContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    zIndex: 10,
  },
  unknownApp: {
    padding: 16,
  }
});
