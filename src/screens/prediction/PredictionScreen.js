import { ScreenLayout } from '../../components/ScreenLayout';
import { screens } from '../../data/screens';

export function PredictionScreen({ seasonState }) {
  return (
    <ScreenLayout
      screen={screens.prediction}
      seasonState={seasonState}
      showSeasonDropdown
    />
  );
}
