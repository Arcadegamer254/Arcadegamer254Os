import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useOSStore, WindowState } from '../store/osStore';
import { X, Square, Minus } from 'lucide-react-native';

const DOCK_HEIGHT = 60; // approximate

export function Window({ window, children, index = 0, totalWindows = 1 }: { window: WindowState, children: React.ReactNode, key?: React.Key, index?: number, totalWindows?: number }) {
  const { closeWindow, focusWindow, updateWindow, minimizeWindow, toggleMaximize, overviewMode, setOverviewMode } = useOSStore();

  const translateX = useSharedValue(window.x);
  const translateY = useSharedValue(window.y);
  const width = useSharedValue(window.width);
  const height = useSharedValue(window.height);
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  // Sync state to shared values
  useEffect(() => {
    if (window.status === 'minimized') return;

    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

    if (overviewMode) {
      const cols = Math.ceil(Math.sqrt(totalWindows));
      const rows = Math.ceil(totalWindows / cols);
      const padding = 40;
      const screenW = SCREEN_WIDTH;
      const screenH = SCREEN_HEIGHT - DOCK_HEIGHT;
      
      const cellW = (screenW - padding * (cols + 1)) / cols;
      const cellH = (screenH - padding * (rows + 1)) / rows;
      
      const targetScale = Math.min(cellW / window.width, cellH / window.height, 0.8);
      const scaledW = window.width * targetScale;
      const scaledH = window.height * targetScale;
      
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const targetX = padding + col * (cellW + padding) + (cellW - scaledW) / 2;
      const targetY = padding + row * (cellH + padding) + (cellH - scaledH) / 2;

      translateX.value = withSpring(targetX, { stiffness: 300, damping: 30 });
      translateY.value = withSpring(targetY, { stiffness: 300, damping: 30 });
      width.value = withSpring(window.width, { stiffness: 300, damping: 30 });
      height.value = withSpring(window.height, { stiffness: 300, damping: 30 });
      scale.value = withSpring(targetScale, { stiffness: 300, damping: 30 });
      opacity.value = withSpring(1);
    } else if (window.status === 'maximized') {
      translateX.value = withSpring(0, { stiffness: 300, damping: 30 });
      translateY.value = withSpring(0, { stiffness: 300, damping: 30 });
      width.value = withSpring(SCREEN_WIDTH, { stiffness: 300, damping: 30 });
      height.value = withSpring(SCREEN_HEIGHT - DOCK_HEIGHT, { stiffness: 300, damping: 30 });
      scale.value = withSpring(1, { stiffness: 300, damping: 30 });
      opacity.value = withSpring(1);
    } else if (window.status === 'snapped-left') {
      translateX.value = withSpring(0, { stiffness: 300, damping: 30 });
      translateY.value = withSpring(0, { stiffness: 300, damping: 30 });
      width.value = withSpring(SCREEN_WIDTH / 2, { stiffness: 300, damping: 30 });
      height.value = withSpring(SCREEN_HEIGHT - DOCK_HEIGHT, { stiffness: 300, damping: 30 });
      scale.value = withSpring(1, { stiffness: 300, damping: 30 });
      opacity.value = withSpring(1);
    } else if (window.status === 'snapped-right') {
      translateX.value = withSpring(SCREEN_WIDTH / 2, { stiffness: 300, damping: 30 });
      translateY.value = withSpring(0, { stiffness: 300, damping: 30 });
      width.value = withSpring(SCREEN_WIDTH / 2, { stiffness: 300, damping: 30 });
      height.value = withSpring(SCREEN_HEIGHT - DOCK_HEIGHT, { stiffness: 300, damping: 30 });
      scale.value = withSpring(1, { stiffness: 300, damping: 30 });
      opacity.value = withSpring(1);
    } else {
      translateX.value = withSpring(window.x, { stiffness: 300, damping: 30 });
      translateY.value = withSpring(window.y, { stiffness: 300, damping: 30 });
      width.value = withSpring(window.width, { stiffness: 300, damping: 30 });
      height.value = withSpring(window.height, { stiffness: 300, damping: 30 });
      scale.value = withSpring(1, { stiffness: 300, damping: 30 });
      opacity.value = withSpring(1);
    }
  }, [window.status, window.x, window.y, window.width, window.height, overviewMode, index, totalWindows]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ] as any,
      width: width.value,
      height: height.value,
      opacity: opacity.value,
      zIndex: overviewMode ? 100 : window.zIndex,
    };
  });

  const handleSnap = (x: number, y: number) => {
    const snapThreshold = 20;
    const screenW = Dimensions.get('window').width;
    
    let newStatus = 'normal';
    if (x <= snapThreshold) newStatus = 'snapped-left';
    else if (x + window.width >= screenW - snapThreshold && x > screenW / 2) newStatus = 'snapped-right';
    else if (y <= snapThreshold) newStatus = 'maximized';

    if (newStatus !== 'normal') {
       updateWindow(window.id, { status: newStatus as any, previousState: { x, y, width: window.width, height: window.height } });
    } else {
       updateWindow(window.id, { x, y });
    }
  };

  const startDragX = useSharedValue(0);
  const startDragY = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .enabled(!overviewMode)
    .onStart(() => {
      runOnJS(focusWindow)(window.id);
      startDragX.value = translateX.value;
      startDragY.value = translateY.value;
      if (window.status !== 'normal') {
        const prev = window.previousState || { x: 100, y: 100, width: 800, height: 600 };
        runOnJS(updateWindow)(window.id, { status: 'normal', x: prev.x, y: prev.y, width: prev.width, height: prev.height });
      }
    })
    .onUpdate((e) => {
      if (window.status === 'normal') {
        translateX.value = startDragX.value + e.translationX;
        translateY.value = startDragY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (window.status === 'normal') {
        runOnJS(handleSnap)(translateX.value, translateY.value);
      }
    });

  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);

  const resizeGesture = Gesture.Pan()
    .enabled(!overviewMode && window.status === 'normal')
    .onStart(() => {
      runOnJS(focusWindow)(window.id);
      startWidth.value = width.value;
      startHeight.value = height.value;
    })
    .onUpdate((e) => {
      if (window.status === 'normal') {
        width.value = Math.max(300, startWidth.value + e.translationX);
        height.value = Math.max(200, startHeight.value + e.translationY);
      }
    })
    .onEnd(() => {
      if (window.status === 'normal') {
        runOnJS(updateWindow)(window.id, { width: width.value, height: height.value });
      }
    });

  if (window.status === 'minimized') return null;

  return (
    <Animated.View
      style={[styles.windowContainer, animatedStyle]}
      pointerEvents={overviewMode ? 'auto' : 'box-none'}
    >
      <View 
        style={[styles.windowInner, overviewMode && styles.overviewHover]}
        onPointerDown={() => {
          if (overviewMode) {
            setOverviewMode(false);
            focusWindow(window.id);
          } else {
            focusWindow(window.id);
          }
        }}
      >
        <GestureDetector gesture={dragGesture}>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>{window.title}</Text>
            <View style={styles.controls}>
              <Pressable onPress={() => minimizeWindow(window.id)} style={styles.controlBtn}>
                {/* @ts-ignore */}
                <Minus size={16} color="#9ca3af" />
              </Pressable>
              <Pressable onPress={() => toggleMaximize(window.id)} style={styles.controlBtn}>
                {/* @ts-ignore */}
                <Square size={16} color="#9ca3af" />
              </Pressable>
              <Pressable onPress={() => closeWindow(window.id)} style={styles.controlBtnClose}>
                {/* @ts-ignore */}
                <X size={20} color="#9ca3af" />
              </Pressable>
            </View>
          </View>
        </GestureDetector>
        
        <View style={styles.content} pointerEvents={overviewMode ? 'none' : 'auto'}>
          {children}
        </View>

        {/* Resize Handle */}
        {window.status === 'normal' && !overviewMode && (
          <GestureDetector gesture={resizeGesture}>
            <View style={styles.resizeHandle} />
          </GestureDetector>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  windowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  windowInner: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
    borderColor: '#374151', // gray-700
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 24,
  },
  overviewHover: {
    borderColor: '#3b82f6', // blue-500
    borderWidth: 2,
  },
  titleBar: {
    height: 40,
    backgroundColor: '#1f2937', // gray-800
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151', // gray-700
    // @ts-ignore
    cursor: 'grab', // Web specific
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb', // gray-200
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlBtn: {
    padding: 4,
  },
  controlBtnClose: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#030712', // gray-950
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
    // @ts-ignore
    cursor: 'nwse-resize',
    zIndex: 10,
  }
});
