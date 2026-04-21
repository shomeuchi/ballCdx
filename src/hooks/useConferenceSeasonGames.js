import { useEffect, useState } from 'react';

import { getConferenceSeasonGames } from '../services/game/gamesService';

export function useConferenceSeasonGames({ conferenceId, seasonId }) {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadGames() {
      if (!conferenceId || !seasonId) {
        setGames([]);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const list = await getConferenceSeasonGames({
          conferenceId,
          seasonId,
        });

        if (!isMounted) {
          return;
        }

        setGames(Array.isArray(list) ? list : []);
      } catch (requestError) {
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
    };
  }, [conferenceId, seasonId]);

  return {
    error,
    games,
    isLoading,
  };
}
