import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Activity, Cpu, HardDrive } from 'lucide-react';

export function SystemMonitor() {
  const [cpu, setCpu] = useState(0);
  const [ram, setRam] = useState(0);
  const [memTotal, setMemTotal] = useState(0);
  const [memAvail, setMemAvail] = useState(0);

  useEffect(() => {
    const fetchMonitor = async () => {
      try {
        const res = await fetch('/api/system/monitor');
        const data = await res.json();
        if (data.cpu !== undefined) setCpu(data.cpu);
        if (data.ram !== undefined) setRam(data.ram);
        if (data.memTotal !== undefined) setMemTotal(data.memTotal);
        if (data.memAvail !== undefined) setMemAvail(data.memAvail);
      } catch (e) {
        console.error("Failed to fetch system monitor data", e);
      }
    };

    fetchMonitor();
    const interval = setInterval(fetchMonitor, 1000);
    return () => clearInterval(interval);
  }, []);

  const memUsed = memTotal - memAvail;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Activity color="#4ade80" size={28} />
        <Text style={styles.title}>System Monitor</Text>
      </View>

      <View style={styles.grid}>
        {/* CPU Monitor */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Cpu color="#60a5fa" size={24} />
              <Text style={styles.cardTitle}>CPU Usage</Text>
            </View>
            <Text style={[styles.percentage, { color: '#60a5fa' }]}>{cpu.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.barContainer}>
            <View style={[styles.bar, { backgroundColor: '#3b82f6', width: `${cpu}%` }]} />
          </View>
          
          <Text style={styles.footerText}>Reading from /proc/stat</Text>
        </View>

        {/* RAM Monitor */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <HardDrive color="#c084fc" size={24} />
              <Text style={styles.cardTitle}>RAM Usage</Text>
            </View>
            <Text style={[styles.percentage, { color: '#c084fc' }]}>{ram.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.barContainer}>
            <View style={[styles.bar, { backgroundColor: '#a855f7', width: `${ram}%` }]} />
          </View>
          
          <View style={styles.ramDetails}>
            <Text style={styles.footerText}>Used: {(memUsed / 1024).toFixed(1)} MB</Text>
            <Text style={styles.footerText}>Total: {(memTotal / 1024).toFixed(1)} MB</Text>
          </View>
          <Text style={[styles.footerText, { marginTop: 8 }]}>Reading from /proc/meminfo</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712', // gray-950
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f3f4f6', // gray-100
  },
  grid: {
    gap: 24,
  },
  card: {
    backgroundColor: '#111827', // gray-900
    borderColor: '#1f2937', // gray-800
    borderWidth: 1,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  percentage: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  barContainer: {
    width: '100%',
    backgroundColor: '#1f2937', // gray-800
    borderRadius: 9999,
    height: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    height: '100%',
  },
  ramDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280', // gray-500
    fontFamily: 'monospace',
  },
});
