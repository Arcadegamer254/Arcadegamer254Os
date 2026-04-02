import React from 'react';
import { Terminal, Settings as SettingsIcon, Package, Activity, Chrome, Music, Video, Image as ImageIcon, Folder, Mail, Play, Box } from 'lucide-react';

export const getAppIcon = (app: any) => {
  const name = app.name.toLowerCase();
  const exec = app.exec.toLowerCase();
  if (name.includes('terminal') || exec.includes('terminal')) return <Terminal className="w-8 h-8 text-green-400" />;
  if (name.includes('settings') || exec.includes('settings')) return <SettingsIcon className="w-8 h-8 text-gray-400" />;
  if (name.includes('store') || name.includes('software') || exec.includes('appstore')) return <Package className="w-8 h-8 text-blue-400" />;
  if (name.includes('monitor') || name.includes('task') || exec.includes('monitor')) return <Activity className="w-8 h-8 text-red-400" />;
  if (name.includes('browser') || name.includes('chrome') || name.includes('firefox')) return <Chrome className="w-8 h-8 text-blue-500" />;
  if (name.includes('music') || name.includes('spotify') || name.includes('audacity')) return <Music className="w-8 h-8 text-green-500" />;
  if (name.includes('video') || name.includes('player') || name.includes('obs') || name.includes('kdenlive') || name.includes('handbrake')) return <Video className="w-8 h-8 text-purple-400" />;
  if (name.includes('image') || name.includes('photo') || name.includes('gimp') || name.includes('krita') || name.includes('blender') || name.includes('inkscape')) return <ImageIcon className="w-8 h-8 text-yellow-400" />;
  if (name.includes('file') || name.includes('folder')) return <Folder className="w-8 h-8 text-blue-300" />;
  if (name.includes('mail') || name.includes('thunderbird')) return <Mail className="w-8 h-8 text-red-300" />;
  if (app.category === 'Games') return <Play className="w-8 h-8 text-orange-400" />;
  return <Box className="w-8 h-8 text-gray-300" />;
};
