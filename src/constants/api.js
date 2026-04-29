export const API_BASE_URL = 'http://192.168.1.161:3000';

export const endpoints = {
  addPlayer: `${API_BASE_URL}/player/addPlayer`,
  conferenceSeasonGames: `${API_BASE_URL}/game/conference_season_games`,
  createGameWithTeamPlayers: `${API_BASE_URL}/game/create_game_with_team_players`,
  editPlayer: `${API_BASE_URL}/player/editPlayer`,
  gamePlayers: `${API_BASE_URL}/game/players`,
  login: `${API_BASE_URL}/login/login`,
  playersWithLast10Games: `${API_BASE_URL}/player/players_with_last_10_games`,
  statsPlayerDataFullStats: `${API_BASE_URL}/stats/playerDataFullStats`,
  seasonsByConferenceId: `${API_BASE_URL}/main/seasons_by_conference_id`,
};
