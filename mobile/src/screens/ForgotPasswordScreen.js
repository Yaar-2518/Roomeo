import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import CustomModal from '../components/CustomModal';
import api from '../api';

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  const handleSendOTP = async () => {
    if (!email) {
      setErrorModal({ visible: true, message: 'Please enter your email' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorModal({ visible: true, message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setSuccessModal({ visible: true, message: 'OTP sent to your email!' });
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error.response?.data?.error || 'Failed to send OTP' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrorModal({ visible: true, message: 'Please enter the 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      setStep(3);
      setSuccessModal({ visible: true, message: 'OTP verified! Set your new password.' });
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error.response?.data?.error || 'Invalid OTP' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorModal({ visible: true, message: 'Please fill all fields' });
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setErrorModal({ visible: true, message: 'Password must be 8-16 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorModal({ visible: true, message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccessModal({ 
        visible: true, 
        message: 'Password reset successfully! Please login with your new password.' 
      });
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error.response?.data?.error || 'Failed to reset password' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={theme.gradient}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Set your new password"}
          </Text>
        </View>

        {/* Step 1: Email */}
        {step === 1 && (
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Email"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.buttonGradient}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={theme.textTertiary}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.buttonGradient}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSendOTP} style={styles.resendButton}>
              <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                Didn't receive OTP? <Text style={{ color: '#fff', fontWeight: '600' }}>Resend</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="New Password"
              placeholderTextColor={theme.textTertiary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Text style={[styles.helperText, { color: theme.textTertiary }]}>
              Password must be 8-16 characters long
            </Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.buttonGradient}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title="Error"
        message={errorModal.message}
        type="error"
        confirmText="OK"
      />

      <CustomModal
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        title="Success"
        message={successModal.message}
        type="success"
        confirmText="OK"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    lineHeight: 24,
  },
  formContainer: {
    gap: 15,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: -10,
    marginLeft: 5,
  },
  button: {
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
});
