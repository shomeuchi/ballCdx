import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';

import { BiosShell } from './src/components/BiosShell';
import { LoginScreen } from './src/screens/LoginScreen';
import { ModuleScreen } from './src/screens/ModuleScreen';
import { styles } from './src/styles/biosStyles';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState('home');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveScreen('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveScreen('home');
  };

  return (
    <View style={styles.container}>
      <BiosShell
        activeScreen={activeScreen}
        isAuthenticated={isAuthenticated}
        onNavigate={setActiveScreen}
        onLogout={handleLogout}>
        {isAuthenticated ? (
          <ModuleScreen screenKey={activeScreen} />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </BiosShell>
      <StatusBar style="light" />
    </View>
  );
}
