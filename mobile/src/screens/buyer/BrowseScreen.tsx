import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { productService, Product, Category } from '../../services/productService';
import ProductCard from '../../components/ProductCard';

interface BrowseScreenProps {
  navigation: any;
  route: any;
}

const BrowseScreen: React.FC<BrowseScreenProps> = ({ navigation, route }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    route.params?.categoryId || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params: any = {
          page: pageNum,
          limit: 20,
        };

        if (selectedCategory) {
          params.category_id = selectedCategory;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await productService.getProducts(params);
        const newProducts = response.items || [];

        if (refresh || pageNum === 1) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }

        setHasMore(newProducts.length === 20);
        setPage(pageNum);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, searchQuery]
  );

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1, true);
  }, [selectedCategory, fetchProducts]);

  useEffect(() => {
    if (route.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
  }, [route.params?.categoryId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };

  const handleSearch = () => {
    fetchProducts(1, true);
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productItem, index % 2 === 0 ? styles.productItemLeft : styles.productItemRight]}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      />
    </View>
  );

  const renderCategoryFilter = () => (
    <FlatList
      data={[{ _id: null, name: 'All', slug: 'all' }, ...categories]}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
      keyExtractor={(item) => item._id || 'all'}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === item._id && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(item._id)}
          testID={`category-filter-${item.slug}`}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === item._id && styles.categoryChipTextActive,
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            testID="product-search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchProducts(1, true);
              }}
              testID="clear-search-button"
            >
              <Icon name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} testID="filter-button">
          <Icon name="options-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      {renderCategoryFilter()}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </Text>
      </View>
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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `No products match "${searchQuery}"`
          : 'No products available in this category'}
      </Text>
      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory(null);
        }}
      >
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  filterButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  resultsCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  productItem: {
    flex: 1,
    maxWidth: '50%',
  },
  productItemLeft: {
    paddingRight: spacing.xs,
  },
  productItemRight: {
    paddingLeft: spacing.xs,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
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
  clearFiltersButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
  },
  clearFiltersText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

export default BrowseScreen;
