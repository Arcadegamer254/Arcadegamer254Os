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

  return null; // Native webview disabled for now
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
