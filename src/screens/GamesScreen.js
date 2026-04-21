import { ScreenLayout } from '../components/ScreenLayout';
import { screens } from '../data/screens';

export function GamesScreen() {
  return <ScreenLayout screen={screens.games} showSeasonDropdown />;
}
