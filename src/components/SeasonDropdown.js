import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '../styles/biosStyles';

export function SeasonDropdown({
  error,
  helperTextOverride,
  isLoading,
  onSelect,
  seasons,
  selectedSeason,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = selectedSeason?.season ?? 'Select season';
  const helperText = helperTextOverride ?? (isLoading
    ? 'LOADING SEASONS...'
    : error
      ? `SEASON LINK ERROR: ${error}`
      : `${seasons.length} SEASONS LOADED`);

  return (
    <View style={styles.dropdownBlock}>
      <Text style={styles.inputLabel}>SEASON</Text>

      <Pressable
        disabled={isLoading || seasons.length === 0}
        onPress={() => setIsOpen(current => !current)}
        style={[
          styles.dropdownButton,
          isOpen && styles.dropdownButtonActive,
          (isLoading || seasons.length === 0) && styles.dropdownButtonDisabled,
        ]}>
        <Text style={styles.dropdownButtonText}>{selectedLabel}</Text>
        <Text style={styles.dropdownArrow}>{isOpen ? '^' : 'v'}</Text>
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          {seasons.map(season => (
            <Pressable
              key={season.id}
              onPress={() => {
                onSelect(season.id);
                setIsOpen(false);
              }}
              style={[
                styles.dropdownOption,
                selectedSeason?.id === season.id && styles.dropdownOptionActive,
              ]}>
              <Text
                style={[
                  styles.dropdownOptionText,
                  selectedSeason?.id === season.id &&
                    styles.dropdownOptionTextActive,
                ]}>
                {season.season}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={[styles.dropdownHelp, error && styles.dropdownError]}>
        {helperText}
      </Text>
    </View>
  );
}
