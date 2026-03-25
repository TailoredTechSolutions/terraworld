import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { productService, Product } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ navigation, route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const data = await productService.getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      Alert.alert('Success', `${product.name} added to cart!`, [
        { text: 'Continue Shopping', style: 'cancel' },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('CartTab'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Product not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
      </View>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: '', is_primary: true }];
  const isInStock = product.availability?.status === 'in_stock' && product.stock_quantity > 0;
  const totalPrice = product.base_price * quantity;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {images[selectedImageIndex]?.url ? (
            <Image
              source={{ uri: images[selectedImageIndex].url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mainImage, styles.imagePlaceholder]}>
              <Icon name="image-outline" size={64} color={colors.textLight} />
            </View>
          )}

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                >
                  {img.url ? (
                    <Image source={{ uri: img.url }} style={styles.thumbnailImage} />
                  ) : (
                    <View style={[styles.thumbnailImage, styles.thumbnailPlaceholder]}>
                      <Icon name="image-outline" size={16} color={colors.textLight} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Stock Badge */}
          <View style={[styles.stockBadge, !isInStock && styles.stockBadgeOut]}>
            <Text style={[styles.stockBadgeText, !isInStock && styles.stockBadgeTextOut]}>
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Title & Price */}
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₱{product.base_price.toFixed(2)}
              <Text style={styles.unit}>/{product.unit}</Text>
            </Text>
            {product.stats?.rating && product.stats.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={18} color={colors.warning} />
                <Text style={styles.ratingText}>{product.stats.rating.toFixed(1)}</Text>
                <Text style={styles.reviewsText}>({product.stats.reviews || 0} reviews)</Text>
              </View>
            )}
          </View>

          {/* Stock Info */}
          {isInStock && (
            <Text style={styles.stockInfo}>
              {product.stock_quantity} {product.unit} available
            </Text>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
                testID="decrease-quantity-button"
              >
                <Icon name="remove" size={20} color={quantity <= 1 ? colors.textLight : colors.text} />
              </TouchableOpacity>
              <View style={styles.quantityValue}>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Text style={styles.quantityUnit}>{product.unit}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= product.stock_quantity && styles.quantityButtonDisabled,
                ]}
                onPress={incrementQuantity}
                disabled={quantity >= product.stock_quantity}
                testID="increase-quantity-button"
              >
                <Icon
                  name="add"
                  size={20}
                  color={quantity >= product.stock_quantity ? colors.textLight : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₱{totalPrice.toFixed(2)}</Text>
        </View>
        <Button
          title={addingToCart ? 'Adding...' : 'Add to Cart'}
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={!isInStock || addingToCart}
          style={styles.addToCartButton}
        />
      </View>
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
  imageContainer: {
    backgroundColor: colors.surface,
  },
  mainImage: {
    width: width,
    height: width * 0.8,
  },
  imagePlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  thumbnail: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: spacing.lg,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
    marginBottom: spacing.sm,
  },
  stockBadgeOut: {
    backgroundColor: colors.error + '20',
  },
  stockBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  stockBadgeTextOut: {
    color: colors.error,
  },
  productName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  unit: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  reviewsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  stockInfo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.xs,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    ...shadows.small,
  },
  quantityButtonDisabled: {
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityValue: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  quantityText: {
    ...typography.h3,
    color: colors.text,
  },
  quantityUnit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.medium,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  totalPrice: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  addToCartButton: {
    flex: 1,
    marginLeft: spacing.md,
  },
});

export default ProductDetailScreen;
