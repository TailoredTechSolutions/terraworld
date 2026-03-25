import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { orderService, Order } from '../../services/orderService';
import Button from '../../components/Button';

interface OrderDetailScreenProps {
  navigation: any;
  route: any;
}

const ORDER_STATUS_CONFIG: { [key: string]: { color: string; icon: string; label: string } } = {
  pending: { color: colors.warning, icon: 'time-outline', label: 'Pending' },
  confirmed: { color: colors.info, icon: 'checkmark-circle-outline', label: 'Confirmed' },
  processing: { color: colors.info, icon: 'cog-outline', label: 'Processing' },
  ready_for_pickup: { color: colors.primary, icon: 'cube-outline', label: 'Ready for Pickup' },
  in_transit: { color: colors.primary, icon: 'car-outline', label: 'In Transit' },
  delivered: { color: colors.success, icon: 'checkmark-done-circle-outline', label: 'Delivered' },
  cancelled: { color: colors.error, icon: 'close-circle-outline', label: 'Cancelled' },
  refunded: { color: colors.textSecondary, icon: 'refresh-circle-outline', label: 'Refunded' },
};

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await orderService.cancelOrder(orderId, 'Cancelled by buyer');
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
              fetchOrder();
            } catch (error: any) {
              Alert.alert(
                'Cannot Cancel',
                error.response?.data?.detail || 'This order cannot be cancelled at this stage.'
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = order?.status === 'pending' || order?.status === 'confirmed';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Order not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
      </View>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Order Header */}
      <View style={styles.headerCard}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Icon name={statusConfig.icon} size={18} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Order Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.progressCard}>
          {order.status_history?.map((history, index) => {
            const config = ORDER_STATUS_CONFIG[history.status] || ORDER_STATUS_CONFIG.pending;
            const isLast = index === order.status_history.length - 1;

            return (
              <View key={index} style={styles.progressItem}>
                <View style={styles.progressIndicator}>
                  <View style={[styles.progressDot, { backgroundColor: config.color }]}>
                    <Icon name={config.icon} size={12} color={colors.white} />
                  </View>
                  {!isLast && <View style={styles.progressLine} />}
                </View>
                <View style={styles.progressContent}>
                  <Text style={styles.progressLabel}>{config.label}</Text>
                  <Text style={styles.progressTime}>
                    {formatDate(history.timestamp)}
                  </Text>
                  {history.note && (
                    <Text style={styles.progressNote}>{history.note}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.itemsCard}>
          {order.items?.map((item, index) => (
            <View
              key={index}
              style={[
                styles.orderItem,
                index < order.items.length - 1 && styles.orderItemBorder,
              ]}
            >
              <View style={styles.itemImageContainer}>
                {item.product?.images?.[0]?.url ? (
                  <Image
                    source={{ uri: item.product.images[0].url }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Icon name="image-outline" size={20} color={colors.textLight} />
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product?.name || 'Product'}
                </Text>
                <Text style={styles.itemQuantity}>
                  {item.quantity} x ₱{item.unit_price?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <Text style={styles.itemTotal}>₱{item.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          <Icon name="location-outline" size={20} color={colors.primary} />
          <View style={styles.addressContent}>
            <Text style={styles.addressName}>
              {order.delivery_address?.contact_name || 'N/A'}
            </Text>
            <Text style={styles.addressText}>
              {order.delivery_address?.street_address}, {order.delivery_address?.barangay}
            </Text>
            <Text style={styles.addressText}>
              {order.delivery_address?.city}, {order.delivery_address?.province}{' '}
              {order.delivery_address?.postal_code}
            </Text>
            <Text style={styles.addressPhone}>
              {order.delivery_address?.contact_phone || 'No phone'}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₱{order.pricing?.subtotal?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee</Text>
            <Text style={styles.summaryValue}>₱{order.pricing?.platform_fee?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>₱{order.pricing?.tax?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₱{order.pricing?.logistics_fee?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₱{order.pricing?.total?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {canCancel && (
        <View style={styles.actionsSection}>
          <Button
            title={cancelling ? 'Cancelling...' : 'Cancel Order'}
            onPress={handleCancelOrder}
            variant="outline"
            loading={cancelling}
            disabled={cancelling}
            style={styles.cancelButton}
            textStyle={{ color: colors.error }}
          />
        </View>
      )}

      {/* Support Contact */}
      <TouchableOpacity style={styles.supportCard}>
        <Icon name="headset-outline" size={24} color={colors.primary} />
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>Contact our support team</Text>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.h4,
    color: colors.text,
    marginVertical: spacing.md,
  },
  headerCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderInfo: {},
  orderNumber: {
    ...typography.h4,
    color: colors.text,
  },
  orderDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadows.small,
  },
  progressItem: {
    flexDirection: 'row',
  },
  progressIndicator: {
    alignItems: 'center',
    width: 32,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  progressContent: {
    flex: 1,
    paddingLeft: spacing.sm,
    paddingBottom: spacing.md,
  },
  progressLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  progressTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  progressNote: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemImageContainer: {
    marginRight: spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.medium,
  },
  itemImagePlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  itemQuantity: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  itemTotal: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadows.small,
  },
  addressContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  addressName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  addressPhone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.text,
  },
  totalValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  supportContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  supportTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  supportText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default OrderDetailScreen;
