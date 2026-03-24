import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

// Main App Navigation
import BuyerNavigator from './BuyerNavigator';
import FarmerNavigator from './FarmerNavigator';
import DriverNavigator from './DriverNavigator';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          </>
        ) : (
          // Main App Stack - Route based on user role
          <>
            {user?.roles.includes('buyer') && (
              <Stack.Screen name="BuyerApp" component={BuyerNavigator} />
            )}
            {user?.roles.includes('farmer') && (
              <Stack.Screen name="FarmerApp" component={FarmerNavigator} />
            )}
            {user?.roles.includes('driver') && (
              <Stack.Screen name="DriverApp" component={DriverNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
