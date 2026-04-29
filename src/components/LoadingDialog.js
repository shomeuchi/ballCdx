import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';

import { styles } from '../styles/biosStyles';

export function LoadingDialog({ message, onRequestClose, visible }) {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!visible) {
      setShowCursor(true);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setShowCursor(current => !current);
    }, 450);

    return () => {
      clearInterval(intervalId);
    };
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.popupOverlay}>
        <View style={styles.loadingDialogPanel}>
          <Text style={styles.loadingDialogText}>
            {message}
            <Text style={styles.loadingDialogCursor}>
              {showCursor ? ' _' : '  '}
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
}
