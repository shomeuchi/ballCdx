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
import { addPlayer } from '../../../services/player/playersService';
import { styles } from '../../../styles/biosStyles';

const STATUS_OPTIONS = ['active', 'inactive', 'inessential', 'injured'];
const EMPLOYMENT_OPTIONS = ['permanent', 'temporary'];

export function AddPlayerScreen({ onBack, onCreated }) {
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('active');
  const [employment, setEmployment] = useState('permanent');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [openDropdown, setOpenDropdown] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [popup, setPopup] = useState(null);

  function closePopup() {
    const action = popup?.onClose;

    setPopup(null);
    action?.();
  }

  function openAvatarPicker() {
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
    setError('');
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      const permissionError = 'IMAGE ACCESS DENIED';

      setError(permissionError);
      setPopup({
        message: permissionError,
        title: 'ADD PLAYER',
      });
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
    if (isSaving) {
      return;
    }

    if (!name.trim()) {
      const validationError = 'NAME IS REQUIRED';

      setError(validationError);
      setPopup({
        message: validationError,
        title: 'ADD PLAYER',
      });
      return;
    }

    const positionValue = position === '' ? null : Number(position);

    if (position !== '' && !Number.isInteger(positionValue)) {
      const validationError = 'POSITION MUST BE AN INTEGER';

      setError(validationError);
      setPopup({
        message: validationError,
        title: 'ADD PLAYER',
      });
      return;
    }

    setIsSaving(true);
    setError('');

    const payload = {
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
      const createdPlayer = await addPlayer({
        player: payload,
      });

      setPopup({
        message: 'Player added successfully.',
        onClose: () => onCreated?.({
          ...payload,
          ...createdPlayer,
          avatar_cache_key: Date.now(),
        }),
        title: 'ADD PLAYER',
      });
    } catch (requestError) {
      const saveError = requestError.message || 'Unable to add player';

      setError(saveError);
      setPopup({
        message: saveError,
        title: 'ADD PLAYER',
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
              onPress={openAvatarPicker}
              style={styles.playerDetailsAvatar}>
              {avatarPreview ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: avatarPreview }}
                  style={styles.playerAvatarImage}
                />
              ) : (
                <Text style={styles.playerDetailsAvatarText}>+</Text>
              )}
            </Pressable>

            <View style={styles.playerDetailsTitleBlock}>
              <Text style={styles.sectionTitle}>ADD PLAYER</Text>
              <Text style={styles.prompt}>{name || 'NEW PLAYER'}</Text>
              <Text style={styles.copy}>Create a roster profile.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <EditableField label="Name" onChangeText={setName} value={name} />
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
              setOpenDropdown(current => (current === 'status' ? '' : 'status'))
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
              ADD PLAYER ERROR: {error}
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
