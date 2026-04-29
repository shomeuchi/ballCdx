export const MAX_PLAYERS_PER_TEAM = 6;

export function createEmptyTeamSlots() {
  return Array.from({ length: MAX_PLAYERS_PER_TEAM }, () => null);
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function logistic(diff, scale) {
  return 1 / (1 + Math.exp(-(diff / scale)));
}

export function getPlayerDisplayName(player) {
  return (
    player?.name ||
    [player?.first_name, player?.last_name].filter(Boolean).join(' ') ||
    `PLAYER #${player?.id ?? '?'}`
  );
}

export function formAverage(lastFive) {
  if (!Array.isArray(lastFive) || !lastFive.length) {
    return 0.5;
  }

  const resultValues = {
    L: 0,
    T: 0.5,
    W: 1,
  };
  const values = lastFive
    .slice(0, 5)
    .map(item => resultValues[String(item?.result ?? '').toUpperCase()] ?? 0.5);

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function formText(lastFive) {
  if (!Array.isArray(lastFive) || !lastFive.length) {
    return 'n/a';
  }

  return lastFive
    .slice(0, 5)
    .map(item => String(item?.result ?? '-').toUpperCase())
    .join(' ');
}

export function statusFactor(status) {
  const normalizedStatus = String(status ?? '').toLowerCase();

  if (normalizedStatus === 'active') {
    return 1;
  }

  if (normalizedStatus === 'injured') {
    return 0.35;
  }

  return 0.75;
}

export function buildGameLineups(games, gamePlayersMap) {
  return games.map(game => {
    const players = gamePlayersMap.get(Number(game.id)) ?? [];

    return {
      blackIds: players
        .filter(player => toNumber(player.team_id) === 2)
        .map(player => Number(player.player_id ?? player.id)),
      gameId: Number(game.id),
      whiteIds: players
        .filter(player => toNumber(player.team_id) === 1)
        .map(player => Number(player.player_id ?? player.id)),
      winTeam: String(game.win_team ?? '').toLowerCase(),
    };
  });
}

export function computeSynergy(teamIds, lineups, teamName) {
  if (!teamIds.length || teamIds.length < 2) {
    return { pairCount: 0, score: 0 };
  }

  let totalScore = 0;
  let weightedPairs = 0;

  for (let index = 0; index < teamIds.length; index += 1) {
    for (
      let secondaryIndex = index + 1;
      secondaryIndex < teamIds.length;
      secondaryIndex += 1
    ) {
      const firstId = Number(teamIds[index]);
      const secondId = Number(teamIds[secondaryIndex]);
      let togetherGames = 0;
      let togetherWins = 0;

      lineups.forEach(game => {
        const sameTeamIds = teamName === 'white' ? game.whiteIds : game.blackIds;

        if (sameTeamIds.includes(firstId) && sameTeamIds.includes(secondId)) {
          togetherGames += 1;

          if (game.winTeam === teamName) {
            togetherWins += 1;
          }
        }
      });

      if (togetherGames > 0) {
        const winRate = togetherWins / togetherGames;
        const chemistryEdge = (winRate - 0.5) * 2;
        const reliability = Math.min(togetherGames / 6, 1);

        totalScore += chemistryEdge * reliability;
        weightedPairs += 1;
      }
    }
  }

  return {
    pairCount: weightedPairs,
    score: weightedPairs ? totalScore / weightedPairs : 0,
  };
}

export function computeMatchupBonus(whiteIds, blackIds, lineups) {
  let blackScore = 0;
  let whiteScore = 0;
  let weightedMatchups = 0;

  whiteIds.forEach(whiteId => {
    blackIds.forEach(blackId => {
      let blackWins = 0;
      let facedGames = 0;
      let whiteWins = 0;

      lineups.forEach(game => {
        const whiteAsWhite =
          game.whiteIds.includes(Number(whiteId)) &&
          game.blackIds.includes(Number(blackId));
        const whiteAsBlack =
          game.blackIds.includes(Number(whiteId)) &&
          game.whiteIds.includes(Number(blackId));

        if (whiteAsWhite) {
          facedGames += 1;

          if (game.winTeam === 'white') {
            whiteWins += 1;
          }

          if (game.winTeam === 'black') {
            blackWins += 1;
          }
        }

        if (whiteAsBlack) {
          facedGames += 1;

          if (game.winTeam === 'black') {
            whiteWins += 1;
          }

          if (game.winTeam === 'white') {
            blackWins += 1;
          }
        }
      });

      if (facedGames > 0) {
        const whiteEdge = (whiteWins / facedGames - 0.5) * 2;
        const blackEdge = (blackWins / facedGames - 0.5) * 2;
        const reliability = Math.min(facedGames / 5, 1);

        whiteScore += whiteEdge * reliability;
        blackScore += blackEdge * reliability;
        weightedMatchups += 1;
      }
    });
  });

  return {
    black: weightedMatchups ? blackScore / weightedMatchups : 0,
    matchupCount: weightedMatchups,
    white: weightedMatchups ? whiteScore / weightedMatchups : 0,
  };
}

export function buildPlayerModel(player, teamIds, teamName, lineups) {
  const gamesPlayed = toNumber(player?.games_played);
  const winRate = clamp(toNumber(player?.win_percentage) / 100, 0, 1);
  const form = clamp(formAverage(player?.last_5_results), 0, 1);
  const experience = clamp(gamesPlayed / 20, 0, 1);
  const availability = statusFactor(player?.status);
  const teammates = teamIds.filter(id => Number(id) !== Number(player?.id));
  const teamSynergy = computeSynergy(
    [Number(player?.id), ...teammates],
    lineups,
    teamName,
  ).score;
  const synergyNormalized = clamp((teamSynergy + 1) / 2, 0, 1);

  let risk = 0;

  if (gamesPlayed < 5) {
    risk += 0.5;
  } else if (gamesPlayed < 10) {
    risk += 0.25;
  }

  if (toNumber(player?.win_percentage) < 45) {
    risk += 0.25;
  }

  if (form < 0.4) {
    risk += 0.2;
  }

  if (String(player?.status ?? '').toLowerCase() === 'injured') {
    risk += 0.8;
  }

  risk = clamp(risk, 0, 1);

  const reliabilityBoost = Math.min(gamesPlayed / 12, 1);
  const rawImpact =
    winRate * 30 +
    form * 20 +
    experience * 18 +
    availability * 10 +
    synergyNormalized * 14 +
    reliabilityBoost * 10 -
    risk * 12;

  return {
    formText: formText(player?.last_5_results),
    gamesPlayed,
    id: Number(player?.id),
    impact: clamp(rawImpact, 0, 100),
    name: getPlayerDisplayName(player),
    player,
    riskScore: risk,
    synergyScore: teamSynergy,
    team: teamName,
    winPct: toNumber(player?.win_percentage),
  };
}

export function coreAndBench(models) {
  const sortedModels = [...models].sort((left, right) => right.impact - left.impact);

  return {
    bench: sortedModels.slice(5),
    core: sortedModels.slice(0, 5),
  };
}

export function computeTogetherStats(teamIds, lineups, teamName) {
  if (!teamIds?.length || !lineups.length) {
    return { count: 0, winRate: 0 };
  }

  let togetherGames = 0;
  let wins = 0;

  lineups.forEach(game => {
    const sameTeamIds = teamName === 'white' ? game.whiteIds : game.blackIds;
    const allPresent = teamIds.every(id => sameTeamIds.includes(Number(id)));

    if (allPresent) {
      togetherGames += 1;

      if (game.winTeam === teamName) {
        wins += 1;
      }
    }
  });

  return {
    count: togetherGames,
    winRate: togetherGames ? (wins / togetherGames) * 100 : 0,
  };
}

export function computePrediction(playerStats, lineups, whiteIdsInput, blackIdsInput) {
  const whiteIds = (whiteIdsInput ?? []).map(Number).filter(Boolean);
  const blackIds = (blackIdsInput ?? []).map(Number).filter(Boolean);
  const playerMap = new Map(
    (playerStats ?? []).map(player => [Number(player.id), player]),
  );

  const whiteModels = whiteIds.map(id =>
    buildPlayerModel(
      playerMap.get(id) ?? {
        games_played: 0,
        id,
        last_5_results: [],
        name: `Unknown #${id}`,
        status: 'unknown',
        win_percentage: 0,
      },
      whiteIds,
      'white',
      lineups,
    ),
  );
  const blackModels = blackIds.map(id =>
    buildPlayerModel(
      playerMap.get(id) ?? {
        games_played: 0,
        id,
        last_5_results: [],
        name: `Unknown #${id}`,
        status: 'unknown',
        win_percentage: 0,
      },
      blackIds,
      'black',
      lineups,
    ),
  );

  const whiteSplit = coreAndBench(whiteModels);
  const blackSplit = coreAndBench(blackModels);
  const whiteCoreIds = whiteSplit.core.map(player => player.id);
  const blackCoreIds = blackSplit.core.map(player => player.id);
  const whiteSynergy = computeSynergy(whiteCoreIds, lineups, 'white').score;
  const blackSynergy = computeSynergy(blackCoreIds, lineups, 'black').score;
  const matchup = computeMatchupBonus(whiteCoreIds, blackCoreIds, lineups);
  const whiteBase =
    whiteSplit.core.reduce((sum, player) => sum + player.impact, 0) /
    Math.max(whiteSplit.core.length, 1);
  const blackBase =
    blackSplit.core.reduce((sum, player) => sum + player.impact, 0) /
    Math.max(blackSplit.core.length, 1);
  const whiteBenchBonus =
    whiteSplit.bench.reduce((sum, player) => sum + player.impact, 0) * 0.08;
  const blackBenchBonus =
    blackSplit.bench.reduce((sum, player) => sum + player.impact, 0) * 0.08;
  const whiteRiskPenalty =
    (whiteSplit.core.reduce((sum, player) => sum + player.riskScore, 0) /
      Math.max(whiteSplit.core.length, 1)) *
    7;
  const blackRiskPenalty =
    (blackSplit.core.reduce((sum, player) => sum + player.riskScore, 0) /
      Math.max(blackSplit.core.length, 1)) *
    7;
  const whiteStrength =
    whiteBase + whiteBenchBonus + whiteSynergy * 14 + matchup.white * 10 - whiteRiskPenalty;
  const blackStrength =
    blackBase + blackBenchBonus + blackSynergy * 14 + matchup.black * 10 - blackRiskPenalty;
  const whiteProbability = clamp(logistic(whiteStrength - blackStrength, 7), 0.05, 0.95);
  const blackProbability = 1 - whiteProbability;
  const allModels = [...whiteModels, ...blackModels].sort(
    (left, right) => right.impact - left.impact,
  );
  const mvp = allModels[0] ?? null;
  const risk =
    [...whiteModels, ...blackModels].sort(
      (left, right) =>
        right.riskScore - left.riskScore || left.impact - right.impact,
    )[0] ?? null;
  const reasons = [];

  if (!whiteModels.length || !blackModels.length) {
    reasons.push('Select players on both teams to generate a prediction.');
  } else {
    reasons.push(
      `${
        whiteStrength >= blackStrength ? 'White' : 'Black'
      } team projects stronger overall from lineup impact.`,
    );

    if (Math.abs(whiteSynergy - blackSynergy) > 0.06) {
      reasons.push(
        `${
          whiteSynergy > blackSynergy ? 'White' : 'Black'
        } lineup has better chemistry from players who won together before.`,
      );
    }

    if (Math.abs(matchup.white - matchup.black) > 0.05) {
      reasons.push(
        `${
          matchup.white > matchup.black ? 'White' : 'Black'
        } side has the better opponent matchup history.`,
      );
    }

    const whiteWinPct =
      whiteSplit.core.reduce((sum, player) => sum + player.winPct, 0) /
      Math.max(whiteSplit.core.length, 1);
    const blackWinPct =
      blackSplit.core.reduce((sum, player) => sum + player.winPct, 0) /
      Math.max(blackSplit.core.length, 1);

    if (Math.abs(whiteWinPct - blackWinPct) > 2) {
      reasons.push(
        `${
          whiteWinPct > blackWinPct ? 'White' : 'Black'
        } team has the better average season win profile.`,
      );
    }

    const whiteForm =
      whiteSplit.core.reduce(
        (sum, player) => sum + formAverage(player.player?.last_5_results),
        0,
      ) / Math.max(whiteSplit.core.length, 1);
    const blackForm =
      blackSplit.core.reduce(
        (sum, player) => sum + formAverage(player.player?.last_5_results),
        0,
      ) / Math.max(blackSplit.core.length, 1);

    if (Math.abs(whiteForm - blackForm) > 0.08) {
      reasons.push(
        `${whiteForm > blackForm ? 'White' : 'Black'} team comes in with stronger recent form.`,
      );
    }

    if (whiteSplit.bench.length || blackSplit.bench.length) {
      reasons.push(
        'A 6th selected player is treated as a bench substitution with a smaller bonus.',
      );
    }

    if (risk) {
      reasons.push(
        `Biggest risk flag is ${risk.name} due to lower experience, form, or win profile.`,
      );
    }
  }

  return {
    blackModels,
    blackProbability,
    blackStrength,
    mvp,
    reasons,
    risk,
    whiteModels,
    whiteProbability,
    whiteStrength,
  };
}
