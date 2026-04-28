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

export async function getGamePlayers({ gameId, signal }) {
  const response = await fetch(endpoints.gamePlayers, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      game_id: gameId,
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

  return data?.data ?? data?.players ?? [];
}

export async function createGameWithTeamPlayers({
  finalScore,
  gameDate,
  players,
  seasonId,
  teamWinId,
  signal,
}) {
  const response = await fetch(endpoints.createGameWithTeamPlayers, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      season_id: String(seasonId),
      game_date: gameDate,
      final_score: Number(finalScore),
      team_win_id: Number(teamWinId),
      players,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  return data?.data ?? data;
}
