import { Pressable, ScrollView, Text, View } from 'react-native';

import { screens } from '../../data/screens';
import { styles } from '../../styles/biosStyles';

export function SettingsScreen({ currentUser, onLogout }) {
  const screen = screens.settings;
  const username =
    currentUser?.username ??
    currentUser?.name ??
    currentUser?.first_name ??
    'UNKNOWN';
  const userType =
    currentUser?.user_type ?? currentUser?.userType ?? 'unknown';

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>{screen.title.toUpperCase()}</Text>
        <Text style={styles.prompt}>{screen.summary}</Text>
        <Text style={styles.copy}>{screen.copy}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User</Text>
          <Text style={styles.infoValue}>{String(username).toUpperCase()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{String(userType).toUpperCase()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Session</Text>
          <Text style={styles.infoValue}>ACTIVE</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={onLogout}>
          <Text style={styles.primaryButtonText}>LOGOUT</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
