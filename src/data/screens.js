export const screens = {
  home: {
    title: 'Home',
    summary: 'Command center',
    rows: [
      ['Active module', 'Dashboard'],
      ['Data link', 'Local preview'],
      ['Session', 'Authenticated'],
      ['System mode', 'Development'],
    ],
    copy:
      'Select a module below to review basketball operations, player records, statistics, prediction tools, and app preferences.',
  },
  games: {
    title: 'Games',
    summary: 'Schedule matrix',
    rows: [
      ['Tonight', '3 matchups'],
      ['Next tipoff', '19:30'],
      ['Court status', 'Open'],
      ['Sync', 'Manual'],
    ],
    copy:
      'Track fixtures, final scores, venues, and live game readiness from this BIOS-style schedule panel.',
  },
  players: {
    title: 'Players',
    summary: 'Roster registry',
    rows: [
      ['Roster size', '12 players'],
      ['Available', '10 active'],
      ['Injured', '1 listed'],
      ['Scouting', 'Enabled'],
    ],
    copy:
      'Review player profiles, positions, form indicators, availability, and scouting notes in one consistent interface.',
  },
  stats: {
    title: 'Stats',
    summary: 'Performance table',
    rows: [
      ['Team pace', 'High'],
      ['FG trend', '+4.2%'],
      ['Rebounds', 'Stable'],
      ['Turnovers', 'Watch'],
    ],
    copy:
      'Inspect team and player metrics with compact rows designed for quick comparison during analysis.',
  },
  prediction: {
    title: 'Prediction',
    summary: 'Forecast engine',
    rows: [
      ['Model status', 'Standby'],
      ['Confidence', 'Pending'],
      ['Inputs', 'Awaiting data'],
      ['Output', 'No pick yet'],
    ],
    copy:
      'Prepare prediction inputs, compare matchup signals, and surface model decisions once real data is connected.',
  },
  settings: {
    title: 'Settings',
    summary: 'System options',
    rows: [
      ['Theme', 'BIOS blue'],
      ['Network', 'LAN'],
      ['Expo Go', '54.0.6'],
      ['Build', '1.0.0'],
    ],
    copy:
      'Tune app preferences, preview runtime status, and keep environment details visible while the product grows.',
  },
};

export const navItems = [
  ['home', 'Home'],
  ['games', 'Games'],
  ['players', 'Players'],
  ['stats', 'Stats'],
  ['prediction', 'Predict'],
];
