import React from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { getAppIcon } from '../utils/icons';
import { X } from 'lucide-react-native';

export interface AppType {
  name: string;
  exec: string;
  icon?: string;
}

interface AppIconProps {
  app: AppType;
  index: number;
  isDragged: boolean;
  isDragOver: boolean;
  onLaunch: (app: AppType) => void;
  onRemove: (e: GestureResponderEvent, app: AppType) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

export function AppIcon({
  app,
  index,
  isDragged,
  isDragOver,
  onLaunch,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}: AppIconProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: isDragged ? 0.5 : 1,
      backgroundColor: isDragOver ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    };
  });

  return (
    <View
      // @ts-ignore - Web specific drag events
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e: React.DragEvent<HTMLDivElement>) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e: React.DragEvent<HTMLDivElement>) => onDrop(e, index)}
      style={styles.containerWrapper}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => onLaunch(app)}
        style={styles.pressable}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.iconContainer}>
            {/* @ts-ignore - Lucide icons render as SVG on web */}
            {getAppIcon(app)}
          </View>
          <Text style={styles.text} numberOfLines={2}>
            {app.name}
          </Text>
          <Pressable
            onPress={(e) => onRemove(e, app)}
            style={styles.removeButton}
          >
            {/* @ts-ignore */}
            <X size={12} color="white" />
          </Pressable>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    width: 96,
    height: 96,
    margin: 8,
  },
  pressable: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    marginBottom: 8,
  },
  text: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
  }
});
