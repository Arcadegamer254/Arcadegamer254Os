import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Search, Download, Check, Package as PackageIcon } from 'lucide-react';

export function PackageManager() {
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [installedPackages, setInstalledPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [installingPkg, setInstallingPkg] = useState<string | null>(null);
  const [installLog, setInstallLog] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'installed') fetchInstalled();
  }, [activeTab]);

  const searchPackages = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/system/packages/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.packages || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchInstalled = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/packages/installed');
      const data = await res.json();
      setInstalledPackages(data.packages || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const installPackage = async (pkgName: string) => {
    setInstallingPkg(pkgName);
    setInstallLog(`Requesting polkit authorization to install ${pkgName}...\n`);
    try {
      const res = await fetch('/api/system/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkg: pkgName })
      });
      const data = await res.json();
      if (data.error) {
        setInstallLog(prev => prev + `\nError: ${data.error}`);
      } else {
        setInstallLog(prev => prev + `\nSuccess:\n${data.output}`);
        // Update search results to show as installed
        setSearchResults(prev => prev.map(p => p.name === pkgName ? { ...p, installed: true } : p));
      }
    } catch (e: any) {
      setInstallLog(prev => prev + `\nException: ${e.message}`);
    }
    setInstallingPkg(null);
  };

  return (
    <View style={styles.container}>
      {/* Header / Tabs */}
      <View style={styles.header}>
        <PackageIcon color="#3b82f6" size={24} />
        <Text style={styles.headerTitle}>Pacman GUI</Text>
        <TouchableOpacity 
          onPress={() => setActiveTab('search')}
          style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('installed')}
          style={[styles.tabButton, activeTab === 'installed' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === 'installed' && styles.activeTabText]}>Installed</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'search' && (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <Search color="#9ca3af" size={20} style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={searchPackages}
                placeholder="Search Arch Repositories (e.g., firefox, htop)..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <ScrollView style={styles.resultsList}>
              {loading ? (
                <Text style={styles.emptyText}>Searching...</Text>
              ) : searchResults.map((pkg, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{pkg.name}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{pkg.description}</Text>
                    <View style={styles.versionBadge}>
                      <Text style={styles.itemVersion}>{pkg.version}</Text>
                    </View>
                  </View>
                  
                  <View>
                    {pkg.installed ? (
                      <View style={styles.installedBadge}>
                        <Check color="#4ade80" size={16} />
                        <Text style={styles.installedText}>Installed</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.installButton, installingPkg !== null && styles.disabledButton]}
                        onPress={() => installPackage(pkg.name)}
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
            </ScrollView>

            {/* Install Log Terminal */}
            {installLog ? (
              <ScrollView style={styles.logContainer}>
                <Text style={styles.logText}>{installLog}</Text>
              </ScrollView>
            ) : null}
          </View>
        )}

        {activeTab === 'installed' && (
          <View style={styles.tabContent}>
            <Text style={styles.installedTitle}>Installed Packages ({installedPackages.length})</Text>
            <ScrollView style={styles.resultsList}>
              <View style={styles.grid}>
                {loading ? (
                  <Text style={styles.emptyText}>Loading installed packages...</Text>
                ) : installedPackages.map((pkg, i) => (
                  <View key={i} style={styles.installedItem}>
                    <Text style={styles.installedItemName} numberOfLines={1}>{pkg.name}</Text>
                    <Text style={styles.installedItemVersion}>{pkg.version}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
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
    paddingVertical: 16,
    backgroundColor: '#111827', // gray-900
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937', // gray-800
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginRight: 32,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#1f2937',
  },
  tabText: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
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
    outlineWidth: 0,
  },
  resultsList: {
    flex: 1,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dbeafe',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  versionBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  itemVersion: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#d1d5db',
  },
  installedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  installedText: {
    color: '#4ade80',
    fontWeight: '500',
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  installButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  logContainer: {
    height: 192,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#4ade80',
  },
  installedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  installedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    minWidth: 200,
  },
  installedItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f3f4f6',
    flex: 1,
    marginRight: 16,
  },
  installedItemVersion: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6b7280',
  },
});
