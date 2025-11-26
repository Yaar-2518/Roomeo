import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function CustomModal({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}) {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#34C759' };
      case 'error':
        return { name: 'close-circle', color: '#FF3B30' };
      case 'warning':
        return { name: 'warning', color: '#FF9500' };
      case 'confirm':
        return { name: 'help-circle', color: theme.primary };
      default:
        return { name: 'information-circle', color: theme.primary };
    }
  };

  const icon = getIcon();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={showCancel ? null : onClose}
      >
        <View 
          style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={icon.name} size={56} color={icon.color} />
          </View>

          {title && (
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
          )}

          {message && (
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              {message}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: icon.color },
                !showCancel && styles.fullWidthButton
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 0,
    width: '100%',
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
