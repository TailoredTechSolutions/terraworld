"""
Terra Farming API Tests - Iteration 2
Tests for: Backend refactor, Email triggers, Image uploads, Analytics, Coupons, Reviews
"""
import pytest
import requests
import os
import io
from PIL import Image

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthAndBasics:
    """Health check and basic endpoints"""
    
    def test_health_endpoint(self, api_client):
        """GET /api/health returns healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check passed: {data}")
    
    def test_root_api_endpoint(self, api_client):
        """GET /api returns API info"""
        response = api_client.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data
        assert data["status"] == "healthy"
        print(f"✓ Root API: {data}")


class TestProducts:
    """Product endpoints"""
    
    def test_get_products_returns_32(self, api_client):
        """GET /api/products returns 32 products"""
        response = api_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 32, f"Expected 32 products, got {len(data)}"
        print(f"✓ Products count: {len(data)}")
    
    def test_product_structure(self, api_client):
        """Products have required fields"""
        response = api_client.get(f"{BASE_URL}/api/products?limit=1")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            product = data[0]
            required_fields = ["id", "name", "price", "category", "farm_id"]
            for field in required_fields:
                assert field in product, f"Missing field: {field}"
            print(f"✓ Product structure valid: {product['name']}")


class TestFarms:
    """Farm endpoints"""
    
    def test_get_farms_returns_10(self, api_client):
        """GET /api/farms returns 10 farms"""
        response = api_client.get(f"{BASE_URL}/api/farms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 10, f"Expected 10 farms, got {len(data)}"
        print(f"✓ Farms count: {len(data)}")
    
    def test_farm_structure(self, api_client):
        """Farms have required fields"""
        response = api_client.get(f"{BASE_URL}/api/farms?limit=1")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            farm = data[0]
            required_fields = ["id", "name"]
            for field in required_fields:
                assert field in farm, f"Missing field: {field}"
            print(f"✓ Farm structure valid: {farm['name']}")


class TestCategories:
    """Category endpoints"""
    
    def test_get_categories_returns_4(self, api_client):
        """GET /api/categories returns 4 categories"""
        response = api_client.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 4, f"Expected 4 categories, got {len(data)}"
        expected_ids = ["vegetables", "fruits", "dairy", "pantry"]
        actual_ids = [c["id"] for c in data]
        for eid in expected_ids:
            assert eid in actual_ids, f"Missing category: {eid}"
        print(f"✓ Categories: {actual_ids}")


class TestCoupons:
    """Coupon endpoints"""
    
    def test_get_coupons_returns_3(self, api_client):
        """GET /api/coupons returns 3 coupons"""
        response = api_client.get(f"{BASE_URL}/api/coupons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3, f"Expected at least 3 coupons, got {len(data)}"
        print(f"✓ Coupons count: {len(data)}")
    
    def test_validate_welcome10_coupon(self, api_client):
        """POST /api/coupons/validate with WELCOME10 and subtotal=500 returns valid"""
        response = requests.post(
            f"{BASE_URL}/api/coupons/validate",
            json={"code": "WELCOME10", "subtotal": 500}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert "discount" in data
        assert data["discount"] > 0
        print(f"✓ WELCOME10 validation: discount={data['discount']}")
    
    def test_validate_invalid_coupon(self, api_client):
        """POST /api/coupons/validate with invalid code returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/coupons/validate",
            json={"code": "INVALIDCODE", "subtotal": 500}
        )
        assert response.status_code == 404
        print("✓ Invalid coupon returns 404")
    
    def test_validate_coupon_min_order_not_met(self, api_client):
        """POST /api/coupons/validate with subtotal below minimum returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/coupons/validate",
            json={"code": "WELCOME10", "subtotal": 50}  # Below min order
        )
        assert response.status_code == 400
        print("✓ Coupon min order validation works")


class TestAnalytics:
    """Analytics endpoints"""
    
    def test_analytics_overview(self, api_client):
        """GET /api/analytics/overview returns analytics data"""
        response = api_client.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["total_revenue", "total_orders", "total_products", "total_farms"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        print(f"✓ Analytics overview: revenue={data['total_revenue']}, orders={data['total_orders']}")
    
    def test_revenue_chart(self, api_client):
        """GET /api/analytics/revenue-chart returns chart data array"""
        response = api_client.get(f"{BASE_URL}/api/analytics/revenue-chart")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "date" in data[0]
            assert "revenue" in data[0]
        print(f"✓ Revenue chart: {len(data)} data points")
    
    def test_top_products(self, api_client):
        """GET /api/analytics/top-products returns product analytics"""
        response = api_client.get(f"{BASE_URL}/api/analytics/top-products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Top products: {len(data)} products")


class TestAdminStats:
    """Admin endpoints"""
    
    def test_admin_stats(self, api_client):
        """GET /api/admin/stats returns admin stats"""
        response = api_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["total_orders", "total_products", "total_farms", "total_revenue"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        print(f"✓ Admin stats: orders={data['total_orders']}, revenue={data['total_revenue']}")


class TestImageUpload:
    """Image upload endpoints"""
    
    def test_upload_jpg_image(self):
        """POST /api/uploads/image accepts a JPG file and returns url"""
        # Create a test image in memory
        img = Image.new('RGB', (100, 100), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "filename" in data
        assert data["url"].startswith("/api/files/")
        print(f"✓ Image upload successful: {data['url']}")
        return data["filename"]
    
    def test_upload_txt_file_rejected(self):
        """POST /api/uploads/image rejects a .txt file"""
        files = {'file': ('test.txt', b'This is a text file', 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        
        assert response.status_code == 400
        print("✓ Text file upload correctly rejected")
    
    def test_uploaded_file_accessible(self):
        """Uploaded file is accessible via GET /api/files/{filename}"""
        # First upload an image
        img = Image.new('RGB', (50, 50), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test_access.jpg', img_bytes, 'image/jpeg')}
        upload_response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        assert upload_response.status_code == 200
        
        filename = upload_response.json()["filename"]
        
        # Now try to access it
        get_response = requests.get(f"{BASE_URL}/api/files/{filename}")
        assert get_response.status_code == 200
        assert get_response.headers.get("content-type", "").startswith("image/")
        print(f"✓ Uploaded file accessible: {filename}")


class TestEmails:
    """Email endpoints (mocked)"""
    
    def test_send_test_email(self, api_client):
        """POST /api/emails/send-test triggers mock email and stores in DB"""
        response = requests.post(
            f"{BASE_URL}/api/emails/send-test",
            params={"to_email": "test@example.com", "template": "order_confirmation"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "email_id" in data
        print(f"✓ Test email sent: {data['email_id']}")
    
    def test_get_sent_emails(self, api_client):
        """GET /api/emails returns sent emails list"""
        response = api_client.get(f"{BASE_URL}/api/emails")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Emails list: {len(data)} emails")


class TestReviews:
    """Review endpoints"""
    
    def test_get_product_reviews(self, api_client):
        """GET /api/reviews/product/{id} returns reviews structure"""
        # Get a product ID first
        products_response = api_client.get(f"{BASE_URL}/api/products?limit=1")
        products = products_response.json()
        if len(products) > 0:
            product_id = products[0]["id"]
            
            response = api_client.get(f"{BASE_URL}/api/reviews/product/{product_id}")
            assert response.status_code == 200
            data = response.json()
            
            required_fields = ["reviews", "total", "average_rating"]
            for field in required_fields:
                assert field in data, f"Missing field: {field}"
            
            assert isinstance(data["reviews"], list)
            print(f"✓ Product reviews: total={data['total']}, avg={data['average_rating']}")
        else:
            pytest.skip("No products available for review test")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
