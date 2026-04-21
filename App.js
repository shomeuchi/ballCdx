import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';

import { BiosShell } from './src/components/BiosShell';
import {
  GamesScreen,
  HomeScreen,
  LoginScreen,
  PlayersScreen,
  PredictionScreen,
  SettingsScreen,
  StatsScreen,
} from './src/screens';
import { styles } from './src/styles/biosStyles';

const screenComponents = {
  games: GamesScreen,
  home: HomeScreen,
  players: PlayersScreen,
  prediction: PredictionScreen,
  settings: SettingsScreen,
  stats: StatsScreen,
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState('home');
  const ActiveScreen = screenComponents[activeScreen] ?? HomeScreen;

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
          <ActiveScreen />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </BiosShell>
      <StatusBar style="light" />
    </View>
  );
}
