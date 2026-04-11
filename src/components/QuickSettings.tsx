import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Pressable, PanResponder } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { Wifi, WifiOff, Bluetooth, BluetoothOff, Battery, ChevronLeft, ChevronRight, Settings as SettingsIcon, Volume2, VolumeX } from 'lucide-react-native';
import { useWindowManager } from '../contexts/WindowManagerContext';

const { width, height } = Dimensions.get('window');

// Simple Slider Component
const Slider = ({ value, onValueChange }: { value: number, onValueChange: (val: number) => void }) => {
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
    let newValue = (x / sliderWidth) * 100;
    newValue = Math.max(0, Math.min(100, newValue));
    onValueChange(newValue);
  };

  return (
    <View 
      style={styles.sliderContainer} 
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${value}%` }]} />
      </View>
    </View>
  );
};

export function QuickSettings({ isOpen, onClose, position }: { isOpen: boolean, onClose: () => void, position: string }) {
  const { openWindow } = useWindowManager();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [battery, setBattery] = useState<any>(null);
  const [wifiNetworks, setWifiNetworks] = useState<any[]>([]);
  const [bluetooth, setBluetooth] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);
  
  const [wifiEnabled, setWifiEnabled] = useState(false);
  const [btEnabled, setBtEnabled] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    // Fetch system states when opened
    fetch('/api/system/battery').then(r => r.json()).then(d => !d.error && setBattery(d)).catch(() => {});
    fetch('/api/system/wifi').then(r => r.json()).then(d => {
      if (!d.error) {
        setWifiNetworks(d.networks || []);
        setWifiEnabled(d.enabled);
      } else {
        setWifiEnabled(false);
      }
    }).catch(() => setWifiEnabled(false));
    
    fetch('/api/system/bluetooth').then(r => r.json()).then(d => {
      if (!d.error) {
        setBluetooth(d);
        setBtEnabled(d.enabled);
      } else {
        setBtEnabled(false);
      }
    }).catch(() => setBtEnabled(false));
    
    fetch('/api/system/audio').then(r => r.json()).then(d => !d.error && setAudio(d)).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const renderCalendar = () => {
    const startDate = startOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(startDate, i));
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarMonth}>{format(currentDate, 'MMMM yyyy')}</Text>
          <View style={styles.calendarNav}>
            <TouchableOpacity onPress={() => setCurrentDate(subWeeks(currentDate, 4))} style={styles.navButton}>
              <ChevronLeft color="#f3f4f6" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentDate(addWeeks(currentDate, 4))} style={styles.navButton}>
              <ChevronRight color="#f3f4f6" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.daysHeader}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <Text key={d} style={styles.dayHeaderText}>{d}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            return (
              <View key={i} style={styles.dayCell}>
                <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                  <Text style={[
                    styles.dayText, 
                    isToday ? styles.todayText : isCurrentMonth ? styles.currentMonthText : styles.otherMonthText
                  ]}>
                    {format(day, 'd')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'Top': return { top: 64, right: 16 };
      case 'Left': return { bottom: 16, left: 80 };
      case 'Right': return { bottom: 16, right: 80 };
      case 'Bottom': default: return { bottom: 64, right: 16 };
    }
  };

  const toggleWifi = async () => {
    const newState = !wifiEnabled;
    setWifiEnabled(newState);
    try {
      await fetch('/api/system/wifi/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });
    } catch (e) {
      setWifiEnabled(!newState);
    }
  };

  const toggleBluetooth = async () => {
    const newState = !btEnabled;
    setBtEnabled(newState);
    try {
      await fetch('/api/system/bluetooth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });
    } catch (e) {
      setBtEnabled(!newState);
    }
  };

  const changeVolume = async (volume: number) => {
    setAudio({ ...audio, volume });
    try {
      await fetch('/api/system/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume })
      });
    } catch (err) {}
  };

  return (
    <>
      <View 
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>
      
      <View 
        style={[styles.panel, getPositionStyle()]}
      >
        {/* Header / Date */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{format(new Date(), 'EEEE, MMM d')}</Text>
          <TouchableOpacity 
            onPress={() => { onClose(); openWindow('settings', 'System Settings', 'settings'); }}
            style={styles.settingsButton}
          >
            <SettingsIcon color="#d1d5db" size={16} />
          </TouchableOpacity>
        </View>

        {/* Quick Toggles */}
        <View style={styles.togglesGrid}>
          <TouchableOpacity 
            style={[styles.toggleButton, wifiEnabled ? styles.toggleActive : styles.toggleInactive]}
            onPress={toggleWifi}
          >
            <View style={[styles.iconCircle, wifiEnabled ? styles.iconCircleActive : styles.iconCircleInactive]}>
              {wifiEnabled ? <Wifi color="#ffffff" size={16} /> : <WifiOff color="#ffffff" size={16} />}
            </View>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Wi-Fi</Text>
              <Text style={styles.toggleSubtitle} numberOfLines={1}>
                {wifiEnabled ? (wifiNetworks[0]?.ssid || 'On') : 'Off'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleButton, btEnabled ? styles.toggleActive : styles.toggleInactive]}
            onPress={toggleBluetooth}
          >
            <View style={[styles.iconCircle, btEnabled ? styles.iconCircleActive : styles.iconCircleInactive]}>
              {btEnabled ? <Bluetooth color="#ffffff" size={16} /> : <BluetoothOff color="#ffffff" size={16} />}
            </View>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Bluetooth</Text>
              <Text style={styles.toggleSubtitle} numberOfLines={1}>
                {btEnabled ? (bluetooth?.devices?.find((d:any) => d.connected)?.name || 'On') : 'Off'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sliders */}
        <View style={styles.slidersContainer}>
          <View style={styles.sliderRow}>
            <View style={styles.sliderIcon}>
              {audio?.muted ? <VolumeX color="#9ca3af" size={16} /> : <Volume2 color="#d1d5db" size={16} />}
            </View>
            <Slider value={audio?.volume || 0} onValueChange={changeVolume} />
          </View>
          <View style={styles.sliderRow}>
            <View style={styles.sliderIcon}>
              <Battery color="#d1d5db" size={16} />
            </View>
            <View style={styles.batteryTrack}>
              <View style={[styles.batteryFill, { width: `${battery?.capacity || 100}%` }]} />
            </View>
            <Text style={styles.batteryText}>{battery?.capacity || 100}%</Text>
          </View>
        </View>

        {/* Calendar */}
        {renderCalendar()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  panel: {
    position: 'absolute',
    zIndex: 50,
    width: 320,
    backgroundColor: 'rgba(17, 24, 39, 0.9)', // gray-900/90
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f3f4f6',
  },
  settingsButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  togglesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  toggleActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500/20
  },
  toggleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconCircle: {
    padding: 8,
    borderRadius: 16,
  },
  iconCircleActive: {
    backgroundColor: '#3b82f6', // blue-500
  },
  iconCircleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f3f4f6',
  },
  toggleSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
  },
  slidersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 16,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderIcon: {
    width: 24,
    alignItems: 'center',
  },
  sliderContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#60a5fa', // blue-400
  },
  batteryTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
  },
  batteryText: {
    fontSize: 10,
    color: '#9ca3af',
    width: 24,
    textAlign: 'right',
  },
  calendarContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // gray-800/50
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayCircle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  todayCircle: {
    backgroundColor: '#3b82f6',
  },
  dayText: {
    fontSize: 14,
  },
  todayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  currentMonthText: {
    color: '#e5e7eb',
  },
  otherMonthText: {
    color: '#4b5563',
  },
});
