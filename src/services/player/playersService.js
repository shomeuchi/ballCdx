import { endpoints } from '../../constants/api';

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

  return data?.data ?? data?.players ?? [];
}
