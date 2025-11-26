import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import CustomModal from '../components/CustomModal';
import api from '../api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateOfBirth.match(dateRegex);
    if (!match) return 'N/A';
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    const dob = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleEditProfile = () => {
    setMenuVisible(false);
    setTimeout(() => {
      navigation.navigate('EditProfile');
    }, 100);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    setTimeout(() => setLogoutModal(true), 300);
  };

  const confirmLogout = async () => {
    setLogoutModal(false);
    await logout();
  };

  const handleDeleteAccount = () => {
    setMenuVisible(false);
    setTimeout(() => setDeleteModal(true), 300);
  };

  const confirmDelete = async () => {
    setDeleteModal(false);
    try {
      await api.delete('/auth/delete-account');
      setSuccessModal({ visible: true, message: 'Account deleted successfully' });
      setTimeout(async () => {
        setSuccessModal({ visible: false, message: '' });
        await logout();
      }, 2000);
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error.response?.data?.error || 'Failed to delete account' 
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradient}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header with Menu Icon */}
      <LinearGradient
        colors={theme.headerGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="person" size={20} color={theme.textSecondary} style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user?.name || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="mail" size={20} color={theme.textSecondary} style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="calendar" size={20} color={theme.textSecondary} style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Age</Text>
            <Text style={[styles.value, { color: theme.text }]}>{calculateAge(user?.profile?.dateOfBirth)}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="gift" size={20} color={theme.textSecondary} style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Date of Birth</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user?.profile?.dateOfBirth || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Gender</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {user?.profile?.gender ? user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1) : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="school" size={20} color={theme.textSecondary} style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Major</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user?.profile?.major || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="ribbon" size={20} color={theme.textSecondary} style={styles.cardIcon} />
          <View style={styles.cardContent}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Year of Study</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user?.profile?.year || 'N/A'}</Text>
          </View>
        </View>

        {user?.profile?.hobbies && user.profile.hobbies.length > 0 && (
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="heart" size={20} color={theme.textSecondary} style={styles.cardIcon} />
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Hobbies</Text>
              <View style={styles.hobbiesContainer}>
                {user.profile.hobbies.map((hobby, index) => (
                  <View key={index} style={[styles.hobbyTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, borderWidth: 1 }]}>
                    <Text style={[styles.hobbyTagText, { color: theme.primary }]}>{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {user?.profile?.sleepSchedule && (
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="moon" size={20} color={theme.textSecondary} style={styles.cardIcon} />
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Sleep Schedule</Text>
              <View style={[styles.preferenceTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, borderWidth: 1 }]}>
                <Text style={[styles.preferenceText, { color: theme.primary }]}>
                  {user.profile.sleepSchedule === 'early-bird' ? '🌅 Early Bird' : 
                   user.profile.sleepSchedule === 'night-owl' ? '🌙 Night Owl' : '🔄 Flexible'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {user?.profile?.cleanliness && (
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="sparkles" size={20} color={theme.textSecondary} style={styles.cardIcon} />
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Cleanliness</Text>
              <View style={[styles.preferenceTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, borderWidth: 1 }]}>
                <Text style={[styles.preferenceText, { color: theme.primary }]}>{'⭐'.repeat(user.profile.cleanliness)}</Text>
              </View>
            </View>
          </View>
        )}

        {user?.profile?.budget && (
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="wallet" size={20} color={theme.textSecondary} style={styles.cardIcon} />
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Budget</Text>
              <View style={[styles.preferenceTag, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, borderWidth: 1 }]}>
                <Text style={[styles.preferenceText, { color: theme.primary }]}>
                  {user.profile.budget === 'low' ? '💰 $500-$800/month' : 
                   user.profile.budget === 'medium' ? '💰💰 $800-$1200/month' : 
                   user.profile.budget === 'high' ? '💰💰💰 $1200+/month' : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Simple Modal Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View 
            style={[styles.menuModal, { backgroundColor: theme.cardBackground }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.menuModalHeader}>
              <Text style={[styles.menuModalTitle, { color: theme.text }]}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.menuModalItem, { borderBottomColor: theme.border }]}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={24} color={theme.text} />
              <Text style={[styles.menuModalItemText, { color: theme.text }]}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={[styles.menuModalItem, { borderBottomColor: theme.border }]}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={theme.text} />
              <Text style={[styles.menuModalItemText, { color: theme.text }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={isDark ? '#fff' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity 
              style={[styles.menuModalItem, { borderBottomColor: theme.border }]}
              onPress={() => {
                setMenuVisible(false);
                Linking.openURL('https://github.com/Yaar-2518/Roomeo').catch(err => {
                  Alert.alert('Error', 'Could not open GitHub link');
                });
              }}
            >
              <Ionicons name="logo-github" size={24} color={theme.text} />
              <Text style={[styles.menuModalItemText, { color: theme.text }]}>View on GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuModalItem, { borderBottomColor: theme.border }]}
              onPress={() => {
                setMenuVisible(false);
                setTimeout(() => setAboutVisible(true), 300);
              }}
            >
              <Ionicons name="information-circle-outline" size={24} color={theme.text} />
              <Text style={[styles.menuModalItemText, { color: theme.text }]}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuModalItem, { borderBottomColor: theme.border }]}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={24} color="#ff3b30" />
              <Text style={[styles.menuModalItemText, { color: '#ff3b30' }]}>Delete Account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuModalItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#ff9500" />
              <Text style={[styles.logoutItemText, { color: '#ff9500' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAboutVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAboutVisible(false)}
        >
          <View 
            style={[styles.menuModal, { backgroundColor: theme.cardBackground }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.menuModalHeader}>
              <Text style={[styles.menuModalTitle, { color: theme.text }]}>About Roomeo</Text>
              <TouchableOpacity onPress={() => setAboutVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.aboutContent, { borderBottomColor: theme.border }]}>
              <Ionicons name="home" size={48} color={theme.primary} style={styles.aboutIcon} />
              <Text style={[styles.aboutTitle, { color: theme.text }]}>Roomeo</Text>
              <Text style={[styles.aboutSubtitle, { color: theme.textSecondary }]}>Roommate Matching App</Text>
            </View>

            <View style={[styles.aboutSection, { borderBottomColor: theme.border }]}>
              <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>Version</Text>
              <Text style={[styles.aboutValue, { color: theme.text }]}>1.0.0</Text>
            </View>

            <View style={[styles.aboutSection, { borderBottomColor: theme.border }]}>
              <Text style={[styles.aboutDescription, { color: theme.textSecondary }]}>
                Find your perfect roommate based on compatibility, preferences, and lifestyle. Match with students who share similar habits and interests.
              </Text>
            </View>

            <View style={styles.aboutFooter}>
              <Text style={[styles.aboutCopyright, { color: theme.textTertiary }]}>
                © 2025 Roomeo. All rights reserved.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Modals */}
      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        type="confirm"
        confirmText="Logout"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={confirmLogout}
      />

      <CustomModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Account"
        message="Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
        type="error"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={confirmDelete}
      />

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
    </View>
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
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hobbyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hobbyTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  preferenceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  preferenceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  menuModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  menuModalItemText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '600',
    flex: 1,
  },
  aboutContent: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  aboutIcon: {
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aboutSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutSection: {
    padding: 18,
    borderBottomWidth: 1,
  },
  aboutLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  aboutFooter: {
    padding: 18,
    alignItems: 'center',
  },
  aboutCopyright: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
