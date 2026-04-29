import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppPopup } from '../../components/AppPopup';
import { LoadingDialog } from '../../components/LoadingDialog';
import { SeasonDropdown } from '../../components/SeasonDropdown';
import { screens } from '../../data/screens';
import { getConferenceSeasonGames } from '../../services/game/gamesService';
import { getPlayerDataFullStats } from '../../services/stats/statsService';
import { styles } from '../../styles/biosStyles';

const STAT_TABS = ['Players', 'Games'];
const PLAYER_FILTERS = ['All players', 'Active players'];

export function StatsScreen({ seasonState }) {
  const [activeTab, setActiveTab] = useState('Players');
  const [playerFilter, setPlayerFilter] = useState('All players');
  const [playerStats, setPlayerStats] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [playersError, setPlayersError] = useState('');
  const [gameStats, setGameStats] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState('');
  const [selectedPlayerStats, setSelectedPlayerStats] = useState(null);
  const screen = screens.stats;
  const selectedSeasonId = seasonState?.selectedSeason?.id ?? null;
  const selectedConferenceId =
    selectedSeasonId === 9999999
      ? 9999999
      : seasonState?.selectedSeason?.conference_id ?? 1;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPlayerStats() {
      if (!selectedSeasonId) {
        setPlayerStats([]);
        setPlayersError('');
        setIsLoadingPlayers(false);
        return;
      }

      setIsLoadingPlayers(true);
      setPlayersError('');

      try {
        const list = await getPlayerDataFullStats({
          seasonId: selectedSeasonId,
          signal: controller.signal,
        });

        if (isMounted) {
          setPlayerStats(Array.isArray(list) ? list : []);
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') {
          return;
        }

        if (isMounted) {
          setPlayerStats([]);
          setPlayersError(requestError.message || 'Unable to load player stats');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPlayers(false);
        }
      }
    }

    loadPlayerStats();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedSeasonId]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadGameStats() {
      if (!selectedSeasonId || !selectedConferenceId) {
        setGameStats([]);
        setGamesError('');
        setIsLoadingGames(false);
        return;
      }

      setIsLoadingGames(true);
      setGamesError('');

      try {
        const list = await getConferenceSeasonGames({
          conferenceId: selectedConferenceId,
          seasonId: selectedSeasonId,
          signal: controller.signal,
        });

        if (isMounted) {
          setGameStats(Array.isArray(list) ? list : []);
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') {
          return;
        }

        if (isMounted) {
          setGameStats([]);
          setGamesError(requestError.message || 'Unable to load game stats');
        }
      } finally {
        if (isMounted) {
          setIsLoadingGames(false);
        }
      }
    }

    loadGameStats();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedConferenceId, selectedSeasonId]);

  const normalizedPlayerStats = useMemo(
    () =>
      playerStats.map(player => ({
        ...player,
        games_played: Number(player.games_played ?? 0),
        wins: Number(player.wins ?? 0),
        games_played_percentage: Number(player.games_played_percentage ?? 0),
        win_percentage: Number(player.win_percentage ?? 0),
      })),
    [playerStats],
  );

  const filteredPlayerStats = useMemo(() => {
    if (playerFilter === 'All players') {
      return normalizedPlayerStats;
    }

    return normalizedPlayerStats.filter(
      player => String(player.status ?? '').toLowerCase() === 'active',
    );
  }, [normalizedPlayerStats, playerFilter]);

  const topByWinPercentage = useMemo(
    () =>
      filteredPlayerStats
        .filter(player => player.games_played >= 20)
        .sort((left, right) => {
          if (right.win_percentage !== left.win_percentage) {
            return right.win_percentage - left.win_percentage;
          }

          return right.games_played - left.games_played;
        })
        .slice(0, 10),
    [filteredPlayerStats],
  );

  const topByGamesPlayed = useMemo(
    () =>
      [...filteredPlayerStats]
        .sort((left, right) => {
          if (right.games_played !== left.games_played) {
            return right.games_played - left.games_played;
          }

          return right.wins - left.wins;
        })
        .slice(0, 10),
    [filteredPlayerStats],
  );

  const playerSummary = useMemo(() => {
    const totalPlayers = filteredPlayerStats.length;
    const activePlayers = filteredPlayerStats.filter(
      player => String(player.status ?? '').toLowerCase() === 'active',
    ).length;
    const injuredPlayers = filteredPlayerStats.filter(
      player => String(player.status ?? '').toLowerCase() === 'injured',
    ).length;
    const eligiblePlayers = filteredPlayerStats.filter(player =>
      ['active', 'injured'].includes(String(player.status ?? '').toLowerCase()),
    ).length;
    const totalSeasonGames =
      Number(filteredPlayerStats[0]?.total_season_games ?? 0) || 0;
    const averageWinRate =
      totalPlayers > 0
        ? filteredPlayerStats.reduce(
            (sum, player) => sum + Number(player.win_percentage ?? 0),
            0,
          ) / totalPlayers
        : 0;

    return {
      activePlayers,
      averageWinRate,
      eligiblePlayers,
      injuredPlayers,
      totalPlayers,
      totalSeasonGames,
    };
  }, [filteredPlayerStats]);

  const normalizedGameStats = useMemo(
    () =>
      gameStats.map(game => {
        const totalPlayers = Number(
          game.total_players ??
            Number(game.num_players_white ?? 0) + Number(game.num_players_black ?? 0),
        );

        return {
          ...game,
          final_score: Number(game.final_score ?? 0),
          total_players: totalPlayers,
          num_players_white: Number(game.num_players_white ?? 0),
          num_players_black: Number(game.num_players_black ?? 0),
        };
      }),
    [gameStats],
  );

  const gameSummary = useMemo(() => {
    const totalGames = normalizedGameStats.length;
    const averagePlayers =
      totalGames > 0
        ? normalizedGameStats.reduce(
            (sum, game) => sum + Number(game.total_players ?? 0),
            0,
          ) / totalGames
        : 0;
    const averageScore =
      totalGames > 0
        ? normalizedGameStats.reduce(
            (sum, game) => sum + Number(game.final_score ?? 0),
            0,
          ) / totalGames
        : 0;

    return {
      averagePlayers,
      averageScore,
      totalGames,
    };
  }, [normalizedGameStats]);
  const loadingMessage =
    seasonState?.isLoading
      ? 'LOADING SEASONS...'
      : activeTab === 'Players'
        ? 'LOADING PLAYER STATS...'
        : 'LOADING GAME STATS...';

  const gamesByPlayersData = useMemo(() => {
    const groups = normalizedGameStats.reduce((map, game) => {
      const key = String(Number(game.total_players ?? 0));
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map());

    return [...groups.entries()]
      .map(([players, count]) => ({
        id: `players-${players}`,
        label: `${players}P`,
        value: count,
        displayValue: `${count}`,
        sortValue: Number(players),
      }))
      .sort((left, right) => left.sortValue - right.sortValue);
  }, [normalizedGameStats]);

  const scoreBucketsData = useMemo(() => {
    const buckets = [
      { id: 'score-0-5', label: '0-5', value: 0 },
      { id: 'score-5-10', label: '5-10', value: 0 },
      { id: 'score-10-15', label: '10-15', value: 0 },
      { id: 'score-15-plus', label: '15+', value: 0 },
    ];

    normalizedGameStats.forEach(game => {
      const score = Number(game.final_score ?? 0);

      if (score <= 5) {
        buckets[0].value += 1;
      } else if (score <= 10) {
        buckets[1].value += 1;
      } else if (score <= 15) {
        buckets[2].value += 1;
      } else {
        buckets[3].value += 1;
      }
    });

    return buckets.map(bucket => ({
      ...bucket,
      displayValue: `${bucket.value}`,
    }));
  }, [normalizedGameStats]);

  return (
    <>
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

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Selected season</Text>
            <Text style={styles.infoValue}>
              {seasonState?.selectedSeason?.season ?? 'None'}
            </Text>
          </View>

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

            <View style={styles.statsFilterTabs}>
              {PLAYER_FILTERS.map(filter => {
                const isActive = filter === playerFilter;

                return (
                  <Pressable
                    key={filter}
                    onPress={() => setPlayerFilter(filter)}
                    style={[
                      styles.statsFilterTab,
                      isActive && styles.statsFilterTabActive,
                    ]}>
                    <Text
                      style={[
                        styles.statsFilterTabText,
                        isActive && styles.statsFilterTabTextActive,
                      ]}>
                      {filter.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {isLoadingPlayers && (
              <Text style={styles.gamesStateText}>LOADING PLAYER STATS...</Text>
              )}

              {playersError ? (
                <Text style={[styles.gamesStateText, styles.dropdownError]}>
                  PLAYER STATS ERROR: {playersError}
                </Text>
              ) : null}

              {!isLoadingPlayers &&
              !playersError &&
              filteredPlayerStats.length === 0 ? (
                <Text style={styles.gamesStateText}>NO PLAYER STATS FOUND</Text>
              ) : null}

              {!playersError && filteredPlayerStats.length > 0 ? (
                <>
                  <View style={styles.statsSummaryGrid}>
                    <SummaryStat
                      label="Total players"
                      value={playerSummary.totalPlayers}
                    />
                    <SummaryStat
                      label="Eligible players"
                      value={playerSummary.eligiblePlayers}
                    />
                    <SummaryStat
                      label="Active players"
                      value={playerSummary.activePlayers}
                    />
                    <SummaryStat
                      label="Injured players"
                      value={playerSummary.injuredPlayers}
                    />
                    <SummaryStat
                      label="Avg win rate"
                      value={`${formatNumber(playerSummary.averageWinRate)}%`}
                    />
                    <SummaryStat
                      label="Total season games"
                      value={playerSummary.totalSeasonGames}
                    />
                  </View>

                  <StatsChart
                    data={topByWinPercentage.map(player => ({
                      id: player.id,
                      label:
                        player.name ?? player.first_name ?? `PLAYER #${player.id}`,
                      value: Number(player.win_percentage ?? 0),
                      displayValue: `${formatNumber(player.win_percentage)}%`,
                    }))}
                    title="TOP 10 BY WIN %"
                  />

                  <StatsChart
                    data={topByGamesPlayed.map(player => ({
                      id: player.id,
                      label:
                        player.name ?? player.first_name ?? `PLAYER #${player.id}`,
                      value: Number(player.games_played ?? 0),
                      displayValue: `${player.games_played}`,
                    }))}
                    title="TOP 10 BY GAMES PLAYED"
                  />

                <View style={styles.statsTableSection}>
                  <Text style={styles.teamTitle}>PLAYERS TABLE</Text>

                  <View style={styles.statsTableHeader}>
                    <Text style={styles.statsTableIndexHeader}>NO</Text>
                    <Text style={styles.statsTableNameHeader}>NAME</Text>
                    <Text style={styles.statsTableStatusHeader}>S</Text>
                    <Text style={styles.statsTableMetricHeader}>GAMES</Text>
                    <Text style={styles.statsTableMetricHeader}>WIN</Text>
                  </View>

                  {filteredPlayerStats.map((player, index) => (
                      <Pressable
                        key={`${player.id}`}
                        onPress={() => setSelectedPlayerStats(player)}
                        style={styles.statsTableRow}>
                        <Text style={styles.statsTableIndexText}>{index + 1}</Text>
                        <View style={styles.statsTableNameCell}>
                        <Text style={styles.statsTableNameText}>
                          {truncateTableName(
                            player.name ??
                              player.first_name ??
                              `PLAYER #${player.id}`,
                          )}
                        </Text>
                        </View>
                        <Text style={styles.statsTableStatusText}>
                          {formatStatusCompact(player.status)}
                        </Text>
                        <Text style={styles.statsTableMetricText}>
                          {`${player.games_played} (${formatNumber(player.games_played_percentage)}%)`}
                        </Text>
                        <Text style={styles.statsTableMetricText}>
                          {`${player.wins} (${formatNumber(player.win_percentage)}%)`}
                        </Text>
                      </Pressable>
                  ))}
                  </View>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.helpTitle}>GAME STATS</Text>

              {isLoadingGames && (
                <Text style={styles.gamesStateText}>LOADING GAME STATS...</Text>
              )}

              {gamesError ? (
                <Text style={[styles.gamesStateText, styles.dropdownError]}>
                  GAME STATS ERROR: {gamesError}
                </Text>
              ) : null}

              {!isLoadingGames && !gamesError && normalizedGameStats.length === 0 ? (
                <Text style={styles.gamesStateText}>NO GAME STATS FOUND</Text>
              ) : null}

              {!gamesError && normalizedGameStats.length > 0 ? (
                <>
                  <View style={styles.statsSummaryGrid}>
                    <SummaryStat label="Total games" value={gameSummary.totalGames} />
                    <SummaryStat
                      label="Average no. players"
                      value={formatNumber(gameSummary.averagePlayers)}
                    />
                    <SummaryStat
                      label="Average score"
                      value={formatNumber(gameSummary.averageScore)}
                    />
                  </View>

                  <StatsChart
                    data={gamesByPlayersData}
                    title="GAMES BY NO. PLAYERS"
                  />

                  <StatsChart
                    data={scoreBucketsData}
                    title="FINAL SCORE RANGES"
                  />
                </>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <AppPopup
        message={formatLastFiveResults(selectedPlayerStats)}
        onClose={() => setSelectedPlayerStats(null)}
        title={selectedPlayerStats ? getStatsPlayerTitle(selectedPlayerStats) : ''}
        visible={Boolean(selectedPlayerStats)}
      />
      <LoadingDialog
        message={loadingMessage}
        onRequestClose={() => {}}
        visible={
          Boolean(seasonState?.isLoading) ||
          (activeTab === 'Players' ? isLoadingPlayers : isLoadingGames)
        }
      />
    </>
  );
}

function SummaryStat({ label, value }) {
  return (
    <View style={styles.statsSummaryCard}>
      <Text style={styles.statsSummaryLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.statsSummaryValue}>{value}</Text>
    </View>
  );
}

function StatsChart({ data, title }) {
  const maxValue = data.reduce((highest, item) => Math.max(highest, Number(item.value ?? 0)), 0);

  return (
    <View style={styles.statsChartSection}>
      <Text style={styles.teamTitle}>{title}</Text>

      {data.map(item => {
        const value = Number(item.value ?? 0);
        const widthPercent =
          maxValue > 0 ? Math.max((value / maxValue) * 100, 4) : 0;

        return (
          <View key={`${title}-${item.id}`} style={styles.statsBarRow}>
            <Text style={styles.statsBarName} numberOfLines={1}>
              {item.label}
            </Text>
            <View style={styles.statsBarTrack}>
              <View
                style={[
                  styles.statsBarFill,
                  { width: `${widthPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.statsBarValue}>{item.displayValue}</Text>
          </View>
        );
      })}
    </View>
  );
}

function formatNumber(value) {
  return Number(value ?? 0).toFixed(2).replace(/\.00$/, '');
}

function formatStatusCompact(value) {
  if (!value) {
    return '-';
  }

  return String(value).charAt(0).toUpperCase();
}

function getStatsPlayerTitle(player) {
  return `${player.name ?? player.first_name ?? `PLAYER #${player.id}`} - LAST 5`;
}

function formatLastFiveResults(player) {
  if (!player) {
    return '';
  }

  const results = Array.isArray(player.last_5_results) ? player.last_5_results : [];

  if (results.length === 0) {
    return 'NO LAST 5 GAME RESULTS.';
  }

  return results
    .map((result, index) => {
      const date = result?.game_date
        ? formatGameDate(result.game_date)
        : 'NO DATE';
      const gameId = result?.game_id ?? '-';
      const gameResult = String(result?.result ?? '-').toUpperCase();

      return `${index + 1}. ${date} / GAME ${gameId} / ${gameResult}`;
    })
    .join('\n');
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

function truncateTableName(value) {
  const name = String(value ?? '');

  if (name.length <= 8) {
    return name;
  }

  return name.slice(0, 8);
}
