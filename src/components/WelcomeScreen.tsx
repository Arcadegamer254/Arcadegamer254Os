import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, User } from 'lucide-react';

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [username, setUsername] = useState<string>('Loading user...');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/system/user');
        const data = await res.json();
        setUsername(data.username || 'arcadegamer254');
      } catch (e) {
        setUsername('arcadegamer254');
      }
    };

    fetchUser();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsAuthenticating(true);
    
    // Simulate authentication verification
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-blue-950 text-white overflow-hidden">
      {/* Glassmorphism background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10 w-full max-w-sm px-4"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
          Arcadegamer254 os
        </h1>
        
        <div className="flex items-center space-x-3 mb-12">
          <div className="h-[1px] w-8 bg-white/30" />
          <p className="text-sm font-medium text-blue-200/80 uppercase tracking-widest">
            made by arcadegamer254
          </p>
          <div className="h-[1px] w-8 bg-white/30" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4 border-4 border-white/10">
            <User className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-6">{username}</h2>

          <form onSubmit={handleLogin} className="w-full relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={!password || isAuthenticating}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {isAuthenticating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
