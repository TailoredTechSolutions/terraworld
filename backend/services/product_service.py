from typing import List, Optional, Tuple
from models.product import (
    Product, ProductCreate, ProductUpdate, ProductFilter,
    Category, CategoryCreate
)
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now, slugify
from fastapi import HTTPException, status
import re


class ProductService:
    """Product service"""
    
    def __init__(self):
        self.db = get_database()
    
    async def create_product(self, product_data: ProductCreate, farmer_id: str) -> Product:
        """Create a new product"""
        # Generate slug
        base_slug = slugify(product_data.name)
        slug = base_slug
        counter = 1
        
        while await self.db.products.find_one({"slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Check if category exists
        category = await self.db.categories.find_one({"_id": product_data.category_id})
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Create product
        product = Product(
            _id=generate_uuid(),
            farmer_id=farmer_id,
            category_id=product_data.category_id,
            name=product_data.name,
            slug=slug,
            description=product_data.description,
            unit=product_data.unit,
            base_price=product_data.base_price,
            stock_quantity=product_data.stock_quantity,
            min_order_quantity=product_data.min_order_quantity,
            max_order_quantity=product_data.max_order_quantity,
            images=product_data.images,
            attributes=product_data.attributes,
            availability={
                "status": "in_stock" if product_data.stock_quantity > 0 else "out_of_stock",
                "seasonal": product_data.seasonal,
                "available_from": product_data.available_from,
                "available_until": product_data.available_until
            },
            tags=product_data.tags
        )
        
        await self.db.products.insert_one(product.model_dump(by_alias=True))
        
        # Update farmer stats
        await self._update_farmer_product_count(farmer_id, 1)
        
        return product
    
    async def get_product(self, product_id: str) -> Optional[Product]:
        """Get product by ID"""
        product_dict = await self.db.products.find_one({
            "_id": product_id,
            "deleted_at": None
        })
        
        if product_dict:
            # Increment view count
            await self.db.products.update_one(
                {"_id": product_id},
                {"$inc": {"stats.views": 1}}
            )
            return Product(**product_dict)
        
        return None
    
    async def get_products(
        self,
        filters: ProductFilter,
        show_all_moderation_status: bool = False
    ) -> Tuple[List[Product], int]:
        """Get products with filters and pagination"""
        # Build query
        query = {"deleted_at": None}
        
        # Moderation status - only show approved products to buyers unless specified otherwise
        if not show_all_moderation_status:
            query["moderation.status"] = "approved"
        
        if filters.category_id:
            query["category_id"] = filters.category_id
        
        if filters.farmer_id:
            query["farmer_id"] = filters.farmer_id
        
        if filters.search:
            # Search in name, description, and tags
            search_regex = re.compile(filters.search, re.IGNORECASE)
            query["$or"] = [
                {"name": search_regex},
                {"description": search_regex},
                {"tags": search_regex}
            ]
        
        if filters.min_price is not None:
            query["base_price"] = {"$gte": filters.min_price}
        
        if filters.max_price is not None:
            if "base_price" in query:
                query["base_price"]["$lte"] = filters.max_price
            else:
                query["base_price"] = {"$lte": filters.max_price}
        
        if filters.in_stock_only:
            query["availability.status"] = "in_stock"
        
        if filters.featured_only:
            query["featured"] = True
        
        if filters.tags:
            query["tags"] = {"$in": filters.tags}
        
        # Get total count
        total = await self.db.products.count_documents(query)
        
        # Build sort
        sort_field = filters.sort_by
        if sort_field == "price":
            sort_field = "base_price"
        elif sort_field == "rating":
            sort_field = "stats.rating"
        
        sort_direction = -1 if filters.sort_order == "desc" else 1
        
        # Get products
        skip = (filters.page - 1) * filters.limit
        products = await self.db.products.find(query)\
            .sort(sort_field, sort_direction)\
            .skip(skip)\
            .limit(filters.limit)\
            .to_list(filters.limit)
        
        return [Product(**p) for p in products], total
    
    async def update_product(
        self,
        product_id: str,
        product_update: ProductUpdate,
        farmer_id: str
    ) -> Product:
        """Update product"""
        # Check if product exists and belongs to farmer
        existing = await self.db.products.find_one({
            "_id": product_id,
            "farmer_id": farmer_id,
            "deleted_at": None
        })
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Build update fields
        update_fields = {
            k: v for k, v in product_update.model_dump(exclude_unset=True).items()
            if v is not None
        }
        
        # Update availability status based on stock
        if "stock_quantity" in update_fields:
            if update_fields["stock_quantity"] > 0:
                update_fields["availability.status"] = "in_stock"
            else:
                update_fields["availability.status"] = "out_of_stock"
        
        update_fields["updated_at"] = utc_now()
        
        # If moderation was approved, require re-approval for significant changes
        if existing.get("moderation", {}).get("status") == "approved":
            significant_fields = ["name", "description", "base_price", "category_id"]
            if any(field in update_fields for field in significant_fields):
                update_fields["moderation.status"] = "pending"
                update_fields["moderation.reviewed_by"] = None
                update_fields["moderation.reviewed_at"] = None
        
        await self.db.products.update_one(
            {"_id": product_id},
            {"$set": update_fields}
        )
        
        # Fetch updated product
        updated_dict = await self.db.products.find_one({"_id": product_id})
        return Product(**updated_dict)
    
    async def delete_product(self, product_id: str, farmer_id: str) -> None:
        """Soft delete product"""
        result = await self.db.products.update_one(
            {
                "_id": product_id,
                "farmer_id": farmer_id,
                "deleted_at": None
            },
            {"$set": {"deleted_at": utc_now()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Update farmer stats
        await self._update_farmer_product_count(farmer_id, -1)
    
    async def get_categories(self, parent_id: Optional[str] = None) -> List[Category]:
        """Get categories"""
        query = {"status": "active"}
        if parent_id is not None:
            query["parent_id"] = parent_id
        else:
            query["parent_id"] = None
        
        categories = await self.db.categories.find(query).sort("order", 1).to_list(100)
        return [Category(**c) for c in categories]
    
    async def create_category(self, category_data: CategoryCreate) -> Category:
        """Create category (admin only)"""
        # Generate slug
        slug = slugify(category_data.name)
        
        # Check if slug exists
        existing = await self.db.categories.find_one({"slug": slug})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
        
        category = Category(
            _id=generate_uuid(),
            name=category_data.name,
            slug=slug,
            parent_id=category_data.parent_id,
            description=category_data.description,
            icon_url=category_data.icon_url,
            image_url=category_data.image_url,
            order=category_data.order
        )
        
        await self.db.categories.insert_one(category.model_dump(by_alias=True))
        
        return category
    
    async def _update_farmer_product_count(self, farmer_id: str, delta: int) -> None:
        """Update farmer's product count"""
        await self.db.farmer_profiles.update_one(
            {"user_id": farmer_id},
            {"$inc": {"stats.total_products": delta}}
        )
