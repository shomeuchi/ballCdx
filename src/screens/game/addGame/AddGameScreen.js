import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../../../styles/biosStyles';

export function AddGameScreen({ onBack, season }) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.panel}>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>BACK TO GAMES</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>ADD GAME</Text>
        <Text style={styles.prompt}>New game</Text>
        <Text style={styles.copy}>
          Configure a new game for the selected season.
        </Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Season</Text>
          <Text style={styles.infoValue}>{season?.season ?? 'None'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Conference</Text>
          <Text style={styles.infoValue}>
            {season?.id === 9999999 ? 9999999 : season?.conference_id ?? '-'}
          </Text>
        </View>
      </View>

      <View style={styles.gamesPanel}>
        <Text style={styles.gamesStateText}>
          CREATE GAME FORM WILL BE CONNECTED WHEN THE API CONTRACT IS READY.
        </Text>
      </View>
    </ScrollView>
  );
}
