import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from '../WebView';
import { Globe, Search, ArrowLeft, ArrowRight, RotateCw, Home, AlertTriangle, Shield, ShieldOff } from 'lucide-react';
import { getEmbedUrl } from '../../utils/url';

export function ArcadeBrowser({ initialUrl }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl || 'https://www.google.com/webhp?igu=1');
  const [inputUrl, setInputUrl] = useState(initialUrl || 'https://www.google.com');
  const [loading, setLoading] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [useAdblock, setUseAdblock] = useState(true);

  useEffect(() => {
    if (initialUrl) {
      handleNavigate(initialUrl, false, true);
    }
  }, [initialUrl]);

  const handleNavigate = (targetUrl?: string, forceProxy?: boolean, forceAdblock?: boolean) => {
    let finalUrl = (targetUrl || inputUrl).trim();
    
    // Check if it's a search query (no dot, or contains spaces)
    if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
    } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    
    const embedUrl = getEmbedUrl(finalUrl);
    const isEmbed = embedUrl !== finalUrl;
    
    const shouldProxy = forceProxy !== undefined ? forceProxy : useProxy;
    const shouldAdblock = forceAdblock !== undefined ? forceAdblock : useAdblock;
    
    let proxiedUrl = embedUrl;
    if (shouldProxy && !isEmbed) {
      proxiedUrl = `/api/proxy?url=${encodeURIComponent(embedUrl)}&adblock=${shouldAdblock}`;
    }
    
    setUrl(proxiedUrl);
    setInputUrl(finalUrl);
  };

  const toggleProxy = () => {
    const newProxyState = !useProxy;
    setUseProxy(newProxyState);
    handleNavigate(undefined, newProxyState, useAdblock);
  };

  const toggleAdblock = () => {
    const newAdblockState = !useAdblock;
    setUseAdblock(newAdblockState);
    handleNavigate(undefined, useProxy, newAdblockState);
  };

  return (
    <View style={styles.container}>
      {/* Browser Chrome */}
      <View style={styles.toolbar}>
        <View style={styles.navButtons}>
          <Pressable style={styles.iconButton}>
            {/* @ts-ignore */}
            <ArrowLeft size={16} color="#4b5563" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            {/* @ts-ignore */}
            <ArrowRight size={16} color="#4b5563" />
          </Pressable>
          <Pressable 
            style={styles.iconButton}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 500);
            }}
          >
            {/* @ts-ignore */}
            <RotateCw size={16} color="#4b5563" />
          </Pressable>
          <Pressable 
            style={styles.iconButton}
            onPress={() => {
              setUrl('https://www.google.com/webhp?igu=1');
              setInputUrl('https://www.google.com');
            }}
          >
            {/* @ts-ignore */}
            <Home size={16} color="#4b5563" />
          </Pressable>
        </View>

        <View style={styles.addressBar}>
          {/* @ts-ignore */}
          <Globe size={16} color="#9ca3af" style={styles.addressIcon} />
          <TextInput 
            style={styles.addressInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            onSubmitEditing={() => handleNavigate()}
            placeholder="Search or enter web address"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <Pressable
          onPress={toggleAdblock}
          style={[styles.iconButton, useAdblock ? styles.activeAdblock : null]}
        >
          {/* @ts-ignore */}
          <AlertTriangle size={16} color={useAdblock ? "#dc2626" : "#4b5563"} />
        </Pressable>

        <Pressable
          onPress={toggleProxy}
          style={[styles.iconButton, useProxy ? styles.activeProxy : null]}
        >
          {/* @ts-ignore */}
          {useProxy ? <ShieldOff size={16} color="#2563eb" /> : <Shield size={16} color="#4b5563" />}
        </Pressable>
      </View>

      {/* Browser Content */}
      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator color="#3b82f6" />
          </View>
        )}
        
        <WebView 
          source={{ uri: url }} 
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  navButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 9999,
    marginHorizontal: 2,
  },
  addressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addressIcon: {
    marginRight: 8,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0, // Remove default padding on Android
  },
  activeAdblock: {
    backgroundColor: '#fee2e2',
  },
  activeProxy: {
    backgroundColor: '#dbeafe',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
  }
});
