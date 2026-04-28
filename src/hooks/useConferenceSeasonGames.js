import { useCallback, useEffect, useState } from 'react';

import { getConferenceSeasonGames } from '../services/game/gamesService';

export function useConferenceSeasonGames({ conferenceId, seasonId }) {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefreshIndex(current => current + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadGames() {
      if (!conferenceId || !seasonId) {
        setGames([]);
        setError('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      setGames([]);

      try {
        const list = await getConferenceSeasonGames({
          conferenceId,
          seasonId,
          signal: controller.signal,
        });

        if (!isMounted) {
          return;
        }

        setGames(Array.isArray(list) ? list : []);
      } catch (requestError) {
        if (requestError.name === 'AbortError') {
          return;
        }

        if (!isMounted) {
          return;
        }

        setGames([]);
        setError(requestError.message || 'Unable to load games');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [conferenceId, refreshIndex, seasonId]);

  return {
    error,
    games,
    isLoading,
    refresh,
  };
}
