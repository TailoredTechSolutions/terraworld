#!/usr/bin/env python3
"""
Terra Farming Backend API Test Suite
Tests all backend endpoints as specified in the review request
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Get backend URL from frontend .env
BACKEND_URL = "https://app-constructor-45.preview.emergentagent.com/api"
TEST_USER_ID = "test-user-123"

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def make_request(self, method: str, endpoint: str, **kwargs) -> tuple[bool, Any]:
        """Make HTTP request and return (success, response_data)"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.request(method, url, **kwargs)
            
            if response.status_code >= 400:
                return False, f"HTTP {response.status_code}: {response.text}"
            
            try:
                return True, response.json()
            except:
                return True, response.text
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"
    
    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        
        # Test root endpoint
        success, data = self.make_request("GET", "/")
        if success and isinstance(data, dict) and data.get("message") == "Terra Farming API":
            self.log_test("GET /api/ - Root endpoint", True, f"Version: {data.get('version')}")
        else:
            self.log_test("GET /api/ - Root endpoint", False, str(data))
        
        # Test health endpoint
        success, data = self.make_request("GET", "/health")
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            self.log_test("GET /api/health - Health status", True, f"Database: {data.get('database')}")
        else:
            self.log_test("GET /api/health - Health status", False, str(data))
    
    def test_products_api(self):
        """Test Products API endpoints"""
        print("\n=== PRODUCTS API TESTS ===")
        
        # Test get all products
        success, data = self.make_request("GET", "/products")
        if success and isinstance(data, list) and len(data) > 0:
            self.log_test("GET /api/products - List all products", True, f"Found {len(data)} products")
            # Store first product for later tests
            self.sample_product = data[0]
        else:
            self.log_test("GET /api/products - List all products", False, str(data))
            return
        
        # Test filter by category
        success, data = self.make_request("GET", "/products?category=Vegetables")
        if success and isinstance(data, list):
            vegetable_count = len(data)
            self.log_test("GET /api/products?category=Vegetables - Filter by category", True, f"Found {vegetable_count} vegetables")
        else:
            self.log_test("GET /api/products?category=Vegetables - Filter by category", False, str(data))
        
        # Test filter organic products
        success, data = self.make_request("GET", "/products?organic=true")
        if success and isinstance(data, list):
            organic_count = len(data)
            self.log_test("GET /api/products?organic=true - Filter organic products", True, f"Found {organic_count} organic products")
        else:
            self.log_test("GET /api/products?organic=true - Filter organic products", False, str(data))
        
        # Test search products
        success, data = self.make_request("GET", "/products?search=cabbage")
        if success and isinstance(data, list):
            search_count = len(data)
            self.log_test("GET /api/products?search=cabbage - Search products", True, f"Found {search_count} products matching 'cabbage'")
        else:
            self.log_test("GET /api/products?search=cabbage - Search products", False, str(data))
        
        # Test get single product
        if hasattr(self, 'sample_product'):
            product_id = self.sample_product.get('id', '1')
            success, data = self.make_request("GET", f"/products/{product_id}")
            if success and isinstance(data, dict) and data.get('id') == product_id:
                self.log_test(f"GET /api/products/{product_id} - Get single product", True, f"Product: {data.get('name')}")
            else:
                self.log_test(f"GET /api/products/{product_id} - Get single product", False, str(data))
    
    def test_farms_api(self):
        """Test Farms API endpoints"""
        print("\n=== FARMS API TESTS ===")
        
        # Test get all farms
        success, data = self.make_request("GET", "/farms")
        if success and isinstance(data, list) and len(data) > 0:
            self.log_test("GET /api/farms - List all farms", True, f"Found {len(data)} farms")
            self.sample_farm = data[0]
        else:
            self.log_test("GET /api/farms - List all farms", False, str(data))
            return
        
        # Test get specific farm (saymayat-vegetable)
        success, data = self.make_request("GET", "/farms/saymayat-vegetable")
        if success and isinstance(data, dict) and data.get('id') == 'saymayat-vegetable':
            self.log_test("GET /api/farms/saymayat-vegetable - Get farm by ID", True, f"Farm: {data.get('name')}")
        else:
            self.log_test("GET /api/farms/saymayat-vegetable - Get farm by ID", False, str(data))
        
        # Test get farm's products
        success, data = self.make_request("GET", "/farms/saymayat-vegetable/products")
        if success and isinstance(data, list):
            products_count = len(data)
            self.log_test("GET /api/farms/saymayat-vegetable/products - Get farm's products", True, f"Found {products_count} products")
        else:
            self.log_test("GET /api/farms/saymayat-vegetable/products - Get farm's products", False, str(data))
    
    def test_cart_api(self):
        """Test Cart API endpoints"""
        print("\n=== CART API TESTS ===")
        
        # Test get cart (should create empty if not exists)
        success, data = self.make_request("GET", f"/cart/{TEST_USER_ID}")
        if success and isinstance(data, dict) and data.get('user_id') == TEST_USER_ID:
            self.log_test(f"GET /api/cart/{TEST_USER_ID} - Get cart", True, f"Items: {len(data.get('items', []))}")
        else:
            self.log_test(f"GET /api/cart/{TEST_USER_ID} - Get cart", False, str(data))
        
        # Test add item to cart
        add_payload = {
            "user_id": TEST_USER_ID,
            "product_id": "1",
            "quantity": 2
        }
        success, data = self.make_request("POST", "/cart/add", json=add_payload)
        if success and isinstance(data, dict) and len(data.get('items', [])) > 0:
            self.log_test("POST /api/cart/add - Add item to cart", True, f"Added product_id=1, quantity=2")
        else:
            self.log_test("POST /api/cart/add - Add item to cart", False, str(data))
        
        # Test update cart item quantity
        update_payload = {"quantity": 5}
        success, data = self.make_request("PUT", f"/cart/{TEST_USER_ID}/item/1", json=update_payload)
        if success and isinstance(data, dict):
            # Check if quantity was updated
            items = data.get('items', [])
            updated_item = next((item for item in items if item['product_id'] == '1'), None)
            if updated_item and updated_item['quantity'] == 5:
                self.log_test(f"PUT /api/cart/{TEST_USER_ID}/item/1 - Update quantity", True, "Quantity updated to 5")
            else:
                self.log_test(f"PUT /api/cart/{TEST_USER_ID}/item/1 - Update quantity", False, "Quantity not updated correctly")
        else:
            self.log_test(f"PUT /api/cart/{TEST_USER_ID}/item/1 - Update quantity", False, str(data))
        
        # Test remove item from cart
        success, data = self.make_request("DELETE", f"/cart/{TEST_USER_ID}/item/1")
        if success and isinstance(data, dict):
            items = data.get('items', [])
            removed = not any(item['product_id'] == '1' for item in items)
            if removed:
                self.log_test(f"DELETE /api/cart/{TEST_USER_ID}/item/1 - Remove item", True, "Item removed successfully")
            else:
                self.log_test(f"DELETE /api/cart/{TEST_USER_ID}/item/1 - Remove item", False, "Item not removed")
        else:
            self.log_test(f"DELETE /api/cart/{TEST_USER_ID}/item/1 - Remove item", False, str(data))
        
        # Add item back for order testing
        success, data = self.make_request("POST", "/cart/add", json=add_payload)
        
        # Test clear cart (will test this after order creation)
    
    def test_order_api(self):
        """Test Order API endpoints"""
        print("\n=== ORDER API TESTS ===")
        
        # First ensure we have items in cart
        add_payload = {
            "user_id": TEST_USER_ID,
            "product_id": "1",
            "quantity": 2
        }
        self.make_request("POST", "/cart/add", json=add_payload)
        
        # Test create order
        order_payload = {
            "user_id": TEST_USER_ID,
            "delivery_address": {
                "full_name": "Juan dela Cruz",
                "phone": "09171234567",
                "address_line1": "123 Main Street",
                "city": "Baguio City",
                "province": "Benguet",
                "postal_code": "2600"
            },
            "payment_method": "gcash"
        }
        
        success, data = self.make_request("POST", "/orders", json=order_payload)
        if success and isinstance(data, dict) and data.get('user_id') == TEST_USER_ID:
            order_id = data.get('id')
            self.log_test("POST /api/orders - Create order", True, f"Order ID: {order_id}, Total: ₱{data.get('total')}")
            self.test_order_id = order_id
        else:
            self.log_test("POST /api/orders - Create order", False, str(data))
            return
        
        # Test get user's orders
        success, data = self.make_request("GET", f"/orders/{TEST_USER_ID}")
        if success and isinstance(data, list) and len(data) > 0:
            self.log_test(f"GET /api/orders/{TEST_USER_ID} - Get user's orders", True, f"Found {len(data)} orders")
        else:
            self.log_test(f"GET /api/orders/{TEST_USER_ID} - Get user's orders", False, str(data))
        
        # Test get single order
        if hasattr(self, 'test_order_id'):
            success, data = self.make_request("GET", f"/orders/detail/{self.test_order_id}")
            if success and isinstance(data, dict) and data.get('id') == self.test_order_id:
                self.log_test(f"GET /api/orders/detail/{self.test_order_id} - Get single order", True, f"Status: {data.get('order_status')}")
            else:
                self.log_test(f"GET /api/orders/detail/{self.test_order_id} - Get single order", False, str(data))
        
        # Test clear cart after order
        success, data = self.make_request("DELETE", f"/cart/{TEST_USER_ID}")
        if success:
            self.log_test(f"DELETE /api/cart/{TEST_USER_ID} - Clear cart", True, "Cart cleared successfully")
        else:
            self.log_test(f"DELETE /api/cart/{TEST_USER_ID} - Clear cart", False, str(data))
    
    def test_categories_api(self):
        """Test Categories API"""
        print("\n=== CATEGORIES API TESTS ===")
        
        success, data = self.make_request("GET", "/categories")
        if success and isinstance(data, list) and len(data) > 0:
            categories = [cat.get('name') for cat in data]
            self.log_test("GET /api/categories - List categories", True, f"Categories: {', '.join(categories)}")
        else:
            self.log_test("GET /api/categories - List categories", False, str(data))
    
    def test_database_seeding(self):
        """Test database seeding"""
        print("\n=== DATABASE SEEDING TESTS ===")
        
        success, data = self.make_request("POST", "/seed")
        if success and isinstance(data, dict):
            message = data.get('message', '')
            if 'already seeded' in message:
                self.log_test("POST /api/seed - Database seeding", True, f"Database already seeded with {data.get('products', 0)} products")
            elif 'seeded successfully' in message:
                self.log_test("POST /api/seed - Database seeding", True, f"Seeded {data.get('farms', 0)} farms and {data.get('products', 0)} products")
            else:
                self.log_test("POST /api/seed - Database seeding", False, str(data))
        else:
            self.log_test("POST /api/seed - Database seeding", False, str(data))
    
    def run_all_tests(self):
        """Run all test suites"""
        print(f"🧪 Testing Terra Farming Backend API at {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_database_seeding()
        self.test_products_api()
        self.test_farms_api()
        self.test_cart_api()
        self.test_order_api()
        self.test_categories_api()
        
        # Summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['details']}")
        
        return passed == total

def main():
    """Main test runner"""
    tester = APITester(BACKEND_URL)
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()