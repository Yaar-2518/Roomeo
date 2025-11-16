import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';

const COMMON_HOBBIES = [
  'Reading', 'Gaming', 'Sports', 'Music', 'Cooking', 'Photography',
  'Traveling', 'Art', 'Dancing', 'Yoga', 'Hiking', 'Swimming',
  'Cycling', 'Movies', 'Writing', 'Gardening', 'Coding', 'Fitness',
  'Meditation', 'Shopping', 'Fashion', 'Netflix', 'Anime', 'Podcasts'
];

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
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

  useEffect(() => {
    // Load current profile data
    if (user) {
      // Parse existing date of birth if available
      let dateObj = new Date(2000, 0, 1);
      if (user.profile?.dateOfBirth) {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = user.profile.dateOfBirth.match(dateRegex);
        if (match) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // Month is 0-indexed
          const year = parseInt(match[3]);
          dateObj = new Date(year, month, day);
        }
      }

      setFormData({
        name: user.name || '',
        dateOfBirth: dateObj,
        gender: user.profile?.gender || '',
        major: user.profile?.major || '',
        yearOfStudy: user.profile?.year || '',
        sleepSchedule: user.profile?.sleepSchedule || '',
        cleanliness: user.profile?.cleanliness?.toString() || '',
        noiseLevel: user.profile?.noiseLevel || '',
        socialLevel: user.profile?.socialLevel || '',
        guestsFrequency: user.profile?.guestsFrequency || '',
        smoking: user.profile?.smoking || false,
        drinking: user.profile?.drinking || false,
        pets: user.profile?.pets || false,
        hobbies: user.profile?.hobbies || [],
        budget: user.profile?.budget || '',
      });
    }
  }, [user]);

  const toggleHobby = (hobby) => {
    if (formData.hobbies.includes(hobby)) {
      setFormData({ ...formData, hobbies: formData.hobbies.filter(h => h !== hobby) });
    } else {
      setFormData({ ...formData, hobbies: [...formData.hobbies, hobby] });
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.dateOfBirth || !formData.major) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Calculate age from date
    const today = new Date();
    let age = today.getFullYear() - formData.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - formData.dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < formData.dateOfBirth.getDate())) {
      age--;
    }

    if (age < 16 || age > 100 || isNaN(age)) {
      Alert.alert('Error', 'Please enter a valid date of birth (age must be 16-100)');
      return;
    }

    // Format date as DD/MM/YYYY
    const day = String(formData.dateOfBirth.getDate()).padStart(2, '0');
    const month = String(formData.dateOfBirth.getMonth() + 1).padStart(2, '0');
    const year = formData.dateOfBirth.getFullYear();
    const dateOfBirth = `${day}/${month}/${year}`;

    setLoading(true);
    try {
      // Update name
      await api.put('/auth/update-name', { name: formData.name });

      // Update profile
      await api.put('/profile', {
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

      // Update local user data
      updateUser({ 
        name: formData.name,
        profile: {
          dateOfBirth: dateOfBirth,
          age: age,
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
        }
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: theme.primary, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
          
          <Text style={[styles.label, { color: theme.textSecondary }]}>Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
            placeholder="Full Name"
            placeholderTextColor={theme.textTertiary}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Date of Birth *</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
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
                }
              }}
              maximumDate={new Date(2009, 11, 31)}
              minimumDate={new Date(1925, 0, 1)}
            />
          )}

          <Text style={[styles.label, { color: theme.textSecondary }]}>Gender *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Gender" value="" color="#999" />
              <Picker.Item label="Male" value="male" color="#000" />
              <Picker.Item label="Female" value="female" color="#000" />
              <Picker.Item label="Other" value="other" color="#000" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Major *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.major}
              onValueChange={(value) => setFormData({ ...formData, major: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Major" value="" color="#999" />
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

          <Text style={[styles.label, { color: theme.textSecondary }]}>Year of Study *</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.yearOfStudy}
              onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Year" value="" color="#999" />
              <Picker.Item label="1st Year" value="1st" color="#000" />
              <Picker.Item label="2nd Year" value="2nd" color="#000" />
              <Picker.Item label="3rd Year" value="3rd" color="#000" />
              <Picker.Item label="4th Year" value="4th" color="#000" />
            </Picker>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lifestyle Preferences</Text>
          
          <Text style={[styles.label, { color: theme.textSecondary }]}>Sleep Schedule</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.sleepSchedule}
              onValueChange={(value) => setFormData({ ...formData, sleepSchedule: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Schedule" value="" color="#999" />
              <Picker.Item label="🌅 Early Bird (sleep by 10 PM)" value="early-bird" color="#000" />
              <Picker.Item label="🌙 Night Owl (sleep after 12 AM)" value="night-owl" color="#000" />
              <Picker.Item label="🔄 Flexible" value="flexible" color="#000" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Cleanliness (1-5)</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.cleanliness}
              onValueChange={(value) => setFormData({ ...formData, cleanliness: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Level" value="" color="#999" />
              <Picker.Item label="⭐ Not very clean" value="1" color="#000" />
              <Picker.Item label="⭐⭐ Somewhat clean" value="2" color="#000" />
              <Picker.Item label="⭐⭐⭐ Average" value="3" color="#000" />
              <Picker.Item label="⭐⭐⭐⭐ Clean" value="4" color="#000" />
              <Picker.Item label="⭐⭐⭐⭐⭐ Very clean" value="5" color="#000" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Noise Level</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.noiseLevel}
              onValueChange={(value) => setFormData({ ...formData, noiseLevel: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Level" value="" color="#999" />
              <Picker.Item label="🤫 Quiet (prefer silence)" value="quiet" color="#000" />
              <Picker.Item label="🎵 Moderate (some noise okay)" value="moderate" color="#000" />
              <Picker.Item label="🎉 Loud (don't mind noise)" value="loud" color="#000" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Social Level</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.socialLevel}
              onValueChange={(value) => setFormData({ ...formData, socialLevel: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Level" value="" color="#999" />
              <Picker.Item label="😌 Introvert (prefer alone time)" value="introvert" color="#000" />
              <Picker.Item label="😊 Ambivert (balanced)" value="ambivert" color="#000" />
              <Picker.Item label="🎊 Extrovert (love socializing)" value="extrovert" color="#000" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Guest Frequency</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.guestsFrequency}
              onValueChange={(value) => setFormData({ ...formData, guestsFrequency: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Frequency" value="" color="#999" />
              <Picker.Item label="Never" value="never" color="#000" />
              <Picker.Item label="Sometimes" value="sometimes" color="#000" />
              <Picker.Item label="Often" value="often" color="#000" />
            </Picker>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Habits</Text>
          
          <View style={styles.habitRow}>
            <Text style={[styles.label, { color: theme.textSecondary, flex: 1 }]}>Smoking 🚬</Text>
            <View style={styles.habitButtons}>
              <TouchableOpacity
                style={[
                  styles.habitButton,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  !formData.smoking && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setFormData({ ...formData, smoking: false })}
              >
                <Text style={[styles.habitButtonText, { color: theme.text }, !formData.smoking && { color: '#fff' }]}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.habitButton,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  formData.smoking && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setFormData({ ...formData, smoking: true })}
              >
                <Text style={[styles.habitButtonText, { color: theme.text }, formData.smoking && { color: '#fff' }]}>YES</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.habitRow}>
            <Text style={[styles.label, { color: theme.textSecondary, flex: 1 }]}>Drinking 🍺</Text>
            <View style={styles.habitButtons}>
              <TouchableOpacity
                style={[
                  styles.habitButton,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  !formData.drinking && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setFormData({ ...formData, drinking: false })}
              >
                <Text style={[styles.habitButtonText, { color: theme.text }, !formData.drinking && { color: '#fff' }]}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.habitButton,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  formData.drinking && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setFormData({ ...formData, drinking: true })}
              >
                <Text style={[styles.habitButtonText, { color: theme.text }, formData.drinking && { color: '#fff' }]}>YES</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.habitRow}>
            <Text style={[styles.label, { color: theme.textSecondary, flex: 1 }]}>Pets 🐾</Text>
            <View style={styles.habitButtons}>
              <TouchableOpacity
                style={[
                  styles.habitButton,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  !formData.pets && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setFormData({ ...formData, pets: false })}
              >
                <Text style={[styles.habitButtonText, { color: theme.text }, !formData.pets && { color: '#fff' }]}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.habitButton,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  formData.pets && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setFormData({ ...formData, pets: true })}
              >
                <Text style={[styles.habitButtonText, { color: theme.text }, formData.pets && { color: '#fff' }]}>YES</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Info</Text>
          
          <Text style={[styles.label, { color: theme.textSecondary }]}>Hobbies (tap to select)</Text>
          <View style={styles.hobbiesContainer}>
            {COMMON_HOBBIES.map((hobby) => (
              <TouchableOpacity
                key={hobby}
                style={[
                  styles.hobbyTag,
                  { backgroundColor: theme.inputBackground, borderColor: theme.border },
                  formData.hobbies.includes(hobby) && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => toggleHobby(hobby)}
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

          <Text style={[styles.label, { color: theme.textSecondary }]}>Budget</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <Picker
              selectedValue={formData.budget}
              onValueChange={(value) => setFormData({ ...formData, budget: value })}
              style={[styles.picker, { color: theme.text, backgroundColor: theme.inputBackground }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Select Budget" value="" color="#999" />
              <Picker.Item label="💰 Low ($500-$800/month)" value="low" color="#000" />
              <Picker.Item label="💰💰 Medium ($800-$1200/month)" value="medium" color="#000" />
              <Picker.Item label="💰💰💰 High ($1200+/month)" value="high" color="#000" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  datePickerContainer: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  datePicker: {
    height: 50,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  habitButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  habitButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  habitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
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
  saveButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
