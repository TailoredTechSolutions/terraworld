import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 'orders',
      icon: 'receipt-outline',
      label: 'My Orders',
      onPress: () => navigation.navigate('OrdersTab'),
    },
    {
      id: 'addresses',
      icon: 'location-outline',
      label: 'Delivery Addresses',
      onPress: () => {},
    },
    {
      id: 'rewards',
      icon: 'gift-outline',
      label: 'Rewards & Tokens',
      onPress: () => {},
    },
    {
      id: 'wallet',
      icon: 'wallet-outline',
      label: 'My Wallet',
      onPress: () => {},
    },
    {
      id: 'referral',
      icon: 'people-outline',
      label: 'Referral Program',
      onPress: () => {},
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => {},
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About Terra',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profile?.avatar_url ? (
            <Image source={{ uri: user.profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {user?.profile?.first_name?.charAt(0) || 'U'}
                {user?.profile?.last_name?.charAt(0) || ''}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="camera" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>
          {user?.profile?.first_name} {user?.profile?.last_name}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₱0</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
        </View>
      </View>

      {/* Referral Card */}
      <TouchableOpacity style={styles.referralCard}>
        <View style={styles.referralContent}>
          <Icon name="gift" size={32} color={colors.secondary} />
          <View style={styles.referralText}>
            <Text style={styles.referralTitle}>Invite Friends & Earn</Text>
            <Text style={styles.referralSubtitle}>
              Get ₱50 for every friend who makes their first order
            </Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
            testID={`menu-${item.id}`}
          >
            <View style={styles.menuItemIcon}>
              <Icon name={item.icon} size={22} color={colors.textSecondary} />
            </View>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        testID="logout-button"
      >
        <Icon name="log-out-outline" size={22} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Terra Digital Platform v1.0.0</Text>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '15',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  referralContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  referralTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  referralSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  menuContainer: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.error + '30',
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  versionText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default ProfileScreen;
