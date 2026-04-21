export const API_BASE_URL = 'http://192.168.1.161:3000';

export const endpoints = {
  conferenceSeasonGames: `${API_BASE_URL}/game/conference_season_games`,
  gamePlayers: `${API_BASE_URL}/game/players`,
  seasonsByConferenceId: `${API_BASE_URL}/main/seasons_by_conference_id`,
};
