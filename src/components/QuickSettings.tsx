import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { Wifi, WifiOff, Bluetooth, BluetoothOff, Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, ChevronLeft, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { useWindowManager } from '../contexts/WindowManagerContext';

export function QuickSettings({ isOpen, onClose, position }: { isOpen: boolean, onClose: () => void, position: string }) {
  const { openWindow } = useWindowManager();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [battery, setBattery] = useState<any>(null);
  const [wifiNetworks, setWifiNetworks] = useState<any[]>([]);
  const [bluetooth, setBluetooth] = useState<any>(null);
  
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [btEnabled, setBtEnabled] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    
    // Fetch system states when opened
    fetch('/api/system/battery').then(r => r.json()).then(d => !d.error && setBattery(d)).catch(() => {});
    fetch('/api/system/wifi').then(r => r.json()).then(d => !d.error && setWifiNetworks(d.networks || [])).catch(() => {});
    fetch('/api/system/bluetooth').then(r => r.json()).then(d => !d.error && setBluetooth(d)).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const renderCalendar = () => {
    const startDate = startOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(startDate, i));
    }

    return (
      <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">{format(currentDate, 'MMMM yyyy')}</span>
          <div className="flex space-x-2">
            <button onClick={() => setCurrentDate(subWeeks(currentDate, 4))} className="p-1 hover:bg-white/10 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 4))} className="p-1 hover:bg-white/10 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            return (
              <div 
                key={i} 
                className={`p-1.5 rounded-full flex items-center justify-center ${isToday ? 'bg-blue-500 text-white font-bold' : isCurrentMonth ? 'text-gray-200 hover:bg-white/10 cursor-pointer' : 'text-gray-600'}`}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'Top': return 'top-16 right-4';
      case 'Left': return 'bottom-4 left-20';
      case 'Right': return 'bottom-4 right-20';
      case 'Bottom': default: return 'bottom-16 right-4';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`fixed z-50 w-80 bg-gray-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-4 text-gray-100 ${getPositionClasses()} animate-in fade-in slide-in-from-bottom-4 duration-200`}>
        
        {/* Quick Toggles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className={`p-4 rounded-2xl flex flex-col cursor-pointer transition-colors ${wifiEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setWifiEnabled(!wifiEnabled)}
          >
            <div className="flex justify-between items-start mb-2">
              {wifiEnabled ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 text-gray-400" />}
            </div>
            <span className="font-medium text-sm">Wi-Fi</span>
            <span className="text-xs text-blue-200 truncate">{wifiEnabled ? (wifiNetworks[0]?.ssid || 'Connected') : 'Off'}</span>
          </div>

          <div 
            className={`p-4 rounded-2xl flex flex-col cursor-pointer transition-colors ${btEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setBtEnabled(!btEnabled)}
          >
            <div className="flex justify-between items-start mb-2">
              {btEnabled ? <Bluetooth className="w-5 h-5" /> : <BluetoothOff className="w-5 h-5 text-gray-400" />}
            </div>
            <span className="font-medium text-sm">Bluetooth</span>
            <span className="text-xs text-blue-200 truncate">{btEnabled ? (bluetooth?.devices?.find((d:any) => d.connected)?.name || 'On') : 'Off'}</span>
          </div>
        </div>

        {/* Sliders (Mocked for now) */}
        <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 space-y-4">
          <div className="flex items-center space-x-3">
            <Battery className="w-5 h-5 text-gray-400" />
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${battery?.capacity || 100}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{battery?.capacity || 100}%</span>
          </div>
        </div>

        {/* Calendar */}
        {renderCalendar()}

        {/* Footer */}
        <div className="flex justify-between items-center px-2 pt-2 border-t border-gray-800">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{format(new Date(), 'EEEE, MMMM d')}</span>
          </div>
          <button 
            onClick={() => { onClose(); openWindow('settings', 'System Settings', 'settings'); }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <SettingsIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </>
  );
}
