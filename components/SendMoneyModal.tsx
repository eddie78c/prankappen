import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePrank } from '../contexts/PrankContext';

interface SendMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (phoneNumber: string, amount: number) => void;
}

export default function SendMoneyModal({ visible, onClose, onSend }: SendMoneyModalProps) {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const { settings } = usePrank();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const amountRef = useRef<TextInput>(null);

  const handleSend = () => {
    Keyboard.dismiss();
    if (!phoneNumber.trim()) {
      Alert.alert(translations.error!, translations.pleaseEnterPhone!);
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert(translations.error!, translations.pleaseEnterValidAmount!);
      return;
    }

    if (numericAmount > settings.profileBalance) {
      Alert.alert(translations.insufficientBalance!, translations.cannotSendMore!);
      return;
    }

    onSend(phoneNumber.trim(), numericAmount);
    setPhoneNumber('');
    setAmount('');
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setPhoneNumber('');
    setAmount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose} accessible={false}>
          <View style={styles.overlayContent}>
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {translations.sendMoney}
                </Text>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
                  onPress={handleClose}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.content}>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      {translations.phoneNumber}
                    </Text>
                    <TextInput
                      style={[
                        styles.input, {
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                        }
                      ]}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder={translations.enterPhoneNumber}
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType={Platform.OS === 'web' ? 'default' : 'phone-pad'}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => amountRef.current?.focus()}
                      autoFocus={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      {translations.amount}
                    </Text>
                    <TextInput
                      ref={amountRef}
                      style={[
                        styles.input, {
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                        }
                      ]}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder={translations.enterAmount}
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
                      returnKeyType="send"
                      onSubmitEditing={handleSend}
                      autoFocus={false}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.background }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                    {translations.cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSend}
                >
                  <Ionicons name="send" size={20} color={theme.colors.surface} />
                  <Text style={[styles.sendButtonText, { color: theme.colors.surface }]}>
                    {translations.send}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});