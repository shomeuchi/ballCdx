import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const theme = {
  colors: {
    blue900: '#000080',
    blue800: '#0018a8',
    blue700: '#0030c0',
    cyan: '#00ffff',
    white: '#f8fbff',
    gray: '#b8c7ff',
    yellow: '#ffff66',
  },
  font: {
    family: 'monospace',
  },
};

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>BALLCDX SETUP UTILITY</Text>
          <Text style={styles.headerMeta}>EXPO GO 54.0.6</Text>
        </View>

        <View style={styles.frame}>
          <View style={styles.menuBar}>
            <Text style={[styles.menuItem, styles.menuItemActive]}>Main</Text>
            <Text style={styles.menuItem}>Status</Text>
            <Text style={styles.menuItem}>Boot</Text>
            <Text style={styles.menuItem}>Exit</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.leftPane}>
              <Text style={styles.sectionTitle}>SYSTEM SUMMARY</Text>

              <InfoRow label="Project" value="ballCdx" />
              <InfoRow label="Runtime" value="Expo SDK 54" />
              <InfoRow label="React Native" value="0.81.5" />
              <InfoRow label="Screen" value="Welcome" />

              <View style={styles.divider} />

              <Text style={styles.prompt}>Welcome to ballCdx</Text>
              <Text style={styles.copy}>
                Mobile interface check passed. Open this session in Expo Go to
                continue development.
              </Text>
            </View>

            <View style={styles.rightPane}>
              <Text style={styles.helpTitle}>HELP</Text>
              <Text style={styles.helpText}>
                LAN packager is ready for device preview.
              </Text>

              <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>CURRENT STATE</Text>
                <Text style={styles.statusValue}>READY</Text>
              </View>

              <Text style={styles.footerHint}>
                F10: Save   ESC: Back   ENTER: Select
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>AMIBIOS STYLE MOBILE PREVIEW</Text>
          <Text style={styles.bottomText}>BUILD 1.0.0</Text>
        </View>
      </View>

      <StatusBar style="light" />
    </View>
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
    minHeight: 36,
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
    alignItems: 'center',
    backgroundColor: theme.colors.blue700,
    borderBottomColor: theme.colors.white,
    borderBottomWidth: 2,
    flexDirection: 'row',
    minHeight: 34,
    paddingHorizontal: 8,
  },
  menuItem: {
    color: theme.colors.gray,
    fontFamily: theme.font.family,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 18,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  menuItemActive: {
    backgroundColor: theme.colors.gray,
    color: theme.colors.blue900,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  leftPane: {
    backgroundColor: theme.colors.blue900,
    borderColor: theme.colors.gray,
    borderWidth: 2,
    padding: 12,
  },
  rightPane: {
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
  infoRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.blue700,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 30,
  },
  infoLabel: {
    color: theme.colors.gray,
    fontFamily: theme.font.family,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    color: theme.colors.white,
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
  helpTitle: {
    color: theme.colors.yellow,
    fontFamily: theme.font.family,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  helpText: {
    color: theme.colors.white,
    fontFamily: theme.font.family,
    fontSize: 13,
    lineHeight: 20,
  },
  statusBox: {
    borderColor: theme.colors.cyan,
    borderWidth: 2,
    marginTop: 18,
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
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  footerHint: {
    color: theme.colors.gray,
    fontFamily: theme.font.family,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 'auto',
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
