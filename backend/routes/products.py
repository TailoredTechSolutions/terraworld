from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from models.product import (
    Product, ProductCreate, ProductUpdate, ProductFilter,
    Category, CategoryCreate
)
from models.user import User
from middleware.auth import get_current_user, get_current_farmer, get_optional_user
from services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_farmer)
):
    """
    Create a new product (Farmer only)
    
    Product will be in pending moderation status until approved by admin.
    """
    product_service = ProductService()
    return await product_service.create_product(product_data, current_user.id)


@router.get("", response_model=dict)
async def get_products(
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    in_stock_only: bool = Query(True),
    featured_only: bool = Query(False),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get products with filters and pagination
    
    - **category_id**: Filter by category
    - **search**: Search in name, description, tags
    - **min_price**: Minimum price filter
    - **max_price**: Maximum price filter
    - **in_stock_only**: Show only in-stock products
    - **featured_only**: Show only featured products
    - **sort_by**: Sort field (created_at | price | rating | name)
    - **sort_order**: Sort order (asc | desc)
    - **page**: Page number
    - **limit**: Items per page
    """
    product_service = ProductService()
    
    filters = ProductFilter(
        category_id=category_id,
        search=search,
        min_price=min_price,
        max_price=max_price,
        in_stock_only=in_stock_only,
        featured_only=featured_only,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
    
    products, total = await product_service.get_products(filters)
    
    return {
        "items": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/my-products", response_model=dict)
async def get_my_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_farmer)
):
    """Get current farmer's products"""
    product_service = ProductService()
    
    filters = ProductFilter(
        farmer_id=current_user.id,
        in_stock_only=False,  # Show all products for farmer
        page=page,
        limit=limit
    )
    
    products, total = await product_service.get_products(filters, show_all_moderation_status=True)
    
    return {
        "items": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get product details"""
    product_service = ProductService()
    
    product = await product_service.get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_farmer)
):
    """Update product (Farmer only - own products)"""
    product_service = ProductService()
    
    return await product_service.update_product(
        product_id,
        product_update,
        current_user.id
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_farmer)
):
    """Delete product (Farmer only - own products)"""
    product_service = ProductService()
    
    await product_service.delete_product(product_id, current_user.id)
    return None


# Category routes
@router.get("/categories/all", response_model=List[Category], tags=["Categories"])
async def get_categories(parent_id: Optional[str] = Query(None)):
    """
    Get categories
    
    - **parent_id**: Get subcategories of a parent (null for root categories)
    """
    product_service = ProductService()
    return await product_service.get_categories(parent_id)


@router.post("/categories", response_model=Category, status_code=status.HTTP_201_CREATED, tags=["Categories"])
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user)
):
    """Create category (Admin only)"""
    if "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    
    product_service = ProductService()
    return await product_service.create_category(category_data)
