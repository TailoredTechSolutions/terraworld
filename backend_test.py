#!/usr/bin/env python3
"""
Terra Digital Platform Backend API Tests
Tests all backend APIs including authentication, user management, and product catalog.
"""

import asyncio
import aiohttp
import json
import os
from typing import Dict, Any, Optional

# Get backend URL from environment
BACKEND_URL = "https://terra-digital-v1.preview.emergentagent.com/api"

class TerraAPITester:
    def __init__(self):
        self.session = None
        self.buyer_tokens = {}
        self.farmer_tokens = {}
        self.buyer_user_id = None
        self.farmer_user_id = None
        self.test_product_id = None
        self.test_address_id = None
        self.test_results = []
        
        # Generate unique emails for this test run
        import time
        timestamp = int(time.time())
        self.buyer_email = f"maria.santos.{timestamp}@example.com"
        self.farmer_email = f"juan.delacruz.{timestamp}@example.com"
        self.buyer_phone = f"+6391712345{timestamp % 100:02d}"
        self.farmer_phone = f"+6391876543{timestamp % 100:02d}"
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
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
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, 
                          headers: Dict = None, auth_token: str = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{BACKEND_URL}{endpoint}"
        
        # Prepare headers
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)
        if auth_token:
            request_headers["Authorization"] = f"Bearer {auth_token}"
        
        try:
            async with self.session.request(
                method, url, 
                json=data if data else None,
                headers=request_headers
            ) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return response.status < 400, response_data, response.status
        except Exception as e:
            return False, str(e), 0
    
    async def test_health_check(self):
        """Test health check endpoint"""
        success, data, status = await self.make_request("GET", "/health")
        
        if success and status == 200:
            if isinstance(data, dict) and data.get("status") == "healthy":
                self.log_test("Health Check", True, f"Status: {data.get('status')}")
            else:
                self.log_test("Health Check", False, f"Invalid response: {data}")
        else:
            self.log_test("Health Check", False, f"Status {status}: {data}")
    
    async def test_register_buyer(self):
        """Test buyer registration"""
        buyer_data = {
            "email": self.buyer_email,
            "password": "SecurePass123",
            "first_name": "Maria",
            "last_name": "Santos",
            "role": "buyer",
            "phone": self.buyer_phone
        }
        
        success, data, status = await self.make_request("POST", "/auth/register", buyer_data)
        
        if success and status == 201:
            if isinstance(data, dict) and "access_token" in data and "user" in data:
                self.buyer_tokens = {
                    "access_token": data["access_token"],
                    "refresh_token": data["refresh_token"]
                }
                self.buyer_user_id = data["user"]["_id"]
                self.log_test("Register Buyer", True, f"User ID: {self.buyer_user_id}")
            else:
                self.log_test("Register Buyer", False, f"Invalid response structure: {data}")
        else:
            self.log_test("Register Buyer", False, f"Status {status}: {data}")
    
    async def test_register_farmer(self):
        """Test farmer registration"""
        farmer_data = {
            "email": self.farmer_email,
            "password": "FarmPass123",
            "first_name": "Juan",
            "last_name": "Dela Cruz",
            "role": "farmer",
            "phone": self.farmer_phone
        }
        
        success, data, status = await self.make_request("POST", "/auth/register", farmer_data)
        
        if success and status == 201:
            if isinstance(data, dict) and "access_token" in data and "user" in data:
                self.farmer_tokens = {
                    "access_token": data["access_token"],
                    "refresh_token": data["refresh_token"]
                }
                self.farmer_user_id = data["user"]["_id"]
                self.log_test("Register Farmer", True, f"User ID: {self.farmer_user_id}")
            else:
                self.log_test("Register Farmer", False, f"Invalid response structure: {data}")
        else:
            self.log_test("Register Farmer", False, f"Status {status}: {data}")
    
    async def test_register_duplicate_email(self):
        """Test registration with duplicate email (should fail)"""
        duplicate_data = {
            "email": self.buyer_email,  # Same as buyer
            "password": "AnotherPass123",
            "first_name": "Another",
            "last_name": "User",
            "role": "buyer"
        }
        
        success, data, status = await self.make_request("POST", "/auth/register", duplicate_data)
        
        if not success and status == 400:
            self.log_test("Register Duplicate Email", True, "Correctly rejected duplicate email")
        else:
            self.log_test("Register Duplicate Email", False, f"Should have failed but got status {status}: {data}")
    
    async def test_login_buyer(self):
        """Test buyer login"""
        login_data = {
            "email": self.buyer_email,
            "password": "SecurePass123"
        }
        
        success, data, status = await self.make_request("POST", "/auth/login", login_data)
        
        if success and status == 200:
            if isinstance(data, dict) and "access_token" in data:
                # Update tokens
                self.buyer_tokens = {
                    "access_token": data["access_token"],
                    "refresh_token": data["refresh_token"]
                }
                self.log_test("Login Buyer", True, "Successfully logged in")
            else:
                self.log_test("Login Buyer", False, f"Invalid response: {data}")
        else:
            self.log_test("Login Buyer", False, f"Status {status}: {data}")
    
    async def test_login_wrong_password(self):
        """Test login with wrong password (should fail)"""
        login_data = {
            "email": self.buyer_email,
            "password": "WrongPassword123"
        }
        
        success, data, status = await self.make_request("POST", "/auth/login", login_data)
        
        if not success and status == 401:
            self.log_test("Login Wrong Password", True, "Correctly rejected wrong password")
        else:
            self.log_test("Login Wrong Password", False, f"Should have failed but got status {status}: {data}")
    
    async def test_refresh_token(self):
        """Test token refresh"""
        if not self.buyer_tokens.get("refresh_token"):
            self.log_test("Refresh Token", False, "No refresh token available")
            return
        
        refresh_data = {
            "refresh_token": self.buyer_tokens["refresh_token"]
        }
        
        success, data, status = await self.make_request("POST", "/auth/refresh", refresh_data)
        
        if success and status == 200:
            if isinstance(data, dict) and "access_token" in data:
                # Update tokens
                self.buyer_tokens = {
                    "access_token": data["access_token"],
                    "refresh_token": data["refresh_token"]
                }
                self.log_test("Refresh Token", True, "Successfully refreshed token")
            else:
                self.log_test("Refresh Token", False, f"Invalid response: {data}")
        else:
            self.log_test("Refresh Token", False, f"Status {status}: {data}")
    
    async def test_get_current_user(self):
        """Test get current user profile"""
        if not self.buyer_tokens.get("access_token"):
            self.log_test("Get Current User", False, "No access token available")
            return
        
        success, data, status = await self.make_request(
            "GET", "/users/me", 
            auth_token=self.buyer_tokens["access_token"]
        )
        
        if success and status == 200:
            if isinstance(data, dict) and "_id" in data and "email" in data:
                self.log_test("Get Current User", True, f"Email: {data.get('email')}")
            else:
                self.log_test("Get Current User", False, f"Invalid response: {data}")
        else:
            self.log_test("Get Current User", False, f"Status {status}: {data}")
    
    async def test_update_user_profile(self):
        """Test update user profile"""
        if not self.buyer_tokens.get("access_token"):
            self.log_test("Update User Profile", False, "No access token available")
            return
        
        update_data = {
            "first_name": "Maria Elena",
            "bio": "Updated bio for testing"
        }
        
        success, data, status = await self.make_request(
            "PUT", "/users/me", update_data,
            auth_token=self.buyer_tokens["access_token"]
        )
        
        if success and status == 200:
            if isinstance(data, dict) and data.get("profile", {}).get("first_name") == "Maria Elena":
                self.log_test("Update User Profile", True, "Profile updated successfully")
            else:
                self.log_test("Update User Profile", False, f"Profile not updated correctly: {data}")
        else:
            self.log_test("Update User Profile", False, f"Status {status}: {data}")
    
    async def test_create_address(self):
        """Test create address"""
        if not self.buyer_tokens.get("access_token"):
            self.log_test("Create Address", False, "No access token available")
            return
        
        address_data = {
            "type": "delivery",
            "label": "Home",
            "is_default": True,
            "contact_name": "Maria Santos",
            "contact_phone": "+639171234567",
            "street_address": "123 Rizal Street",
            "barangay": "Poblacion",
            "city": "Quezon City",
            "province": "Metro Manila",
            "postal_code": "1100",
            "country": "PH"
        }
        
        success, data, status = await self.make_request(
            "POST", "/users/addresses", address_data,
            auth_token=self.buyer_tokens["access_token"]
        )
        
        if success and status == 201:
            if isinstance(data, dict) and "_id" in data:
                self.test_address_id = data["_id"]
                self.log_test("Create Address", True, f"Address ID: {self.test_address_id}")
            else:
                self.log_test("Create Address", False, f"Invalid response: {data}")
        else:
            self.log_test("Create Address", False, f"Status {status}: {data}")
    
    async def test_get_addresses(self):
        """Test get user addresses"""
        if not self.buyer_tokens.get("access_token"):
            self.log_test("Get Addresses", False, "No access token available")
            return
        
        success, data, status = await self.make_request(
            "GET", "/users/addresses",
            auth_token=self.buyer_tokens["access_token"]
        )
        
        if success and status == 200:
            if isinstance(data, list):
                self.log_test("Get Addresses", True, f"Found {len(data)} addresses")
            else:
                self.log_test("Get Addresses", False, f"Expected list, got: {type(data)}")
        else:
            self.log_test("Get Addresses", False, f"Status {status}: {data}")
    
    async def test_update_address(self):
        """Test update address"""
        if not self.buyer_tokens.get("access_token") or not self.test_address_id:
            self.log_test("Update Address", False, "No access token or address ID available")
            return
        
        update_data = {
            "label": "Updated Home",
            "delivery_instructions": "Ring the doorbell twice"
        }
        
        success, data, status = await self.make_request(
            "PUT", f"/users/addresses/{self.test_address_id}", update_data,
            auth_token=self.buyer_tokens["access_token"]
        )
        
        if success and status == 200:
            if isinstance(data, dict) and data.get("label") == "Updated Home":
                self.log_test("Update Address", True, "Address updated successfully")
            else:
                self.log_test("Update Address", False, f"Address not updated correctly: {data}")
        else:
            self.log_test("Update Address", False, f"Status {status}: {data}")
    
    async def test_get_categories(self):
        """Test get categories"""
        success, data, status = await self.make_request("GET", "/products/categories/all")
        
        if success and status == 200:
            if isinstance(data, list) and len(data) >= 6:  # Should have 6 seed categories
                self.log_test("Get Categories", True, f"Found {len(data)} categories")
            else:
                self.log_test("Get Categories", False, f"Expected at least 6 categories, got: {len(data) if isinstance(data, list) else 'not a list'}")
        else:
            self.log_test("Get Categories", False, f"Status {status}: {data}")
    
    async def test_create_product_as_farmer(self):
        """Test create product as farmer"""
        if not self.farmer_tokens.get("access_token"):
            self.log_test("Create Product as Farmer", False, "No farmer access token available")
            return
        
        # First get a category ID
        success, categories, status = await self.make_request("GET", "/products/categories/all")
        if not success or not categories:
            self.log_test("Create Product as Farmer", False, "Could not get categories")
            return
        
        category_id = categories[0]["_id"]
        
        product_data = {
            "category_id": category_id,
            "name": "Fresh Organic Tomatoes",
            "description": "Locally grown organic tomatoes, perfect for cooking and salads",
            "unit": "kg",
            "base_price": 85.50,
            "stock_quantity": 100,
            "min_order_quantity": 1,
            "tags": ["organic", "fresh", "local"]
        }
        
        success, data, status = await self.make_request(
            "POST", "/products", product_data,
            auth_token=self.farmer_tokens["access_token"]
        )
        
        if success and status == 201:
            if isinstance(data, dict) and "_id" in data:
                self.test_product_id = data["_id"]
                self.log_test("Create Product as Farmer", True, f"Product ID: {self.test_product_id}")
            else:
                self.log_test("Create Product as Farmer", False, f"Invalid response: {data}")
        else:
            self.log_test("Create Product as Farmer", False, f"Status {status}: {data}")
    
    async def test_create_product_as_buyer(self):
        """Test create product as buyer (should fail)"""
        if not self.buyer_tokens.get("access_token"):
            self.log_test("Create Product as Buyer", False, "No buyer access token available")
            return
        
        # Get a category ID
        success, categories, status = await self.make_request("GET", "/products/categories/all")
        if not success or not categories:
            self.log_test("Create Product as Buyer", False, "Could not get categories")
            return
        
        category_id = categories[0]["_id"]
        
        product_data = {
            "category_id": category_id,
            "name": "Test Product",
            "description": "This should fail",
            "unit": "kg",
            "base_price": 50.0,
            "stock_quantity": 10
        }
        
        success, data, status = await self.make_request(
            "POST", "/products", product_data,
            auth_token=self.buyer_tokens["access_token"]
        )
        
        if not success and status == 403:
            self.log_test("Create Product as Buyer", True, "Correctly rejected buyer creating product")
        else:
            self.log_test("Create Product as Buyer", False, f"Should have failed but got status {status}: {data}")
    
    async def test_get_all_products(self):
        """Test get all products"""
        success, data, status = await self.make_request("GET", "/products")
        
        if success and status == 200:
            if isinstance(data, dict) and "items" in data and "total" in data:
                self.log_test("Get All Products", True, f"Found {data['total']} products")
            else:
                self.log_test("Get All Products", False, f"Invalid response structure: {data}")
        else:
            self.log_test("Get All Products", False, f"Status {status}: {data}")
    
    async def test_search_products(self):
        """Test search products"""
        success, data, status = await self.make_request("GET", "/products?search=tomato")
        
        if success and status == 200:
            if isinstance(data, dict) and "items" in data:
                self.log_test("Search Products", True, f"Search returned {len(data['items'])} products")
            else:
                self.log_test("Search Products", False, f"Invalid response structure: {data}")
        else:
            self.log_test("Search Products", False, f"Status {status}: {data}")
    
    async def test_get_farmer_products(self):
        """Test get farmer's products"""
        if not self.farmer_tokens.get("access_token"):
            self.log_test("Get Farmer Products", False, "No farmer access token available")
            return
        
        success, data, status = await self.make_request(
            "GET", "/products/my-products",
            auth_token=self.farmer_tokens["access_token"]
        )
        
        if success and status == 200:
            if isinstance(data, dict) and "items" in data:
                self.log_test("Get Farmer Products", True, f"Farmer has {len(data['items'])} products")
            else:
                self.log_test("Get Farmer Products", False, f"Invalid response structure: {data}")
        else:
            self.log_test("Get Farmer Products", False, f"Status {status}: {data}")
    
    async def test_get_product_detail(self):
        """Test get product detail"""
        if not self.test_product_id:
            self.log_test("Get Product Detail", False, "No test product ID available")
            return
        
        success, data, status = await self.make_request("GET", f"/products/{self.test_product_id}")
        
        if success and status == 200:
            if isinstance(data, dict) and "_id" in data and "name" in data:
                self.log_test("Get Product Detail", True, f"Product: {data.get('name')}")
            else:
                self.log_test("Get Product Detail", False, f"Invalid response: {data}")
        else:
            self.log_test("Get Product Detail", False, f"Status {status}: {data}")
    
    async def test_update_product_as_farmer(self):
        """Test update product as farmer"""
        if not self.farmer_tokens.get("access_token") or not self.test_product_id:
            self.log_test("Update Product as Farmer", False, "No farmer token or product ID available")
            return
        
        update_data = {
            "name": "Premium Organic Tomatoes",
            "base_price": 95.0
        }
        
        success, data, status = await self.make_request(
            "PUT", f"/products/{self.test_product_id}", update_data,
            auth_token=self.farmer_tokens["access_token"]
        )
        
        if success and status == 200:
            if isinstance(data, dict) and data.get("name") == "Premium Organic Tomatoes":
                self.log_test("Update Product as Farmer", True, "Product updated successfully")
            else:
                self.log_test("Update Product as Farmer", False, f"Product not updated correctly: {data}")
        else:
            self.log_test("Update Product as Farmer", False, f"Status {status}: {data}")
    
    async def test_logout(self):
        """Test logout"""
        if not self.buyer_tokens.get("refresh_token"):
            self.log_test("Logout", False, "No refresh token available")
            return
        
        logout_data = {
            "refresh_token": self.buyer_tokens["refresh_token"]
        }
        
        success, data, status = await self.make_request("POST", "/auth/logout", logout_data)
        
        if success and status == 204:
            self.log_test("Logout", True, "Successfully logged out")
        else:
            self.log_test("Logout", False, f"Status {status}: {data}")
    
    async def test_delete_address(self):
        """Test delete address"""
        if not self.buyer_tokens.get("access_token") or not self.test_address_id:
            self.log_test("Delete Address", False, "No access token or address ID available")
            return
        
        success, data, status = await self.make_request(
            "DELETE", f"/users/addresses/{self.test_address_id}",
            auth_token=self.buyer_tokens["access_token"]
        )
        
        if success and status == 204:
            self.log_test("Delete Address", True, "Address deleted successfully")
        else:
            self.log_test("Delete Address", False, f"Status {status}: {data}")
    
    async def test_delete_product(self):
        """Test delete product"""
        if not self.farmer_tokens.get("access_token") or not self.test_product_id:
            self.log_test("Delete Product", False, "No farmer token or product ID available")
            return
        
        success, data, status = await self.make_request(
            "DELETE", f"/products/{self.test_product_id}",
            auth_token=self.farmer_tokens["access_token"]
        )
        
        if success and status == 204:
            self.log_test("Delete Product", True, "Product deleted successfully")
        else:
            self.log_test("Delete Product", False, f"Status {status}: {data}")
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Terra Digital Platform Backend API Tests")
        print(f"🔗 Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Health check
        await self.test_health_check()
        
        # Authentication tests
        print("\n📝 Authentication Tests")
        await self.test_register_buyer()
        await self.test_register_farmer()
        await self.test_register_duplicate_email()
        await self.test_login_buyer()
        await self.test_login_wrong_password()
        await self.test_refresh_token()
        
        # User management tests
        print("\n👤 User Management Tests")
        await self.test_get_current_user()
        await self.test_update_user_profile()
        await self.test_create_address()
        await self.test_get_addresses()
        await self.test_update_address()
        
        # Product catalog tests
        print("\n🛒 Product Catalog Tests")
        await self.test_get_categories()
        await self.test_create_product_as_farmer()
        await self.test_create_product_as_buyer()
        await self.test_get_all_products()
        await self.test_search_products()
        await self.test_get_farmer_products()
        await self.test_get_product_detail()
        await self.test_update_product_as_farmer()
        
        # Cleanup tests
        print("\n🧹 Cleanup Tests")
        await self.test_delete_address()
        await self.test_delete_product()
        await self.test_logout()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total


async def main():
    """Main test runner"""
    async with TerraAPITester() as tester:
        success = await tester.run_all_tests()
        return success


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)