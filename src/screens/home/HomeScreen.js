import { ScreenLayout } from '../../components/ScreenLayout';
import { screens } from '../../data/screens';

export function HomeScreen({ seasonState }) {
  return (
    <ScreenLayout
      screen={screens.home}
      seasonState={seasonState}
      showSeasonDropdown
    />
  );
}
