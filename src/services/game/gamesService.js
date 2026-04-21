import { endpoints } from '../../constants/api';

export async function getConferenceSeasonGames({ conferenceId, seasonId, signal }) {
  const response = await fetch(endpoints.conferenceSeasonGames, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conference_id: conferenceId,
      season_id: seasonId,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return data?.data ?? data?.games ?? [];
}
