import { Pressable, ScrollView, Text, View } from 'react-native';

import { LoadingDialog } from '../../../components/LoadingDialog';
import { useGamePlayers } from '../../../hooks/useGamePlayers';
import { styles } from '../../../styles/biosStyles';

export function GameDetailsScreen({ game, onBack }) {
  const playersState = useGamePlayers(game.id);

  return (
    <>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
        <View style={styles.panel}>
          <Pressable style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>BACK TO GAMES</Text>
          </Pressable>

        <Text style={styles.sectionTitle}>GAME DETAILS</Text>
        <Text style={styles.prompt}>GAME #{game.id}</Text>
        <Text style={styles.copy}>{formatGameDate(game.game_date)}</Text>

        <View style={styles.divider} />

        <View style={styles.gameStatsGrid}>
          <GameStat label="Score" value={game.final_score ?? '-'} />
          <GameStat label="Winner" value={game.win_team ?? '-'} />
          <GameStat label="Players" value={game.total_players ?? '-'} />
        </View>
      </View>

        <View style={styles.gamesPanel}>
        {playersState.isLoading && (
          <Text style={styles.gamesStateText}>LOADING PLAYERS...</Text>
        )}

        {playersState.error ? (
          <Text style={[styles.gamesStateText, styles.dropdownError]}>
            PLAYERS LINK ERROR: {playersState.error}
          </Text>
        ) : null}

        {!playersState.isLoading &&
          !playersState.error &&
          playersState.players.length === 0 && (
            <Text style={styles.gamesStateText}>NO PLAYERS FOUND</Text>
          )}

        <View style={styles.teamsGrid}>
          <TeamSection
            players={playersState.teams.white}
            title={`WHITE (${playersState.teams.white.length})`}
          />
          <TeamSection
            players={playersState.teams.black}
            title={`BLACK (${playersState.teams.black.length})`}
          />
        </View>
        </View>
      </ScrollView>
      <LoadingDialog
        message="LOADING PLAYERS..."
        onRequestClose={() => {}}
        visible={playersState.isLoading}
      />
    </>
  );
}

function TeamSection({ players, title }) {
  return (
    <View style={styles.teamColumn}>
      <Text style={styles.teamTitle}>{title}</Text>

      {players.map(player => (
        <PlayerRow
          key={`${player.game_id}-${player.player_id}-${player.id}`}
          player={player}
        />
      ))}
    </View>
  );
}

function PlayerRow({ player }) {
  const playerName =
    player.name ||
    [player.first_name, player.last_name].filter(Boolean).join(' ') ||
    `PLAYER #${player.player_id ?? player.id}`;

  return (
    <View style={styles.playerRow}>
      <Text style={styles.playerName}>{playerName}</Text>
      <Text style={styles.playerMeta}>
        POS {player.position ?? '-'} / {player.status ?? 'unknown'}
      </Text>
    </View>
  );
}

function GameStat({ label, value }) {
  return (
    <View style={styles.gameStat}>
      <Text style={styles.gameStatLabel}>{label}</Text>
      <Text style={styles.gameStatValue}>{value}</Text>
    </View>
  );
}

function formatGameDate(value) {
  if (!value) {
    return 'NO DATE';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
