import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { SeasonDropdown } from '../../components/SeasonDropdown';
import { screens } from '../../data/screens';
import { styles } from '../../styles/biosStyles';

const STAT_TABS = ['Players', 'Games'];

export function StatsScreen({ seasonState }) {
  const [activeTab, setActiveTab] = useState('Players');
  const screen = screens.stats;

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.panel}>
        <SeasonDropdown
          error={seasonState?.error}
          isLoading={seasonState?.isLoading}
          onSelect={seasonState?.setSelectedSeasonId}
          seasons={seasonState?.seasons ?? []}
          selectedSeason={seasonState?.selectedSeason}
        />

        <Text style={styles.sectionTitle}>{screen.title.toUpperCase()}</Text>
        <Text style={styles.prompt}>{screen.summary}</Text>
        <Text style={styles.copy}>{screen.copy}</Text>

        <View style={styles.divider} />

        <View style={styles.statsTabs}>
          {STAT_TABS.map(tab => {
            const isActive = tab === activeTab;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.statsTab, isActive && styles.statsTabActive]}>
                <Text
                  style={[
                    styles.statsTabText,
                    isActive && styles.statsTabTextActive,
                  ]}>
                  {tab.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.gamesPanel}>
        {activeTab === 'Players' ? (
          <>
            <Text style={styles.helpTitle}>PLAYER STATS</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>View</Text>
              <Text style={styles.infoValue}>Players</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Season</Text>
              <Text style={styles.infoValue}>
                {seasonState?.selectedSeason?.season ?? 'None'}
              </Text>
            </View>
            <Text style={styles.gamesStateText}>
              PLAYER STAT TABLES WILL BE SHOWN IN THIS TAB.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.helpTitle}>GAME STATS</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>View</Text>
              <Text style={styles.infoValue}>Games</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Season</Text>
              <Text style={styles.infoValue}>
                {seasonState?.selectedSeason?.season ?? 'None'}
              </Text>
            </View>
            <Text style={styles.gamesStateText}>
              GAME STAT TABLES WILL BE SHOWN IN THIS TAB.
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}
