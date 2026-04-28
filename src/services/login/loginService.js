import { endpoints } from '../../constants/api';

export async function loginUser({ password, signal, username }) {
  const response = await fetch(endpoints.login, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password,
      username,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  return data?.data ?? data?.user ?? data;
}
