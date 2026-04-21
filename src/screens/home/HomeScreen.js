import { ScreenLayout } from '../../components/ScreenLayout';
import { screens } from '../../data/screens';

export function HomeScreen() {
  return <ScreenLayout screen={screens.home} showSeasonDropdown />;
}
