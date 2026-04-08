import React from 'react';
import { Image, View } from 'react-native';
import { Terminal, Settings as SettingsIcon, Package, Activity, Globe, Music, Video, Image as ImageIcon, Folder, Mail, Play, Box } from 'lucide-react-native';
import { Svg, Path } from 'react-native-svg';

export const AIcon = ({ className, color = "#3b82f6", size = 32 }: { className?: string, color?: string, size?: number }) => (
  <Svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
    <Path d="M12 2L3 22h4.5l2.5-6h8l2.5 6H21L12 2zm-1.5 11L12 7l1.5 6h-3z" />
  </Svg>
);

export const getAppIcon = (app: any) => {
  if (app.iconUrl) {
    return <Image source={{ uri: app.iconUrl }} style={{ width: 32, height: 32, borderRadius: 8 }} />;
  }
  
  if (app.exec && app.exec.startsWith('web:')) {
    try {
      const url = new URL(app.exec.replace('web:', ''));
      return <Image source={{ uri: `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128` }} style={{ width: 32, height: 32, borderRadius: 8 }} />;
    } catch (e) {
      // fallback
    }
  }

  const name = app.name ? app.name.toLowerCase() : '';
  const exec = app.exec ? app.exec.toLowerCase() : '';
  if (name.includes('terminal') || exec.includes('terminal')) return <Terminal color="#4ade80" size={32} />;
  if (name.includes('settings') || exec.includes('settings')) return <SettingsIcon color="#9ca3af" size={32} />;
  if (name.includes('store') || name.includes('software') || exec.includes('appstore')) return <AIcon color="#3b82f6" size={32} />;
  if (name.includes('monitor') || name.includes('task') || exec.includes('monitor')) return <Activity color="#f87171" size={32} />;
  if (name.includes('browser') || name.includes('chrome') || name.includes('firefox')) return <Globe color="#3b82f6" size={32} />;
  if (name.includes('music') || name.includes('spotify') || name.includes('audacity')) return <Music color="#22c55e" size={32} />;
  if (name.includes('video') || name.includes('player') || name.includes('obs') || name.includes('kdenlive') || name.includes('handbrake')) return <Video color="#c084fc" size={32} />;
  if (name.includes('image') || name.includes('photo') || name.includes('gimp') || name.includes('krita') || name.includes('blender') || name.includes('inkscape')) return <ImageIcon color="#facc15" size={32} />;
  if (name.includes('file') || name.includes('folder')) return <Folder color="#93c5fd" size={32} />;
  if (name.includes('mail') || name.includes('thunderbird')) return <Mail color="#fca5a5" size={32} />;
  if (app.category === 'Games') return <Play color="#fb923c" size={32} />;
  return <Box color="#d1d5db" size={32} />;
};
