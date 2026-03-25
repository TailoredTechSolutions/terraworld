import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { orderService } from '../../services/orderService';
import api from '../../services/api';
import Button from '../../components/Button';

interface Address {
  _id: string;
  label: string;
  street_address: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  contact_name: string;
  contact_phone: string;
  is_default: boolean;
}

interface CheckoutScreenProps {
  navigation: any;
}

type PaymentMethod = 'cod' | 'gcash' | 'card' | 'wallet';

const PAYMENT_METHODS = [
  {
    id: 'cod' as PaymentMethod,
    name: 'Cash on Delivery',
    icon: 'cash-outline',
    description: 'Pay when your order arrives',
  },
  {
    id: 'gcash' as PaymentMethod,
    name: 'GCash',
    icon: 'phone-portrait-outline',
    description: 'Pay with GCash e-wallet',
  },
  {
    id: 'card' as PaymentMethod,
    name: 'Debit/Credit Card',
    icon: 'card-outline',
    description: 'Visa, Mastercard, etc.',
  },
  {
    id: 'wallet' as PaymentMethod,
    name: 'Terra Wallet',
    icon: 'wallet-outline',
    description: 'Use your tokens & coupons',
  },
];

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { cart, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchAddresses();
    fetchWalletBalance();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      const addressList = response.data || [];
      setAddresses(addressList);
      
      // Select default address
      const defaultAddress = addressList.find((a: Address) => a.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      // This would fetch the user's wallet/token balance
      // For now, we'll use a mock value
      setWalletBalance(250.00);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const calculatePricing = () => {
    const subtotal = cart?.totals?.subtotal || 0;
    const platformFee = subtotal * 0.05; // 5% platform fee
    const tax = subtotal * 0.12; // 12% VAT
    const logisticsFee = 50; // Fixed delivery fee
    const total = subtotal + platformFee + tax + logisticsFee;

    return { subtotal, platformFee, tax, logisticsFee, total };
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Address Required', 'Please select or add a delivery address');
      return;
    }

    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    const { total } = calculatePricing();

    if (selectedPayment === 'wallet' && walletBalance < total) {
      Alert.alert(
        'Insufficient Balance',
        'Your wallet balance is not enough to cover this order. Please select another payment method or add funds to your wallet.'
      );
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        delivery_address_id: selectedAddressId,
        delivery_instructions: deliveryInstructions || undefined,
        buyer_notes: buyerNotes || undefined,
        payment_method: selectedPayment,
      };

      const order = await orderService.createOrder(orderData);
      
      // Clear the cart after successful order
      await clearCart();

      // Navigate to order confirmation
      Alert.alert(
        'Order Placed!',
        `Your order #${order.order_number} has been placed successfully.`,
        [
          {
            text: 'View Order',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'CartTab' },
                ],
              });
              navigation.navigate('OrdersTab', {
                screen: 'OrderDetail',
                params: { orderId: order._id },
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Order Failed',
        error.response?.data?.detail || 'Failed to place order. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  const renderAddressCard = (address: Address) => {
    const isSelected = selectedAddressId === address._id;
    
    return (
      <TouchableOpacity
        key={address._id}
        style={[styles.addressCard, isSelected && styles.addressCardSelected]}
        onPress={() => setSelectedAddressId(address._id)}
        testID={`address-${address._id}`}
      >
        <View style={styles.addressHeader}>
          <View style={styles.addressLabelContainer}>
            <Icon
              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={isSelected ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.addressLabel}>{address.label}</Text>
            {address.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.addressName}>{address.contact_name}</Text>
        <Text style={styles.addressText}>
          {address.street_address}, {address.barangay}
        </Text>
        <Text style={styles.addressText}>
          {address.city}, {address.province} {address.postal_code}
        </Text>
        <Text style={styles.addressPhone}>{address.contact_phone}</Text>
      </TouchableOpacity>
    );
  };

  const renderPaymentMethod = (method: typeof PAYMENT_METHODS[0]) => {
    const isSelected = selectedPayment === method.id;
    const isWallet = method.id === 'wallet';
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
        onPress={() => setSelectedPayment(method.id)}
        testID={`payment-${method.id}`}
      >
        <View style={styles.paymentIcon}>
          <Icon
            name={method.icon}
            size={24}
            color={isSelected ? colors.primary : colors.textSecondary}
          />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentName, isSelected && styles.paymentNameSelected]}>
            {method.name}
          </Text>
          <Text style={styles.paymentDescription}>
            {isWallet ? `Balance: ₱${walletBalance.toFixed(2)}` : method.description}
          </Text>
        </View>
        <Icon
          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isSelected ? colors.primary : colors.border}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  const { subtotal, platformFee, tax, logisticsFee, total } = calculatePricing();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          
          {addresses.length > 0 ? (
            addresses.map(renderAddressCard)
          ) : (
            <View style={styles.noAddressContainer}>
              <Icon name="location-outline" size={40} color={colors.textLight} />
              <Text style={styles.noAddressText}>No delivery address found</Text>
              <Button
                title="Add Address"
                variant="outline"
                onPress={() => {/* Navigate to add address */}}
                style={{ marginTop: spacing.md }}
              />
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="card-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {PAYMENT_METHODS.map(renderPaymentMethod)}
        </View>

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="E.g., Ring the doorbell, leave at the gate..."
            placeholderTextColor={colors.textLight}
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
            testID="delivery-instructions-input"
          />
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Any special requests for the seller..."
            placeholderTextColor={colors.textLight}
            value={buyerNotes}
            onChangeText={setBuyerNotes}
            multiline
            numberOfLines={3}
            testID="buyer-notes-input"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cart?.totals?.items_count || 0} items)</Text>
              <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Fee (5%)</Text>
              <Text style={styles.summaryValue}>₱{platformFee.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (12%)</Text>
              <Text style={styles.summaryValue}>₱{tax.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₱{logisticsFee.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>₱{total.toFixed(2)}</Text>
        </View>
        <Button
          title={placing ? 'Placing Order...' : 'Place Order'}
          onPress={handlePlaceOrder}
          loading={placing}
          disabled={placing || !selectedAddressId}
          style={styles.placeOrderButton}
          testID="place-order-button"
        />
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addressLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  defaultBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.small,
  },
  defaultBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  addressName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
    marginLeft: spacing.lg + spacing.sm,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.lg + spacing.sm,
  },
  addressPhone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.lg + spacing.sm,
  },
  noAddressContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
  },
  noAddressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  paymentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  paymentNameSelected: {
    color: colors.primary,
  },
  paymentDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.large,
  },
  bottomTotal: {
    flex: 1,
  },
  bottomTotalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bottomTotalValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  placeOrderButton: {
    flex: 1,
    marginLeft: spacing.md,
  },
});

export default CheckoutScreen;
