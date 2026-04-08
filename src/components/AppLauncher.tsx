import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Dimensions, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Search, ChevronUp } from 'lucide-react-native';
import { useWindowManager } from '../contexts/WindowManagerContext';
import { getAppIcon } from '../utils/icons';
import { playSound } from '../utils/sounds';
import { getEmbedUrl } from '../utils/url';

const { width, height } = Dimensions.get('window');

export function AppLauncher({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [apps, setApps] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { openWindow } = useWindowManager();
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isOpen) {
      fetchApps();
      // Focus search bar when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearch('');
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
    playSound('click');
    if (app.exec.startsWith('internal:')) {
      const component = app.exec.split(':')[1];
      openWindow(component, app.name, component);
      onClose();
      return;
    }
    
    if (app.exec.startsWith('web:')) {
      const url = app.exec.split('web:')[1];
      const embedUrl = getEmbedUrl(url);
      openWindow(`webapp-${app.name}`, app.name, 'webapp', embedUrl);
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

  const filteredApps = apps.filter(app => {
    return app.name.toLowerCase().includes(search.toLowerCase()) || app.exec.toLowerCase().includes(search.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Chrome OS style full-screen blurred background */}
      <Animated.View 
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      
      <Animated.View 
        entering={SlideInDown.springify().damping(25).stiffness(300)}
        exiting={SlideOutDown.duration(200)}
        style={styles.launcherContainer}
      >
        {/* Search Bar Area */}
        <View style={styles.searchArea}>
          <View style={styles.searchContainer}>
            <Search color="#9ca3af" size={20} style={styles.searchIcon} />
            <TextInput 
              ref={searchInputRef}
              placeholder="Search your device, apps, web..." 
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Apps Grid */}
        <ScrollView style={styles.appsScroll} contentContainerStyle={styles.appsContent}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : filteredApps.length === 0 ? (
            <View style={styles.centerContainer}>
              <Search color="rgba(255,255,255,0.5)" size={48} style={{ marginBottom: 16 }} />
              <Text style={styles.noAppsText}>No apps found for "{search}"</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredApps.map((app, i) => (
                <Animated.View 
                  key={i}
                  entering={ZoomIn.delay(i * 10)}
                  style={styles.appItemContainer}
                >
                  <TouchableOpacity
                    onPress={() => launchApp(app)}
                    style={styles.appItem}
                  >
                    <View style={styles.appIconContainer}>
                      {getAppIcon(app)}
                    </View>
                    <Text style={styles.appName} numberOfLines={2}>
                      {app.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
        
        {/* Bottom Chevron (Chrome OS style) */}
        <TouchableOpacity style={styles.bottomChevron} onPress={onClose}>
          <ChevronUp color="#9ca3af" size={20} />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 40,
  },
  launcherContainer: {
    position: 'absolute',
    zIndex: 45,
    left: '50%',
    bottom: 80,
    transform: [{ translateX: -Math.min(width * 0.9, 672) / 2 }],
    width: '90%',
    maxWidth: 672,
    height: height * 0.6,
    maxHeight: 500,
    backgroundColor: 'rgba(17, 24, 39, 0.8)', // gray-900/80
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  searchArea: {
    padding: 24,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 9999,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  appsScroll: {
    flex: 1,
  },
  appsContent: {
    padding: 24,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noAppsText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  appItemContainer: {
    width: 80,
    marginBottom: 8,
  },
  appItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    borderRadius: 16,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 12,
    color: '#e5e7eb',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomChevron: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
});
