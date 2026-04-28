import { endpoints } from '../../constants/api';

export async function addPlayer({ player, signal }) {
  const response = await fetch(endpoints.addPlayer, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(player),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  return data?.data ?? data?.player ?? data;
}

export async function getPlayersWithLast10Games({ signal } = {}) {
  const response = await fetch(endpoints.playersWithLast10Games, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.players)) {
    return data.data.players;
  }

  return data?.players ?? [];
}

export async function editPlayer({ player, signal }) {
  const response = await fetch(endpoints.editPlayer, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(player),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  return data?.data ?? data?.player ?? data;
}
