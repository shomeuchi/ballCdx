import { memo, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';

import { LoadingDialog } from '../../components/LoadingDialog';
import { getPlayersWithLast10Games } from '../../services/player/playersService';
import { styles } from '../../styles/biosStyles';
import { AddPlayerScreen } from './addPlayer/AddPlayerScreen';
import { PlayerDetailsScreen } from './playerDetails/PlayerDetailsScreen';
import {
  getAvatarUrl,
  getEmploymentValue,
  getInitials,
  getPlayerId,
  getPlayerName,
  getStatusValue,
} from './playerUtils';

export function PlayersScreen({ currentUser }) {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const playerCounts = useMemo(() => getPlayerCounts(players), [players]);
  const canAddPlayer =
    String(currentUser?.user_type ?? currentUser?.userType ?? '').toLowerCase() ===
    'admin';

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPlayers() {
      setIsLoading(true);
      setError('');

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
          setError(requestError.message || 'Unable to load players');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (selectedPlayer) {
    return (
      <PlayerDetailsScreen
        currentUser={currentUser}
        onBack={() => setSelectedPlayer(null)}
        onSaved={updatedPlayer => {
          setSelectedPlayer(updatedPlayer);
          setPlayers(current =>
            current.map(player =>
              getPlayerId(player) === getPlayerId(updatedPlayer)
                ? {
                    ...player,
                    ...updatedPlayer,
                    avatar_cache_key: Date.now(),
                  }
                : player,
            ),
          );
        }}
        player={selectedPlayer}
      />
    );
  }

  if (isAddingPlayer) {
    return (
      <AddPlayerScreen
        onBack={() => setIsAddingPlayer(false)}
        onCreated={createdPlayer => {
          setPlayers(current => [createdPlayer, ...current]);
          setIsAddingPlayer(false);
        }}
      />
    );
  }

  return (
    <>
      <FlatList
        data={players}
        keyExtractor={(player, index) => `${getPlayerId(player) || index}`}
        ListHeaderComponent={
          <>
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>PLAYERS</Text>
              <Text style={styles.prompt}>ROSTER TABLE</Text>
              <Text style={styles.copy}>
                All players with roster status and employment details.
              </Text>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Players loaded</Text>
                <Text style={styles.infoValue}>{players.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Active</Text>
                <Text style={styles.infoValue}>{playerCounts.active}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Injured</Text>
                <Text style={styles.infoValue}>{playerCounts.injured}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Inessential</Text>
                <Text style={styles.infoValue}>{playerCounts.inessential}</Text>
              </View>
            </View>

            <View style={styles.playersTablePanel}>
              {canAddPlayer && (
                <View style={styles.addGameButtonRow}>
                  <Pressable
                    style={styles.addGameButton}
                    onPress={() => setIsAddingPlayer(true)}>
                    <Text style={styles.addGameButtonText}>ADD PLAYER</Text>
                  </Pressable>
                </View>
              )}

              {error ? (
                <Text style={[styles.gamesStateText, styles.dropdownError]}>
                  PLAYERS LINK ERROR: {error}
                </Text>
              ) : null}

              {!isLoading && !error && players.length === 0 && (
                <Text style={styles.gamesStateText}>NO PLAYERS FOUND</Text>
              )}

              <View style={styles.playersTableHeader}>
                <Text style={styles.playersIndexHeader}>NO</Text>
                <Text style={styles.playersAvatarHeader}>AV</Text>
                <Text style={styles.playersNameHeader}>PLAYER</Text>
                <Text style={styles.playersCellHeader}>STATUS</Text>
                <Text style={styles.playersCellHeader}>WORK</Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <PlayerTableRow
            index={index}
            onPress={setSelectedPlayer}
            player={item}
          />
        )}
        style={styles.content}
      />
      <LoadingDialog
        message="LOADING PLAYERS..."
        onRequestClose={() => {}}
        visible={isLoading}
      />
    </>
  );
}

const PlayerTableRow = memo(function PlayerTableRow({
  index,
  onPress,
  player,
}) {
  const avatarUrl = getAvatarUrl(player);
  const name = getPlayerName(player);

  return (
    <Pressable style={styles.playerTableRow} onPress={() => onPress(player)}>
      <Text style={styles.playerTableIndex}>{index + 1}.</Text>

      <View style={styles.playerAvatar}>
        {avatarUrl ? (
          <Image
            resizeMode="cover"
            source={{ uri: avatarUrl }}
            style={styles.playerAvatarImage}
          />
        ) : (
          <Text style={styles.playerAvatarText}>{getInitials(name)}</Text>
        )}
      </View>

      <View style={styles.playerTableNameCell}>
        <Text style={styles.playerTableName}>{name}</Text>
        <Text style={styles.playerTableSubText}>ID {getPlayerId(player)}</Text>
      </View>

      <Text style={styles.playerTableCell}>{getStatusValue(player)}</Text>
      <Text style={styles.playerTableCell}>{getEmploymentValue(player)}</Text>
    </Pressable>
  );
});

function getPlayerCounts(players) {
  return players.reduce(
    (counts, player) => {
      const status = String(
        player.status ?? player.player_status ?? player.availability ?? '',
      ).toLowerCase();

      if (status === 'active') {
        counts.active += 1;
      }

      if (status === 'injured') {
        counts.injured += 1;
      }

      if (status === 'inessential') {
        counts.inessential += 1;
      }

      return counts;
    },
    {
      active: 0,
      injured: 0,
      inessential: 0,
    },
  );
}
