import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (Login/Register)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator (after login and profile completion)
function MainTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowColor: '#000',
          shadowOffset: { height: -4, width: 0 },
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main Navigation Logic
function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Not logged in
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !user.hasCompletedProfile ? (
          // Logged in but needs to complete profile
          <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
        ) : (
          // Logged in and profile completed
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </ThemeProvider>
  );
}
