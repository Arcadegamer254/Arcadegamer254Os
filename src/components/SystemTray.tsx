import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, Wifi, WifiOff, Clock, Settings as SettingsIcon, Package, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useWindowManager } from '../contexts/WindowManagerContext';
import { AppLauncher } from './AppLauncher';

export function SystemTray() {
  const { openWindow } = useWindowManager();
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState<{ capacity: number; status: string; device: string } | null>(null);
  const [wifiNetworks, setWifiNetworks] = useState<any[]>([]);
  const [wifiError, setWifiError] = useState<string | null>(null);
  const [batteryError, setBatteryError] = useState<string | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

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

  return (
    <>
      <div className="fixed z-50 bg-gray-900/60 backdrop-blur-2xl border-white/10 flex items-center justify-between text-gray-100 transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)]
        bottom-0 left-0 right-0 h-14 flex-row px-4 border-t
        md:top-0 md:bottom-0 md:left-0 md:w-16 md:h-screen md:flex-col md:py-4 md:px-0 md:border-t-0 md:border-r"
      >
        <div className="flex items-center md:flex-col space-x-2 md:space-x-0 md:space-y-4">
          <button 
            onClick={() => setIsLauncherOpen(!isLauncherOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg ${isLauncherOpen ? 'bg-blue-500 scale-95' : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'}`}
          >
            <span className="font-bold text-lg">A</span>
          </button>
        </div>

        {/* App Dock */}
        <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 flex items-center md:flex-col space-x-2 md:space-x-0 md:space-y-2">
          <button 
            onClick={() => openWindow('settings', 'System Settings', 'settings')}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors group relative"
          >
            <SettingsIcon className="w-6 h-6 text-gray-300 group-hover:text-white" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:bottom-auto md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:ml-2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Settings</span>
          </button>
          <button 
            onClick={() => openWindow('appstore', 'App Store', 'appstore')}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors group relative"
          >
            <Package className="w-6 h-6 text-gray-300 group-hover:text-white" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:bottom-auto md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:ml-2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">App Store</span>
          </button>
          <button 
            onClick={() => openWindow('monitor', 'System Monitor', 'monitor')}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors group relative"
          >
            <Activity className="w-6 h-6 text-gray-300 group-hover:text-white" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:bottom-auto md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:ml-2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">System Monitor</span>
          </button>
        </div>

        <div className="flex items-center md:flex-col space-x-4 md:space-x-0 md:space-y-4">
          {/* Wi-Fi Indicator */}
          <div className="relative group flex items-center justify-center cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors">
            {wifiError ? <WifiOff className="w-5 h-5 text-gray-500" /> : <Wifi className="w-5 h-5" />}
            
            {/* Wi-Fi Tooltip/Menu */}
            <div className="absolute bottom-full right-0 mb-2 md:bottom-auto md:right-auto md:left-full md:top-1/2 md:-translate-y-1/2 md:ml-2 w-64 bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity p-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Wi-Fi Networks</h3>
              {wifiError ? (
                <div className="text-xs text-red-400 p-2 bg-red-900/20 rounded">{wifiError}</div>
              ) : wifiNetworks.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {wifiNetworks.map((net, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-1.5 hover:bg-white/10 rounded">
                      <span className="truncate max-w-[150px]">{net.ssid}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{net.security}</span>
                        <Wifi className={`w-3 h-3 ${net.signal > 70 ? 'text-green-400' : net.signal > 30 ? 'text-yellow-400' : 'text-red-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 p-2">Scanning...</div>
              )}
            </div>
          </div>

          {/* Battery Indicator */}
          <div className="relative group flex items-center justify-center cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors">
            {renderBatteryIcon()}

            {/* Battery Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 md:bottom-auto md:right-auto md:left-full md:top-1/2 md:-translate-y-1/2 md:ml-2 w-48 bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Power</h3>
              {batteryError ? (
                <div className="text-xs text-red-400 p-2 bg-red-900/20 rounded">{batteryError}</div>
              ) : battery ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span>{battery.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Capacity:</span>
                    <span>{battery.capacity}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Device:</span>
                    <span className="font-mono text-xs">{battery.device}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">Loading...</div>
              )}
            </div>
          </div>

          {/* Clock */}
          <div className="flex items-center justify-center hover:bg-white/10 p-2 rounded-xl transition-colors cursor-default">
            <Clock className="w-5 h-5 text-gray-400 md:hidden" />
            <span className="text-sm font-medium md:text-xs md:text-center">{format(time, 'HH:mm')}</span>
          </div>
        </div>
      </div>
      
      <AppLauncher isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
    </>
  );
}
