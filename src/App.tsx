import { useState, useEffect } from 'react';
import { SystemTray } from './components/SystemTray';
import { WindowManagerProvider, useWindowManager } from './contexts/WindowManagerContext';
import { Window } from './components/Window';
import { Settings } from './components/apps/Settings';
import { AppStore } from './components/apps/AppStore';
import { ArcadeBrowser } from './components/apps/ArcadeBrowser';
import { SystemMonitor } from './components/apps/SystemMonitor';
import { Terminal } from './components/apps/Terminal';
import { WelcomeScreen } from './components/WelcomeScreen';

function Desktop() {
  const { windows } = useWindowManager();
  const [pers, setPers] = useState({
    wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    font: 'Inter',
    theme: 'dark'
  });

  useEffect(() => {
    const fetchPers = async () => {
      try {
        const res = await fetch('/api/system/personalization');
        const data = await res.json();
        setPers(data);
      } catch (e) {}
    };
    fetchPers();
    const interval = setInterval(fetchPers, 2000); // Poll for changes
    return () => clearInterval(interval);
  }, []);

  const renderComponent = (componentName: string) => {
    switch (componentName) {
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

      {/* Desktop Area (Where windows go) - Responsive padding for bottom/side dock */}
      <div className="relative z-10 w-full h-[calc(100vh-3.5rem)] md:h-screen md:w-[calc(100vw-4rem)] md:ml-16 p-4 overflow-hidden">
        {windows.map(win => (
          <Window key={win.id} window={win}>
            {renderComponent(win.component)}
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
