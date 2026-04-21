import { ScrollView, Text, View } from 'react-native';

import { SeasonDropdown } from '../components/SeasonDropdown';
import { useConferenceSeasonGames } from '../hooks/useConferenceSeasonGames';
import { useSeasons } from '../hooks/useSeasons';
import { styles } from '../styles/biosStyles';

export function GamesScreen() {
  const seasonState = useSeasons(true);
  const conferenceId = seasonState.selectedSeason?.conference_id ?? 1;
  const seasonId = seasonState.selectedSeason?.id ?? null;
  const gamesState = useConferenceSeasonGames({
    conferenceId,
    seasonId,
  });

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.panel}>
        <SeasonDropdown
          error={seasonState.error}
          helperTextOverride={
            gamesState.isLoading
              ? 'LOADING GAMES...'
              : gamesState.error
                ? `GAME LINK ERROR: ${gamesState.error}`
                : `${gamesState.games.length} GAMES LOADED`
          }
          isLoading={seasonState.isLoading}
          onSelect={seasonState.setSelectedSeasonId}
          seasons={seasonState.seasons}
          selectedSeason={seasonState.selectedSeason}
        />
      </View>

      <View style={styles.gamesPanel}>
        <Text style={styles.helpTitle}>GAMES</Text>

        {gamesState.isLoading && (
          <Text style={styles.gamesStateText}>LOADING GAMES...</Text>
        )}

        {gamesState.error ? (
          <Text style={[styles.gamesStateText, styles.dropdownError]}>
            GAME LINK ERROR: {gamesState.error}
          </Text>
        ) : null}

        {!gamesState.isLoading &&
          !gamesState.error &&
          gamesState.games.length === 0 && (
            <Text style={styles.gamesStateText}>NO GAMES FOUND</Text>
          )}

        {gamesState.games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </View>
    </ScrollView>
  );
}

function GameCard({ game }) {
  const winner = game.win_team ? game.win_team.toUpperCase() : 'PENDING';

  return (
    <View style={styles.gameCard}>
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameId}>GAME #{game.id}</Text>
        <Text style={styles.gameDate}>{formatGameDate(game.game_date)}</Text>
      </View>

      <View style={styles.gameWinnerRow}>
        <Text style={styles.gameWinnerLabel}>WINNER</Text>
        <Text style={styles.gameWinnerValue}>{winner}</Text>
      </View>

      <View style={styles.gameStatsGrid}>
        <GameStat label="Score" value={game.final_score ?? '-'} />
        <GameStat label="White" value={game.num_players_white ?? '-'} />
        <GameStat label="Black" value={game.num_players_black ?? '-'} />
        <GameStat label="Total" value={game.total_players ?? '-'} />
      </View>

      <View style={styles.gameDiffRow}>
        <Text style={styles.gameDiffText}>WHITE DIFF: {game.white_diff ?? '-'}</Text>
        <Text style={styles.gameDiffText}>BLACK DIFF: {game.black_diff ?? '-'}</Text>
      </View>
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
