import { useState } from 'react';
import { SystemTray } from './components/SystemTray';
import { WindowManagerProvider, useWindowManager } from './contexts/WindowManagerContext';
import { Window } from './components/Window';
import { Settings } from './components/apps/Settings';
import { AppStore } from './components/apps/AppStore';
import { SystemMonitor } from './components/apps/SystemMonitor';
import { WelcomeScreen } from './components/WelcomeScreen';

function Desktop() {
  const { windows } = useWindowManager();

  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case 'settings': return <Settings />;
      case 'appstore': return <AppStore />;
      case 'monitor': return <SystemMonitor />;
      default: return <div className="p-4 text-white">Unknown App</div>;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 font-sans">
      {/* Desktop Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
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
