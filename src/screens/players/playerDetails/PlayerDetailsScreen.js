import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { AppPopup } from '../../../components/AppPopup';
import { LoadingDialog } from '../../../components/LoadingDialog';
import { theme } from '../../../constants/theme';
import { editPlayer } from '../../../services/player/playersService';
import { styles } from '../../../styles/biosStyles';
import {
  formatGameDate,
  getAvatarUrl,
  getEmploymentValue,
  getInitials,
  getPlayerId,
  getPlayerName,
  getStatusValue,
} from '../playerUtils';

const STATUS_OPTIONS = ['active', 'inactive', 'inessential', 'injured'];
const EMPLOYMENT_OPTIONS = ['permanent', 'temporary'];

export function PlayerDetailsScreen({ currentUser, onBack, onSaved, player }) {
  const isAdmin =
    String(currentUser?.user_type ?? currentUser?.userType ?? '').toLowerCase() ===
    'admin';
  const avatarUrl = getAvatarUrl(player);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [name, setName] = useState(player.name ?? getPlayerName(player));
  const [firstName, setFirstName] = useState(player.first_name ?? '');
  const [lastName, setLastName] = useState(player.last_name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(player.phone_number ?? '');
  const [email, setEmail] = useState(player.email ?? '');
  const [position, setPosition] = useState(
    player.position === null || player.position === undefined
      ? ''
      : String(player.position),
  );
  const [status, setStatus] = useState(player.status ?? 'active');
  const [employment, setEmployment] = useState(player.employment ?? 'permanent');
  const [openDropdown, setOpenDropdown] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [popup, setPopup] = useState(null);
  const recentResults = Array.isArray(player.last_10_results)
    ? player.last_10_results
    : [];
  const displayAvatar = avatarPreview || avatarUrl;

  function closePopup() {
    const action = popup?.onClose;

    setPopup(null);
    action?.();
  }

  function openAvatarPicker() {
    if (!isAdmin) {
      return;
    }

    setPopup({
      actions: [
        {
          label: 'GALLERY',
          onPress: () => {
            setPopup(null);
            pickAvatar('library');
          },
        },
        {
          label: 'CAMERA',
          onPress: () => {
            setPopup(null);
            pickAvatar('camera');
          },
        },
        {
          label: 'CANCEL',
          onPress: () => setPopup(null),
        },
      ],
      message: 'Choose avatar source.',
      title: 'PLAYER AVATAR',
    });
  }

  async function pickAvatar(source) {
    if (!isAdmin) {
      return;
    }

    setError('');
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('IMAGE ACCESS DENIED');
      return;
    }

    const picker =
      source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;
    const result = await picker({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/png';

    setAvatarPreview(asset.uri);
    setAvatarBase64(`data:${mimeType};base64,${asset.base64}`);
  }

  async function savePlayer() {
    if (!isAdmin || isSaving) {
      return;
    }

    const positionValue = Number(position);

    if (!Number.isInteger(positionValue)) {
      const validationError = 'POSITION MUST BE AN INTEGER';

      setError(validationError);
      setPopup({
        message: validationError,
        title: 'SAVE PLAYER',
      });
      return;
    }

    if (!name.trim()) {
      const validationError = 'NAME IS REQUIRED';

      setError(validationError);
      setPopup({
        message: validationError,
        title: 'SAVE PLAYER',
      });
      return;
    }

    setIsSaving(true);
    setError('');

    const payload = {
      id: getPlayerId(player),
      name: name.trim(),
      first_name: firstName,
      last_name: lastName,
      position: positionValue,
      status,
      employment,
      phone_number: phoneNumber,
      email,
    };

    if (avatarBase64) {
      payload.avatar = avatarBase64;
    }

    try {
      const updatedPlayer = await editPlayer({
        player: payload,
      });

      const mergedPlayer = {
        ...player,
        ...payload,
        ...updatedPlayer,
        avatar_cache_key: Date.now(),
      };

      setAvatarBase64('');
      setPopup({
        message: 'Player saved successfully.',
        onClose: () => {
          onSaved?.(mergedPlayer);
          onBack();
        },
        title: 'SAVE PLAYER',
      });
    } catch (requestError) {
      const saveError = requestError.message || 'Unable to save player';

      setError(saveError);
      setPopup({
        message: saveError,
        title: 'SAVE PLAYER',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
        <View style={styles.panel}>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>BACK TO PLAYERS</Text>
        </Pressable>

        <View style={styles.playerDetailsHeader}>
          <Pressable
            disabled={!isAdmin}
            onPress={openAvatarPicker}
            style={styles.playerDetailsAvatar}>
            {displayAvatar ? (
              <Image
                resizeMode="cover"
                source={{ uri: displayAvatar }}
                style={styles.playerAvatarImage}
              />
            ) : (
              <Text style={styles.playerDetailsAvatarText}>
                {getInitials(name)}
              </Text>
            )}
          </Pressable>

          <View style={styles.playerDetailsTitleBlock}>
            <Text style={styles.sectionTitle}>PLAYER DETAILS</Text>
            <Text style={styles.prompt}>{name}</Text>
            <Text style={styles.copy}>ID {getPlayerId(player)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {isAdmin ? (
          <>
            <EditableField
              label="Name"
              onChangeText={setName}
              value={name}
            />
            <EditableField
              label="First name"
              onChangeText={setFirstName}
              value={firstName}
            />
            <EditableField
              label="Last name"
              onChangeText={setLastName}
              value={lastName}
            />
            <EditableField
              keyboardType="number-pad"
              label="Position"
              onChangeText={value => setPosition(value.replace(/\D/g, ''))}
              value={position}
            />
            <PickerField
              isOpen={openDropdown === 'status'}
              label="Status"
              onSelect={setStatus}
              onToggle={() =>
                setOpenDropdown(current =>
                  current === 'status' ? '' : 'status',
                )
              }
              options={STATUS_OPTIONS}
              value={status}
            />
            <PickerField
              isOpen={openDropdown === 'employment'}
              label="Employment"
              onSelect={setEmployment}
              onToggle={() =>
                setOpenDropdown(current =>
                  current === 'employment' ? '' : 'employment',
                )
              }
              options={EMPLOYMENT_OPTIONS}
              value={employment}
            />
            <EditableField
              keyboardType="phone-pad"
              label="Phone"
              onChangeText={setPhoneNumber}
              value={phoneNumber}
            />
            <EditableField
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              value={email}
            />

            {error ? (
              <Text style={[styles.gamesStateText, styles.dropdownError]}>
                SAVE ERROR: {error}
              </Text>
            ) : null}

            <Pressable
              disabled={isSaving}
              onPress={savePlayer}
              style={[
                styles.primaryButton,
                isSaving && styles.dropdownButtonDisabled,
              ]}>
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'SAVING...' : 'SAVE PLAYER'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{player.name ?? '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First name</Text>
              <Text style={styles.infoValue}>{player.first_name ?? '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last name</Text>
              <Text style={styles.infoValue}>{player.last_name ?? '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{getStatusValue(player)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Employment</Text>
              <Text style={styles.infoValue}>{getEmploymentValue(player)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Position</Text>
              <Text style={styles.infoValue}>{player.position ?? '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{player.phone_number ?? '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{player.email ?? '-'}</Text>
            </View>
          </>
        )}
        </View>
      </ScrollView>

      <AppPopup
        actions={popup?.actions}
        message={popup?.message ?? ''}
        onClose={closePopup}
        title={popup?.title ?? ''}
        visible={Boolean(popup)}
      />
      <LoadingDialog
        message="SAVING PLAYER..."
        onRequestClose={() => {}}
        visible={isSaving}
      />
    </>
  );
}

function EditableField({
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  label,
  onChangeText,
  value,
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.inputLabel}>{label.toUpperCase()}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        cursorColor={theme.colors.yellow}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder="-"
        placeholderTextColor={theme.colors.gray}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function PickerField({ isOpen, label, onSelect, onToggle, options, value }) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.inputLabel}>{label.toUpperCase()}</Text>
      <Pressable
        onPress={onToggle}
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonActive]}>
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Text style={styles.dropdownArrow}>{isOpen ? '^' : 'v'}</Text>
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          {options.map(option => (
            <Pressable
              key={option}
              onPress={() => {
                onSelect(option);
                onToggle();
              }}
              style={[
                styles.dropdownOption,
                value === option && styles.dropdownOptionActive,
              ]}>
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option && styles.dropdownOptionTextActive,
                ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
