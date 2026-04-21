import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const theme = {
  colors: {
    blue950: '#00004f',
    blue900: '#000080',
    blue800: '#0018a8',
    blue700: '#0030c0',
    cyan: '#00ffff',
    white: '#f8fbff',
    gray: '#b8c7ff',
    yellow: '#ffff66',
    red: '#ff6b6b',
  },
  font: {
    family: 'monospace',
  },
};

const credentials = {
  username: 'gli',
  password: '1',
};

const screens = {
  home: {
    title: 'Home',
    summary: 'Command center',
    rows: [
      ['Active module', 'Dashboard'],
      ['Data link', 'Local preview'],
      ['Session', 'Authenticated'],
      ['System mode', 'Development'],
    ],
    copy:
      'Select a module below to review basketball operations, player records, statistics, prediction tools, and app preferences.',
  },
  games: {
    title: 'Games',
    summary: 'Schedule matrix',
    rows: [
      ['Tonight', '3 matchups'],
      ['Next tipoff', '19:30'],
      ['Court status', 'Open'],
      ['Sync', 'Manual'],
    ],
    copy:
      'Track fixtures, final scores, venues, and live game readiness from this BIOS-style schedule panel.',
  },
  players: {
    title: 'Players',
    summary: 'Roster registry',
    rows: [
      ['Roster size', '12 players'],
      ['Available', '10 active'],
      ['Injured', '1 listed'],
      ['Scouting', 'Enabled'],
    ],
    copy:
      'Review player profiles, positions, form indicators, availability, and scouting notes in one consistent interface.',
  },
  stats: {
    title: 'Stats',
    summary: 'Performance table',
    rows: [
      ['Team pace', 'High'],
      ['FG trend', '+4.2%'],
      ['Rebounds', 'Stable'],
      ['Turnovers', 'Watch'],
    ],
    copy:
      'Inspect team and player metrics with compact rows designed for quick comparison during analysis.',
  },
  prediction: {
    title: 'Prediction',
    summary: 'Forecast engine',
    rows: [
      ['Model status', 'Standby'],
      ['Confidence', 'Pending'],
      ['Inputs', 'Awaiting data'],
      ['Output', 'No pick yet'],
    ],
    copy:
      'Prepare prediction inputs, compare matchup signals, and surface model decisions once real data is connected.',
  },
  settings: {
    title: 'Settings',
    summary: 'System options',
    rows: [
      ['Theme', 'BIOS blue'],
      ['Network', 'LAN'],
      ['Expo Go', '54.0.6'],
      ['Build', '1.0.0'],
    ],
    copy:
      'Tune app preferences, preview runtime status, and keep environment details visible while the product grows.',
  },
};

const navItems = [
  ['home', 'Home'],
  ['games', 'Games'],
  ['players', 'Players'],
  ['stats', 'Stats'],
  ['prediction', 'Predict'],
  ['settings', 'Settings'],
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState('home');

  return (
    <View style={styles.container}>
      <BiosShell
        activeScreen={activeScreen}
        isAuthenticated={isAuthenticated}
        onNavigate={setActiveScreen}
        onLogout={() => {
          setIsAuthenticated(false);
          setActiveScreen('home');
        }}>
        {isAuthenticated ? (
          <ModuleScreen screenKey={activeScreen} />
        ) : (
          <LoginScreen
            onLogin={() => {
              setIsAuthenticated(true);
              setActiveScreen('home');
            }}
          />
        )}
      </BiosShell>
      <StatusBar style="light" />
    </View>
  );
}

function BiosShell({
  activeScreen,
  children,
  isAuthenticated,
  onLogout,
  onNavigate,
}) {
  const activeTitle = isAuthenticated ? screens[activeScreen].title : 'Login';

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>BALLCDX SETUP UTILITY</Text>
        <Text style={styles.headerMeta}>ACTIVE: {activeTitle.toUpperCase()}</Text>
      </View>

      <View style={styles.frame}>
        {isAuthenticated && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.menuBar}
            contentContainerStyle={styles.menuBarContent}>
            {navItems.map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => onNavigate(key)}
                style={[
                  styles.menuButton,
                  activeScreen === key && styles.menuButtonActive,
                ]}>
                <Text
                  style={[
                    styles.menuText,
                    activeScreen === key && styles.menuTextActive,
                  ]}>
                  {label}
                </Text>
              </Pressable>
            ))}

            <Pressable style={styles.menuButton} onPress={onLogout}>
              <Text style={styles.menuText}>Logout</Text>
            </Pressable>
          </ScrollView>
        )}

        {children}
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>AMIBIOS STYLE MOBILE PREVIEW</Text>
        <Text style={styles.bottomText}>
          {isAuthenticated ? 'SESSION: GLI' : 'AUTH REQUIRED'}
        </Text>
      </View>
    </View>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password);
  const [error, setError] = useState('');

  const submit = () => {
    if (
      username.trim().toLowerCase() === credentials.username &&
      password === credentials.password
    ) {
      setError('');
      onLogin();
      return;
    }

    setError('ACCESS DENIED: INVALID USERNAME OR PASSWORD');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>SECURITY CHECKPOINT</Text>
        <Text style={styles.prompt}>Operator login</Text>
        <Text style={styles.copy}>
          Enter authorized credentials to unlock the ballCdx modules.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            cursorColor={theme.colors.yellow}
            onChangeText={setUsername}
            placeholder="gli"
            placeholderTextColor={theme.colors.gray}
            style={styles.input}
            value={username}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput
            cursorColor={theme.colors.yellow}
            onChangeText={setPassword}
            onSubmitEditing={submit}
            placeholder="1"
            placeholderTextColor={theme.colors.gray}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>ENTER</Text>
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  );
}

function ModuleScreen({ screenKey }) {
  const screen = screens[screenKey];

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>{screen.title.toUpperCase()}</Text>
        <Text style={styles.prompt}>{screen.summary}</Text>
        <Text style={styles.copy}>{screen.copy}</Text>

        <View style={styles.divider} />

        {screen.rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </View>

      <View style={styles.helpPanel}>
        <Text style={styles.helpTitle}>MODULE STATUS</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>CURRENT MODULE</Text>
          <Text style={styles.statusValue}>{screen.title.toUpperCase()}</Text>
        </View>
        <Text style={styles.footerHint}>Tap menu entries to switch screens.</Text>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.blue900,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.blue900,
    paddingBottom: 18,
    paddingHorizontal: 12,
    paddingTop: 52,
  },
  headerBar: {
    alignItems: 'center',
    backgroundColor: theme.colors.gray,
    borderColor: theme.colors.white,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: theme.colors.blue900,
    fontFamily: theme.font.family,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerMeta: {
    color: theme.colors.blue900,
    fontFamily: theme.font.family,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  frame: {
    backgroundColor: theme.colors.blue800,
    borderColor: theme.colors.white,
    borderTopWidth: 0,
    borderWidth: 2,
    flex: 1,
  },
  menuBar: {
    backgroundColor: theme.colors.blue700,
    borderBottomColor: theme.colors.white,
    borderBottomWidth: 2,
    flexGrow: 0,
    minHeight: 42,
  },
  menuBarContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  menuButton: {
    borderColor: theme.colors.blue700,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  menuButtonActive: {
    backgroundColor: theme.colors.gray,
    borderColor: theme.colors.white,
  },
  menuText: {
    color: theme.colors.gray,
    fontFamily: theme.font.family,
    fontSize: 13,
    fontWeight: '700',
  },
  menuTextActive: {
    color: theme.colors.blue900,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  contentBody: {
    flexGrow: 1,
  },
  panel: {
    backgroundColor: theme.colors.blue900,
    borderColor: theme.colors.gray,
    borderWidth: 2,
    padding: 12,
  },
  helpPanel: {
    backgroundColor: theme.colors.blue800,
    borderColor: theme.colors.gray,
    borderTopWidth: 0,
    borderWidth: 2,
    flex: 1,
    padding: 12,
  },
  sectionTitle: {
    color: theme.colors.yellow,
    fontFamily: theme.font.family,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  prompt: {
    color: theme.colors.cyan,
    fontFamily: theme.font.family,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    textTransform: 'uppercase',
  },
  copy: {
    color: theme.colors.white,
    fontFamily: theme.font.family,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  formGroup: {
    marginTop: 18,
  },
  inputLabel: {
    color: theme.colors.yellow,
    fontFamily: theme.font.family,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.blue950,
    borderColor: theme.colors.cyan,
    borderWidth: 2,
    color: theme.colors.white,
    fontFamily: theme.font.family,
    fontSize: 18,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  errorText: {
    color: theme.colors.red,
    fontFamily: theme.font.family,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 18,
    marginTop: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.gray,
    borderColor: theme.colors.white,
    borderWidth: 2,
    marginTop: 20,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: theme.colors.blue900,
    fontFamily: theme.font.family,
    fontSize: 15,
    fontWeight: '900',
  },
  infoRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.blue700,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  infoLabel: {
    color: theme.colors.gray,
    flex: 1,
    fontFamily: theme.font.family,
    fontSize: 13,
    fontWeight: '700',
    paddingRight: 8,
  },
  infoValue: {
    color: theme.colors.white,
    flex: 1,
    fontFamily: theme.font.family,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  divider: {
    backgroundColor: theme.colors.gray,
    height: 2,
    marginBottom: 16,
    marginTop: 16,
  },
  helpTitle: {
    color: theme.colors.yellow,
    fontFamily: theme.font.family,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  statusBox: {
    borderColor: theme.colors.cyan,
    borderWidth: 2,
    marginTop: 8,
    padding: 12,
  },
  statusLabel: {
    color: theme.colors.gray,
    fontFamily: theme.font.family,
    fontSize: 12,
    fontWeight: '700',
  },
  statusValue: {
    color: theme.colors.yellow,
    fontFamily: theme.font.family,
    fontSize: 23,
    fontWeight: '900',
    marginTop: 4,
  },
  footerHint: {
    color: theme.colors.gray,
    fontFamily: theme.font.family,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  bottomBar: {
    alignItems: 'center',
    backgroundColor: theme.colors.gray,
    borderColor: theme.colors.white,
    borderTopWidth: 0,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 34,
    paddingHorizontal: 10,
  },
  bottomText: {
    color: theme.colors.blue900,
    fontFamily: theme.font.family,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
});
