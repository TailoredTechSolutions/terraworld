import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

interface RewardsScreenProps {
  navigation: any;
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
  // Mock data - would come from API
  const userPoints = 0;
  const pendingPoints = 0;
  const referralCode = 'TERRA123';

  const rewards = [
    {
      id: '1',
      title: '₱50 Off Your Order',
      points: 500,
      description: 'Get ₱50 discount on orders above ₱500',
      icon: 'pricetag',
    },
    {
      id: '2',
      title: 'Free Delivery',
      points: 300,
      description: 'Free delivery on your next order',
      icon: 'car',
    },
    {
      id: '3',
      title: '10% Cashback',
      points: 1000,
      description: '10% cashback on your next order (max ₱200)',
      icon: 'cash',
    },
    {
      id: '4',
      title: 'Premium Farmer Box',
      points: 2000,
      description: 'Curated box of premium produce',
      icon: 'gift',
    },
  ];

  const earnActivities = [
    { icon: 'cart', label: 'Shop & Earn', description: '1 point per ₱10 spent' },
    { icon: 'people', label: 'Refer Friends', description: '100 points per referral' },
    { icon: 'star', label: 'Write Reviews', description: '20 points per review' },
    { icon: 'share-social', label: 'Share Products', description: '5 points per share' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Points Card */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <Icon name="diamond" size={32} color={colors.white} />
          <Text style={styles.pointsTitle}>Terra Rewards</Text>
        </View>
        <View style={styles.pointsValue}>
          <Text style={styles.pointsNumber}>{userPoints}</Text>
          <Text style={styles.pointsLabel}>Available Points</Text>
        </View>
        {pendingPoints > 0 && (
          <Text style={styles.pendingPoints}>
            +{pendingPoints} points pending
          </Text>
        )}
      </View>

      {/* Referral Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        <View style={styles.referralCard}>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyButton} testID="copy-referral-button">
              <Icon name="copy-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.referralText}>
            Share your code and earn 100 points when your friend makes their first order!
          </Text>
          <TouchableOpacity style={styles.shareButton} testID="share-referral-button">
            <Icon name="share-social-outline" size={18} color={colors.white} />
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ways to Earn */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ways to Earn</Text>
        <View style={styles.earnGrid}>
          {earnActivities.map((activity, index) => (
            <View key={index} style={styles.earnCard}>
              <View style={styles.earnIcon}>
                <Icon name={activity.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.earnLabel}>{activity.label}</Text>
              <Text style={styles.earnDescription}>{activity.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rewards Catalog */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Redeem Rewards</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {rewards.map((reward) => (
          <TouchableOpacity
            key={reward.id}
            style={styles.rewardCard}
            testID={`reward-${reward.id}`}
          >
            <View style={styles.rewardIcon}>
              <Icon name={reward.icon} size={24} color={colors.secondary} />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <Text style={styles.rewardDescription}>{reward.description}</Text>
            </View>
            <View style={styles.rewardPoints}>
              <Text style={styles.rewardPointsValue}>{reward.points}</Text>
              <Text style={styles.rewardPointsLabel}>pts</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* History Link */}
      <TouchableOpacity style={styles.historyButton}>
        <Icon name="time-outline" size={20} color={colors.primary} />
        <Text style={styles.historyText}>View Points History</Text>
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pointsCard: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xlarge,
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pointsTitle: {
    ...typography.h4,
    color: colors.white,
  },
  pointsValue: {
    alignItems: 'center',
  },
  pointsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
  },
  pointsLabel: {
    ...typography.body,
    color: colors.white,
    opacity: 0.8,
  },
  pendingPoints: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.7,
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  referralCode: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  referralText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  shareButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  earnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  earnCard: {
    width: '50%',
    padding: spacing.xs,
  },
  earnIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  earnLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  earnDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  rewardDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  rewardPoints: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  rewardPointsValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  rewardPointsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    gap: spacing.md,
  },
  historyText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});

export default RewardsScreen;
