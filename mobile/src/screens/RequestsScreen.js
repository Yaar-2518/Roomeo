import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';
import { useTheme } from '../contexts/ThemeContext';

export default function RequestsScreen() {
  const { theme } = useTheme();
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // received, sent, accepted
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [receivedRes, sentRes, acceptedRes] = await Promise.all([
        api.get('/matches/requests/received'),
        api.get('/matches/requests/sent'),
        api.get('/matches/accepted'),
      ]);
      setReceived(receivedRes.data.requests);
      setSent(sentRes.data.requests);
      setAccepted(acceptedRes.data.matches);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRequest = async (requestId, status, name) => {
    const action = status === 'accepted' ? 'accept' : 'reject';
    Alert.alert(
      'Confirm',
      `${action === 'accept' ? 'Accept' : 'Reject'} request from ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'accept' ? 'Accept' : 'Reject',
          onPress: async () => {
            try {
              await api.put(`/matches/requests/${requestId}`, { status });
              Alert.alert('Success', `Request ${status}!`);
              fetchRequests();
            } catch (error) {
              Alert.alert('Error', 'Failed to update request');
            }
          },
        },
      ]
    );
  };

  const renderReceivedRequest = ({ item }) => {
    if (!item.sender) return null;
    return (
      <View style={[styles.requestCard, { backgroundColor: theme.cardBackground, shadowColor: theme.isDark ? '#000' : '#000' }]}>
        <View style={styles.requestHeader}>
          <View>
            <Text style={[styles.requestName, { color: theme.text }]}>{item.sender.name}</Text>
            <Text style={[styles.requestEmail, { color: theme.textSecondary }]}>{item.sender.email}</Text>
          </View>
        </View>
        <Text style={[styles.requestMessage, { color: theme.textSecondary }]}>{item.message}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleRequest(item._id, 'accepted', item.sender.name)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#34C759', '#28a745']}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>✓ Accept</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRequest(item._id, 'rejected', item.sender.name)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF3B30', '#dc3545']}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>✗ Reject</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const renderSentRequest = ({ item }) => {
    if (!item.receiver) return null;
    return (
      <View style={[styles.requestCard, { backgroundColor: theme.cardBackground, shadowColor: theme.isDark ? '#000' : '#000' }]}>
        <View style={styles.requestHeader}>
          <View>
            <Text style={[styles.requestName, { color: theme.text }]}>{item.receiver.name}</Text>
            <Text style={[styles.requestEmail, { color: theme.textSecondary }]}>{item.receiver.email}</Text>
          </View>
        <View style={[
          styles.statusBadge,
          item.status === 'accepted' && styles.acceptedBadge,
          item.status === 'rejected' && styles.rejectedBadge,
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.requestMessage, { color: theme.textSecondary }]}>{item.message}</Text>
    </View>
    );
  };

  const renderAcceptedMatch = ({ item }) => {
    if (!item.sender || !item.receiver) return null;
    const otherUser = item.sender._id === item.receiver._id ? item.receiver : item.sender;
    return (
      <View style={[styles.matchCard, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.matchName, { color: theme.text }]}>🎉 {otherUser.name}</Text>
        <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>📧 {otherUser.email}</Text>
        {otherUser.phone && (
          <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>📞 {otherUser.phone}</Text>
        )}
        <Text style={[styles.contactNote, { color: theme.primary }]}>
          You can now contact them to discuss further!
        </Text>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Requests</Text>
      </LinearGradient>

      <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'received' ? theme.primary : theme.textSecondary }, activeTab === 'received' && styles.activeTabText]}>
            Received ({received.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'sent' ? theme.primary : theme.textSecondary }, activeTab === 'sent' && styles.activeTabText]}>
            Sent ({sent.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'accepted' ? theme.primary : theme.textSecondary }, activeTab === 'accepted' && styles.activeTabText]}>
            Matched ({accepted.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'received' ? received :
          activeTab === 'sent' ? sent :
          accepted
        }
        renderItem={
          activeTab === 'received' ? renderReceivedRequest :
          activeTab === 'sent' ? renderSentRequest :
          renderAcceptedMatch
        }
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchRequests();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No requests yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  requestCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  requestMessage: {
    fontSize: 14,
    marginVertical: 10,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rejectButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#FF9500',
  },
  acceptedBadge: {
    backgroundColor: '#34C759',
  },
  rejectedBadge: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  matchCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 14,
    marginBottom: 5,
  },
  contactNote: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
  },
});
