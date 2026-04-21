import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { SeasonDropdown } from '../components/SeasonDropdown';
import { useConferenceSeasonGames } from '../hooks/useConferenceSeasonGames';
import { useGamePlayers } from '../hooks/useGamePlayers';
import { useSeasons } from '../hooks/useSeasons';
import { styles } from '../styles/biosStyles';

export function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState(null);
  const seasonState = useSeasons(true);
  const seasonId = seasonState.selectedSeason?.id ?? null;
  const conferenceId =
    seasonId === 9999999
      ? 9999999
      : seasonState.selectedSeason?.conference_id ?? 1;
  const gamesState = useConferenceSeasonGames({
    conferenceId,
    seasonId,
  });
  const dropdownHelperText = gamesState.isLoading
    ? 'LOADING GAMES...'
    : gamesState.error
      ? `GAME LINK ERROR: ${gamesState.error}`
      : `${gamesState.games.length} GAMES LOADED`;

  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.panel}>
          <SeasonDropdown
            error={seasonState.error}
            helperTextOverride={dropdownHelperText}
            isLoading={seasonState.isLoading}
            onSelect={seasonState.setSelectedSeasonId}
            seasons={seasonState.seasons}
            selectedSeason={seasonState.selectedSeason}
          />
        </View>

        <View style={styles.gamesPanel}>
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
        </View>
      </>
    ),
    [
      dropdownHelperText,
      gamesState.error,
      gamesState.games.length,
      gamesState.isLoading,
      seasonState.error,
      seasonState.isLoading,
      seasonState.seasons,
      seasonState.selectedSeason,
      seasonState.setSelectedSeasonId,
    ],
  );

  const renderGame = useCallback(
    ({ item }) => <GameCard game={item} onPress={setSelectedGame} />,
    [],
  );

  const keyExtractor = useCallback(game => `${game.id}`, []);

  if (selectedGame) {
    return (
      <GameDetailsScreen
        game={selectedGame}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  return (
    <FlatList
      data={gamesState.games}
      initialNumToRender={12}
      keyExtractor={keyExtractor}
      ListHeaderComponent={listHeader}
      maxToRenderPerBatch={8}
      removeClippedSubviews
      renderItem={renderGame}
      style={styles.content}
      updateCellsBatchingPeriod={50}
      windowSize={7}
    />
  );
}

function GameDetailsScreen({ game, onBack }) {
  const playersState = useGamePlayers(game.id);

  return (
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

        <TeamSection
          players={playersState.teams.white}
          title={`WHITE TEAM (${playersState.teams.white.length})`}
        />
        <TeamSection
          players={playersState.teams.black}
          title={`BLACK TEAM (${playersState.teams.black.length})`}
        />
      </View>
    </ScrollView>
  );
}

const GameCard = memo(function GameCard({ game, onPress }) {
  const winner = game.win_team ? game.win_team.toUpperCase() : 'PENDING';

  return (
    <Pressable style={styles.gameCard} onPress={() => onPress(game)}>
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
    </Pressable>
  );
});

function TeamSection({ players, title }) {
  return (
    <View style={styles.teamSection}>
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
