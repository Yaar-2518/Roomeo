import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';

const { width } = Dimensions.get('window');

export default function QuestionnaireScreen() {
  const { updateUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [formData, setFormData] = useState({
    dateOfBirth: new Date(2000, 0, 1),
    gender: '',
    major: '',
    yearOfStudy: '',
    sleepSchedule: '',
    cleanliness: '',
    noiseLevel: '',
    socialLevel: '',
    guestsFrequency: '',
    smoking: false,
    drinking: false,
    pets: false,
    hobbies: [],
    budget: '',
  });

  const COMMON_HOBBIES = [
    'Reading', 'Gaming', 'Sports', 'Music', 'Cooking', 'Traveling',
    'Photography', 'Art', 'Fitness', 'Yoga', 'Dancing', 'Movies',
    'Netflix', 'Hiking', 'Swimming', 'Cycling', 'Running', 'Guitar',
    'Piano', 'Singing', 'Writing', 'Coding', 'Chess', 'Board Games'
  ];

  const MAJOR_OPTIONS = [
    'Computer Science', 'Engineering', 'Business', 'Medicine',
    'Law', 'Architecture', 'Psychology', 'Biology', 'Chemistry',
    'Physics', 'Mathematics', 'Economics', 'Finance', 'Marketing',
    'Design', 'Other'
  ];

  const questions = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: '👤',
      fields: ['day', 'month', 'year', 'gender', 'major', 'yearOfStudy']
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Preferences',
      icon: '🏠',
      fields: ['sleepSchedule', 'cleanliness', 'noiseLevel']
    },
    {
      id: 'social',
      title: 'Social Preferences',
      icon: '🤝',
      fields: ['socialLevel', 'guestsFrequency']
    },
    {
      id: 'habits',
      title: 'Habits',
      icon: '✨',
      fields: ['smoking', 'drinking', 'pets']
    },
    {
      id: 'additional',
      title: 'Additional Info',
      icon: '🎯',
      fields: ['hobbies', 'budget']
    }
  ];

  const validateCurrentStep = () => {
    const step = questions[currentStep];
    const newErrors = {};
    
    if (step.id === 'basic') {
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = true;
      } else {
        const today = new Date();
        let age = today.getFullYear() - formData.dateOfBirth.getFullYear();
        const monthDiff = today.getMonth() - formData.dateOfBirth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < formData.dateOfBirth.getDate())) {
          age--;
        }
        if (age < 16 || age > 100 || isNaN(age)) {
          newErrors.dateOfBirth = true;
        }
      }
      if (!formData.gender) newErrors.gender = true;
      if (!formData.major) newErrors.major = true;
      if (!formData.yearOfStudy) newErrors.year = true;
    }
    
    if (step.id === 'lifestyle') {
      if (!formData.sleepSchedule) newErrors.sleepSchedule = true;
      if (!formData.cleanliness) newErrors.cleanliness = true;
      if (!formData.noiseLevel) newErrors.noiseLevel = true;
    }
    
    if (step.id === 'social') {
      if (!formData.socialLevel) newErrors.socialLevel = true;
      if (!formData.guestsFrequency) newErrors.guestsFrequency = true;
    }
    
    if (step.id === 'additional') {
      if (!formData.budget) newErrors.budget = true;
      if (formData.hobbies.length === 0) newErrors.hobbies = true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < questions.length - 1) {
      setErrors({});
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setErrors({});
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
        slideAnim.setValue(-width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.dateOfBirth || !formData.major) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    // Calculate age from date
    const today = new Date();
    let age = today.getFullYear() - formData.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - formData.dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < formData.dateOfBirth.getDate())) {
      age--;
    }

    // Format date as DD/MM/YYYY
    const day = String(formData.dateOfBirth.getDate()).padStart(2, '0');
    const month = String(formData.dateOfBirth.getMonth() + 1).padStart(2, '0');
    const year = formData.dateOfBirth.getFullYear();
    const dateOfBirth = `${day}/${month}/${year}`;

    setLoading(true);
    try {
      const response = await api.post('/profile', {
        age: age,
        dateOfBirth: dateOfBirth,
        gender: formData.gender,
        major: formData.major,
        year: formData.yearOfStudy,
        sleepSchedule: formData.sleepSchedule,
        cleanliness: parseInt(formData.cleanliness),
        noiseLevel: formData.noiseLevel,
        socialLevel: formData.socialLevel,
        guestsFrequency: formData.guestsFrequency,
        smoking: formData.smoking,
        drinking: formData.drinking,
        pets: formData.pets,
        budget: formData.budget,
        hobbies: formData.hobbies,
      });

      updateUser({ hasCompletedProfile: true });
      Alert.alert('Success', 'Profile created! Finding your matches...');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionCard = () => {
    const step = questions[currentStep];
    
    return (
      <Animated.View 
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{step.icon}</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{step.title}</Text>
          <Text style={[styles.stepIndicator, { color: theme.primary }]}>
            {currentStep + 1} of {questions.length}
          </Text>
        </View>

        <ScrollView 
          style={styles.cardContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardContentInner}
        >
          {step.id === 'basic' && (
            <>
              {/* Date of Birth - Date Picker */}
              <Text style={[styles.label, { color: theme.text }]}>Date of Birth *</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  errors.dateOfBirth && styles.inputError
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                  {formData.dateOfBirth.toLocaleDateString('en-GB')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setFormData({ ...formData, dateOfBirth: selectedDate });
                      if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: false });
                    }
                  }}
                  maximumDate={new Date(2009, 11, 31)} // Max age 16
                  minimumDate={new Date(1925, 0, 1)} // Min age 100
                />
              )}
              {errors.dateOfBirth && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Invalid date. Age must be between 16-100 years.
                </Text>
              )}

              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.gender && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => {
                    setFormData({ ...formData, gender: value });
                    if (errors.gender) setErrors({ ...errors, gender: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Gender *" value="" color="#999" />
                  <Picker.Item label="Male" value="male" color="#000" />
                  <Picker.Item label="Female" value="female" color="#000" />
                  <Picker.Item label="Other" value="other" color="#000" />
                </Picker>
              </View>
              {errors.gender && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your gender
                </Text>
              )}

              {/* Major - Dropdown */}
              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.major && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.major}
                  onValueChange={(value) => {
                    setFormData({ ...formData, major: value });
                    if (errors.major) setErrors({ ...errors, major: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Major *" value="" color="#999" />
                  <Picker.Item label="Computer Science" value="Computer Science" color="#000" />
                  <Picker.Item label="Engineering" value="Engineering" color="#000" />
                  <Picker.Item label="Business Administration" value="Business Administration" color="#000" />
                  <Picker.Item label="Medicine" value="Medicine" color="#000" />
                  <Picker.Item label="Law" value="Law" color="#000" />
                  <Picker.Item label="Architecture" value="Architecture" color="#000" />
                  <Picker.Item label="Psychology" value="Psychology" color="#000" />
                  <Picker.Item label="Biology" value="Biology" color="#000" />
                  <Picker.Item label="Economics" value="Economics" color="#000" />
                  <Picker.Item label="Mathematics" value="Mathematics" color="#000" />
                  <Picker.Item label="Design" value="Design" color="#000" />
                  <Picker.Item label="Other" value="Other" color="#000" />
                </Picker>
              </View>
              {errors.major && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your major
                </Text>
              )}

              {/* Year of Study */}
              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.year && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.yearOfStudy}
                  onValueChange={(value) => {
                    setFormData({ ...formData, yearOfStudy: value });
                    if (errors.year) setErrors({ ...errors, year: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Year of Study *" value="" color="#999" />
                  <Picker.Item label="1st Year" value="1st" color="#000" />
                  <Picker.Item label="2nd Year" value="2nd" color="#000" />
                  <Picker.Item label="3rd Year" value="3rd" color="#000" />
                  <Picker.Item label="4th Year" value="4th" color="#000" />
                </Picker>
              </View>
              {errors.year && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your year of study
                </Text>
              )}
            </>
          )}

          {step.id === 'lifestyle' && (
            <>
              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.sleepSchedule && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.sleepSchedule}
                  onValueChange={(value) => {
                    setFormData({ ...formData, sleepSchedule: value });
                    if (errors.sleepSchedule) setErrors({ ...errors, sleepSchedule: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Sleep Schedule *" value="" color="#999" />
                  <Picker.Item label="🌅 Early Bird (sleep by 10 PM)" value="early-bird" color="#000" />
                  <Picker.Item label="🌙 Night Owl (sleep after 12 AM)" value="night-owl" color="#000" />
                  <Picker.Item label="🔄 Flexible" value="flexible" color="#000" />
                </Picker>
              </View>
              {errors.sleepSchedule && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your sleep schedule
                </Text>
              )}

              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.cleanliness && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.cleanliness}
                  onValueChange={(value) => {
                    setFormData({ ...formData, cleanliness: value });
                    if (errors.cleanliness) setErrors({ ...errors, cleanliness: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Cleanliness Level *" value="" color="#999" />
                  <Picker.Item label="⭐ Not very clean" value={1} color="#000" />
                  <Picker.Item label="⭐⭐ Somewhat clean" value={2} color="#000" />
                  <Picker.Item label="⭐⭐⭐ Moderately clean" value={3} color="#000" />
                  <Picker.Item label="⭐⭐⭐⭐ Very clean" value={4} color="#000" />
                  <Picker.Item label="⭐⭐⭐⭐⭐ Extremely clean" value={5} color="#000" />
                </Picker>
              </View>
              {errors.cleanliness && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your cleanliness level
                </Text>
              )}

              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.noiseLevel && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.noiseLevel}
                  onValueChange={(value) => {
                    setFormData({ ...formData, noiseLevel: value });
                    if (errors.noiseLevel) setErrors({ ...errors, noiseLevel: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Noise Level Preference *" value="" color="#999" />
                  <Picker.Item label="🤫 Quiet (prefer silence)" value="quiet" color="#000" />
                  <Picker.Item label="🎵 Moderate (some noise okay)" value="moderate" color="#000" />
                  <Picker.Item label="🎉 Loud (don't mind noise)" value="loud" color="#000" />
                </Picker>
              </View>
              {errors.noiseLevel && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your noise level preference
                </Text>
              )}
            </>
          )}

          {step.id === 'social' && (
            <>
              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.socialLevel && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.socialLevel}
                  onValueChange={(value) => {
                    setFormData({ ...formData, socialLevel: value });
                    if (errors.socialLevel) setErrors({ ...errors, socialLevel: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Social Level *" value="" color="#999" />
                  <Picker.Item label="😌 Introvert (prefer alone time)" value="introvert" color="#000" />
                  <Picker.Item label="😊 Ambivert (balanced)" value="ambivert" color="#000" />
                  <Picker.Item label="🎊 Extrovert (love socializing)" value="extrovert" color="#000" />
                </Picker>
              </View>
              {errors.socialLevel && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your social level
                </Text>
              )}

              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.guestsFrequency && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.guestsFrequency}
                  onValueChange={(value) => {
                    setFormData({ ...formData, guestsFrequency: value });
                    if (errors.guestsFrequency) setErrors({ ...errors, guestsFrequency: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Guest Frequency *" value="" color="#999" />
                  <Picker.Item label="Never" value="never" color="#000" />
                  <Picker.Item label="Sometimes" value="sometimes" color="#000" />
                  <Picker.Item label="Often" value="often" color="#000" />
                </Picker>
              </View>
              {errors.guestsFrequency && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select how often you have guests
                </Text>
              )}
            </>
          )}

          {step.id === 'habits' && (
            <>
              <View style={[styles.optionCard, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>Do you smoke? 🚬</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border },
                      !formData.smoking && [styles.toggleButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, smoking: false })}
                  >
                    <Text style={[
                      styles.toggleText,
                      { color: theme.text },
                      !formData.smoking && styles.toggleTextActive
                    ]}>NO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border },
                      formData.smoking && [styles.toggleButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, smoking: true })}
                  >
                    <Text style={[
                      styles.toggleText,
                      { color: theme.text },
                      formData.smoking && styles.toggleTextActive
                    ]}>YES</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.optionCard, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>Do you drink alcohol? 🍺</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border },
                      !formData.drinking && [styles.toggleButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, drinking: false })}
                  >
                    <Text style={[
                      styles.toggleText,
                      { color: theme.text },
                      !formData.drinking && styles.toggleTextActive
                    ]}>NO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border },
                      formData.drinking && [styles.toggleButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, drinking: true })}
                  >
                    <Text style={[
                      styles.toggleText,
                      { color: theme.text },
                      formData.drinking && styles.toggleTextActive
                    ]}>YES</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.optionCard, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>Do you have pets? 🐾</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border },
                      !formData.pets && [styles.toggleButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, pets: false })}
                  >
                    <Text style={[
                      styles.toggleText,
                      { color: theme.text },
                      !formData.pets && styles.toggleTextActive
                    ]}>NO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border },
                      formData.pets && [styles.toggleButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, pets: true })}
                  >
                    <Text style={[
                      styles.toggleText,
                      { color: theme.text },
                      formData.pets && styles.toggleTextActive
                    ]}>YES</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {step.id === 'additional' && (
            <>
              <Text style={[styles.label, { color: theme.text }]}>Hobbies (tap to select) *</Text>
              <View style={styles.hobbiesContainer}>
                {COMMON_HOBBIES.map((hobby) => (
                  <TouchableOpacity
                    key={hobby}
                    style={[
                      styles.hobbyTag,
                      { backgroundColor: theme.inputBackground, borderColor: theme.border },
                      formData.hobbies.includes(hobby) && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => {
                      if (formData.hobbies.includes(hobby)) {
                        setFormData({ ...formData, hobbies: formData.hobbies.filter(h => h !== hobby) });
                      } else {
                        setFormData({ ...formData, hobbies: [...formData.hobbies, hobby] });
                      }
                      if (errors.hobbies) setErrors({ ...errors, hobbies: false });
                    }}
                  >
                    <Text style={[
                      styles.hobbyText,
                      { color: theme.text },
                      formData.hobbies.includes(hobby) && { color: '#fff', fontWeight: '600' }
                    ]}>
                      {hobby}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.hobbies && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select at least one hobby
                </Text>
              )}

              <View style={[
                styles.pickerContainer,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.budget && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.budget}
                  onValueChange={(value) => {
                    setFormData({ ...formData, budget: value });
                    if (errors.budget) setErrors({ ...errors, budget: false });
                  }}
                  style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Select Budget Range *" value="" color="#999" />
                  <Picker.Item label="💰 Low ($500-$800/month)" value="low" color="#000" />
                  <Picker.Item label="💰💰 Medium ($800-$1200/month)" value="medium" color="#000" />
                  <Picker.Item label="💰💰💰 High ($1200+/month)" value="high" color="#000" />
                </Picker>
              </View>
              {errors.budget && (
                <Text style={[styles.errorText, { color: '#ff3b30' }]}>
                  Please select your budget range
                </Text>
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.title}>Complete Your Profile</Text>
      </View>

      <View style={styles.progressBar}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              { backgroundColor: theme.border },
              index <= currentStep && [styles.progressDotActive, { backgroundColor: theme.primary }]
            ]}
          />
        ))}
      </View>

      <View style={styles.cardContainer}>
        {renderQuestionCard()}
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentStep === 0 && styles.navButtonDisabled
          ]}
          onPress={goToPrevious}
          disabled={currentStep === 0}
        >
          <Text style={[
            styles.navButtonText,
            { color: theme.primary },
            currentStep === 0 && [styles.navButtonTextDisabled, { color: theme.textTertiary }]
          ]}>← Previous</Text>
        </TouchableOpacity>

        {currentStep < questions.length - 1 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNext}
          >
            <Text style={[styles.navButtonText, { color: theme.primary }]}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Find Matches! ✨'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    flex: 1,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
  },
  cardContentInner: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  input: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 15,
    borderWidth: 1,
    width: '100%',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    textAlign: 'left',
  },
  pickerContainer: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    paddingTop: 10,
    paddingHorizontal: 15,
    textAlign: 'center',
  },
  dateButton: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  datePickerContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    textAlign: 'left',
    fontSize: 16,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    width: '100%',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  toggleButtonActive: {
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  hobbyTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  hobbyText: {
    fontSize: 13,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  navButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
});
