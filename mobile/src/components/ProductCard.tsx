import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    base_price: number;
    unit: string;
    images: Array<{ url: string; is_primary: boolean }>;
    stats?: { rating: number };
    availability?: { status: string };
  };
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
  const isAvailable = product.availability?.status === 'in_stock';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage.url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Icon name="image-outline" size={40} color={colors.textLight} />
          </View>
        )}
        {!isAvailable && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₱{product.base_price.toFixed(2)}
            <Text style={styles.unit}>/{product.unit}</Text>
          </Text>
          {product.stats?.rating && product.stats.rating > 0 && (
            <View style={styles.rating}>
              <Icon name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>{product.stats.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    ...shadows.small,
    margin: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
  },
  placeholderImage: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  outOfStockText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    minHeight: 48,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  unit: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default ProductCard;
