import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { CartItem } from '../../services/cartService';
import Button from '../../components/Button';

interface CartScreenProps {
  navigation: any;
}

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { cart, isLoading, fetchCart, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    setUpdatingItemId(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFromCart(productId);
          } catch (error) {
            Alert.alert('Error', 'Failed to remove item');
          }
        },
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearCart();
          } catch (error) {
            Alert.alert('Error', 'Failed to clear cart');
          }
        },
      },
    ]);
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isUpdating = updatingItemId === item.product_id;
    const productImage = item.product.images?.[0]?.url;

    return (
      <View style={styles.cartItem} testID={`cart-item-${item.product_id}`}>
        {/* Product Image */}
        <View style={styles.itemImageContainer}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
              <Icon name="image-outline" size={24} color={colors.textLight} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.itemFarmer}>{item.farmer.farm_name}</Text>
          <Text style={styles.itemPrice}>
            ₱{item.unit_price.toFixed(2)}/{item.product.unit}
          </Text>
        </View>

        {/* Quantity & Actions */}
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.product_id)}
            testID={`remove-item-${item.product_id}`}
          >
            <Icon name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>

          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
              disabled={isUpdating}
              testID={`decrease-${item.product_id}`}
            >
              <Icon name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.quantityDisplay}>
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.quantityText}>{item.quantity}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stock_quantity}
              testID={`increase-${item.product_id}`}
            >
              <Icon name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemSubtotal}>₱{item.subtotal.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cart-outline" size={80} color={colors.textLight} />
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyText}>Browse our products and add items to your cart</Text>
      <Button
        title="Start Shopping"
        onPress={() => navigation.navigate('BrowseTab')}
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );

  if (isLoading && !cart) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  const itemsCount = cart?.totals?.items_count || 0;
  const subtotal = cart?.totals?.subtotal || 0;

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      {cart && cart.items.length > 0 && (
        <View style={styles.headerActions}>
          <Text style={styles.itemsCount}>
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'} in cart
          </Text>
          <TouchableOpacity onPress={handleClearCart} testID="clear-cart-button">
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Items */}
      <FlatList
        data={cart?.items || []}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      {/* Checkout Summary */}
      {cart && cart.items.length > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({itemsCount} items)</Text>
            <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
          </View>
          <Text style={styles.summaryNote}>
            Taxes and delivery fees calculated at checkout
          </Text>
          <Button
            title="Proceed to Checkout"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            testID="proceed-checkout-button"
          />
        </View>
      )}
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemsCount: {
    ...typography.body,
    color: colors.textSecondary,
  },
  clearButton: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 200,
    flexGrow: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  itemImageContainer: {
    marginRight: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.medium,
  },
  itemImagePlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemFarmer: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: spacing.xs,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.xs / 2,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.small,
  },
  quantityDisplay: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  itemSubtotal: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.large,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  summaryNote: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  checkoutButton: {
    width: '100%',
  },
});

export default CartScreen;
