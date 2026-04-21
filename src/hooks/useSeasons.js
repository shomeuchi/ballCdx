import { useEffect, useState } from 'react';

import { endpoints } from '../constants/api';

export function useSeasons(enabled = true) {
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
        const response = await fetch(endpoints.seasonsByConferenceId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : [];

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
  }, [enabled]);

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
