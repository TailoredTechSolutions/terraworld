"""
Backend API Tests for Terra Farming - New Features
Tests: Coupons, Reviews, Analytics, and new routes
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Basic health check tests"""
    
    def test_health_check(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health check passed")

    def test_api_root(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "Terra Farming API" in data.get("message", "")
        print("✅ API root endpoint working")


class TestCouponsAPI:
    """Coupon API tests - GET /api/coupons, POST /api/coupons/validate"""
    
    @pytest.fixture(autouse=True)
    def setup_coupons(self):
        """Seed test coupons if not exist"""
        # Create test coupons
        test_coupons = [
            {
                "code": "WELCOME10",
                "coupon_type": "percentage",
                "value": 10,
                "min_order": 0,
                "description": "10% off for new customers"
            },
            {
                "code": "SAVE50",
                "coupon_type": "fixed",
                "value": 50,
                "min_order": 100,
                "description": "₱50 off on orders over ₱100"
            },
            {
                "code": "FREEDELIVERY",
                "coupon_type": "free_delivery",
                "value": 50,
                "min_order": 0,
                "description": "Free delivery on any order"
            }
        ]
        
        for coupon in test_coupons:
            try:
                requests.post(f"{BASE_URL}/api/coupons", json=coupon)
            except:
                pass  # Coupon may already exist
    
    def test_get_all_coupons(self):
        """GET /api/coupons returns list of coupons"""
        response = requests.get(f"{BASE_URL}/api/coupons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ GET /api/coupons returned {len(data)} coupons")
    
    def test_validate_coupon_welcome10(self):
        """POST /api/coupons/validate with WELCOME10 returns discount"""
        response = requests.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "WELCOME10",
            "subtotal": 500
        })
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == "WELCOME10"
        assert data["coupon_type"] == "percentage"
        assert data["discount"] == 50  # 10% of 500
        print(f"✅ WELCOME10 coupon validated: discount = ₱{data['discount']}")
    
    def test_validate_coupon_save50(self):
        """POST /api/coupons/validate with SAVE50 returns fixed discount"""
        response = requests.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "SAVE50",
            "subtotal": 600  # min_order is 500
        })
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == "SAVE50"
        assert data["coupon_type"] == "fixed"
        assert data["discount"] == 50
        print(f"✅ SAVE50 coupon validated: discount = ₱{data['discount']}")
    
    def test_validate_coupon_freedelivery(self):
        """POST /api/coupons/validate with FREEDELIVERY returns free delivery"""
        response = requests.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "FREEDELIVERY",
            "subtotal": 400  # min_order is 300
        })
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == "FREEDELIVERY"
        assert data["coupon_type"] == "free_delivery"
        print(f"✅ FREEDELIVERY coupon validated: discount = ₱{data['discount']}")
    
    def test_validate_invalid_coupon(self):
        """POST /api/coupons/validate with invalid code returns 404"""
        response = requests.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "INVALIDCODE123",
            "subtotal": 500
        })
        assert response.status_code == 404
        print("✅ Invalid coupon correctly returns 404")
    
    def test_validate_coupon_min_order_not_met(self):
        """POST /api/coupons/validate with subtotal below min_order returns 400"""
        response = requests.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "SAVE50",
            "subtotal": 50  # Below min_order of 100
        })
        assert response.status_code == 400
        print("✅ Coupon min_order validation working")


class TestReviewsAPI:
    """Reviews API tests - GET /api/reviews/product/{id}"""
    
    def test_get_product_reviews(self):
        """GET /api/reviews/product/{id} returns reviews response"""
        # Use a known product ID from seed data
        product_id = "saymayat-vegetable-cabbage"
        response = requests.get(f"{BASE_URL}/api/reviews/product/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert "reviews" in data
        assert "total" in data
        assert "average_rating" in data
        assert isinstance(data["reviews"], list)
        print(f"✅ GET /api/reviews/product/{product_id} returned {data['total']} reviews, avg rating: {data['average_rating']}")
    
    def test_create_and_get_review(self):
        """POST /api/reviews creates review, GET retrieves it"""
        product_id = "saymayat-vegetable-cabbage"
        
        # Create a review
        response = requests.post(
            f"{BASE_URL}/api/reviews?user_id=test-user-123&user_name=Test%20User",
            json={
                "product_id": product_id,
                "rating": 5,
                "comment": "TEST_Great fresh cabbage!",
                "images": []
            }
        )
        assert response.status_code == 200
        review = response.json()
        assert review["rating"] == 5
        assert "TEST_" in review["comment"]
        print(f"✅ Created review with ID: {review['id']}")
        
        # Verify review appears in product reviews
        response = requests.get(f"{BASE_URL}/api/reviews/product/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        print(f"✅ Review persisted - total reviews: {data['total']}")


class TestAnalyticsAPI:
    """Analytics API tests - GET /api/analytics/overview"""
    
    def test_get_analytics_overview(self):
        """GET /api/analytics/overview returns analytics data"""
        response = requests.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields
        required_fields = [
            "total_revenue", "total_orders", "monthly_revenue", "monthly_orders",
            "weekly_revenue", "weekly_orders", "average_order_value",
            "total_products", "total_farms", "total_drivers"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✅ Analytics overview: revenue=₱{data['total_revenue']}, orders={data['total_orders']}, products={data['total_products']}, farms={data['total_farms']}")
    
    def test_get_revenue_chart(self):
        """GET /api/analytics/revenue-chart returns chart data"""
        response = requests.get(f"{BASE_URL}/api/analytics/revenue-chart?days=7")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "date" in data[0]
            assert "revenue" in data[0]
            assert "orders" in data[0]
        print(f"✅ Revenue chart returned {len(data)} data points")
    
    def test_get_top_products(self):
        """GET /api/analytics/top-products returns top selling products"""
        response = requests.get(f"{BASE_URL}/api/analytics/top-products?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Top products returned {len(data)} products")
    
    def test_get_top_farms(self):
        """GET /api/analytics/top-farms returns top performing farms"""
        response = requests.get(f"{BASE_URL}/api/analytics/top-farms?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Top farms returned {len(data)} farms")
    
    def test_get_order_status_distribution(self):
        """GET /api/analytics/order-status-distribution returns status counts"""
        response = requests.get(f"{BASE_URL}/api/analytics/order-status-distribution")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✅ Order status distribution: {data}")


class TestFarmerManagementAPI:
    """Farmer Management API tests"""
    
    def test_get_farmer_stats(self):
        """GET /api/farmer/{farm_id}/stats returns farm statistics"""
        farm_id = "saymayat-vegetable"
        response = requests.get(f"{BASE_URL}/api/farmer/{farm_id}/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "farm" in data
        assert "product_count" in data
        assert "total_orders" in data
        assert "total_revenue" in data
        
        print(f"✅ Farmer stats: products={data['product_count']}, orders={data['total_orders']}, revenue=₱{data['total_revenue']}")
    
    def test_get_farmer_products(self):
        """GET /api/farmer/{farm_id}/products returns farm products"""
        farm_id = "saymayat-vegetable"
        response = requests.get(f"{BASE_URL}/api/farmer/{farm_id}/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Farmer products: {len(data)} products found")
    
    def test_get_farmer_orders(self):
        """GET /api/farmer/{farm_id}/orders returns farm orders"""
        farm_id = "saymayat-vegetable"
        response = requests.get(f"{BASE_URL}/api/farmer/{farm_id}/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Farmer orders: {len(data)} orders found")


class TestProductsAndFarmsBasics:
    """Basic products and farms tests to ensure data exists"""
    
    def test_products_exist(self):
        """GET /api/products returns products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No products found - database may need seeding"
        print(f"✅ Products API: {len(data)} products available")
    
    def test_farms_exist(self):
        """GET /api/farms returns farms"""
        response = requests.get(f"{BASE_URL}/api/farms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No farms found - database may need seeding"
        print(f"✅ Farms API: {len(data)} farms available")
    
    def test_get_single_product(self):
        """GET /api/products/{id} returns product details"""
        # First get a product ID
        response = requests.get(f"{BASE_URL}/api/products?limit=1")
        products = response.json()
        if len(products) > 0:
            product_id = products[0]["id"]
            response = requests.get(f"{BASE_URL}/api/products/{product_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == product_id
            print(f"✅ Single product: {data['name']} from {data['farm_name']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
