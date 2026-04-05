import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, Wifi, WifiOff, Clock, Settings as SettingsIcon, Package, Activity, Terminal, Chrome, Music, Video, Image as ImageIcon, Folder, Mail, Play, Box } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { useWindowManager } from '../contexts/WindowManagerContext';
import { AppLauncher } from './AppLauncher';
import { QuickSettings } from './QuickSettings';
import { getAppIcon } from '../utils/icons';

export function SystemTray() {
  const { windows, openWindow, focusWindow } = useWindowManager();
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState<{ capacity: number; status: string; device: string } | null>(null);
  const [wifiNetworks, setWifiNetworks] = useState<any[]>([]);
  const [wifiError, setWifiError] = useState<string | null>(null);
  const [batteryError, setBatteryError] = useState<string | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [pers, setPers] = useState<any>({ dockPosition: 'Bottom', dockAutoHide: false });
  const [hoveredWindow, setHoveredWindow] = useState<string | null>(null);
  const [isDockHovered, setIsDockHovered] = useState(false);

  // Fetch Personalization
  useEffect(() => {
    const fetchPers = async () => {
      try {
        const res = await fetch('/api/system/personalization');
        const data = await res.json();
        setPers(data);
      } catch (e) {}
    };
    fetchPers();
    const interval = setInterval(fetchPers, 2000);
    return () => clearInterval(interval);
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Battery
  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const res = await fetch('/api/system/battery');
        const data = await res.json();
        if (data.error) {
          setBatteryError(data.error);
        } else {
          setBattery(data);
          setBatteryError(null);
        }
      } catch (err) {
        setBatteryError('Failed to fetch battery');
      }
    };

    fetchBattery();
    const interval = setInterval(fetchBattery, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch Wi-Fi
  useEffect(() => {
    const fetchWifi = async () => {
      try {
        const res = await fetch('/api/system/wifi');
        const data = await res.json();
        if (data.error) {
          setWifiError(data.error);
        } else {
          setWifiNetworks(data.networks || []);
          setWifiError(null);
        }
      } catch (err) {
        setWifiError('Failed to fetch Wi-Fi');
      }
    };

    fetchWifi();
    const interval = setInterval(fetchWifi, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const renderBatteryIcon = () => {
    if (!battery) return <Battery className="w-4 h-4 text-gray-400" />;
    if (battery.status === 'Charging') return <BatteryCharging className="w-4 h-4 text-green-400" />;
    if (battery.capacity > 90) return <BatteryFull className="w-4 h-4" />;
    if (battery.capacity > 50) return <BatteryMedium className="w-4 h-4" />;
    if (battery.capacity > 20) return <BatteryLow className="w-4 h-4 text-yellow-400" />;
    return <BatteryWarning className="w-4 h-4 text-red-500" />;
  };

  const getHitAreaClasses = () => {
    const base = "fixed z-50";
    const isHidden = pers.dockAutoHide && !isDockHovered && !isLauncherOpen && !isQuickSettingsOpen;
    
    switch (pers.dockPosition) {
      case 'Top': return `${base} top-0 left-0 right-0 ${isHidden ? 'h-2' : 'h-14'}`;
      case 'Left': return `${base} top-0 bottom-0 left-0 ${isHidden ? 'w-2' : 'w-16'}`;
      case 'Right': return `${base} top-0 bottom-0 right-0 ${isHidden ? 'w-2' : 'w-16'}`;
      case 'Bottom': default: return `${base} bottom-0 left-0 right-0 ${isHidden ? 'h-2' : 'h-14'}`;
    }
  };

  const getDockClasses = () => {
    const base = "absolute bg-gray-900/60 backdrop-blur-2xl border-white/10 flex items-center justify-between text-gray-100 transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)]";
    switch (pers.dockPosition) {
      case 'Top':
        return `${base} top-0 left-0 right-0 h-14 flex-row px-4 border-b`;
      case 'Left':
        return `${base} top-0 bottom-0 left-0 w-16 flex-col py-4 px-0 border-r`;
      case 'Right':
        return `${base} top-0 bottom-0 right-0 w-16 flex-col py-4 px-0 border-l`;
      case 'Bottom':
      default:
        return `${base} bottom-0 left-0 right-0 h-14 flex-row px-4 border-t`;
    }
  };

  const getDockAnimation = () => {
    if (!pers.dockAutoHide) return { x: 0, y: 0 };
    if (isDockHovered || isLauncherOpen || isQuickSettingsOpen) return { x: 0, y: 0 };
    
    switch (pers.dockPosition) {
      case 'Top': return { y: '-100%' };
      case 'Left': return { x: '-100%' };
      case 'Right': return { x: '100%' };
      case 'Bottom': default: return { y: '100%' };
    }
  };

  const isVertical = pers.dockPosition === 'Left' || pers.dockPosition === 'Right';

  // Base pinned apps
  const pinnedApps = [
    { id: 'settings', title: 'System Settings', component: 'settings', icon: <SettingsIcon className="w-6 h-6 text-gray-300 group-hover:text-white" /> },
    { id: 'files', title: 'File Explorer', component: 'files', icon: <Folder className="w-6 h-6 text-gray-300 group-hover:text-white" /> },
    { id: 'appstore', title: 'App Store', component: 'appstore', icon: <Package className="w-6 h-6 text-gray-300 group-hover:text-white" /> },
    { id: 'monitor', title: 'System Monitor', component: 'monitor', icon: <Activity className="w-6 h-6 text-gray-300 group-hover:text-white" /> }
  ];

  // Combine pinned apps with open windows
  const dockItems = [...pinnedApps];
  windows.forEach(win => {
    if (!dockItems.find(item => item.id === win.id)) {
      dockItems.push({
        id: win.id,
        title: win.title,
        component: win.component,
        icon: getAppIcon({ name: win.title, exec: win.component === 'webapp' ? `web:${win.url}` : win.component })
      });
    }
  });

  return (
    <>
      <div 
        className={getHitAreaClasses()}
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => setIsDockHovered(false)}
      >
        <motion.div 
          className={getDockClasses()}
          animate={getDockAnimation()}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className={`flex items-center ${isVertical ? 'flex-col space-y-4' : 'flex-row space-x-2'}`}>
            <button 
              onClick={() => setIsLauncherOpen(!isLauncherOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg ${isLauncherOpen ? 'bg-blue-500 scale-95' : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'}`}
            >
              <span className="font-bold text-lg">A</span>
            </button>
          </div>

          {/* App Dock */}
          <div className={`absolute ${isVertical ? 'top-1/2 -translate-y-1/2 flex-col space-y-2' : 'left-1/2 -translate-x-1/2 flex-row space-x-2'} flex items-center`}>
            {dockItems.map(item => {
              const isOpen = windows.some(w => w.id === item.id);
              const isFocused = windows.length > 0 && windows.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current).id === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className="relative group"
                  onMouseEnter={() => setHoveredWindow(item.id)}
                  onMouseLeave={() => setHoveredWindow(null)}
                >
                  <button 
                    onClick={() => {
                      if (isOpen) {
                        focusWindow(item.id);
                      } else {
                        openWindow(item.id, item.title, item.component);
                      }
                    }}
                    className={`p-2.5 rounded-xl transition-colors relative ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    {item.icon}
                    {isOpen && (
                      <div className={`absolute ${isVertical ? 'left-0 top-1/2 -translate-y-1/2 w-1 h-4' : 'bottom-0 left-1/2 -translate-x-1/2 w-4 h-1'} rounded-full ${isFocused ? 'bg-blue-400' : 'bg-gray-400'}`} />
                    )}
                  </button>
                  
                  {/* Window Preview Tooltip */}
                  {hoveredWindow === item.id && (
                    <div className={`absolute ${isVertical ? (pers.dockPosition === 'Left' ? 'left-full ml-4 top-1/2 -translate-y-1/2' : 'right-full mr-4 top-1/2 -translate-y-1/2') : (pers.dockPosition === 'Top' ? 'top-full mt-4 left-1/2 -translate-x-1/2' : 'bottom-full mb-4 left-1/2 -translate-x-1/2')} z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200`}>
                      <div className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden w-48 flex flex-col">
                        <div className="px-3 py-2 border-b border-white/10 bg-white/5 flex items-center space-x-2">
                          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                            {React.cloneElement(item.icon as React.ReactElement, { className: 'w-3 h-3' })}
                          </div>
                          <span className="text-xs font-medium text-white truncate">{item.title}</span>
                        </div>
                        {isOpen ? (
                          <div className="h-24 bg-gray-800/50 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-2 border border-white/5 rounded bg-gray-900 flex flex-col">
                              <div className="h-3 border-b border-white/5 bg-white/5 flex items-center px-1 space-x-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                              </div>
                              <div className="flex-1 flex items-center justify-center">
                                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-8 h-8 opacity-20' })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="px-3 py-2 text-[10px] text-gray-400 text-center bg-gray-800/50">
                            Not running
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`flex items-center ${isVertical ? 'flex-col space-y-2' : 'flex-row space-x-2'}`}>
            {/* Unified Quick Settings Button */}
            <button 
              onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
              className={`flex items-center justify-center hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer ${isQuickSettingsOpen ? 'bg-white/10' : ''} ${isVertical ? 'flex-col space-y-2' : 'space-x-3'}`}
            >
              <div className={`flex items-center ${isVertical ? 'flex-col space-y-2' : 'space-x-2'}`}>
                {wifiError ? <WifiOff className="w-4 h-4 text-gray-500" /> : <Wifi className="w-4 h-4" />}
                {renderBatteryIcon()}
              </div>
              <div className={`flex flex-col ${isVertical ? 'items-center' : 'items-end'}`}>
                <span className={`text-sm font-medium leading-none ${isVertical ? 'text-xs text-center mt-1' : ''}`}>{format(time, 'HH:mm')}</span>
                {!isVertical && <span className="text-[10px] text-gray-400 leading-none mt-1">{format(time, 'MM/dd/yyyy')}</span>}
              </div>
            </button>
          </div>
        </motion.div>
      </div>
      
      <AppLauncher isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
      <QuickSettings isOpen={isQuickSettingsOpen} onClose={() => setIsQuickSettingsOpen(false)} position={pers.dockPosition} />
    </>
  );
}
