import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInDown, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(200, { duration: 1500, easing: Easing.inOut(Easing.ease) });
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progressWidth.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn.duration(800)}
        style={styles.content}
      >
        <Text style={styles.title}>Arcadegamer254 os</Text>
        
        <Animated.View 
          entering={SlideInDown.delay(600).duration(500)}
          style={styles.subtitleRow}
        >
          <View style={styles.divider} />
          <Text style={styles.subtitle}>MADE BY ARCADEGAMER254</Text>
          <View style={styles.divider} />
        </Animated.View>

        <Animated.View style={[styles.progressBar, progressStyle]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#312e81', // indigo-900
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    height: 1,
    width: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#bfdbfe', // blue-200
    letterSpacing: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#60a5fa', // blue-400
    marginTop: 48,
    borderRadius: 2,
  }
});
