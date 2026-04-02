import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, Box, Play, Settings as SettingsIcon, Package, Activity, Chrome, Music, Video, Image as ImageIcon, Folder, Mail, Power } from 'lucide-react';
import { useWindowManager } from '../contexts/WindowManagerContext';

const getAppIcon = (app: any) => {
  const name = app.name.toLowerCase();
  const exec = app.exec.toLowerCase();
  if (name.includes('terminal') || exec.includes('terminal')) return <Terminal className="w-8 h-8 text-green-400" />;
  if (name.includes('settings') || exec.includes('settings')) return <SettingsIcon className="w-8 h-8 text-gray-400" />;
  if (name.includes('store') || name.includes('software') || exec.includes('appstore')) return <Package className="w-8 h-8 text-blue-400" />;
  if (name.includes('monitor') || name.includes('task') || exec.includes('monitor')) return <Activity className="w-8 h-8 text-red-400" />;
  if (name.includes('browser') || name.includes('chrome') || name.includes('firefox')) return <Chrome className="w-8 h-8 text-blue-500" />;
  if (name.includes('music') || name.includes('spotify')) return <Music className="w-8 h-8 text-green-500" />;
  if (name.includes('video') || name.includes('player')) return <Video className="w-8 h-8 text-purple-400" />;
  if (name.includes('image') || name.includes('photo')) return <ImageIcon className="w-8 h-8 text-yellow-400" />;
  if (name.includes('file') || name.includes('folder')) return <Folder className="w-8 h-8 text-blue-300" />;
  if (name.includes('mail')) return <Mail className="w-8 h-8 text-red-300" />;
  return <Box className="w-8 h-8 text-gray-300" />;
};

export function AppLauncher({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [apps, setApps] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { openWindow } = useWindowManager();

  useEffect(() => {
    if (isOpen && apps.length === 0) {
      fetchApps();
    }
  }, [isOpen]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/apps');
      const data = await res.json();
      setApps(data.apps || []);
    } catch (e) {
      console.error("Failed to fetch apps", e);
    }
    setLoading(false);
  };

  const launchApp = async (app: any) => {
    if (app.exec.startsWith('internal:')) {
      const component = app.exec.split(':')[1];
      openWindow(component, app.name, component);
      onClose();
      return;
    }
    
    try {
      await fetch('/api/system/apps/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exec: app.exec })
      });
      onClose();
    } catch (e) {
      console.error("Failed to launch app", e);
    }
  };

  const handlePower = () => {
    // In a real system this would call a backend endpoint to shutdown/reboot
    window.location.reload();
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) || 
    app.exec.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close when clicking outside */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[40]"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-[45] bottom-20 left-4 md:left-20 md:bottom-auto md:top-4 w-[90vw] max-w-2xl h-[60vh] max-h-[600px] bg-gray-900/80 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Search Bar */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="relative flex-1 mr-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  autoFocus
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Type to search apps..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder-gray-500"
                />
              </div>
              <button 
                onClick={handlePower}
                className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-colors"
                title="Power Options"
              >
                <Power className="w-6 h-6" />
              </button>
            </div>

            {/* App Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Box className="w-12 h-12 mb-4 opacity-20" />
                  <p>No applications found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {filteredApps.map((app, i) => (
                    <button
                      key={i}
                      onClick={() => launchApp(app)}
                      className="flex flex-col items-center justify-start p-3 rounded-xl hover:bg-white/10 transition-colors group text-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl shadow-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform group-hover:shadow-blue-500/20 group-hover:border-blue-500/30">
                        {getAppIcon(app)}
                      </div>
                      <span className="text-xs text-gray-300 group-hover:text-white line-clamp-2 leading-tight">
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
