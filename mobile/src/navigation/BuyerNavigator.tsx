import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Buyer Screens
import HomeScreen from '../screens/buyer/HomeScreen';
import BrowseScreen from '../screens/buyer/BrowseScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import CartScreen from '../screens/buyer/CartScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import OrderDetailScreen from '../screens/buyer/OrderDetailScreen';
import RewardsScreen from '../screens/buyer/RewardsScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Terra' }}
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
      options={{ title: 'Product Details' }}
    />
  </Stack.Navigator>
);

// Browse Stack
const BrowseStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Browse" 
      component={BrowseScreen}
      options={{ title: 'Browse Products' }}
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
      options={{ title: 'Product Details' }}
    />
  </Stack.Navigator>
);

// Cart Stack
const CartStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Cart" 
      component={CartScreen}
      options={{ title: 'Shopping Cart' }}
    />
    <Stack.Screen 
      name="Checkout" 
      component={CheckoutScreen}
      options={{ title: 'Checkout' }}
    />
  </Stack.Navigator>
);

// Orders Stack
const OrdersStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Orders" 
      component={OrdersScreen}
      options={{ title: 'My Orders' }}
    />
    <Stack.Screen 
      name="OrderDetail" 
      component={OrderDetailScreen}
      options={{ title: 'Order Details' }}
    />
  </Stack.Navigator>
);

const BuyerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BrowseTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="BrowseTab" 
        component={BrowseStack}
        options={{ title: 'Browse' }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartStack}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="OrdersTab" 
        component={OrdersStack}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default BuyerNavigator;
