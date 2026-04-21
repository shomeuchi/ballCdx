import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { theme } from '../../constants/theme';
import { credentials } from '../../data/auth';
import { styles } from '../../styles/biosStyles';

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password);
  const [error, setError] = useState('');

  const submit = () => {
    if (
      username.trim().toLowerCase() === credentials.username &&
      password === credentials.password
    ) {
      setError('');
      onLogin();
      return;
    }

    setError('ACCESS DENIED: INVALID USERNAME OR PASSWORD');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>SECURITY CHECKPOINT</Text>
        <Text style={styles.prompt}>Operator login</Text>
        <Text style={styles.copy}>
          Enter authorized credentials to unlock the ballCdx modules.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            cursorColor={theme.colors.yellow}
            onChangeText={setUsername}
            placeholder="gli"
            placeholderTextColor={theme.colors.gray}
            style={styles.input}
            value={username}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput
            cursorColor={theme.colors.yellow}
            onChangeText={setPassword}
            onSubmitEditing={submit}
            placeholder="1"
            placeholderTextColor={theme.colors.gray}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>ENTER</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
