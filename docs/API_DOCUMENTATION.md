# Terra Digital Platform - API Documentation

## Base URL
- **Development**: `http://localhost:8001/api`
- **Production**: `https://your-domain.com/api`

## Authentication
Most endpoints require JWT Bearer token authentication.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## API Endpoints

### Health Check
```
GET /api/health
```
**Description**: Check API health status  
**Authentication**: Not required  
**Response**:
```json
{
  "status": "healthy",
  "app": "Terra Digital Platform",
  "version": "1.0.0"
}
```

---

## Authentication APIs

### Register User
```
POST /api/auth/register
```
**Description**: Register a new user  
**Authentication**: Not required  
**Request Body**:
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "role": "buyer",
  "phone": "+639171234567",
  "referred_by": "REFERRAL123"
}
```
**Validation**:
- Email must be valid format
- Password minimum 8 characters, must contain uppercase, lowercase, and digit
- Role must be: `buyer`, `farmer`, or `driver`
- Phone must be E.164 format (optional)

**Response** (201 Created):
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "refresh_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "_id": "uuid",
    "email": "juan@example.com",
    "phone": "+639171234567",
    "roles": ["buyer"],
    "status": "active",
    "email_verified": false,
    "phone_verified": false,
    "kyc_status": "pending",
    "profile": {
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "display_name": "Juan D."
    },
    "preferences": {
      "language": "en",
      "currency": "PHP"
    },
    "created_at": "2025-07-15T10:00:00Z"
  }
}
```

**Notes**:
- Automatically creates farmer/driver profile based on role
- Creates referral record if `referred_by` code is valid
- Generates unique referral code for the new user

### Login
```
POST /api/auth/login
```
**Description**: Login with email and password  
**Authentication**: Not required  
**Request Body**:
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```
**Response** (200 OK): Same as Register response

### Refresh Token
```
POST /api/auth/refresh
```
**Description**: Get a new access token using refresh token  
**Authentication**: Not required  
**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1..."
}
```
**Response** (200 OK): Same as Login response

### Logout
```
POST /api/auth/logout
```
**Description**: Logout by revoking refresh token  
**Authentication**: Not required  
**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1..."
}
```
**Response** (204 No Content)

---

## User Management APIs

### Get Current User Profile
```
GET /api/users/me
```
**Description**: Get authenticated user's profile  
**Authentication**: Required  
**Response** (200 OK):
```json
{
  "_id": "uuid",
  "email": "juan@example.com",
  "phone": "+639171234567",
  "roles": ["buyer"],
  "status": "active",
  "profile": {
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "display_name": "Juan D.",
    "avatar_url": "https://...",
    "bio": "Love organic food"
  }
}
```

### Update User Profile
```
PUT /api/users/me
```
**Description**: Update current user's profile  
**Authentication**: Required  
**Request Body** (all fields optional):
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "display_name": "Juan D.",
  "bio": "Updated bio",
  "avatar_url": "https://...",
  "phone": "+639171234567",
  "date_of_birth": "1990-05-15",
  "gender": "male"
}
```
**Response** (200 OK): Updated user profile

### Address Management

#### List Addresses
```
GET /api/users/addresses
```
**Description**: Get all addresses for current user  
**Authentication**: Required  
**Response** (200 OK):
```json
[
  {
    "_id": "uuid",
    "user_id": "uuid",
    "type": "delivery",
    "label": "Home",
    "is_default": true,
    "contact_name": "Juan Dela Cruz",
    "contact_phone": "+639171234567",
    "street_address": "123 Magsaysay Ave",
    "barangay": "Baguio",
    "city": "Baguio City",
    "province": "Benguet",
    "postal_code": "2600",
    "country": "PH",
    "coordinates": {
      "latitude": 16.4023,
      "longitude": 120.5960
    },
    "delivery_instructions": "Gate code: 1234",
    "created_at": "2025-07-15T10:00:00Z"
  }
]
```

#### Create Address
```
POST /api/users/addresses
```
**Description**: Create a new address  
**Authentication**: Required  
**Request Body**:
```json
{
  "type": "delivery",
  "label": "Home",
  "is_default": true,
  "contact_name": "Juan Dela Cruz",
  "contact_phone": "+639171234567",
  "street_address": "123 Magsaysay Ave",
  "barangay": "Baguio",
  "city": "Baguio City",
  "province": "Benguet",
  "postal_code": "2600",
  "country": "PH",
  "coordinates": {
    "latitude": 16.4023,
    "longitude": 120.5960
  },
  "delivery_instructions": "Gate code: 1234"
}
```
**Response** (201 Created): Created address

#### Get Address
```
GET /api/users/addresses/{address_id}
```
**Description**: Get specific address  
**Authentication**: Required  
**Response** (200 OK): Address object

#### Update Address
```
PUT /api/users/addresses/{address_id}
```
**Description**: Update address (all fields optional)  
**Authentication**: Required  
**Request Body**: Same as Create Address (all fields optional)  
**Response** (200 OK): Updated address

#### Delete Address
```
DELETE /api/users/addresses/{address_id}
```
**Description**: Delete address  
**Authentication**: Required  
**Response** (204 No Content)

---

## Product Catalog APIs

### List Categories
```
GET /api/products/categories/all?parent_id={uuid}
```
**Description**: Get categories  
**Authentication**: Not required  
**Query Parameters**:
- `parent_id` (optional): Get subcategories of parent (omit for root categories)

**Response** (200 OK):
```json
[
  {
    "_id": "uuid",
    "name": "Vegetables",
    "slug": "vegetables",
    "parent_id": null,
    "description": "Fresh vegetables",
    "icon_url": "https://...",
    "image_url": "https://...",
    "order": 1,
    "status": "active"
  }
]
```

### Create Category
```
POST /api/products/categories
```
**Description**: Create category (Admin only)  
**Authentication**: Required (Admin role)  
**Request Body**:
```json
{
  "name": "Vegetables",
  "parent_id": null,
  "description": "Fresh vegetables",
  "icon_url": "https://...",
  "image_url": "https://...",
  "order": 1
}
```
**Response** (201 Created): Created category

### List Products
```
GET /api/products?category_id={uuid}&search={query}&min_price={float}&max_price={float}&in_stock_only={bool}&featured_only={bool}&sort_by={field}&sort_order={asc|desc}&page={int}&limit={int}
```
**Description**: List products with filters  
**Authentication**: Not required  
**Query Parameters** (all optional):
- `category_id`: Filter by category
- `search`: Search in name, description, tags
- `min_price`: Minimum price
- `max_price`: Maximum price
- `in_stock_only`: Show only in-stock (default: true)
- `featured_only`: Show only featured (default: false)
- `sort_by`: Sort field (created_at | price | rating | name) (default: created_at)
- `sort_order`: Sort order (asc | desc) (default: desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response** (200 OK):
```json
{
  "items": [
    {
      "_id": "uuid",
      "farmer_id": "uuid",
      "category_id": "uuid",
      "name": "Organic Strawberries",
      "slug": "organic-strawberries",
      "description": "Fresh organic strawberries",
      "unit": "kg",
      "base_price": 350.00,
      "stock_quantity": 100,
      "images": [
        {
          "url": "https://...",
          "order": 1,
          "is_primary": true
        }
      ],
      "availability": {
        "status": "in_stock",
        "seasonal": true
      },
      "featured": false,
      "tags": ["organic", "strawberry"],
      "stats": {
        "views": 150,
        "orders": 12,
        "rating": 4.9
      },
      "created_at": "2025-07-15T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### Get Farmer's Products
```
GET /api/products/my-products?page={int}&limit={int}
```
**Description**: Get current farmer's products  
**Authentication**: Required (Farmer role)  
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response** (200 OK): Same as List Products

### Get Product Detail
```
GET /api/products/{product_id}
```
**Description**: Get product details (increments view count)  
**Authentication**: Not required  
**Response** (200 OK): Product object

### Create Product
```
POST /api/products
```
**Description**: Create product (Farmer only)  
**Authentication**: Required (Farmer role)  
**Request Body**:
```json
{
  "category_id": "uuid",
  "name": "Organic Strawberries",
  "description": "Fresh organic strawberries from Baguio",
  "unit": "kg",
  "base_price": 350.00,
  "stock_quantity": 100,
  "min_order_quantity": 1,
  "max_order_quantity": 50,
  "images": [
    {
      "url": "https://...",
      "order": 1,
      "is_primary": true
    }
  ],
  "attributes": {
    "harvest_method": "Hand-picked",
    "storage": "Refrigerate"
  },
  "seasonal": true,
  "available_from": "2025-01-15",
  "available_until": "2025-06-30",
  "tags": ["organic", "strawberry", "baguio"]
}
```
**Response** (201 Created): Created product

**Notes**:
- Product starts in "pending" moderation status
- Will not appear in public listings until approved by admin
- Slug is auto-generated from product name

### Update Product
```
PUT /api/products/{product_id}
```
**Description**: Update product (Farmer only, own products)  
**Authentication**: Required (Farmer role)  
**Request Body**: Same as Create Product (all fields optional)  
**Response** (200 OK): Updated product

**Notes**:
- Farmers can only update their own products
- Significant changes (name, price, category) reset moderation status to "pending"

### Delete Product
```
DELETE /api/products/{product_id}
```
**Description**: Soft delete product (Farmer only, own products)  
**Authentication**: Required (Farmer role)  
**Response** (204 No Content)

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Farmer role required"
}
```

### 404 Not Found
```json
{
  "detail": "Product not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting
- To be implemented in production
- Recommended: 100 requests per minute per IP

## CORS
- Configured to allow all origins in development
- Restrict to specific domains in production

## Pagination
All list endpoints support pagination:
- Default page size: 20
- Maximum page size: 100
- Response includes: `total`, `page`, `limit`, `pages`

## Timestamps
All timestamps are in ISO 8601 format (UTC):
```
2025-07-15T10:00:00Z
```

## UUIDs
All IDs are UUID v4 strings:
```
550e8400-e29b-41d4-a716-446655440000
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-XX  
**Status**: Phase 2 Complete
