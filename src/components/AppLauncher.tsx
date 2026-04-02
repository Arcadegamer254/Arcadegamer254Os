import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, Box, Play } from 'lucide-react';

export function AppLauncher({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [apps, setApps] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const launchApp = async (exec: string) => {
    try {
      await fetch('/api/system/apps/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exec })
      });
      onClose();
    } catch (e) {
      console.error("Failed to launch app", e);
    }
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
            className="fixed z-[45] bottom-20 left-4 md:left-20 md:bottom-auto md:top-4 w-[90vw] max-w-2xl h-[60vh] max-h-[600px] bg-gray-900/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Search Bar */}
            <div className="p-6 border-b border-white/10 bg-white/5">
              <div className="relative">
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
            </div>

            {/* App Grid */}
            <div className="flex-1 overflow-y-auto p-6">
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
                      onClick={() => launchApp(app.exec)}
                      className="flex flex-col items-center justify-start p-3 rounded-xl hover:bg-white/10 transition-colors group text-center"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl shadow-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform group-hover:shadow-blue-500/20 group-hover:border-blue-500/30">
                        {app.icon.includes('terminal') ? (
                          <Terminal className="w-6 h-6 text-gray-300" />
                        ) : (
                          <Box className="w-6 h-6 text-gray-300" />
                        )}
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
