import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

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
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await api.delete('/auth/delete-account');
              Alert.alert('Success', 'Account deleted successfully');
              await logout();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete account');
            }
          },
          style: 'destructive'
        }
      ]
    );
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
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content}>
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
                  <View key={index} style={[styles.hobbyTag, { backgroundColor: theme.primary }]}>
                    <Text style={styles.hobbyTagText}>{hobby}</Text>
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
              <Text style={[styles.value, { color: theme.text }]}>
                {user.profile.sleepSchedule === 'early-bird' ? '🌅 Early Bird' : 
                 user.profile.sleepSchedule === 'night-owl' ? '🌙 Night Owl' : '🔄 Flexible'}
              </Text>
            </View>
          </View>
        )}

        {user?.profile?.cleanliness && (
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="sparkles" size={20} color={theme.textSecondary} style={styles.cardIcon} />
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Cleanliness</Text>
              <Text style={[styles.value, { color: theme.text }]}>{'⭐'.repeat(user.profile.cleanliness)}</Text>
            </View>
          </View>
        )}

        {user?.profile?.budget && (
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="wallet" size={20} color={theme.textSecondary} style={styles.cardIcon} />
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Budget</Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {user.profile.budget === 'low' ? '💰 $500-$800/month' : 
                 user.profile.budget === 'medium' ? '💰💰 $800-$1200/month' : 
                 user.profile.budget === 'high' ? '💰💰💰 $1200+/month' : 'N/A'}
              </Text>
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
              }}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.text} />
              <Text style={[styles.menuModalItemText, { color: theme.text }]}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuModalItem, { borderBottomColor: theme.border }]}
              onPress={() => {
                setMenuVisible(false);
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
    paddingVertical: 4,
    borderRadius: 12,
  },
  hobbyTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
});
