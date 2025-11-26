import React, { useState, useMemo } from 'react';
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
import CustomModal from '../components/CustomModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Email OTP, 2: Registration
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    otp: false,
    password: false,
    confirmPassword: false
  });
  const { register } = useAuth();
  const { theme } = useTheme();

  // Email validation
  const isEmailValid = useMemo(() => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  // Password validation
  const passwordValidation = useMemo(() => {
    if (!password) return { isValid: null, message: '' };
    
    const hasLength = password.length >= 8 && password.length <= 16;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = hasLength && hasLetter && hasNumber && hasSpecial;
    
    let message = '';
    if (!hasLength) message = '8-16 characters required';
    else if (!hasLetter) message = 'Must include letters';
    else if (!hasNumber) message = 'Must include numbers';
    else if (!hasSpecial) message = 'Must include special characters';
    
    return { isValid, message };
  }, [password]);

  // Password match validation
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSendOTP = async () => {
    if (!email) {
      setErrorModal({ visible: true, message: 'Please enter your email' });
      return;
    }

    if (!isEmailValid) {
      setErrorModal({ visible: true, message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setOtpSent(true);
      setSuccessModal({ visible: true, message: 'OTP sent to your email!' });
    } catch (error) {
      setErrorModal({ visible: true, message: error.response?.data?.error || 'Failed to send OTP' });
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
      await api.post('/auth/verify-otp', { email, otp });
      setOtpVerified(true);
      setStep(2);
      setSuccessModal({ visible: true, message: 'Email verified! Complete your registration.' });
    } catch (error) {
      setErrorModal({ visible: true, message: error.response?.data?.error || 'Invalid OTP' });
    } finally {
      setLoading(false);
    }
  }; // End handleVerifyOTP

  const handleRegister = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Check for empty fields or invalid inputs
    if (!name || !email || !password || !confirmPassword) {
      return;
    }

    if (!isEmailValid) {
      setErrorModal({ visible: true, message: 'Please enter a valid email address' });
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorModal({ visible: true, message: 'Please meet all password requirements' });
      return;
    }

    if (!passwordsMatch) {
      setErrorModal({ visible: true, message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, otpVerified);
    } catch (error) {
      setErrorModal({ visible: true, message: error.response?.data?.error || 'Something went wrong' });
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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: '#fff' }]}>
          {step === 1 ? 'Verify Email' : 'Create Account'}
        </Text>
        <Text style={[styles.subtitle, { color: '#f0f0f0' }]}>
          {step === 1 ? 'Enter your email to receive OTP' : 'Complete your registration'}
        </Text>

        {step === 1 ? (
          // Step 1: Email and OTP Verification
          <>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text },
                  email && styles.inputWithIcon
                ]}
                placeholder="Email"
                placeholderTextColor={theme.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!otpSent}
              />
              {email && (
                <Text style={[
                  styles.validationIcon,
                  isEmailValid ? styles.validIcon : styles.invalidIcon
                ]}>
                  {isEmailValid ? '✓' : '✗'}
                </Text>
              )}
            </View>

            {!otpSent ? (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading || !isEmailValid}
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
            ) : (
              <>
                {/* OTP Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, textAlign: 'center', fontSize: 24, letterSpacing: 10 }
                    ]}
                    placeholder="000000"
                    placeholderTextColor={theme.textTertiary}
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <Text style={[styles.helperText, { color: '#f0f0f0', textAlign: 'center', marginTop: -5, marginBottom: 10 }]}>
                  Enter the 6-digit OTP sent to your email
                </Text>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
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

                <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
                  <Text style={[styles.link, { color: '#f0f0f0', textAlign: 'center', marginTop: 10 }]}>
                    Didn't receive OTP? <Text style={{ color: '#fff', fontWeight: 'bold' }}>Resend</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          // Step 2: Complete Registration
          <>
            {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text },
              touched.name && !name && styles.inputError
            ]}
            placeholder="Full Name"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
            onBlur={() => setTouched({ ...touched, name: true })}
          />
        </View>

        {/* Email Input with Validation */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text },
              touched.email && !email && styles.inputError,
              email && styles.inputWithIcon
            ]}
            placeholder="Email"
            placeholderTextColor={theme.textTertiary}
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched({ ...touched, email: true })}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {email && (
            <Text style={[
              styles.validationIcon,
              isEmailValid ? styles.validIcon : styles.invalidIcon
            ]}>
              {isEmailValid ? '✓' : '✗'}
            </Text>
          )}
        </View>

        {/* Password Input with Requirements */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text },
              touched.password && !password && styles.inputError,
              password && styles.inputWithIcon
            ]}
            placeholder="Password"
            placeholderTextColor={theme.textTertiary}
            value={password}
            onChangeText={setPassword}
            onBlur={() => setTouched({ ...touched, password: true })}
            secureTextEntry
          />
          {password && (
            <Text style={[
              styles.validationIcon,
              passwordValidation.isValid ? styles.validIcon : styles.invalidIcon
            ]}>
              {passwordValidation.isValid ? '✓' : '✗'}
            </Text>
          )}
        </View>
        {password && !passwordValidation.isValid && (
          <Text style={[styles.helperText, { color: theme.error }]}>{passwordValidation.message}</Text>
        )}
        {!password && (
          <Text style={[styles.passwordRequirements, { color: theme.textSecondary }]}>
            Password must be 8-16 characters with letters, numbers, and special characters
          </Text>
        )}

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text },
              touched.confirmPassword && !confirmPassword && styles.inputError,
              confirmPassword && styles.inputWithIcon
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => setTouched({ ...touched, confirmPassword: true })}
            secureTextEntry
          />
          {confirmPassword && (
            <Text style={[
              styles.validationIcon,
              passwordsMatch ? styles.validIcon : styles.invalidIcon
            ]}>
              {passwordsMatch ? '✓' : '✗'}
            </Text>
          )}
        </View>
        {confirmPassword && !passwordsMatch && (
          <Text style={[styles.helperText, { color: theme.error }]}>Passwords do not match</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.buttonGradient}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: '#f0f0f0' }]}>
              Already have an account? <Text style={[styles.linkBold, { color: '#fff' }]}>Login</Text>
            </Text>
          </TouchableOpacity>
        </>
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
}const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingRight: 45,
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  validationIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    fontSize: 20,
    fontWeight: 'bold',
  },
  validIcon: {
    color: '#34c759',
  },
  invalidIcon: {
    color: '#ff3b30',
  },
  helperText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  passwordRequirements: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
    fontStyle: 'italic',
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
  link: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  linkBold: {
    fontWeight: '600',
  },
});
