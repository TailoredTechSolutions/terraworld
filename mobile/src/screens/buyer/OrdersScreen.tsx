import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { orderService, Order } from '../../services/orderService';

interface OrdersScreenProps {
  navigation: any;
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

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_transit', label: 'In Transit' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOrders = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const status = selectedTab === 'all' ? undefined : selectedTab;
        const response = await orderService.getOrders(pageNum, status);
        const newOrders = response.items || [];

        if (refresh || pageNum === 1) {
          setOrders(newOrders);
        } else {
          setOrders((prev) => [...prev, ...newOrders]);
        }

        setHasMore(newOrders.length === 20);
        setPage(pageNum);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [selectedTab]
  );

  useEffect(() => {
    fetchOrders(1, true);
  }, [selectedTab, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusTab = ({ item }: { item: typeof STATUS_TABS[0] }) => {
    const isSelected = selectedTab === item.id;
    return (
      <TouchableOpacity
        style={[styles.tab, isSelected && styles.tabActive]}
        onPress={() => setSelectedTab(item.id)}
        testID={`tab-${item.id}`}
      >
        <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = ORDER_STATUS_CONFIG[item.status] || ORDER_STATUS_CONFIG.pending;
    const itemsCount = item.items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
        testID={`order-${item._id}`}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.orderItems}>
            <Icon name="cube-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.orderItemsText}>
              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total</Text>
            <Text style={styles.orderTotalValue}>₱{item.pricing?.total?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <TouchableOpacity style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="receipt-outline" size={80} color={colors.textLight} />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyText}>
        {selectedTab === 'all'
          ? "When you place orders, they'll appear here"
          : `No ${selectedTab.replace('_', ' ')} orders found`}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Tabs */}
      <FlatList
        data={STATUS_TABS}
        renderItem={renderStatusTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabsList}
      />

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </View>
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
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  tabsList: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderNumber: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  orderItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderItemsText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  orderTotalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  orderTotalValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
  },
  orderFooter: {
    paddingTop: spacing.md,
    alignItems: 'flex-end',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewDetailsText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default OrdersScreen;
