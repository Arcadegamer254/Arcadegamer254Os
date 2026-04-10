import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Search, Download, Check, Trash2, ShoppingBag } from 'lucide-react-native';
import { getAppIcon, AIcon } from '../../utils/icons';

import { systemApi } from '../../services/system';
import { Platform } from 'react-native';

export function AppStore() {
  const [query, setQuery] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [installingPkg, setInstallingPkg] = useState<string | null>(null);
  const [uninstallingPkg, setUninstallingPkg] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        fetchSuggestions();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/packages/search?q=`);
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/packages/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const searchPackages = async () => {
    if (!query) {
      fetchSuggestions();
      return;
    }
    performSearch(query);
  };

  const installPackage = async (pkg: any) => {
    setInstallingPkg(pkg.name);
    try {
      const res = await fetch('/api/system/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkg: pkg.name, isWebApp: pkg.isWebApp })
      });
      const data = await res.json();
      if (!data.error) {
        setPackages(prev => prev.map(p => p.name === pkg.name ? { ...p, installed: true } : p));
        
        // Add to desktop
        try {
          const pers = await systemApi.getPersonalization();
          const desktopApps = pers.desktopApps || [];
          const appName = pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1);
          if (!desktopApps.find((a: any) => a.name === appName)) {
            const newApp = {
              name: appName,
              exec: pkg.isWebApp ? `web:${pkg.exec}` : pkg.name,
              icon: pkg.icon || 'box'
            };
            const newDesktopApps = [...desktopApps, newApp];
            await systemApi.updatePersonalization({ desktopApps: newDesktopApps });
            if (Platform.OS === 'web') {
              window.dispatchEvent(new Event('pers-updated'));
            }
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error(e);
    }
    setInstallingPkg(null);
  };

  const uninstallPackage = async (pkg: any) => {
    setUninstallingPkg(pkg.name);
    try {
      const res = await fetch('/api/system/packages/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkg: pkg.name, isWebApp: pkg.isWebApp })
      });
      const data = await res.json();
      if (!data.error) {
        setPackages(prev => prev.map(p => p.name === pkg.name ? { ...p, installed: false } : p));
        
        // Remove from desktop
        try {
          const pers = await systemApi.getPersonalization();
          const desktopApps = pers.desktopApps || [];
          const appName = pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1);
          const newDesktopApps = desktopApps.filter((a: any) => a.name !== appName);
          await systemApi.updatePersonalization({ desktopApps: newDesktopApps });
          if (Platform.OS === 'web') {
            window.dispatchEvent(new Event('pers-updated'));
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error(e);
    }
    setUninstallingPkg(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AIcon color="#3b82f6" size={28} />
        <Text style={styles.headerTitle}>App Store</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Search color="#9ca3af" size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchPackages}
            placeholder="Search App Store..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.centerContainer}>
              <ShoppingBag color="#374151" size={64} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>Search for native Linux applications to install.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {packages.map((pkg, i) => (
                <View key={i} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardHeader}>
                      <View style={styles.iconContainer}>
                        {getAppIcon(pkg)}
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>{pkg.name}</Text>
                    </View>
                    <Text style={styles.cardDescription} numberOfLines={2}>{pkg.description}</Text>
                    <View style={styles.versionBadge}>
                      <Text style={styles.versionText}>{pkg.version}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardBottom}>
                    {pkg.installed ? (
                      <View style={styles.actionRow}>
                        <View style={[styles.button, styles.installedButton]}>
                          <Check color="#4ade80" size={16} />
                          <Text style={styles.installedButtonText}>Installed</Text>
                        </View>
                        <TouchableOpacity 
                          style={[styles.button, styles.uninstallButton]}
                          onPress={() => uninstallPackage(pkg)}
                          disabled={uninstallingPkg !== null}
                        >
                          {uninstallingPkg === pkg.name ? (
                            <ActivityIndicator size="small" color="#f87171" />
                          ) : (
                            <Trash2 color="#f87171" size={16} />
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.button, styles.installButton, installingPkg !== null && styles.buttonDisabled]}
                        onPress={() => installPackage(pkg)}
                        disabled={installingPkg !== null}
                      >
                        {installingPkg === pkg.name ? (
                          <Text style={styles.installButtonText}>Installing...</Text>
                        ) : (
                          <>
                            <Download color="#ffffff" size={16} />
                            <Text style={styles.installButtonText}>Install</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712', // gray-950
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#111827', // gray-900
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937', // gray-800
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6', // gray-100
  },
  content: {
    flex: 1,
    padding: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 56,
    fontSize: 18,
    color: '#f3f4f6',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#6b7280', // gray-500
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    // For web, we'd use media queries, but in RN we might need to calculate width based on screen size.
    // For simplicity, we'll let flexWrap handle it if we set a minWidth or just use 100% for mobile.
    // Assuming desktop-like view, we can set a fixed width or flex basis.
    minWidth: 300,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dbeafe', // blue-100
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#9ca3af', // gray-400
    marginBottom: 8,
    height: 40, // approximate 2 lines
  },
  versionBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#d1d5db', // gray-300
  },
  cardBottom: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.5)', // gray-800/50
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  installedButton: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  installedButtonText: {
    color: '#4ade80',
    fontWeight: '500',
  },
  uninstallButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)', // red-600/20
  },
  installButton: {
    backgroundColor: '#2563eb', // blue-600
    width: '100%',
  },
  installButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
