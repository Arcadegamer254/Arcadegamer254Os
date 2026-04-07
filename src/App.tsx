import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Desktop } from './components/Desktop';

export default function App() {
  const [booting, setBooting] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {booting && <WelcomeScreen onComplete={() => setBooting(false)} />}
      {!booting && <Desktop />}
    </GestureHandlerRootView>
  );
}
