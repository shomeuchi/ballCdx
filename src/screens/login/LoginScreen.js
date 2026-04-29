import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LoadingDialog } from '../../components/LoadingDialog';
import { theme } from '../../constants/theme';
import { loginUser } from '../../services/login/loginService';
import { styles } from '../../styles/biosStyles';

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('Gli');
  const [password, setPassword] = useState('1');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const user = await loginUser({
        password,
        username: username.trim(),
      });

      if (!user?.id) {
        setError('ACCESS DENIED: INVALID LOGIN RESPONSE');
        return;
      }

      onLogin(user);
    } catch (requestError) {
      setError(
        requestError.message
          ? `ACCESS DENIED: ${requestError.message}`
          : 'ACCESS DENIED: INVALID USERNAME OR PASSWORD',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.content}>
      <>
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
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'ENTERING...' : 'ENTER'}
            </Text>
          </Pressable>
        </View>
        <LoadingDialog
          message="CHECKING ACCESS..."
          onRequestClose={() => {}}
          visible={isSubmitting}
        />
      </>
    </KeyboardAvoidingView>
  );
}
