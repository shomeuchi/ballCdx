import { endpoints } from '../../constants/api';

export async function getSeasonsByConferenceId(conferenceId = 1) {
  const response = await fetch(endpoints.seasonsByConferenceId, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conference_id: conferenceId,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return data?.data ?? data?.seasons ?? [];
}
