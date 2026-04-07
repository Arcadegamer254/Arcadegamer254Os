import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

interface WebViewProps {
  source: { uri: string };
  style?: any;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

export function WebView({ source, style, onLoadStart, onLoadEnd }: WebViewProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          src={source.uri}
          style={{ width: '100%', height: '100%', borderWidth: 0 }}
          onLoad={() => {
            if (onLoadEnd) onLoadEnd();
          }}
          // @ts-ignore
          onLoadStart={() => {
            if (onLoadStart) onLoadStart();
          }}
          allow="camera; microphone; geolocation; display-capture"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </View>
    );
  }

  // Use require to avoid web bundler issues with native modules
  const RNWebView = require('react-native-webview').WebView;
  return (
    <RNWebView
      source={source}
      style={style}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
