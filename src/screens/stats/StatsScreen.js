import { ScreenLayout } from '../../components/ScreenLayout';
import { screens } from '../../data/screens';

export function StatsScreen({ seasonState }) {
  return (
    <ScreenLayout
      screen={screens.stats}
      seasonState={seasonState}
      showSeasonDropdown
    />
  );
}
