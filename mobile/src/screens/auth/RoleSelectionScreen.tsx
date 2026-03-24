import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

const RoleSelectionScreen = ({ navigation, route }: any) => {
  const roles = [
    {
      id: 'buyer',
      title: 'I want to Buy',
      subtitle: 'Shop fresh farm products',
      icon: 'cart-outline',
      color: colors.primary,
    },
    {
      id: 'farmer',
      title: 'I want to Sell',
      subtitle: 'List and sell my farm products',
      icon: 'leaf-outline',
      color: colors.success,
    },
    {
      id: 'driver',
      title: 'I want to Deliver',
      subtitle: 'Deliver orders and earn',
      icon: 'bicycle-outline',
      color: colors.info,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How would you like to use Terra?</Text>
        <Text style={styles.subtitle}>Select your primary role</Text>

        <View style={styles.rolesList}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={styles.roleCard}
              onPress={() => {
                // Pass role back to register screen
                navigation.navigate('Register', { role: role.id });
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${role.color}15` }]}>
                <Icon name={role.icon} size={32} color={role.color} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={24} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  rolesList: {
    gap: spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  roleSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default RoleSelectionScreen;