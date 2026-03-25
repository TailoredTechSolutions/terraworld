import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder screens for Farmer
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Icon name="construct-outline" size={64} color={colors.textLight} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>Coming Soon</Text>
  </View>
);

const DashboardScreen = () => <PlaceholderScreen title="Farmer Dashboard" />;
const ProductsScreen = () => <PlaceholderScreen title="My Products" />;
const OrdersScreen = () => <PlaceholderScreen title="Orders" />;
const EarningsScreen = () => <PlaceholderScreen title="Earnings" />;
const FarmerProfileScreen = () => <PlaceholderScreen title="Profile" />;

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
  </Stack.Navigator>
);

const ProductsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'My Products' }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
  </Stack.Navigator>
);

const EarningsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Earnings' }} />
  </Stack.Navigator>
);

const FarmerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ProductsTab') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
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
        name="DashboardTab"
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStack}
        options={{ title: 'Products' }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsStack}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={FarmerProfileScreen}
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

export default FarmerNavigator;
