import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder screens for Driver
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Icon name="construct-outline" size={64} color={colors.textLight} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>Coming Soon</Text>
  </View>
);

const DeliveriesScreen = () => <PlaceholderScreen title="My Deliveries" />;
const RouteScreen = () => <PlaceholderScreen title="Route" />;
const HistoryScreen = () => <PlaceholderScreen title="History" />;
const EarningsScreen = () => <PlaceholderScreen title="Earnings" />;
const DriverProfileScreen = () => <PlaceholderScreen title="Profile" />;

const DeliveriesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Deliveries" component={DeliveriesScreen} options={{ title: 'Deliveries' }} />
  </Stack.Navigator>
);

const RouteStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Route" component={RouteScreen} options={{ title: 'Route' }} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
  </Stack.Navigator>
);

const EarningsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Earnings' }} />
  </Stack.Navigator>
);

const DriverNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'DeliveriesTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'RouteTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'EarningsTab') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DeliveriesTab"
        component={DeliveriesStack}
        options={{ title: 'Deliveries' }}
      />
      <Tab.Screen
        name="RouteTab"
        component={RouteStack}
        options={{ title: 'Route' }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ title: 'History' }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsStack}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={DriverProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default DriverNavigator;
