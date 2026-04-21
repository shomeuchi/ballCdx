import { ScrollView, Text, View } from 'react-native';

import { InfoRow } from '../components/InfoRow';
import { SeasonDropdown } from '../components/SeasonDropdown';
import { screens } from '../data/screens';
import { useSeasons } from '../hooks/useSeasons';
import { styles } from '../styles/biosStyles';

const seasonScreenKeys = ['home', 'games', 'stats', 'prediction'];

export function ModuleScreen({ screenKey }) {
  const screen = screens[screenKey];
  const showSeasonDropdown = seasonScreenKeys.includes(screenKey);
  const seasonState = useSeasons(showSeasonDropdown);

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.panel}>
        {showSeasonDropdown && (
          <SeasonDropdown
            error={seasonState.error}
            isLoading={seasonState.isLoading}
            onSelect={seasonState.setSelectedSeasonId}
            seasons={seasonState.seasons}
            selectedSeason={seasonState.selectedSeason}
          />
        )}

        <Text style={styles.sectionTitle}>{screen.title.toUpperCase()}</Text>
        <Text style={styles.prompt}>{screen.summary}</Text>
        <Text style={styles.copy}>{screen.copy}</Text>

        <View style={styles.divider} />

        {showSeasonDropdown && (
          <InfoRow
            label="Selected season"
            value={seasonState.selectedSeason?.season ?? 'None'}
          />
        )}

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
