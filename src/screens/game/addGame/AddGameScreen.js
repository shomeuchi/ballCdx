import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppPopup } from '../../../components/AppPopup';
import { LoadingDialog } from '../../../components/LoadingDialog';
import { SeasonDropdown } from '../../../components/SeasonDropdown';
import { getPlayersWithLast10Games } from '../../../services/player/playersService';
import { createGameWithTeamPlayers } from '../../../services/game/gamesService';
import { styles } from '../../../styles/biosStyles';

const TEAM_OPTIONS = [
  { id: 1, label: 'WHITE' },
  { id: 2, label: 'BLACK' },
];
const TEAM_SIZE = 6;

export function AddGameScreen({ onBack, onCreated, seasonState }) {
  const [gameDate, setGameDate] = useState(getTodayValue());
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(getTodayValue()),
  );
  const [finalScore, setFinalScore] = useState('');
  const [teamWinId, setTeamWinId] = useState(1);
  const [whitePlayerIds, setWhitePlayerIds] = useState(emptyTeamSlots);
  const [blackPlayerIds, setBlackPlayerIds] = useState(emptyTeamSlots);
  const [players, setPlayers] = useState([]);
  const [playersError, setPlayersError] = useState('');
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [openWinner, setOpenWinner] = useState(false);
  const [openPlayerSlot, setOpenPlayerSlot] = useState(null);
  const [popup, setPopup] = useState(null);

  function closePopup() {
    const action = popup?.onClose;

    setPopup(null);
    action?.();
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPlayers() {
      setIsLoadingPlayers(true);
      setPlayersError('');

      try {
        const list = await getPlayersWithLast10Games({
          signal: controller.signal,
        });

        if (isMounted) {
          setPlayers(Array.isArray(list) ? list : []);
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') {
          return;
        }

        if (isMounted) {
          setPlayers([]);
          setPlayersError(requestError.message || 'Unable to load players');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPlayers(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const selectedIds = useMemo(
    () =>
      new Set(
        [...whitePlayerIds, ...blackPlayerIds].filter(playerId => playerId),
      ),
    [blackPlayerIds, whitePlayerIds],
  );

  const selectedCount = selectedIds.size;
  const selectedSeason = seasonState?.selectedSeason;
  const selectedWinner =
    TEAM_OPTIONS.find(option => option.id === teamWinId)?.label ?? 'WHITE';
  const scoreValue = Number(finalScore);
  const scoreIsValid =
    finalScore !== '' &&
    Number.isInteger(scoreValue) &&
    scoreValue >= 0 &&
    scoreValue <= 50;
  const canSubmit =
    selectedSeason?.id &&
    isValidDateValue(gameDate) &&
    scoreIsValid &&
    selectedCount > 0 &&
    !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) {
      const validationError =
        'Select a season, date, score from 0 to 50, winner, and at least one player.';

      setSubmitError(validationError);
      setPopup({
        message: validationError,
        title: 'CREATE GAME',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const selectedPlayers = [
      ...whitePlayerIds
        .filter(playerId => playerId)
        .map(playerId => ({
          player_id: Number(playerId),
          team_id: 1,
        })),
      ...blackPlayerIds
        .filter(playerId => playerId)
        .map(playerId => ({
          player_id: Number(playerId),
          team_id: 2,
        })),
    ];

    try {
      await createGameWithTeamPlayers({
        finalScore: scoreValue,
        gameDate,
        players: selectedPlayers,
        seasonId: selectedSeason.id,
        teamWinId,
      });

      setPopup({
        message: 'Game created successfully.',
        onClose: () => onCreated?.(),
        title: 'CREATE GAME',
      });
    } catch (requestError) {
      const createError = requestError.message || 'Unable to create game';

      setSubmitError(createError);
      setPopup({
        message: createError,
        title: 'CREATE GAME',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
      <View style={styles.panel}>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>BACK TO GAMES</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>ADD GAME</Text>
        <Text style={styles.prompt}>NEW GAME</Text>
        <Text style={styles.copy}>
          Create a game with teams and selected players.
        </Text>

        <View style={styles.divider} />

        <SeasonDropdown
          error={seasonState?.error}
          isLoading={seasonState?.isLoading}
          onSelect={seasonState?.setSelectedSeasonId}
          seasons={seasonState?.seasons ?? []}
          selectedSeason={selectedSeason}
        />

        <Text style={styles.inputLabel}>GAME DATE</Text>
        <CalendarPicker
          month={calendarMonth}
          onChangeMonth={setCalendarMonth}
          onSelectDate={setGameDate}
          selectedDate={gameDate}
        />

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>FINAL SCORE</Text>
          <TextInput
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={value => {
              const digitsOnly = value.replace(/\D/g, '');
              const limitedValue =
                digitsOnly === '' ? '' : String(Math.min(Number(digitsOnly), 50));

              setFinalScore(limitedValue);
            }}
            placeholder="0-50"
            placeholderTextColor="#b8c7ff"
            style={styles.input}
            value={finalScore}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>WINNER</Text>
          <Pressable
            onPress={() => setOpenWinner(current => !current)}
            style={[
              styles.dropdownButton,
              openWinner && styles.dropdownButtonActive,
            ]}>
            <Text style={styles.dropdownButtonText}>
              {selectedWinner} TEAM ({teamWinId})
            </Text>
            <Text style={styles.dropdownArrow}>{openWinner ? '^' : 'v'}</Text>
          </Pressable>

          {openWinner && (
            <View style={styles.dropdownMenu}>
              {TEAM_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setTeamWinId(option.id);
                    setOpenWinner(false);
                  }}
                  style={[
                    styles.dropdownOption,
                    teamWinId === option.id && styles.dropdownOptionActive,
                  ]}>
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      teamWinId === option.id &&
                        styles.dropdownOptionTextActive,
                    ]}>
                    {option.label} TEAM ({option.id})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.gamesPanel}>
        {isLoadingPlayers && (
          <Text style={styles.gamesStateText}>LOADING PLAYERS...</Text>
        )}

        {playersError ? (
          <Text style={[styles.gamesStateText, styles.dropdownError]}>
            PLAYERS LINK ERROR: {playersError}
          </Text>
        ) : null}

        <View style={styles.teamPickerHeader}>
          <Text style={styles.teamPickerHeaderText}>
            PLAYERS SELECTED {selectedCount}/12
          </Text>
        </View>

        <View style={styles.teamsGrid}>
          <PlayerTeamPicker
            openPlayerSlot={openPlayerSlot}
            players={players}
            selectedIds={selectedIds}
            selectedPlayerIds={whitePlayerIds}
            setOpenPlayerSlot={setOpenPlayerSlot}
            setSelectedPlayerIds={setWhitePlayerIds}
            teamKey="white"
            title="WHITE"
          />
          <PlayerTeamPicker
            openPlayerSlot={openPlayerSlot}
            players={players}
            selectedIds={selectedIds}
            selectedPlayerIds={blackPlayerIds}
            setOpenPlayerSlot={setOpenPlayerSlot}
            setSelectedPlayerIds={setBlackPlayerIds}
            teamKey="black"
            title="BLACK"
          />
        </View>

        {submitError ? (
          <Text style={[styles.gamesStateText, styles.dropdownError]}>
            CREATE GAME ERROR: {submitError}
          </Text>
        ) : null}

        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          style={[
            styles.primaryButton,
            !canSubmit && styles.dropdownButtonDisabled,
          ]}>
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'CREATING...' : 'CREATE GAME'}
          </Text>
        </Pressable>
      </View>
      </ScrollView>

      <AppPopup
        message={popup?.message ?? ''}
        onClose={closePopup}
        title={popup?.title ?? ''}
        visible={Boolean(popup)}
      />
      <LoadingDialog
        message={
          isSubmitting
            ? 'CREATING GAME...'
            : seasonState?.isLoading
              ? 'LOADING SEASONS...'
              : 'LOADING PLAYERS...'
        }
        onRequestClose={() => {}}
        visible={
          isSubmitting ||
          Boolean(seasonState?.isLoading) ||
          isLoadingPlayers
        }
      />
    </>
  );
}

function PlayerTeamPicker({
  openPlayerSlot,
  players,
  selectedIds,
  selectedPlayerIds,
  setOpenPlayerSlot,
  setSelectedPlayerIds,
  teamKey,
  title,
}) {
  return (
    <View style={styles.teamColumn}>
      <Text style={styles.teamTitle}>
        {title} ({selectedPlayerIds.filter(Boolean).length}/6)
      </Text>

      {selectedPlayerIds.map((playerId, index) => {
        const slotKey = `${teamKey}-${index}`;
        const isOpen = openPlayerSlot === slotKey;
        const player = players.find(item => getPlayerId(item) === playerId);

        return (
          <View key={slotKey} style={styles.playerPickerSlot}>
            <Pressable
              onPress={() =>
                setOpenPlayerSlot(current => (current === slotKey ? null : slotKey))
              }
              style={[
                styles.playerRow,
                isOpen && styles.playerPickerSlotActive,
              ]}>
              <Text style={styles.playerName}>
                {player ? getPlayerName(player) : `PLAYER ${index + 1}`}
              </Text>
              <Text style={styles.playerMeta}>
                {player ? getPlayerMeta(player) : 'TAP TO SELECT'}
              </Text>
            </Pressable>

            {isOpen && (
              <View style={styles.playerDropdownMenu}>
                <ScrollView nestedScrollEnabled style={styles.playerDropdownScroll}>
                  {playerId ? (
                    <Pressable
                      onPress={() => {
                        setSelectedPlayerIds(current =>
                          current.map((value, slotIndex) =>
                            slotIndex === index ? null : value,
                          ),
                        );
                        setOpenPlayerSlot(null);
                      }}
                      style={styles.dropdownOption}>
                      <Text style={styles.dropdownOptionText}>CLEAR SLOT</Text>
                    </Pressable>
                  ) : null}

                  {players.map(option => {
                    const optionId = getPlayerId(option);
                    const isCurrentPlayer = optionId === playerId;
                    const isDisabled =
                      selectedIds.has(optionId) && !isCurrentPlayer;

                    return (
                      <Pressable
                        disabled={isDisabled}
                        key={optionId}
                        onPress={() => {
                          setSelectedPlayerIds(current =>
                            current.map((value, slotIndex) =>
                              slotIndex === index ? optionId : value,
                            ),
                          );
                          setOpenPlayerSlot(null);
                        }}
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
                          {getPlayerName(option)}
                        </Text>
                        <Text
                          style={[
                            styles.playerMeta,
                            isDisabled && styles.playerOptionDisabledText,
                          ]}>
                          {isDisabled
                            ? 'ALREADY SELECTED'
                            : getPlayerMeta(option)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function CalendarPicker({ month, onChangeMonth, onSelectDate, selectedDate }) {
  const calendarDays = useMemo(() => getCalendarDays(month), [month]);
  const monthLabel = month.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.calendarBox}>
      <View style={styles.calendarHeader}>
        <Pressable
          onPress={() => onChangeMonth(addMonths(month, -1))}
          style={styles.calendarNavButton}>
          <Text style={styles.calendarNavText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.calendarTitle}>{monthLabel}</Text>
        <Pressable
          onPress={() => onChangeMonth(addMonths(month, 1))}
          style={styles.calendarNavButton}>
          <Text style={styles.calendarNavText}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.calendarWeek}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.calendarWeekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((dateValue, index) => {
          const isSelected = dateValue === selectedDate;

          return (
            <Pressable
              disabled={!dateValue}
              key={`${dateValue || 'empty'}-${index}`}
              onPress={() => onSelectDate(dateValue)}
              style={[
                styles.calendarDay,
                isSelected && styles.calendarDaySelected,
                !dateValue && styles.calendarDayEmpty,
              ]}>
              <Text
                style={[
                  styles.calendarDayText,
                  isSelected && styles.calendarDayTextSelected,
                ]}>
                {dateValue ? Number(dateValue.slice(-2)) : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.dropdownHelp}>SELECTED {selectedDate}</Text>
    </View>
  );
}

function emptyTeamSlots() {
  return Array.from({ length: TEAM_SIZE }, () => null);
}

function getPlayerId(player) {
  return Number(player.player_id ?? player.id);
}

function getPlayerName(player) {
  return (
    player.name ||
    [player.first_name, player.last_name].filter(Boolean).join(' ') ||
    `PLAYER #${getPlayerId(player)}`
  );
}

function getPlayerMeta(player) {
  const last10 =
    player.last_10_games ??
    player.last10_games ??
    player.games_last_10 ??
    player.games_played_last_10;

  if (last10 !== undefined && last10 !== null) {
    return `LAST 10: ${last10}`;
  }

  return `ID ${getPlayerId(player)}`;
}

function getTodayValue() {
  const today = new Date();

  return toDateValue(today);
}

function startOfMonth(dateValue) {
  const [year, month] = dateValue.split('-').map(Number);

  return new Date(year, month - 1, 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getCalendarDays(month) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: firstDay }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(toDateValue(new Date(year, monthIndex, day)));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isValidDateValue(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}
