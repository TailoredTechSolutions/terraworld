import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { productService, Product, Category } from '../../services/productService';
import ProductCard from '../../components/ProductCard';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts({ limit: 10 }),
        productService.getCategories(),
      ]);
      setFeaturedProducts(productsData.items?.slice(0, 4) || []);
      setRecentProducts(productsData.items || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('BrowseTab', { 
        screen: 'Browse',
        params: { categoryId: item._id, categoryName: item.name }
      })}
      testID={`category-${item.slug}`}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.categoryImage} />
      ) : (
        <View style={[styles.categoryImage, styles.categoryPlaceholder]}>
          <Icon name="leaf-outline" size={24} color={colors.primary} />
        </View>
      )}
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user?.profile?.first_name || 'Buyer'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {}}
          testID="notification-button"
        >
          <Icon name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('BrowseTab', { screen: 'Browse' })}
        testID="search-bar"
      >
        <Icon name="search-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.searchPlaceholder}>Search fresh produce...</Text>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="leaf" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="people" size={24} color={colors.secondary} />
          <Text style={styles.statNumber}>100+</Text>
          <Text style={styles.statLabel}>Farmers</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star" size={24} color={colors.warning} />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowseTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowseTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <View key={product._id} style={styles.productCardWrapper}>
                <ProductCard
                  product={product}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Products */}
      {recentProducts.length > 0 && (
        <View style={[styles.section, { paddingBottom: spacing.xxl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowseTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentProducts.slice(0, 6)}
            renderItem={({ item }) => (
              <View style={styles.recentProductCard}>
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
                />
              </View>
            )}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentProductsList}
          />
        </View>
      )}

      {/* Empty State */}
      {!loading && featuredProducts.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="basket-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Products Yet</Text>
          <Text style={styles.emptyText}>
            Check back soon for fresh produce from local farmers!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
  },
  notificationButton: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    ...shadows.small,
  },
  statNumber: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 80,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.round,
    marginBottom: spacing.xs,
  },
  categoryPlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  productCardWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  recentProductsList: {
    paddingHorizontal: spacing.lg,
  },
  recentProductCard: {
    width: 180,
    marginRight: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default HomeScreen;
