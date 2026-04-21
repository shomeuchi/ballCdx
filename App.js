import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Expo Go 54</Text>
      </View>

      <Text style={styles.title}>Welcome to ballCdx</Text>
      <Text style={styles.subtitle}>
        Your React Native app is ready to test on your phone.
      </Text>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
  },
  badge: {
    borderRadius: 8,
    backgroundColor: '#dff7ec',
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 320,
    textAlign: 'center',
  },
});
