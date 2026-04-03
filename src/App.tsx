import React, { useState, useEffect } from 'react';
import { SystemTray } from './components/SystemTray';
import { WindowManagerProvider, useWindowManager } from './contexts/WindowManagerContext';
import { Window } from './components/Window';
import { Settings } from './components/apps/Settings';
import { AppStore } from './components/apps/AppStore';
import { ArcadeBrowser } from './components/apps/ArcadeBrowser';
import { SystemMonitor } from './components/apps/SystemMonitor';
import { Terminal } from './components/apps/Terminal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { getAppIcon } from './utils/icons';
import { X } from 'lucide-react';
import { playSound } from './utils/sounds';

import { getEmbedUrl } from './utils/url';

function Desktop() {
  const { windows, openWindow } = useWindowManager();
  const [pers, setPers] = useState<any>({
    wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    font: 'Inter',
    theme: 'dark',
    desktopApps: []
  });

  useEffect(() => {
    const fetchPers = async () => {
      try {
        const res = await fetch('/api/system/personalization');
        const data = await res.json();
        setPers(data);
      } catch (e) { }
    };
    fetchPers();
    const interval = setInterval(fetchPers, 2000); // Poll for changes
    return () => clearInterval(interval);
  }, []);

  const launchApp = async (app: any) => {
    playSound('click');
    if (app.exec.startsWith('internal:')) {
      const component = app.exec.split(':')[1];
      openWindow(component, app.name, component);
      return;
    }
    
    if (app.exec.startsWith('web:')) {
      const url = app.exec.split('web:')[1];
      const embedUrl = getEmbedUrl(url);
      const isEmbed = embedUrl !== url;
      
      // Use proxy for web apps to bypass X-Frame-Options, unless it's a native embed URL
      const finalUrl = isEmbed ? embedUrl : `/api/proxy?url=${encodeURIComponent(embedUrl)}`;
      openWindow(`webapp-${app.name}`, app.name, 'webapp', finalUrl);
      return;
    }
    
    try {
      await fetch('/api/system/apps/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exec: app.exec })
      });
    } catch (e) {
      console.error("Failed to launch app", e);
    }
  };

  const removeFromDesktop = async (e: React.MouseEvent, appToRemove: any) => {
    e.stopPropagation();
    try {
      const newDesktopApps = pers.desktopApps.filter((app: any) => app.name !== appToRemove.name);
      await fetch('/api/system/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desktopApps: newDesktopApps })
      });
      setPers({ ...pers, desktopApps: newDesktopApps });
    } catch (e) {
      console.error(e);
    }
  };

  const renderComponent = (win: any) => {
    if (win.component === 'webapp') {
      return <iframe src={win.url} className="w-full h-full border-none bg-white" title={win.title} />;
    }
    switch (win.component) {
      case 'settings': return <Settings />;
      case 'appstore': return <AppStore />;
      case 'browser': return <ArcadeBrowser />;
      case 'monitor': return <SystemMonitor />;
      case 'terminal': return <Terminal />;
      default: return <div className="p-4 text-white">Unknown App</div>;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 font-sans" style={{ fontFamily: pers.font }}>
      {/* Desktop Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url("${pers.wallpaper}")` }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Desktop Icons */}
      <div className="absolute inset-0 z-0 p-4 flex flex-col flex-wrap gap-4 content-start">
        {pers.desktopApps?.map((app: any, i: number) => (
          <div 
            key={i}
            className="group relative flex flex-col items-center justify-center w-24 h-24 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            onDoubleClick={() => launchApp(app)}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-xl shadow-sm mb-2">
              {getAppIcon(app)}
            </div>
            <span className="text-white text-xs text-center drop-shadow-md px-1 line-clamp-2 leading-tight">
              {app.name}
            </span>
            <button
              onClick={(e) => removeFromDesktop(e, app)}
              className="absolute top-0 right-0 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md"
              title="Remove from Desktop"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Area (Where windows go) */}
      <div className="absolute inset-0 z-10 p-4 overflow-hidden pointer-events-none">
        {windows.map(win => (
          <Window key={win.id} window={win}>
            {renderComponent(win)}
          </Window>
        ))}
      </div>

      {/* System Tray */}
      <SystemTray />
    </div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  return (
    <>
      {booting && <WelcomeScreen onComplete={() => setBooting(false)} />}
      {!booting && (
        <WindowManagerProvider>
          <Desktop />
        </WindowManagerProvider>
      )}
    </>
  );
}
