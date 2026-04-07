import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, Wifi, WifiOff, Settings as SettingsIcon, Activity, Terminal, Chrome, Music, Video, Folder, Box, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { useOSStore } from '../store/osStore';
import { AppLauncher } from './AppLauncher';
import { QuickSettings } from './QuickSettings';
import { getAppIcon, AIcon } from '../utils/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Taskbar() {
  const { windows, focusWindow, minimizeWindow, overviewMode, setOverviewMode } = useOSStore();
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState<{ capacity: number; status: string; device: string } | null>(null);
  const [wifiNetworks, setWifiNetworks] = useState<unknown[]>([]);
  const [wifiError, setWifiError] = useState<string | null>(null);
  const [batteryError, setBatteryError] = useState<string | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [pers, setPers] = useState<{ dockPosition?: string; dockAutoHide?: boolean }>({ dockPosition: 'Bottom', dockAutoHide: false });
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
    const interval = setInterval(fetchBattery, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Wi-Fi
  useEffect(() => {
    const fetchWifi = async () => {
      try {
        const res = await fetch('/api/system/wifi');
        const data = await res.json();
        if (data.error || !data.enabled) {
          setWifiError(data.error || 'Wi-Fi Disabled');
          setWifiNetworks([]);
        } else {
          setWifiNetworks(data.networks || []);
          setWifiError(null);
        }
      } catch (err) {
        setWifiError('Failed to fetch Wi-Fi');
        setWifiNetworks([]);
      }
    };

    fetchWifi();
    const interval = setInterval(fetchWifi, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderBatteryIcon = () => {
    // @ts-ignore
    if (!battery) return <Battery size={16} color="#9ca3af" />;
    // @ts-ignore
    if (battery.status === 'Charging') return <BatteryCharging size={16} color="#4ade80" />;
    // @ts-ignore
    if (battery.capacity > 90) return <BatteryFull size={16} color="white" />;
    // @ts-ignore
    if (battery.capacity > 50) return <BatteryMedium size={16} color="white" />;
    // @ts-ignore
    if (battery.capacity > 20) return <BatteryLow size={16} color="#facc15" />;
    // @ts-ignore
    return <BatteryWarning size={16} color="#ef4444" />;
  };

  const getAppIconComponent = (component: string) => {
    switch(component) {
      // @ts-ignore
      case 'settings': return <SettingsIcon size={20} color="#d1d5db" />;
      // @ts-ignore
      case 'appstore': return <AIcon color="#3b82f6" size={20} />;
      // @ts-ignore
      case 'monitor': return <Activity size={20} color="#d1d5db" />;
      // @ts-ignore
      case 'terminal': return <Terminal size={20} color="#d1d5db" />;
      // @ts-ignore
      case 'browser': return <Chrome size={20} color="#d1d5db" />;
      // @ts-ignore
      case 'files': return <Folder size={20} color="#d1d5db" />;
      default: 
        if (component.startsWith('webapp-')) {
          // @ts-ignore
          if (component.toLowerCase().includes('spotify')) return <Music size={20} color="#d1d5db" />;
          // @ts-ignore
          if (component.toLowerCase().includes('youtube')) return <Video size={20} color="#d1d5db" />;
          // @ts-ignore
          return <Box size={20} color="#d1d5db" />;
        }
        // @ts-ignore
        return <Box size={20} color="#d1d5db" />;
    }
  };

  const groupedWindows = windows.reduce((acc, win) => {
    if (!acc[win.component]) {
      acc[win.component] = [];
    }
    acc[win.component].push(win);
    return acc;
  }, {} as Record<string, typeof windows>);

  const isVertical = pers.dockPosition === 'Left' || pers.dockPosition === 'Right';

  return (
    <>
      <View 
        style={[
          styles.hitArea,
          pers.dockPosition === 'Top' && styles.hitAreaTop,
          pers.dockPosition === 'Bottom' && styles.hitAreaBottom,
          pers.dockPosition === 'Left' && styles.hitAreaLeft,
          pers.dockPosition === 'Right' && styles.hitAreaRight,
        ]}
        // @ts-ignore
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => setIsDockHovered(false)}
      >
        <View style={[
          styles.dock,
          isVertical ? styles.dockVertical : styles.dockHorizontal
        ]}>
          
          <TaskbarButton 
            isActive={isLauncherOpen} 
            onPress={() => setIsLauncherOpen(!isLauncherOpen)}
          >
            {/* @ts-ignore */}
            <AIcon color="#3b82f6" size={24} />
          </TaskbarButton>

          <TaskbarButton 
            isActive={overviewMode} 
            onPress={() => setOverviewMode(!overviewMode)}
          >
            {/* @ts-ignore */}
            <LayoutGrid size={16} color="white" />
          </TaskbarButton>

          <View style={[styles.divider, isVertical ? styles.dividerVertical : styles.dividerHorizontal]} />

          <View style={[styles.appsContainer, isVertical ? styles.appsContainerVertical : styles.appsContainerHorizontal]}>
            {Object.entries(groupedWindows).map(([component, wins]) => {
              const highestZ = Math.max(10, ...windows.map(w => w.zIndex));
              const isActive = wins.some(w => w.zIndex === highestZ && w.status !== 'minimized');
              const mainWin = wins[0];
              
              return (
                <View 
                  key={component}
                  style={styles.appIconWrapper}
                  // @ts-ignore
                  onMouseEnter={() => setHoveredWindow(component)}
                  onMouseLeave={() => setHoveredWindow(null)}
                >
                  <TaskbarButton
                    isActive={isActive}
                    onPress={() => {
                      if (isActive) {
                        minimizeWindow(mainWin.id);
                      } else {
                        focusWindow(mainWin.id);
                      }
                    }}
                  >
                    {getAppIconComponent(component)}
                  </TaskbarButton>
                  
                  <View style={[
                    styles.activeIndicator,
                    isActive ? styles.activeIndicatorOn : styles.activeIndicatorOff,
                    pers.dockPosition === 'Left' && styles.indicatorLeft,
                    pers.dockPosition === 'Right' && styles.indicatorRight,
                    pers.dockPosition === 'Top' && styles.indicatorTop,
                    (!pers.dockPosition || pers.dockPosition === 'Bottom') && styles.indicatorBottom,
                  ]} />

                  {hoveredWindow === component && (
                    <View style={[
                      styles.tooltip,
                      pers.dockPosition === 'Left' && styles.tooltipLeft,
                      pers.dockPosition === 'Right' && styles.tooltipRight,
                      pers.dockPosition === 'Top' && styles.tooltipTop,
                      (!pers.dockPosition || pers.dockPosition === 'Bottom') && styles.tooltipBottom,
                    ]}>
                      <Text style={styles.tooltipText}>
                        {mainWin.title} {wins.length > 1 ? `(${wins.length})` : ''}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.spacer} />

          <Pressable 
            onPress={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
            style={[
              styles.quickSettings,
              isVertical ? styles.quickSettingsVertical : styles.quickSettingsHorizontal,
              isQuickSettingsOpen ? styles.quickSettingsActive : styles.quickSettingsInactive
            ]}
          >
            <View style={[styles.quickSettingsIcons, isVertical ? styles.quickSettingsIconsVertical : styles.quickSettingsIconsHorizontal]}>
              {/* @ts-ignore */}
              {wifiError ? <WifiOff size={16} color="#6b7280" /> : <Wifi size={16} color="white" />}
              {renderBatteryIcon()}
            </View>
            <Text style={[styles.timeText, isVertical && styles.timeTextVertical]}>
              {format(time, 'h:mm')}
            </Text>
          </Pressable>
        </View>
      </View>

      <AppLauncher isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
      <QuickSettings isOpen={isQuickSettingsOpen} onClose={() => setIsQuickSettingsOpen(false)} position={pers.dockPosition || 'Bottom'} />
    </>
  );
}

function TaskbarButton({ children, isActive, onPress }: { children: React.ReactNode, isActive: boolean, onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[styles.taskbarButton, isActive ? styles.taskbarButtonActive : styles.taskbarButtonInactive]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    position: 'absolute',
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hitAreaTop: { width: '100%', top: 0, height: 64 },
  hitAreaBottom: { width: '100%', bottom: 0, height: 64 },
  hitAreaLeft: { height: '100%', left: 0, width: 64, flexDirection: 'column' },
  hitAreaRight: { height: '100%', right: 0, width: 64, flexDirection: 'column' },
  
  dock: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 9999,
    alignItems: 'center',
    // Note: backdrop-filter requires web-specific styles if needed, 
    // but we'll stick to standard RN styles as much as possible.
  },
  dockHorizontal: {
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  dockVertical: {
    flexDirection: 'column',
    width: 48,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  
  taskbarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  taskbarButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  taskbarButtonInactive: {
    backgroundColor: 'transparent',
  },
  
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerHorizontal: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
  dividerVertical: {
    width: 24,
    height: 1,
    marginVertical: 8,
  },
  
  appsContainer: {
    flexDirection: 'row',
  },
  appsContainerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appsContainerVertical: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  appIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  activeIndicator: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  activeIndicatorOn: {
    transform: [{ scale: 1 }],
  },
  activeIndicatorOff: {
    transform: [{ scale: 0.75 }],
    opacity: 0.5,
  },
  indicatorBottom: { bottom: -4 },
  indicatorTop: { top: -4 },
  indicatorLeft: { left: -4 },
  indicatorRight: { right: -4 },
  
  tooltip: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    zIndex: 50,
  },
  tooltipBottom: { bottom: '100%', marginBottom: 12 },
  tooltipTop: { top: '100%', marginTop: 12 },
  tooltipLeft: { left: '100%', marginLeft: 12 },
  tooltipRight: { right: '100%', marginRight: 12 },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
  
  spacer: {
    flex: 1,
    minWidth: 20,
    minHeight: 20,
  },
  
  quickSettings: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSettingsHorizontal: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  quickSettingsVertical: {
    flexDirection: 'column',
    width: 40,
    paddingVertical: 12,
    marginTop: 8,
  },
  quickSettingsActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickSettingsInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickSettingsIcons: {
    alignItems: 'center',
  },
  quickSettingsIconsHorizontal: {
    flexDirection: 'row',
    marginRight: 8,
    gap: 8,
  },
  quickSettingsIconsVertical: {
    flexDirection: 'column',
    marginBottom: 8,
    gap: 8,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  timeTextVertical: {
    fontSize: 12,
  }
});
