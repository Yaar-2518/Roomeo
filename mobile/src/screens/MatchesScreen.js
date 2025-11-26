import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import CustomModal from '../components/CustomModal';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';
import { useTheme } from '../contexts/ThemeContext';

export default function MatchesScreen({ navigation }) {
  const { theme } = useTheme();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ visible: false, userId: null, name: '' });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/matches');
      setMatches(response.data.matches);
    } catch (error) {
      setErrorModal({ visible: true, message: error.response?.data?.error || 'Failed to load matches' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sendRequest = async (userId, name) => {
    setConfirmModal({ visible: true, userId, name });
  };

  const handleConfirmSend = async () => {
    const { userId } = confirmModal;
    setConfirmModal({ visible: false, userId: null, name: '' });

    try {
      await api.post('/matches/request', {
        receiverId: userId,
        message: 'Hi! I think we would be great roommates!',
      });
      setSuccessModal({ visible: true, message: 'Request sent successfully!' });
      fetchMatches();
    } catch (error) {
      setErrorModal({ visible: true, message: error.response?.data?.error || 'Failed to send request' });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#34C759';
    if (score >= 65) return '#FF9500';
    return '#FF3B30';
  };

  const renderMatch = ({ item }) => {
    const formatBudget = (budget) => {
      if (!budget) return 'Not specified';
      return budget.charAt(0).toUpperCase() + budget.slice(1);
    };

    return (
      <View style={[styles.matchCard, { backgroundColor: theme.cardBackground, shadowColor: theme.isDark ? '#000' : '#000' }]}>
        <View style={styles.matchHeader}>
          <View style={styles.matchInfo}>
            <Text style={[styles.matchName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.matchSubInfo, { color: theme.textSecondary }]}>
              {item.age} years • {item.major} • {item.year} year
            </Text>
          </View>
          <View style={[styles.scoreBox, { backgroundColor: `${getScoreColor(item.score)}20` }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>{item.score}%</Text>
          </View>
        </View>

        <View style={styles.hobbiesContainer}>
          {item.hobbies?.map((hobby, index) => (
            <View key={index} style={[styles.hobbyTag, { backgroundColor: theme.isDark ? '#1a4d5c' : '#E8F4F8' }]}>
              <Text style={[styles.hobbyText, { color: theme.primary }]}>{hobby}</Text>
            </View>
          ))}
        </View>

        <View style={styles.budgetRow}>
          <Text style={[styles.budgetText, { color: theme.textSecondary }]}>💰 Budget: {formatBudget(item.budget)}</Text>
        </View>

        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => sendRequest(item.userId, item.name)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.buttonGradient}
            style={styles.requestButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.requestButtonText}>Send Request 📨</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && matches.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradient}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={theme.headerGradient}
        style={[styles.header, { borderBottomColor: theme.border }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Your Matches</Text>
        <Text style={styles.headerSubtitle}>{matches.length} compatible roommates found!</Text>
      </LinearGradient>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchMatches();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>😔 No matches found yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>Check back later!</Text>
          </View>
        }
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

      <CustomModal
        visible={confirmModal.visible}
        onClose={() => setConfirmModal({ visible: false, userId: null, name: '' })}
        title="Send Request"
        message={`Send a roommate request to ${confirmModal.name}?`}
        type="confirm"
        onConfirm={handleConfirmSend}
        confirmText="Send"
        cancelText="Cancel"
        showCancel={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 5,
    color: '#f0f0f0',
  },
  listContainer: {
    padding: 15,
  },
  matchCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  matchInfo: {
    flex: 1,
    paddingRight: 10,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
  },
  matchSubInfo: {
    fontSize: 14,
    marginTop: 5,
  },
  scoreBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  hobbyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    fontSize: 12,
  },
  budgetRow: {
    marginVertical: 10,
  },
  budgetText: {
    fontSize: 14,
  },
  requestButton: {
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  requestButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
