import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Switch, PanResponder, Dimensions, Platform } from 'react-native';
import { 
  Info, Monitor, Volume2, Battery, HardDrive, Wifi, Bluetooth, 
  Palette, Image as ImageIcon, LayoutGrid, Clock, Globe, 
  AppWindow, PlayCircle, Lock, Shield, Search, ChevronRight,
  Cpu, Activity, Type, CheckCircle, WifiOff, Sun, Moon
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Simple Slider Component
const Slider = ({ value, onValueChange, min = 0, max = 100 }: { value: number, onValueChange: (val: number) => void, min?: number, max?: number }) => {
  const [sliderWidth, setSliderWidth] = useState(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      handleTouch(evt.nativeEvent.locationX);
    },
    onPanResponderMove: (evt) => {
      handleTouch(evt.nativeEvent.locationX);
    },
  });

  const handleTouch = (x: number) => {
    if (sliderWidth === 0) return;
    let percent = x / sliderWidth;
    percent = Math.max(0, Math.min(1, percent));
    const newValue = min + percent * (max - min);
    onValueChange(newValue);
  };

  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <View 
      style={styles.sliderContainer} 
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
};

type Category = {
  id: string;
  label: string;
  icon: React.ElementType;
};

type Section = {
  title: string;
  items: Category[];
};

const SECTIONS: Section[] = [
  {
    title: 'System',
    items: [
      { id: 'about', label: 'About', icon: Info },
      { id: 'display', label: 'Display', icon: Monitor },
      { id: 'audio', label: 'Audio', icon: Volume2 },
      { id: 'power', label: 'Power', icon: Battery },
      { id: 'storage', label: 'Storage', icon: HardDrive },
    ]
  },
  {
    title: 'Network & Connectivity',
    items: [
      { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
      { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
    ]
  },
  {
    title: 'Personalization',
    items: [
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'wallpaper', label: 'Wallpaper', icon: ImageIcon },
      { id: 'fonts', label: 'Fonts', icon: Type },
      { id: 'dock', label: 'Dock Settings', icon: LayoutGrid },
    ]
  },
  {
    title: 'Time & Language',
    items: [
      { id: 'datetime', label: 'Date & Time', icon: Clock },
      { id: 'region', label: 'Region', icon: Globe },
    ]
  },
  {
    title: 'Apps',
    items: [
      { id: 'defaultapps', label: 'Default Apps', icon: AppWindow },
      { id: 'startup', label: 'Startup Apps', icon: PlayCircle },
    ]
  },
  {
    title: 'Security & Privacy',
    items: [
      { id: 'lockscreen', label: 'Lock Screen', icon: Lock },
      { id: 'permissions', label: 'App Permissions', icon: Shield },
    ]
  }
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('about');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Data States ---
  const [aboutData, setAboutData] = useState<any>(null);
  const [storageData, setStorageData] = useState<any>(null);
  const [displayData, setDisplayData] = useState<any>(null);
  const [btData, setBtData] = useState<any>(null);
  const [powerData, setPowerData] = useState<any>(null);
  const [persData, setPersData] = useState<any>(null);
  const [wifiData, setWifiData] = useState<any>(null);
  const [audioData, setAudioData] = useState<any>(null);
  const [dateTimeData, setDateTimeData] = useState<any>(null);
  const [regionData, setRegionData] = useState<any>(null);
  const [defaultAppsData, setDefaultAppsData] = useState<any>(null);
  const [startupData, setStartupData] = useState<any>(null);
  const [permissionsData, setPermissionsData] = useState<any>(null);
  const [lockScreenData, setLockScreenData] = useState<any>(null);

  useEffect(() => {
    let interval: any;

    const fetchData = async () => {
      try {
        if (activeTab === 'about' && !aboutData) {
          fetch('/api/system/about').then(r => r.json()).then(setAboutData).catch(()=>{});
        }
        if (activeTab === 'storage' && !storageData) {
          fetch('/api/system/storage').then(r => r.json()).then(setStorageData).catch(()=>{});
        }
        if (activeTab === 'display' && !displayData) {
          fetch('/api/system/display').then(r => r.json()).then(setDisplayData).catch(()=>{});
        }
        if (['appearance', 'wallpaper', 'fonts', 'dock'].includes(activeTab) && !persData) {
          fetch('/api/system/personalization').then(r => r.json()).then(setPersData).catch(()=>{});
        }
        if (activeTab === 'datetime' && !dateTimeData) {
          fetch('/api/system/datetime').then(r => r.json()).then(setDateTimeData).catch(()=>{});
        }
        if (activeTab === 'region' && !regionData) {
          fetch('/api/system/region').then(r => r.json()).then(setRegionData).catch(()=>{});
        }
        if (activeTab === 'defaultapps' && !defaultAppsData) {
          fetch('/api/system/defaultapps').then(r => r.json()).then(setDefaultAppsData).catch(()=>{});
        }
        if (activeTab === 'startup' && !startupData) {
          fetch('/api/system/startup').then(r => r.json()).then(setStartupData).catch(()=>{});
        }
        if (activeTab === 'permissions' && !permissionsData) {
          fetch('/api/system/permissions').then(r => r.json()).then(setPermissionsData).catch(()=>{});
        }
        if (activeTab === 'lockscreen' && !lockScreenData) {
          fetch('/api/system/lockscreen').then(r => r.json()).then(setLockScreenData).catch(()=>{});
        }

        // Real-time polling for these tabs
        if (activeTab === 'bluetooth') {
          fetch('/api/system/bluetooth').then(r => r.json()).then(setBtData).catch(()=>{});
        }
        if (activeTab === 'power') {
          fetch('/api/system/power').then(r => r.json()).then(setPowerData).catch(()=>{});
        }
        if (activeTab === 'wifi') {
          fetch('/api/system/wifi').then(r => r.json()).then(setWifiData).catch(()=>{});
        }
        if (activeTab === 'audio') {
          fetch('/api/system/audio').then(r => r.json()).then(setAudioData).catch(()=>{});
        }
      } catch (e) {}
    };

    fetchData();

    if (['bluetooth', 'power', 'wifi', 'audio'].includes(activeTab)) {
      interval = setInterval(fetchData, 3000);
    }

    return () => clearInterval(interval);
  }, [activeTab]);

  const updatePers = async (updates: any) => {
    setPersData({ ...persData, ...updates });
    try {
      await fetch('/api/system/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (Platform.OS === 'web') {
        window.dispatchEvent(new Event('pers-updated'));
      }
    } catch (e) {}
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <View style={styles.logoContainer}>
                <Info color="#fff" size={48} />
              </View>
              <View>
                <Text style={styles.titleText}>Arcadegamer254 os</Text>
                <Text style={styles.subtitleText}>Version {aboutData?.version || 'Loading...'}</Text>
              </View>
            </View>

            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <View style={styles.gridItemHeader}>
                  <Cpu color="#60a5fa" size={20} />
                  <Text style={styles.gridItemTitle}>Processor</Text>
                </View>
                <Text style={styles.gridItemValue}>{aboutData?.cpu || 'Loading...'}</Text>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.gridItemHeader}>
                  <Monitor color="#60a5fa" size={20} />
                  <Text style={styles.gridItemTitle}>Graphics</Text>
                </View>
                <Text style={styles.gridItemValue}>{aboutData?.gpu || 'Loading...'}</Text>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.gridItemHeader}>
                  <HardDrive color="#c084fc" size={20} />
                  <Text style={styles.gridItemTitle}>Installed RAM</Text>
                </View>
                <Text style={styles.gridItemValue}>{aboutData?.ram || 'Loading...'}</Text>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.gridItemHeader}>
                  <Activity color="#c084fc" size={20} />
                  <Text style={styles.gridItemTitle}>Kernel Version</Text>
                </View>
                <Text style={styles.gridItemValue}>{aboutData?.kernel || 'Loading...'}</Text>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.gridItemHeader}>
                  <Clock color="#4ade80" size={20} />
                  <Text style={styles.gridItemTitle}>System Uptime</Text>
                </View>
                <Text style={styles.gridItemValue}>{aboutData?.uptime || 'Loading...'}</Text>
              </View>
            </View>
          </View>
        );

      case 'storage':
        const percentage = storageData ? parseInt(storageData.usePercentage) : 0;
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Storage</Text>
              <Text style={styles.sectionSubtitle}>Manage your disk space and partitions.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.storageHeader}>
                <View style={styles.storageInfo}>
                  <HardDrive color="#60a5fa" size={32} />
                  <View style={{ marginLeft: 16 }}>
                    <Text style={styles.cardTitle}>Root Partition (/)</Text>
                    <Text style={styles.cardSubtitle}>Arch Linux System Drive</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {storageData?.error ? (
                    <Text style={styles.errorText}>{storageData.error}</Text>
                  ) : (
                    <>
                      <Text style={styles.storageUsedText}>{storageData?.used || '0G'} <Text style={styles.storageUsedLabel}>used</Text></Text>
                      <Text style={styles.storageFreeText}>{storageData?.available || '0G'} free of {storageData?.total || '0G'}</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0%</Text>
                <Text style={styles.progressLabel}>{percentage}% Used</Text>
                <Text style={styles.progressLabel}>100%</Text>
              </View>
            </View>
          </View>
        );

      case 'display':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Display</Text>
              <Text style={styles.sectionSubtitle}>Configure your monitors and resolution.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Monitor color="#60a5fa" size={32} />
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.cardTitle}>Primary Display</Text>
                  <Text style={styles.cardSubtitle}>Built-in Screen</Text>
                </View>
              </View>

              {displayData?.error ? (
                <Text style={styles.errorText}>{displayData.error}</Text>
              ) : (
                <View style={styles.formGroup}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Resolution</Text>
                    <View style={styles.inputField}>
                      <Text style={styles.inputText}>{displayData?.resolution || 'Unknown'}</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Refresh Rate</Text>
                    <View style={styles.inputField}>
                      <Text style={styles.inputText}>{displayData?.refreshRate || 'Unknown'}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        );

      case 'audio':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Audio</Text>
              <Text style={styles.sectionSubtitle}>Manage sound devices and volume.</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Volume2 color="#60a5fa" size={32} />
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.cardTitle}>Master Volume</Text>
                  <Text style={styles.cardSubtitle}>Default Output Device {audioData?.system ? `(${audioData.system})` : ''}</Text>
                </View>
              </View>
              
              {audioData?.error ? (
                <Text style={styles.errorText}>{audioData.error}</Text>
              ) : (
                <View style={styles.formGroup}>
                  <View style={styles.sliderRow}>
                    <Volume2 color="#9ca3af" size={20} />
                    <View style={{ flex: 1, marginHorizontal: 16 }}>
                      <Slider 
                        value={audioData?.volume || 0} 
                        onValueChange={(vol) => {
                          setAudioData({ ...audioData, volume: Math.round(vol) });
                          fetch('/api/system/audio', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ volume: Math.round(vol) })
                          }).catch(()=>{});
                        }} 
                      />
                    </View>
                    <Text style={styles.sliderValueText}>{Math.round(audioData?.volume || 0)}%</Text>
                  </View>
                  <View style={styles.switchRow}>
                    <Switch 
                      value={audioData?.muted || false}
                      onValueChange={(muted) => {
                        setAudioData({ ...audioData, muted });
                        fetch('/api/system/audio', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ muted })
                        }).catch(()=>{});
                      }}
                      trackColor={{ false: '#4b5563', true: '#3b82f6' }}
                      thumbColor="#fff"
                    />
                    <Text style={styles.switchLabel}>Mute</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        );

      case 'wifi':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wi-Fi</Text>
              <Text style={styles.sectionSubtitle}>Manage wireless networks.</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeader}>
                  <Wifi color="#60a5fa" size={32} />
                  <View style={{ marginLeft: 16 }}>
                    <Text style={styles.cardTitle}>Wi-Fi</Text>
                    <Text style={styles.cardSubtitle}>{wifiData?.enabled ? (wifiData?.networks?.length ? 'Connected' : 'Scanning...') : 'Disabled'}</Text>
                  </View>
                </View>
                <Switch 
                  value={wifiData?.enabled || false}
                  onValueChange={(enabled) => {
                    setWifiData({ ...wifiData, enabled });
                    fetch('/api/system/wifi/toggle', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabled })
                    }).catch(()=>{});
                  }}
                  trackColor={{ false: '#4b5563', true: '#3b82f6' }}
                  thumbColor="#fff"
                />
              </View>
              
              {wifiData?.enabled && (
                <View style={styles.listContainer}>
                  <Text style={styles.listTitle}>Available Networks</Text>
                  {wifiData?.error ? (
                    <View style={styles.errorBox}>
                      <WifiOff color="#f87171" size={20} />
                      <Text style={styles.errorBoxText}>{wifiData.error}</Text>
                    </View>
                  ) : wifiData?.networks?.map((net: any, i: number) => (
                    <View key={i} style={styles.listItem}>
                      <View>
                        <Text style={styles.listItemTitle}>{net.ssid}</Text>
                        <Text style={styles.listItemSubtitle}>{net.security}</Text>
                      </View>
                      <View style={styles.listItemActions}>
                        <Wifi color={net.signal > 70 ? '#4ade80' : net.signal > 30 ? '#facc15' : '#f87171'} size={20} />
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => {
                            fetch('/api/system/wifi/connect', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ssid: net.ssid })
                            }).catch(()=>{});
                          }}
                        >
                          <Text style={styles.actionButtonText}>Connect</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );

      case 'bluetooth':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bluetooth</Text>
              <Text style={styles.sectionSubtitle}>Manage wireless devices and connections.</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeader}>
                  <Bluetooth color="#60a5fa" size={32} />
                  <View style={{ marginLeft: 16 }}>
                    <Text style={styles.cardTitle}>Bluetooth</Text>
                    <Text style={styles.cardSubtitle}>{btData?.enabled ? 'Discoverable as "Arcadegamer254-PC"' : 'Disabled'}</Text>
                  </View>
                </View>
                <Switch 
                  value={btData?.enabled || false}
                  onValueChange={(enabled) => {
                    setBtData({ ...btData, enabled });
                    fetch('/api/system/bluetooth/toggle', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabled })
                    }).catch(()=>{});
                  }}
                  trackColor={{ false: '#4b5563', true: '#3b82f6' }}
                  thumbColor="#fff"
                />
              </View>
              
              {btData?.enabled && (
                <View style={styles.listContainer}>
                  <Text style={styles.listTitle}>Paired Devices</Text>
                  {btData?.devices?.map((dev: any) => (
                    <View key={dev.mac} style={styles.listItem}>
                      <View>
                        <Text style={styles.listItemTitle}>{dev.name}</Text>
                        <Text style={[styles.listItemSubtitle, { fontFamily: 'monospace' }]}>{dev.mac}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {
                          fetch('/api/system/bluetooth/connect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mac: dev.mac })
                          }).catch(()=>{});
                        }}
                      >
                        <Text style={styles.actionButtonText}>Connect</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );

      case 'power':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Power & Battery</Text>
              <Text style={styles.sectionSubtitle}>Monitor battery health and power usage.</Text>
            </View>
            <View style={styles.gridContainer}>
              <View style={[styles.card, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
                <Battery color="#4ade80" size={64} style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>{powerData?.capacity || '0'}%</Text>
                <Text style={{ color: '#9ca3af' }}>{powerData?.status || 'Unknown'}</Text>
              </View>
              <View style={{ gap: 24 }}>
                <View style={styles.card}>
                  <Text style={styles.inputLabel}>Battery Health</Text>
                  <Text style={{ fontSize: 24, fontWeight: '600', color: '#fff' }}>{powerData?.health || 'Unknown'}</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.inputLabel}>Power Mode</Text>
                  <View style={styles.inputField}>
                    <Text style={styles.inputText}>Balanced</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );

      case 'appearance':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <Text style={styles.sectionSubtitle}>Customize the look and feel of your system.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>System Theme</Text>
              <View style={styles.themeRow}>
                <View style={styles.themeInfo}>
                  <View style={[styles.themeIconContainer, persData?.theme === 'light' ? { backgroundColor: 'rgba(234, 179, 8, 0.2)' } : { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    {persData?.theme === 'light' ? <Sun color="#facc15" size={24} /> : <Moon color="#60a5fa" size={24} />}
                  </View>
                  <View style={{ marginLeft: 16 }}>
                    <Text style={styles.themeTitle}>{persData?.theme === 'light' ? 'Light Mode' : 'Dark Mode'}</Text>
                    <Text style={styles.themeSubtitle}>Switch between light and dark themes</Text>
                  </View>
                </View>
                <Switch 
                  value={persData?.theme === 'dark'}
                  onValueChange={() => updatePers({ theme: persData?.theme === 'light' ? 'dark' : 'light' })}
                  trackColor={{ false: '#4b5563', true: '#3b82f6' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>
        );

      case 'wallpaper':
        const wallpapers = [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop'
        ];
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wallpaper</Text>
              <Text style={styles.sectionSubtitle}>Choose your desktop background.</Text>
            </View>
            <View style={styles.wallpaperGrid}>
              {wallpapers.map((wp, i) => (
                <TouchableOpacity 
                  key={i}
                  onPress={() => updatePers({ wallpaper: wp })}
                  style={[styles.wallpaperItem, persData?.wallpaper === wp && styles.wallpaperItemSelected]}
                >
                  <Image source={{ uri: wp }} style={styles.wallpaperImage} />
                  {persData?.wallpaper === wp && (
                    <View style={styles.wallpaperCheck}>
                      <CheckCircle color="#fff" size={16} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'fonts':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fonts</Text>
              <Text style={styles.sectionSubtitle}>Configure system typography.</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Interface Font</Text>
                <View style={styles.inputField}>
                  <Text style={styles.inputText}>{persData?.font || 'Inter'}</Text>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Font Size ({persData?.fontSize || 14}px)</Text>
                <Slider 
                  value={persData?.fontSize || 14} 
                  min={12} 
                  max={24} 
                  onValueChange={(val) => updatePers({ fontSize: Math.round(val) })} 
                />
              </View>
            </View>
          </View>
        );

      case 'datetime':
      case 'region':
        const data = activeTab === 'datetime' ? dateTimeData : regionData;
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{activeTab === 'datetime' ? 'Date & Time' : 'Region & Language'}</Text>
              <Text style={styles.sectionSubtitle}>{activeTab === 'datetime' ? 'Configure system time and timezone.' : 'Configure system locale and keyboard layout.'}</Text>
            </View>
            <View style={styles.card}>
              {data?.error ? (
                <Text style={styles.errorText}>{data.error}</Text>
              ) : (
                <ScrollView style={styles.codeViewer}>
                  <Text style={styles.codeText}>{data?.raw || 'Loading...'}</Text>
                </ScrollView>
              )}
            </View>
          </View>
        );

      case 'defaultapps':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Default Apps</Text>
              <Text style={styles.sectionSubtitle}>Choose default applications for file types.</Text>
            </View>
            <View style={styles.card}>
              {defaultAppsData?.error ? (
                <Text style={styles.errorText}>{defaultAppsData.error}</Text>
              ) : (
                <View style={styles.formGroup}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Web Browser</Text>
                    <View style={styles.inputField}>
                      <Text style={styles.inputText}>{defaultAppsData?.browser || 'Not set'}</Text>
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>HTTP Handler</Text>
                    <View style={styles.inputField}>
                      <Text style={styles.inputText}>{defaultAppsData?.urlScheme || 'Not set'}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        );

      case 'startup':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Startup Apps</Text>
              <Text style={styles.sectionSubtitle}>Manage applications that start automatically.</Text>
            </View>
            <View style={styles.card}>
              {startupData?.error ? (
                <Text style={styles.errorText}>{startupData.error}</Text>
              ) : startupData?.apps?.length === 0 ? (
                <Text style={styles.emptyText}>No startup applications found.</Text>
              ) : (
                <View style={styles.listContainer}>
                  {startupData?.apps?.map((app: string, i: number) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.listItemTitle}>{app}</Text>
                      <Switch value={true} onValueChange={() => {}} trackColor={{ true: '#3b82f6' }} thumbColor="#fff" />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );

      case 'permissions':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>App Permissions</Text>
              <Text style={styles.sectionSubtitle}>Manage granular permissions for sandboxed apps.</Text>
            </View>
            <View style={styles.card}>
              {permissionsData?.error ? (
                <Text style={styles.errorText}>{permissionsData.error}</Text>
              ) : (
                <>
                  <Text style={{ color: '#60a5fa', fontSize: 14, marginBottom: 16 }}>{permissionsData?.note}</Text>
                  <View style={styles.listContainer}>
                    {permissionsData?.apps?.map((app: string, i: number) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={styles.listItemTitle}>{app}</Text>
                        <TouchableOpacity style={styles.actionButton}>
                          <Text style={styles.actionButtonText}>Manage</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        );

      case 'lockscreen':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lock Screen</Text>
              <Text style={styles.sectionSubtitle}>Configure screen lock and timeout.</Text>
            </View>
            <View style={styles.card}>
              <Text style={{ color: '#d1d5db', fontSize: 14, marginBottom: 16 }}>{lockScreenData?.status || 'Loading...'}</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Screen Timeout</Text>
                <View style={styles.inputField}>
                  <Text style={styles.inputText}>5 minutes</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'dock':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dock Settings</Text>
              <Text style={styles.sectionSubtitle}>Customize the system dock.</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dock Position</Text>
                <View style={styles.inputField}>
                  <Text style={styles.inputText}>{persData?.dockPosition || 'Bottom'}</Text>
                </View>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Auto-hide Dock</Text>
                <Switch 
                  value={persData?.dockAutoHide || false}
                  onValueChange={() => updatePers({ dockAutoHide: !persData?.dockAutoHide })}
                  trackColor={{ false: '#4b5563', true: '#3b82f6' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.emptyContainer}>
            <SettingsIcon color="rgba(255,255,255,0.2)" size={64} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Select a category from the sidebar</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.searchContainer}>
          <Search color="#9ca3af" size={16} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search settings..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.sidebarScroll}>
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>{section.title}</Text>
              <View style={styles.sidebarSectionItems}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setActiveTab(item.id)}
                      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                    >
                      <Icon color={isActive ? '#60a5fa' : '#9ca3af'} size={16} />
                      <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.mainScrollContent}>
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
}

// Helper for the default empty state icon
function SettingsIcon(props: any) {
  return <Info {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0f111a',
  },
  sidebar: {
    width: 288,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  searchContainer: {
    padding: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingLeft: 36,
    paddingRight: 16,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  sidebarScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sidebarSectionTitle: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sidebarSectionItems: {
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 12,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  sidebarItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
  },
  sidebarItemTextActive: {
    color: '#60a5fa',
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.1)', // blue-900/10
  },
  mainScrollContent: {
    padding: 32,
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  contentContainer: {
    gap: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#3b82f6', // simplified gradient
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  titleText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#93c5fd',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
  },
  gridItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  gridItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  gridItemValue: {
    fontSize: 14,
    color: '#d1d5db',
    fontFamily: 'monospace',
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    borderRadius: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  storageUsedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  storageUsedLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#6b7280',
  },
  storageFreeText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressBarContainer: {
    width: '100%',
    height: 16,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6', // purple-500
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6b7280',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formGroup: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
  },
  inputField: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputText: {
    color: '#fff',
    fontSize: 14,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderValueText: {
    color: '#fff',
    fontFamily: 'monospace',
    width: 32,
    textAlign: 'right',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#d1d5db',
  },
  listContainer: {
    gap: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    gap: 12,
  },
  errorBoxText: {
    color: '#f87171',
    fontSize: 14,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIconContainer: {
    padding: 12,
    borderRadius: 12,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  themeSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  wallpaperItem: {
    width: '48%',
    aspectRatio: 16/9,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  wallpaperItemSelected: {
    borderColor: '#3b82f6',
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
  },
  wallpaperCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 2,
  },
  codeViewer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
  },
  codeText: {
    color: '#d1d5db',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  sliderContainer: {
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
});
