import { API_BASE_URL } from '../../constants/api';

export function getPlayerId(player) {
  return Number(player.player_id ?? player.id);
}

export function getPlayerName(player) {
  return (
    player.name ||
    [player.first_name, player.last_name].filter(Boolean).join(' ') ||
    `PLAYER #${getPlayerId(player)}`
  );
}

export function getInitials(name) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return initials || 'P';
}

export function getAvatarUrl(player) {
  const hasAvatar =
    player.avatar_url ||
    player.avatar ||
    player.photo_url ||
    player.image_url ||
    player.picture ||
    player.profile_image;

  if (!hasAvatar) {
    return '';
  }

  const avatarVersion =
    player.avatar_cache_key ||
    player.avatar_updated_at ||
    player.updated_at ||
    player.avatar_url ||
    'current';

  return `${API_BASE_URL}/player/avatar/${getPlayerId(player)}?v=${encodeURIComponent(
    avatarVersion,
  )}`;
}

export function getStatusValue(player) {
  const status = player.status ?? player.player_status ?? player.availability;

  if (!status) {
    return '-';
  }

  if (String(status).toLowerCase() === 'inessential') {
    return 'iness.';
  }

  return status;
}

export function getEmploymentValue(player) {
  const employment =
    player.employment ??
    player.employment_status ??
    player.work_status ??
    player.job_status;

  if (!employment) {
    return '-';
  }

  const normalizedEmployment = String(employment).toLowerCase();

  if (normalizedEmployment === 'permanent') {
    return 'perm.';
  }

  if (normalizedEmployment === 'temporary') {
    return 'temp.';
  }

  return employment;
}

export function formatGameDate(value) {
  if (!value) {
    return 'NO DATE';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
