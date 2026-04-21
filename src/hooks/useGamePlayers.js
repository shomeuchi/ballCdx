import { useEffect, useMemo, useState } from 'react';

import { getGamePlayers } from '../services/game/gamesService';

export function useGamePlayers(gameId) {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPlayers() {
      if (!gameId) {
        setPlayers([]);
        setError('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      setPlayers([]);

      try {
        const list = await getGamePlayers({
          gameId,
          signal: controller.signal,
        });

        if (!isMounted) {
          return;
        }

        setPlayers(Array.isArray(list) ? list : []);
      } catch (requestError) {
        if (requestError.name === 'AbortError') {
          return;
        }

        if (!isMounted) {
          return;
        }

        setPlayers([]);
        setError(requestError.message || 'Unable to load players');
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
  }, [gameId]);

  const teams = useMemo(
    () => ({
      black: players.filter(player => player.team_id === 2),
      white: players.filter(player => player.team_id === 1),
    }),
    [players],
  );

  return {
    error,
    isLoading,
    players,
    teams,
  };
}
