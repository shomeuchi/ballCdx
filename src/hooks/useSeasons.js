import { useEffect, useState } from 'react';

import { getSeasonsByConferenceId } from '../services/main/seasonsService';

export function useSeasons(enabled = true, conferenceId = 1) {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadSeasons() {
      if (!enabled) {
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const list = await getSeasonsByConferenceId(conferenceId);

        if (!isMounted) {
          return;
        }

        setSeasons(list);
        setSelectedSeasonId(currentId => currentId ?? list[0]?.id ?? null);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setSeasons([]);
        setSelectedSeasonId(null);
        setError(requestError.message || 'Unable to load seasons');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSeasons();

    return () => {
      isMounted = false;
    };
  }, [conferenceId, enabled]);

  const selectedSeason =
    seasons.find(season => season.id === selectedSeasonId) ?? null;

  return {
    error,
    isLoading,
    seasons,
    selectedSeason,
    selectedSeasonId,
    setSelectedSeasonId,
  };
}
