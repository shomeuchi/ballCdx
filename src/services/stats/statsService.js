import { endpoints } from '../../constants/api';

export async function getPlayerDataFullStats({ seasonId, signal }) {
  const response = await fetch(endpoints.statsPlayerDataFullStats, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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

  return data?.data ?? data?.players ?? [];
}
