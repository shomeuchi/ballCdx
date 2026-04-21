import { ScreenLayout } from '../components/ScreenLayout';
import { screens } from '../data/screens';

export function PredictionScreen() {
  return <ScreenLayout screen={screens.prediction} showSeasonDropdown />;
}
