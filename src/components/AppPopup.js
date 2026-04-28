import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from '../styles/biosStyles';

export function AppPopup({ actions, message, onClose, title, visible }) {
  const popupActions = actions?.length
    ? actions
    : [
        {
          label: 'OK',
          onPress: onClose,
        },
      ];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.popupOverlay}>
        <View style={styles.popupPanel}>
          <Text style={styles.popupTitle}>{title}</Text>
          <Text style={styles.popupMessage}>{message}</Text>

          <View style={styles.popupActions}>
            {popupActions.map(action => (
              <Pressable
                key={action.label}
                style={styles.popupButton}
                onPress={action.onPress}>
                <Text style={styles.popupButtonText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
