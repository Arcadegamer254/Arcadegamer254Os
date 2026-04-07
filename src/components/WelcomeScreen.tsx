import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { ChevronRight, User, UserPlus, AlertCircle } from 'lucide-react';
import { playSound } from '../utils/sounds';

const { width, height } = Dimensions.get('window');

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<'loading' | 'setup' | 'login'>('loading');
  const [bootTime, setBootTime] = useState<string>('Calculating boot metrics...');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const initializeSystem = async () => {
      // 1. Fetch Boot Time
      try {
        const res = await fetch('/api/system/boot');
        const data = await res.json();
        setBootTime(data.bootTime || 'System Booted in: Unknown');
      } catch (e) {
        setBootTime('System Booted in: Unknown (Offline)');
      }

      // 2. Check Auth Status
      try {
        const res = await fetch('/api/system/auth/status');
        const data = await res.json();
        if (data.isSetup) {
          setUsername(data.username);
          setMode('login');
        } else {
          setMode('setup');
        }
      } catch (e) {
        setMode('setup');
      }
    };

    initializeSystem();
  }, []);

  const handleComplete = () => {
    playSound('startup');
    onComplete();
  };

  const handleSetup = async () => {
    setError('');
    if (!username || !password) return setError('All fields are required');
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/system/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setError(data.error || 'Setup failed');
      }
    } catch (e) {
      setError('Network error');
    }
    setIsAuthenticating(false);
  };

  const handleLogin = async () => {
    setError('');
    if (!password) return;
    
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/system/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        handleComplete();
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (e) {
      setError('Network error');
    }
    setIsAuthenticating(false);
  };

  if (mode === 'loading') {
    return <View style={[styles.container, { backgroundColor: '#030712' }]} />;
  }

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={[styles.bgCircle, styles.bgCircleBlue]} />
      <View style={[styles.bgCircle, styles.bgCirclePurple]} />

      <Animated.View 
        entering={SlideInDown.duration(800)}
        style={styles.contentContainer}
      >
        <Text style={styles.title}>Arcadegamer254 os</Text>
        
        <View style={styles.subtitleRow}>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>MADE BY ARCADEGAMER254</Text>
          <View style={styles.divider} />
        </View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.metricsBox}>
          <Text style={styles.metricsLabel}>SYSTEM METRICS</Text>
          <Text style={styles.metricsValue}>{bootTime}</Text>
        </Animated.View>

        {mode === 'setup' ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.card}>
            <View style={styles.iconContainer}>
              <UserPlus color="white" size={40} />
            </View>
            
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Set up your primary user account for Arcadegamer254 os.</Text>

            {error ? (
              <View style={styles.errorBox}>
                <AlertCircle color="#fca5a5" size={16} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
              <TouchableOpacity 
                style={[styles.button, isAuthenticating && styles.buttonDisabled]}
                onPress={handleSetup}
                disabled={isAuthenticating}
              >
                <Text style={styles.buttonText}>{isAuthenticating ? 'Creating...' : 'Create Account'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.card}>
            <View style={[styles.iconContainer, styles.iconContainerLogin]}>
              <User color="white" size={48} />
            </View>
            
            <Text style={styles.usernameText}>{username}</Text>

            {error ? (
              <View style={styles.errorBox}>
                <AlertCircle color="#fca5a5" size={16} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.loginForm}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={!password || isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ChevronRight color="white" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b', // indigo-950
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    width: 384,
    height: 384,
    borderRadius: 192,
    opacity: 0.2,
    // Note: blur requires specific RN implementations, using opacity for now
  },
  bgCircleBlue: {
    backgroundColor: '#3b82f6',
    top: '25%',
    left: '25%',
  },
  bgCirclePurple: {
    backgroundColor: '#a855f7',
    bottom: '25%',
    right: '25%',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 384,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  divider: {
    height: 1,
    width: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(191, 219, 254, 0.8)', // blue-200/80
    letterSpacing: 2,
  },
  metricsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  metricsLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricsValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#4ade80',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    padding: 32,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#22c55e', // green-500
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainerLogin: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2563eb', // blue-600
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 24,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#fecaca', // red-200
    fontSize: 14,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  loginForm: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    outlineWidth: 0,
  },
  button: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loginButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    bottom: 8,
    width: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
