import { ScreenLayout } from '../components/ScreenLayout';
import { screens } from '../data/screens';

export function StatsScreen() {
  return <ScreenLayout screen={screens.stats} showSeasonDropdown />;
}
