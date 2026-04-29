import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LoadingDialog } from '../../components/LoadingDialog';
import { SeasonDropdown } from '../../components/SeasonDropdown';
import { getConferenceSeasonGames, getGamePlayers } from '../../services/game/gamesService';
import { getPlayerDataFullStats } from '../../services/stats/statsService';
import { styles } from '../../styles/biosStyles';
import {
  buildGameLineups,
  computePrediction,
  createEmptyTeamSlots,
  getPlayerDisplayName,
  MAX_PLAYERS_PER_TEAM,
  toNumber,
} from './predictionUtils';
import { formatGameDate } from '../players/playerUtils';

export function PredictionScreen({ seasonState }) {
  const [playerStats, setPlayerStats] = useState([]);
  const [historicalGames, setHistoricalGames] = useState([]);
  const [historicalLineups, setHistoricalLineups] = useState([]);
  const [historicalPredictions, setHistoricalPredictions] = useState([]);
  const [historicalGamePlayersMap, setHistoricalGamePlayersMap] = useState(
    new Map(),
  );
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isLoadingHistoricalPredictions, setIsLoadingHistoricalPredictions] =
    useState(false);
  const [predictionError, setPredictionError] = useState('');
  const [whitePlayerIds, setWhitePlayerIds] = useState(createEmptyTeamSlots);
  const [blackPlayerIds, setBlackPlayerIds] = useState(createEmptyTeamSlots);
  const [appliedWhiteIds, setAppliedWhiteIds] = useState([]);
  const [appliedBlackIds, setAppliedBlackIds] = useState([]);
  const [hasCalculatedPrediction, setHasCalculatedPrediction] = useState(false);
  const [activePickerSlot, setActivePickerSlot] = useState(null);
  const [selectedHistoricalGame, setSelectedHistoricalGame] = useState(null);
  const selectedSeasonId = seasonState?.selectedSeason?.id ?? null;
  const selectedConferenceId =
    selectedSeasonId === 9999999
      ? 9999999
      : seasonState?.selectedSeason?.conference_id ?? 1;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPredictionData() {
      if (!selectedSeasonId) {
        setPlayerStats([]);
        setHistoricalGames([]);
        setHistoricalLineups([]);
        setHistoricalGamePlayersMap(new Map());
        setPredictionError('');
        setIsLoadingPrediction(false);
        return;
      }

      setIsLoadingPrediction(true);
      setPredictionError('');

      try {
        const [players, games] = await Promise.all([
          getPlayerDataFullStats({
            seasonId: selectedSeasonId,
            signal: controller.signal,
          }),
          getConferenceSeasonGames({
            conferenceId: selectedConferenceId,
            seasonId: selectedSeasonId,
            signal: controller.signal,
          }),
        ]);

        const normalizedGames = [...(Array.isArray(games) ? games : [])].sort(
          (left, right) => new Date(right.game_date) - new Date(left.game_date),
        );
        const gamePlayersResponses = await Promise.all(
          normalizedGames.map(game =>
            getGamePlayers({
              gameId: game.id,
              signal: controller.signal,
            }),
          ),
        );
        const gamePlayersMap = new Map();

        normalizedGames.forEach((game, index) => {
          gamePlayersMap.set(Number(game.id), gamePlayersResponses[index] ?? []);
        });

        if (!isMounted) {
          return;
        }

        const normalizedPlayers = Array.isArray(players) ? players : [];
        const availableIds = new Set(
          normalizedPlayers.map(player => Number(player.id)),
        );

        setPlayerStats(normalizedPlayers);
        setHistoricalGames(normalizedGames);
        setHistoricalLineups(buildGameLineups(normalizedGames, gamePlayersMap));
        setHistoricalGamePlayersMap(gamePlayersMap);
        setWhitePlayerIds(current => syncSelectedIds(current, availableIds));
        setBlackPlayerIds(current => syncSelectedIds(current, availableIds));
        setAppliedWhiteIds([]);
        setAppliedBlackIds([]);
        setHasCalculatedPrediction(false);
      } catch (requestError) {
        if (requestError.name === 'AbortError') {
          return;
        }

        if (isMounted) {
          setPlayerStats([]);
          setHistoricalGames([]);
          setHistoricalLineups([]);
          setHistoricalGamePlayersMap(new Map());
          setAppliedWhiteIds([]);
          setAppliedBlackIds([]);
          setHasCalculatedPrediction(false);
          setPredictionError(
            requestError.message || 'Unable to load prediction data',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingPrediction(false);
        }
      }
    }

    loadPredictionData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedConferenceId, selectedSeasonId]);

  const sortedPlayers = useMemo(
    () =>
      [...playerStats]
        .filter(player => String(player.status ?? '').toLowerCase() === 'active')
        .sort((left, right) =>
          getPlayerDisplayName(left).localeCompare(getPlayerDisplayName(right)),
        ),
    [playerStats],
  );

  const selectedIds = useMemo(
    () => new Set([...whitePlayerIds, ...blackPlayerIds].filter(Boolean)),
    [blackPlayerIds, whitePlayerIds],
  );
  const playerMap = useMemo(
    () => new Map(playerStats.map(player => [Number(player.id), player])),
    [playerStats],
  );

  const selectedWhiteIds = useMemo(
    () => whitePlayerIds.filter(Boolean),
    [whitePlayerIds],
  );
  const selectedBlackIds = useMemo(
    () => blackPlayerIds.filter(Boolean),
    [blackPlayerIds],
  );
  const canCalculatePrediction =
    selectedWhiteIds.length > 0 &&
    selectedBlackIds.length > 0 &&
    !isLoadingPrediction &&
    !predictionError;

  const prediction = useMemo(
    () =>
      computePrediction(
        playerStats,
        historicalLineups,
        appliedWhiteIds,
        appliedBlackIds,
      ),
    [appliedBlackIds, appliedWhiteIds, historicalLineups, playerStats],
  );

  useEffect(() => {
    if (!hasCalculatedPrediction) {
      return;
    }

    if (
      areIdListsEqual(selectedWhiteIds, appliedWhiteIds) &&
      areIdListsEqual(selectedBlackIds, appliedBlackIds)
    ) {
      return;
    }

    setHasCalculatedPrediction(false);
  }, [
    appliedBlackIds,
    appliedWhiteIds,
    hasCalculatedPrediction,
    selectedBlackIds,
    selectedWhiteIds,
  ]);

  const selectedCount = selectedWhiteIds.length + selectedBlackIds.length;
  const whiteProbabilityPercent = prediction.whiteProbability * 100;
  const blackProbabilityPercent = prediction.blackProbability * 100;
  const predictedWinner =
    hasCalculatedPrediction && appliedWhiteIds.length && appliedBlackIds.length
      ? whiteProbabilityPercent >= blackProbabilityPercent
        ? 'WHITE'
        : 'BLACK'
      : 'WAITING FOR CALCULATION';
  const helperText = isLoadingPrediction
    ? 'LOADING PREDICTION DATA...'
    : predictionError
      ? `PREDICTION LINK ERROR: ${predictionError}`
      : `${historicalGames.length} GAMES / ${historicalLineups.length} LINEUPS LOADED`;

  useEffect(() => {
    let isCancelled = false;

    if (
      !hasCalculatedPrediction ||
      !historicalGames.length ||
      !historicalLineups.length ||
      !playerStats.length
    ) {
      setHistoricalPredictions([]);
      setIsLoadingHistoricalPredictions(false);
      return undefined;
    }

    setHistoricalPredictions([]);
    setIsLoadingHistoricalPredictions(true);

    const lineupMap = new Map(
      historicalLineups.map(lineup => [Number(lineup.gameId), lineup]),
    );
    const nextPredictions = [];
    let index = 0;

    function processChunk() {
      if (isCancelled) {
        return;
      }

      const chunkEnd = Math.min(index + 8, historicalGames.length);

      for (; index < chunkEnd; index += 1) {
        const game = historicalGames[index];
        const lineup = lineupMap.get(Number(game.id));

        if (!lineup) {
          nextPredictions.push({
            blackPercent: 50,
            correct: false,
            game,
            predictedWinner: '-',
            realWinner: String(game.win_team ?? '').toUpperCase(),
            whitePercent: 50,
          });
          continue;
        }

        const gamePrediction = computePrediction(
          playerStats,
          historicalLineups,
          lineup.whiteIds,
          lineup.blackIds,
        );
        const predictedWinner =
          gamePrediction.whiteProbability >= gamePrediction.blackProbability
            ? 'WHITE'
            : 'BLACK';
        const realWinner = String(game.win_team ?? '').toUpperCase();

        nextPredictions.push({
          blackPercent: gamePrediction.blackProbability * 100,
          correct: predictedWinner === realWinner,
          game,
          predictedWinner,
          realWinner,
          whitePercent: gamePrediction.whiteProbability * 100,
        });
      }

      if (index < historicalGames.length) {
        setTimeout(processChunk, 0);
        return;
      }

      if (!isCancelled) {
        setHistoricalPredictions(nextPredictions);
        setIsLoadingHistoricalPredictions(false);
      }
    }

    setTimeout(processChunk, 0);

    return () => {
      isCancelled = true;
    };
  }, [
    hasCalculatedPrediction,
    historicalGames,
    historicalLineups,
    playerStats,
  ]);

  const historicalAccuracy = useMemo(() => {
    const totalGames = historicalPredictions.length;
    const correctGames = historicalPredictions.filter(item => item.correct).length;

    return {
      correctGames,
      totalGames,
      value: totalGames ? (correctGames / totalGames) * 100 : 0,
    };
  }, [historicalPredictions]);
  const historicalGameDetails = useMemo(() => {
    if (!selectedHistoricalGame) {
      return null;
    }

    const players =
      historicalGamePlayersMap.get(Number(selectedHistoricalGame.game.id)) ?? [];
    const whitePlayers = players
      .filter(player => toNumber(player.team_id) === 1)
      .sort(sortHistoricalPlayers)
      .map(player =>
        formatHistoricalPlayerName(
          playerMap.get(Number(player.player_id ?? player.id)) ?? player,
        ),
      );
    const blackPlayers = players
      .filter(player => toNumber(player.team_id) === 2)
      .sort(sortHistoricalPlayers)
      .map(player =>
        formatHistoricalPlayerName(
          playerMap.get(Number(player.player_id ?? player.id)) ?? player,
        ),
      );

    return {
      blackPlayers,
      gameDate: formatGameDate(selectedHistoricalGame.game.game_date),
      blackPercent: formatNumber(selectedHistoricalGame.blackPercent),
      predictedWinner: selectedHistoricalGame.predictedWinner ?? '-',
      result: selectedHistoricalGame.correct ? 'OK' : 'MISS',
      score: selectedHistoricalGame.game.final_score ?? '-',
      title: `GAME ${selectedHistoricalGame.game.id}`,
      whitePercent: formatNumber(selectedHistoricalGame.whitePercent),
      whitePlayers,
    };
  }, [historicalGamePlayersMap, playerMap, selectedHistoricalGame]);
  const loadingMessage = isLoadingPrediction
    ? 'LOADING PREDICTION DATA...'
    : isLoadingHistoricalPredictions
      ? 'BUILDING HISTORICAL PREDICTIONS...'
      : seasonState?.isLoading
        ? 'LOADING SEASONS...'
        : '';
  const activePickerPlayerId = useMemo(() => {
    if (!activePickerSlot) {
      return null;
    }

    const sourceIds =
      activePickerSlot.teamKey === 'white' ? whitePlayerIds : blackPlayerIds;

    return sourceIds[activePickerSlot.index] ?? null;
  }, [activePickerSlot, blackPlayerIds, whitePlayerIds]);

  return (
    <>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
        <View style={styles.panel}>
          <SeasonDropdown
            error={seasonState?.error}
            helperTextOverride={helperText}
            isLoading={seasonState?.isLoading}
            onSelect={seasonState?.setSelectedSeasonId}
            seasons={seasonState?.seasons ?? []}
            selectedSeason={seasonState?.selectedSeason}
          />

          <Text style={styles.sectionTitle}>PREDICTION</Text>
          <Text style={styles.prompt}>MATCH FORECAST</Text>
          <Text style={styles.copy}>
            Build white and black lineups, then compare win probability, player
            impact, chemistry, and risk from season history.
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Selected season</Text>
            <Text style={styles.infoValue}>
              {seasonState?.selectedSeason?.season ?? 'None'}
            </Text>
          </View>
        </View>

        <View style={styles.gamesPanel}>
          {isLoadingPrediction && (
            <Text style={styles.gamesStateText}>LOADING PREDICTION DATA...</Text>
          )}

          {predictionError ? (
            <Text style={[styles.gamesStateText, styles.dropdownError]}>
              PREDICTION ERROR: {predictionError}
            </Text>
          ) : null}

          <Text style={styles.helpTitle}>UPCOMING MATCH SELECTORS</Text>
          <Text style={styles.footerHint}>
            Choose up to 6 players per team. A player cannot be selected twice. A
            6th player is treated as a bench substitution.
          </Text>

          <View style={styles.teamsGrid}>
            <PredictionTeamPicker
              onOpenSlot={setActivePickerSlot}
              playerMap={playerMap}
              selectedPlayerIds={whitePlayerIds}
              teamKey="white"
              title="WHITE"
            />
            <PredictionTeamPicker
              onOpenSlot={setActivePickerSlot}
              playerMap={playerMap}
              selectedPlayerIds={blackPlayerIds}
              teamKey="black"
              title="BLACK"
            />
          </View>

          <Pressable
            disabled={!canCalculatePrediction}
            onPress={() => {
              setAppliedWhiteIds(selectedWhiteIds);
              setAppliedBlackIds(selectedBlackIds);
              setHasCalculatedPrediction(true);
            }}
            style={[
              styles.primaryButton,
              !canCalculatePrediction && styles.dropdownButtonDisabled,
            ]}>
            <Text style={styles.primaryButtonText}>CALCULATE PREDICTION</Text>
          </Pressable>

          {!hasCalculatedPrediction ? (
            <Text style={styles.gamesStateText}>
              PLACE PLAYERS AND PRESS CALCULATE PREDICTION.
            </Text>
          ) : null}

          <View style={styles.statsSummaryGrid}>
            <SummaryStat label="Historical games" value={historicalGames.length} />
            <SummaryStat
              label="Historical lineups"
              value={historicalLineups.length}
            />
            <SummaryStat
              label="White projected win"
              value={`${formatNumber(whiteProbabilityPercent)}%`}
            />
            <SummaryStat
              label="Black projected win"
              value={`${formatNumber(blackProbabilityPercent)}%`}
            />
            <SummaryStat
              label="Predicted MVP"
              value={prediction.mvp?.name ?? '-'}
            />
            <SummaryStat
              label="Risk player"
              value={prediction.risk?.name ?? '-'}
            />
          </View>

          <View style={styles.predictionProbabilityCard}>
            <View style={styles.predictionProbabilityHeader}>
              <View style={styles.predictionProbabilityTitleBlock}>
                <Text style={styles.teamTitle}>WIN PROBABILITY</Text>
                <Text style={styles.predictionSubtle}>
                  Based on player strength, recent form, lineup chemistry, and
                  matchup history.
                </Text>
              </View>
              <Text style={styles.predictionWinnerText}>{predictedWinner}</Text>
            </View>

            <View style={styles.predictionProbabilityBar}>
              <View
                style={[
                  styles.predictionProbabilityWhite,
                  { width: `${Math.max(whiteProbabilityPercent, selectedCount ? 6 : 50)}%` },
                ]}>
                <Text style={styles.predictionProbabilityBarText}>
                  {`${formatNumber(whiteProbabilityPercent)}%`}
                </Text>
              </View>
              <View
                style={[
                  styles.predictionProbabilityBlack,
                  { width: `${Math.max(blackProbabilityPercent, selectedCount ? 6 : 50)}%` },
                ]}>
                <Text style={styles.predictionProbabilityBarTextDark}>
                  {`${formatNumber(blackProbabilityPercent)}%`}
                </Text>
              </View>
            </View>

            <View style={styles.predictionStrengthRow}>
              <StrengthBox
                label="White strength"
                value={formatNumber(prediction.whiteStrength)}
              />
              <StrengthBox
                label="Black strength"
                value={formatNumber(prediction.blackStrength)}
              />
            </View>

            <View style={styles.predictionReasonsList}>
              {prediction.reasons.map(reason => (
                <Text key={reason} style={styles.predictionReasonText}>
                  {`- ${reason}`}
                </Text>
              ))}
            </View>
          </View>

          <Text style={styles.helpTitle}>HISTORICAL GAMES VS MODEL PREDICTION</Text>

          <View style={styles.statsSummaryGrid}>
            <SummaryStat
              label="Prediction accuracy"
              value={`${formatNumber(historicalAccuracy.value)}%`}
            />
            <SummaryStat
              label="Correct picks"
              value={`${historicalAccuracy.correctGames}/${historicalAccuracy.totalGames}`}
            />
          </View>

          {isLoadingHistoricalPredictions ? (
            <Text style={styles.gamesStateText}>
              BUILDING HISTORICAL PREDICTIONS...
            </Text>
          ) : null}

          <View style={styles.predictionTableSection}>
            <View style={styles.predictionHistoryHeader}>
              <Text style={styles.predictionHistoryDateHeader}>DATE</Text>
              <Text style={styles.predictionMetricHeader}>SCORE</Text>
              <Text style={styles.predictionHistoryResultHeader}>RESULT</Text>
              <Text style={styles.predictionHistoryPercentHeader}>WHITE%</Text>
              <Text style={styles.predictionHistoryPercentHeader}>BLACK%</Text>
            </View>

            {!hasCalculatedPrediction ? (
              <View style={styles.predictionEmptyRow}>
                <Text style={styles.predictionEmptyText}>
                  PRESS CALCULATE PREDICTION TO BUILD HISTORICAL RESULTS.
                </Text>
              </View>
            ) : null}

            {hasCalculatedPrediction &&
            !isLoadingHistoricalPredictions &&
            historicalPredictions.length === 0 ? (
              <View style={styles.predictionEmptyRow}>
                <Text style={styles.predictionEmptyText}>
                  NO HISTORICAL PREDICTIONS AVAILABLE.
                </Text>
              </View>
            ) : null}

            {historicalPredictions.map(item => (
              <Pressable
                key={`historical-${item.game.id}`}
                onPress={() => setSelectedHistoricalGame(item)}
                style={styles.predictionTableRow}>
                <Text style={styles.predictionHistoryDateText}>
                  {formatGameDate(item.game.game_date)}
                </Text>
                <Text style={styles.predictionMetricText}>
                  {item.game.final_score ?? '-'}
                </Text>
                <Text
                  style={[
                    styles.predictionHistoryResultText,
                    item.correct
                      ? styles.predictionHistoryHitText
                      : styles.predictionHistoryMissText,
                  ]}>
                  {item.correct ? 'OK' : 'MISS'}
                </Text>
                <Text style={styles.predictionHistoryPercentText}>
                  {formatNumber(item.whitePercent)}
                </Text>
                <Text style={styles.predictionHistoryPercentText}>
                  {formatNumber(item.blackPercent)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helpTitle}>PLAYER IMPACT TABLE</Text>

          <View style={styles.predictionTableSection}>
            <View style={styles.predictionTableHeader}>
              <Text style={styles.predictionRankHeader}>NO</Text>
              <Text style={styles.predictionTeamHeader}>TM</Text>
              <Text style={styles.predictionNameHeader}>PLAYER</Text>
              <Text style={styles.predictionMetricHeader}>IMP</Text>
              <Text style={styles.predictionMetricHeader}>WIN%</Text>
              <Text style={styles.predictionMetricHeader}>G</Text>
              <Text style={styles.predictionMetricHeader}>SYN</Text>
              <Text style={styles.predictionMetricHeader}>RISK</Text>
            </View>

            {[...prediction.whiteModels, ...prediction.blackModels]
              .sort((left, right) => right.impact - left.impact)
              .map((player, index) => (
                <View key={`${player.team}-${player.id}`} style={styles.predictionTableRow}>
                  <Text style={styles.predictionRankText}>{index + 1}</Text>
                  <Text
                    style={[
                      styles.predictionTeamText,
                      player.team === 'white'
                        ? styles.predictionWhiteChipText
                        : styles.predictionBlackChipText,
                    ]}>
                    {player.team === 'white' ? 'W' : 'B'}
                  </Text>
                  <View style={styles.predictionTableNameCell}>
                    <Text style={styles.predictionTableNameText} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text style={styles.predictionTableMetaText}>
                      {player.formText}
                    </Text>
                  </View>
                  <Text style={styles.predictionMetricText}>
                    {formatNumber(player.impact)}
                  </Text>
                  <Text style={styles.predictionMetricText}>
                    {formatNumber(player.winPct)}
                  </Text>
                  <Text style={styles.predictionMetricText}>
                    {player.gamesPlayed}
                  </Text>
                  <Text style={styles.predictionMetricText}>
                    {formatNumber(player.synergyScore)}
                  </Text>
                  <Text style={styles.predictionMetricText}>
                    {`${formatNumber(player.riskScore * 100)}%`}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>

      <HistoricalGameModal
        details={historicalGameDetails}
        onClose={() => setSelectedHistoricalGame(null)}
      />

      <PredictionPlayerPickerModal
        currentPlayerId={activePickerPlayerId}
        onClose={() => setActivePickerSlot(null)}
        onSelectPlayer={playerId => {
          if (!activePickerSlot) {
            return;
          }

          const setSelectedPlayerIds =
            activePickerSlot.teamKey === 'white'
              ? setWhitePlayerIds
              : setBlackPlayerIds;

          setSelectedPlayerIds(current =>
            current.map((value, slotIndex) =>
              slotIndex === activePickerSlot.index ? playerId : value,
            ),
          );
          setActivePickerSlot(null);
        }}
        players={sortedPlayers}
        selectedIds={selectedIds}
        visible={Boolean(activePickerSlot)}
      />

      <LoadingDialog
        message={loadingMessage}
        onRequestClose={() => {}}
        visible={
          Boolean(seasonState?.isLoading) ||
          isLoadingPrediction ||
          isLoadingHistoricalPredictions
        }
      />
    </>
  );
}

function PredictionTeamPicker({
  onOpenSlot,
  playerMap,
  selectedPlayerIds,
  teamKey,
  title,
}) {
  return (
    <View style={styles.teamColumn}>
      <Text style={styles.teamTitle}>
        {`${title} (${selectedPlayerIds.filter(Boolean).length}/${MAX_PLAYERS_PER_TEAM})`}
      </Text>

      {selectedPlayerIds.map((playerId, index) => {
        const player = playerMap.get(Number(playerId));

        return (
          <View key={`${teamKey}-${index}`} style={styles.playerPickerSlot}>
            <Pressable
              onPress={() => onOpenSlot({ index, teamKey })}
              style={styles.playerRow}>
              <Text style={styles.playerName}>
                {player ? getPlayerDisplayName(player) : `PLAYER ${index + 1}`}
              </Text>
              <Text style={styles.playerMeta}>
                {player
                  ? `POS ${player.position ?? '-'} / ${String(
                      player.status ?? 'unknown',
                    ).toUpperCase()}`
                  : 'TAP TO SELECT'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function PredictionPlayerPickerModal({
  currentPlayerId,
  onClose,
  onSelectPlayer,
  players,
  selectedIds,
  visible,
}) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.popupOverlay}>
        <View style={styles.predictionPickerPanel}>
          <View style={styles.predictionDialogHeader}>
            <View style={styles.predictionDialogHeaderTextBlock}>
              <Text style={styles.popupTitle}>SELECT PLAYER</Text>
              <Text style={styles.predictionDialogMetaText}>
                ACTIVE PLAYERS ONLY
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.popupButton}>
              <Text style={styles.popupButtonText}>CLOSE</Text>
            </Pressable>
          </View>

          <ScrollView nestedScrollEnabled style={styles.playerDropdownScroll}>
            {currentPlayerId ? (
              <Pressable
                onPress={() => onSelectPlayer(null)}
                style={styles.dropdownOption}>
                <Text style={styles.dropdownOptionText}>CLEAR SLOT</Text>
              </Pressable>
            ) : null}

            {players.map(option => {
              const optionId = Number(option.id);
              const isCurrentPlayer = optionId === currentPlayerId;
              const isDisabled = selectedIds.has(optionId) && !isCurrentPlayer;

              return (
                <Pressable
                  disabled={isDisabled}
                  key={optionId}
                  onPress={() => onSelectPlayer(optionId)}
                  style={[
                    styles.dropdownOption,
                    isCurrentPlayer && styles.dropdownOptionActive,
                    isDisabled && styles.playerOptionDisabled,
                  ]}>
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isCurrentPlayer && styles.dropdownOptionTextActive,
                      isDisabled && styles.playerOptionDisabledText,
                    ]}>
                    {getPlayerDisplayName(option)}
                  </Text>
                  <Text
                    style={[
                      styles.playerMeta,
                      isDisabled && styles.playerOptionDisabledText,
                    ]}>
                    {isDisabled
                      ? 'ALREADY SELECTED'
                      : `POS ${option.position ?? '-'} / ${String(
                          option.status ?? 'unknown',
                        ).toUpperCase()} / WIN ${formatNumber(
                          option.win_percentage ?? 0,
                        )}%`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SummaryStat({ label, value }) {
  return (
    <View style={styles.statsSummaryCard}>
      <Text style={styles.statsSummaryLabel}>{label.toUpperCase()}</Text>
      <Text numberOfLines={1} style={styles.statsSummaryValue}>
        {value}
      </Text>
    </View>
  );
}

function StrengthBox({ label, value }) {
  return (
    <View style={styles.predictionStrengthBox}>
      <Text style={styles.predictionStrengthLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.predictionStrengthValue}>{value}</Text>
    </View>
  );
}

function HistoricalGameModal({ details, onClose }) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(details)}
      onRequestClose={onClose}>
      <View style={styles.popupOverlay}>
        <View style={styles.predictionDialogPanel}>
          <View style={styles.predictionDialogHeader}>
            <View style={styles.predictionDialogHeaderTextBlock}>
              <Text style={styles.popupTitle}>{details?.title ?? ''}</Text>
              <Text style={styles.predictionDialogMetaText}>
                {`DATE ${details?.gameDate ?? '-'} / SCORE ${details?.score ?? '-'}`}
              </Text>
              <View style={styles.predictionDialogStatsRow}>
                <Text
                  style={[
                    styles.predictionDialogResultText,
                    details?.result === 'OK'
                      ? styles.predictionHistoryHitText
                      : styles.predictionHistoryMissText,
                  ]}>
                  {`RESULT ${details?.result ?? '-'} / PRED ${details?.predictedWinner ?? '-'}`}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.popupButton}>
              <Text style={styles.popupButtonText}>CLOSE</Text>
            </Pressable>
          </View>

          <View style={styles.teamsGrid}>
            <View style={styles.teamColumn}>
              <Text style={styles.teamTitle}>
                {`WHITE ${details?.whitePercent ?? '-' }%`}
              </Text>
              {(details?.whitePlayers?.length
                ? details.whitePlayers
                : ['NO PLAYERS']
              ).map(playerName => (
                <View key={`white-${playerName}`} style={styles.playerRow}>
                  <Text style={styles.playerName}>{playerName}</Text>
                </View>
              ))}
            </View>

            <View style={styles.teamColumn}>
              <Text style={styles.teamTitle}>
                {`BLACK ${details?.blackPercent ?? '-' }%`}
              </Text>
              {(details?.blackPlayers?.length
                ? details.blackPlayers
                : ['NO PLAYERS']
              ).map(playerName => (
                <View key={`black-${playerName}`} style={styles.playerRow}>
                  <Text style={styles.playerName}>{playerName}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatNumber(value) {
  return Number(value ?? 0).toFixed(1).replace(/\.0$/, '');
}

function syncSelectedIds(currentIds, availableIds) {
  return currentIds.map(playerId =>
    playerId && availableIds.has(Number(playerId)) ? Number(playerId) : null,
  );
}

function areIdListsEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => Number(value) === Number(right[index]));
}

function sortHistoricalPlayers(left, right) {
  const positionDiff =
    toNumber(left.position, 999) - toNumber(right.position, 999);

  if (positionDiff !== 0) {
    return positionDiff;
  }

  return getPlayerDisplayName(left).localeCompare(getPlayerDisplayName(right));
}

function formatHistoricalPlayerName(player) {
  return getPlayerDisplayName(player);
}
