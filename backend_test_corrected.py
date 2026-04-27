#!/usr/bin/env python3
"""
Kasika Self Drive Car Backend API Test Suite - CORRECTED VERSION
Tests all backend endpoints according to the review request specifications.
"""

import requests
import json
import uuid
import time
from datetime import datetime, timedelta

# Base configuration
BASE_URL = "https://48c838e8-d60e-4a3b-967c-81c73821cdf5.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test data
test_user_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
test_user_data = {
    "name": "Test User",
    "email": test_user_email,
    "password": "testpass123",
    "phone": "9876543210"
}

# Admin credentials (pre-seeded)
admin_credentials = {
    "email": "admin@kasika.com",
    "password": "admin123"
}

# Global variables for test state
user_token = None
admin_token = None
test_car_id = None
test_booking_id = None
created_car_id = None

def log_test(test_name, success, details=""):
    """Log test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"    {details}")
    print()

def make_request(method, endpoint, data=None, headers=None, expect_status=200):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    try:
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        
        print(f"    {method} {url} -> {response.status_code}")
        
        return response
    except Exception as e:
        print(f"    Request failed: {str(e)}")
        return None

def test_auth():
    """Test authentication endpoints"""
    global user_token, admin_token
    
    print("=== TESTING AUTH ENDPOINTS ===")
    
    # 1a. Test signup
    response = make_request("POST", "/auth/signup", test_user_data)
    if response and response.status_code == 200:
        data = response.json()
        if "token" in data and "user" in data:
            user_token = data["token"]
            log_test("Auth Signup", True, f"User created with token")
        else:
            log_test("Auth Signup", False, "Missing token or user in response")
    else:
        log_test("Auth Signup", False, "Failed to create user")
    
    # 1b. Test login with same credentials
    login_data = {"email": test_user_data["email"], "password": test_user_data["password"]}
    response = make_request("POST", "/auth/login", login_data)
    if response and response.status_code == 200:
        data = response.json()
        if "token" in data and "user" in data:
            log_test("Auth Login", True, "Login successful")
        else:
            log_test("Auth Login", False, "Missing token or user in response")
    else:
        log_test("Auth Login", False, "Login failed")
    
    # 1c. Test /auth/me with Bearer token
    if user_token:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = make_request("GET", "/auth/me", headers=headers)
        if response and response.status_code == 200:
            data = response.json()
            if "user" in data:
                log_test("Auth Me", True, "User profile retrieved")
            else:
                log_test("Auth Me", False, "Missing user in response")
        else:
            log_test("Auth Me", False, "Failed to get user profile")
    else:
        log_test("Auth Me", False, "No user token available")
    
    # 1d. Test login with wrong password - CORRECTED
    wrong_login = {"email": test_user_data["email"], "password": "wrongpassword"}
    response = make_request("POST", "/auth/login", wrong_login, expect_status=401)
    if response and response.status_code == 401:
        data = response.json()
        if "error" in data and "Invalid credentials" in data["error"]:
            log_test("Auth Wrong Password", True, "Correctly rejected wrong password")
        else:
            log_test("Auth Wrong Password", False, "Wrong error message")
    else:
        log_test("Auth Wrong Password", False, f"Expected 401, got {response.status_code if response else 'None'}")
    
    # Login as admin for later tests
    response = make_request("POST", "/auth/login", admin_credentials)
    if response and response.status_code == 200:
        data = response.json()
        if "token" in data:
            admin_token = data["token"]
            log_test("Admin Login", True, "Admin login successful")
        else:
            log_test("Admin Login", False, "Missing admin token")
    else:
        log_test("Admin Login", False, "Admin login failed")

def test_cars():
    """Test car endpoints"""
    global test_car_id
    
    print("=== TESTING CAR ENDPOINTS ===")
    
    # 2a. Test GET /api/cars
    response = make_request("GET", "/cars")
    if response and response.status_code == 200:
        data = response.json()
        if "cars" in data and len(data["cars"]) >= 6:
            test_car_id = data["cars"][0]["id"]  # Store first car ID for later tests
            log_test("Cars List", True, f"Retrieved {len(data['cars'])} cars")
        else:
            log_test("Cars List", False, "Expected at least 6 cars")
    else:
        log_test("Cars List", False, "Failed to get cars")
    
    # 2b. Test GET /api/cars/:id
    if test_car_id:
        response = make_request("GET", f"/cars/{test_car_id}")
        if response and response.status_code == 200:
            data = response.json()
            if "car" in data and data["car"]["id"] == test_car_id:
                log_test("Car Details", True, f"Retrieved car {test_car_id}")
            else:
                log_test("Car Details", False, "Car data mismatch")
        else:
            log_test("Car Details", False, "Failed to get car details")
    else:
        log_test("Car Details", False, "No car ID available")

def test_coupons():
    """Test coupon endpoints"""
    print("=== TESTING COUPON ENDPOINTS ===")
    
    # 3a. Test GET /api/coupons
    response = make_request("GET", "/coupons")
    if response and response.status_code == 200:
        data = response.json()
        if "coupons" in data and len(data["coupons"]) >= 3:
            log_test("Coupons List", True, f"Retrieved {len(data['coupons'])} coupons")
        else:
            log_test("Coupons List", False, "Expected at least 3 coupons")
    else:
        log_test("Coupons List", False, "Failed to get coupons")
    
    # 3b. Test valid coupon validation
    coupon_data = {"code": "WELCOME10", "amount": 5000}
    response = make_request("POST", "/coupons/validate", coupon_data)
    if response and response.status_code == 200:
        data = response.json()
        if "discount" in data and data["discount"] == 500:  # 10% of 5000
            log_test("Coupon Validate Valid", True, f"WELCOME10 discount: ₹{data['discount']}")
        else:
            log_test("Coupon Validate Valid", False, f"Expected discount 500, got {data.get('discount')}")
    else:
        log_test("Coupon Validate Valid", False, "Failed to validate coupon")
    
    # 3c. Test invalid coupon - CORRECTED
    invalid_coupon = {"code": "INVALID", "amount": 5000}
    response = make_request("POST", "/coupons/validate", invalid_coupon, expect_status=400)
    if response and response.status_code == 400:
        data = response.json()
        if "error" in data and "Invalid coupon code" in data["error"]:
            log_test("Coupon Validate Invalid", True, "Correctly rejected invalid coupon")
        else:
            log_test("Coupon Validate Invalid", False, "Wrong error message")
    else:
        log_test("Coupon Validate Invalid", False, f"Expected 400, got {response.status_code if response else 'None'}")
    
    # 3d. Test coupon below minimum amount - CORRECTED
    below_min = {"code": "FLAT500", "amount": 1000}
    response = make_request("POST", "/coupons/validate", below_min, expect_status=400)
    if response and response.status_code == 400:
        data = response.json()
        if "error" in data and "Minimum order" in data["error"]:
            log_test("Coupon Below Minimum", True, "Correctly rejected below minimum amount")
        else:
            log_test("Coupon Below Minimum", False, "Wrong error message")
    else:
        log_test("Coupon Below Minimum", False, f"Expected 400, got {response.status_code if response else 'None'}")

def test_bookings():
    """Test booking endpoints"""
    global test_booking_id
    
    print("=== TESTING BOOKING ENDPOINTS ===")
    
    if not user_token or not test_car_id:
        log_test("Bookings Setup", False, "Missing user token or car ID")
        return
    
    # Calculate dates
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%d")
    
    # 4a. Test create booking order with auth
    booking_data = {
        "carId": test_car_id,
        "startDate": tomorrow,
        "endDate": end_date
    }
    headers = {"Authorization": f"Bearer {user_token}"}
    response = make_request("POST", "/bookings/create-order", booking_data, headers=headers)
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["orderId", "amount", "key", "bookingId", "summary"]
        if all(field in data for field in required_fields):
            if data["orderId"].startswith("order_") and data["amount"] > 0:
                test_booking_id = data["bookingId"]
                log_test("Booking Create Order", True, f"Order created: {data['orderId']}, Amount: ₹{data['amount']}")
            else:
                log_test("Booking Create Order", False, "Invalid orderId format or amount")
        else:
            missing = [f for f in required_fields if f not in data]
            log_test("Booking Create Order", False, f"Missing fields: {missing}")
    else:
        log_test("Booking Create Order", False, "Failed to create booking order")
    
    # 4b. Test create booking without token - CORRECTED
    response = make_request("POST", "/bookings/create-order", booking_data, expect_status=401)
    if response and response.status_code == 401:
        data = response.json()
        if "error" in data and "Login required" in data["error"]:
            log_test("Booking No Auth", True, "Correctly rejected request without token")
        else:
            log_test("Booking No Auth", False, "Wrong error message")
    else:
        log_test("Booking No Auth", False, f"Expected 401, got {response.status_code if response else 'None'}")
    
    # 4c. Test payment verification with fake signature - CORRECTED
    if test_booking_id:
        fake_verify_data = {
            "razorpay_order_id": "order_fake123",
            "razorpay_payment_id": "pay_fake123",
            "razorpay_signature": "fake_signature",
            "bookingId": test_booking_id
        }
        response = make_request("POST", "/bookings/verify", fake_verify_data, headers=headers, expect_status=400)
        if response and response.status_code == 400:
            data = response.json()
            if "error" in data and "Payment verification failed" in data["error"]:
                log_test("Booking Fake Signature", True, "Correctly rejected fake signature")
            else:
                log_test("Booking Fake Signature", False, "Wrong error message")
        else:
            log_test("Booking Fake Signature", False, f"Expected 400, got {response.status_code if response else 'None'}")
    
    # 4d. Test get user bookings
    response = make_request("GET", "/bookings/me", headers=headers)
    if response and response.status_code == 200:
        data = response.json()
        if "bookings" in data and len(data["bookings"]) > 0:
            # Check if our pending booking is there
            pending_booking = next((b for b in data["bookings"] if b.get("id") == test_booking_id), None)
            if pending_booking:
                log_test("Booking List", True, f"Found {len(data['bookings'])} bookings including pending one")
            else:
                log_test("Booking List", True, f"Found {len(data['bookings'])} bookings (pending booking not found)")
        else:
            log_test("Booking List", False, "No bookings found")
    else:
        log_test("Booking List", False, "Failed to get user bookings")

def test_subscriptions():
    """Test subscription endpoints"""
    print("=== TESTING SUBSCRIPTION ENDPOINTS ===")
    
    # 5a. Test get subscription plans
    response = make_request("GET", "/subscriptions/plans")
    if response and response.status_code == 200:
        data = response.json()
        if "plans" in data and len(data["plans"]) == 2:
            plans = data["plans"]
            monthly = next((p for p in plans if p["id"] == "monthly"), None)
            yearly = next((p for p in plans if p["id"] == "yearly"), None)
            if monthly and yearly:
                log_test("Subscription Plans", True, "Found monthly and yearly plans")
            else:
                log_test("Subscription Plans", False, "Missing monthly or yearly plan")
        else:
            log_test("Subscription Plans", False, "Expected 2 plans")
    else:
        log_test("Subscription Plans", False, "Failed to get subscription plans")
    
    if not user_token:
        log_test("Subscription Tests", False, "No user token available")
        return
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # 5b. Test create subscription order
    sub_data = {"planId": "monthly"}
    response = make_request("POST", "/subscriptions/create-order", sub_data, headers=headers)
    if response and response.status_code == 200:
        data = response.json()
        if "orderId" in data and data["orderId"].startswith("order_"):
            log_test("Subscription Create Order", True, f"Subscription order created: {data['orderId']}")
        else:
            log_test("Subscription Create Order", False, "Invalid orderId format")
    else:
        log_test("Subscription Create Order", False, "Failed to create subscription order")
    
    # 5c. Test invalid plan - CORRECTED
    invalid_plan = {"planId": "invalid"}
    response = make_request("POST", "/subscriptions/create-order", invalid_plan, headers=headers, expect_status=400)
    if response and response.status_code == 400:
        data = response.json()
        if "error" in data and "Invalid plan" in data["error"]:
            log_test("Subscription Invalid Plan", True, "Correctly rejected invalid plan")
        else:
            log_test("Subscription Invalid Plan", False, "Wrong error message")
    else:
        log_test("Subscription Invalid Plan", False, f"Expected 400, got {response.status_code if response else 'None'}")

def test_blogs():
    """Test blog endpoints"""
    print("=== TESTING BLOG ENDPOINTS ===")
    
    # 6a. Test get blogs
    response = make_request("GET", "/blogs")
    if response and response.status_code == 200:
        data = response.json()
        if "blogs" in data and len(data["blogs"]) >= 2:
            log_test("Blogs List", True, f"Retrieved {len(data['blogs'])} blogs")
        else:
            log_test("Blogs List", False, "Expected at least 2 blogs")
    else:
        log_test("Blogs List", False, "Failed to get blogs")
    
    # 6b. Test get specific blog by slug
    response = make_request("GET", "/blogs/top-5-road-trips-from-mumbai")
    if response and response.status_code == 200:
        data = response.json()
        if "blog" in data and data["blog"]["slug"] == "top-5-road-trips-from-mumbai":
            log_test("Blog Details", True, "Retrieved specific blog by slug")
        else:
            log_test("Blog Details", False, "Blog data mismatch")
    else:
        log_test("Blog Details", False, "Failed to get blog details")

def test_admin_endpoints():
    """Test admin endpoints"""
    global created_car_id
    
    print("=== TESTING ADMIN ENDPOINTS ===")
    
    if not admin_token:
        log_test("Admin Tests", False, "No admin token available")
        return
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 7a. Test create car
    new_car_data = {
        "name": "Test Car Admin",
        "brand": "Test Brand",
        "type": "Sedan",
        "transmission": "Automatic",
        "fuel": "Petrol",
        "seats": 5,
        "pricePerDay": 3000,
        "location": "Test City",
        "image": "https://example.com/test-car.jpg",
        "description": "Test car created by admin",
        "features": ["GPS", "AC", "Bluetooth"]
    }
    response = make_request("POST", "/admin/cars", new_car_data, headers=admin_headers)
    if response and response.status_code == 200:
        data = response.json()
        if "car" in data and data["car"]["name"] == "Test Car Admin":
            created_car_id = data["car"]["id"]
            log_test("Admin Create Car", True, f"Car created with ID: {created_car_id}")
        else:
            log_test("Admin Create Car", False, "Car data mismatch")
    else:
        log_test("Admin Create Car", False, "Failed to create car")
    
    # 7b. Test update car
    if created_car_id:
        update_data = {"pricePerDay": 9999}
        response = make_request("PUT", f"/admin/cars/{created_car_id}", update_data, headers=admin_headers)
        if response and response.status_code == 200:
            data = response.json()
            if "car" in data and data["car"]["pricePerDay"] == 9999:
                log_test("Admin Update Car", True, "Car price updated successfully")
            else:
                log_test("Admin Update Car", False, "Price not updated correctly")
        else:
            log_test("Admin Update Car", False, "Failed to update car")
    
    # 7c. Test delete car
    if created_car_id:
        response = make_request("DELETE", f"/admin/cars/{created_car_id}", headers=admin_headers)
        if response and response.status_code == 200:
            data = response.json()
            if data.get("deleted") == True:
                log_test("Admin Delete Car", True, "Car deleted successfully")
            else:
                log_test("Admin Delete Car", False, "Delete confirmation missing")
        else:
            log_test("Admin Delete Car", False, "Failed to delete car")
    
    # 7d. Test get all users
    response = make_request("GET", "/admin/users", headers=admin_headers)
    if response and response.status_code == 200:
        data = response.json()
        if "users" in data and len(data["users"]) > 0:
            log_test("Admin Get Users", True, f"Retrieved {len(data['users'])} users")
        else:
            log_test("Admin Get Users", False, "No users found")
    else:
        log_test("Admin Get Users", False, "Failed to get users")
    
    # 7e. Test get all bookings
    response = make_request("GET", "/admin/bookings", headers=admin_headers)
    if response and response.status_code == 200:
        data = response.json()
        if "bookings" in data:
            log_test("Admin Get Bookings", True, f"Retrieved {len(data['bookings'])} bookings")
        else:
            log_test("Admin Get Bookings", False, "Bookings data missing")
    else:
        log_test("Admin Get Bookings", False, "Failed to get bookings")
    
    # 7f. Test create coupon
    coupon_data = {
        "code": "TEST5",
        "discountType": "percent",
        "discount": 5,
        "minAmount": 0,
        "maxDiscount": 500
    }
    response = make_request("POST", "/admin/coupons", coupon_data, headers=admin_headers)
    if response and response.status_code == 200:
        data = response.json()
        if "coupon" in data and data["coupon"]["code"] == "TEST5":
            log_test("Admin Create Coupon", True, "Coupon created successfully")
        else:
            log_test("Admin Create Coupon", False, "Coupon data mismatch")
    else:
        log_test("Admin Create Coupon", False, "Failed to create coupon")
    
    # 7g. Test create blog
    blog_data = {
        "title": "Test Blog Post",
        "excerpt": "This is a test blog post created by admin",
        "content": "Full content of the test blog post with detailed information.",
        "coverImage": "https://example.com/test-blog.jpg"
    }
    response = make_request("POST", "/admin/blogs", blog_data, headers=admin_headers)
    if response and response.status_code == 200:
        data = response.json()
        if "blog" in data and data["blog"]["title"] == "Test Blog Post":
            log_test("Admin Create Blog", True, "Blog created successfully")
        else:
            log_test("Admin Create Blog", False, "Blog data mismatch")
    else:
        log_test("Admin Create Blog", False, "Failed to create blog")

def test_authorization():
    """Test authorization restrictions"""
    print("=== TESTING AUTHORIZATION ===")
    
    if not user_token:
        log_test("Authorization Tests", False, "No user token available")
        return
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # 8a. Test non-admin access to admin users endpoint - CORRECTED
    response = make_request("GET", "/admin/users", headers=user_headers, expect_status=403)
    if response and response.status_code == 403:
        data = response.json()
        if "error" in data and "Forbidden" in data["error"]:
            log_test("Non-Admin Users Access", True, "Correctly blocked non-admin from users endpoint")
        else:
            log_test("Non-Admin Users Access", False, "Wrong error message")
    else:
        log_test("Non-Admin Users Access", False, f"Expected 403, got {response.status_code if response else 'None'}")
    
    # 8b. Test non-admin access to admin cars endpoint - CORRECTED
    car_data = {"name": "Unauthorized Car", "pricePerDay": 1000}
    response = make_request("POST", "/admin/cars", car_data, headers=user_headers, expect_status=403)
    if response and response.status_code == 403:
        data = response.json()
        if "error" in data and "Forbidden" in data["error"]:
            log_test("Non-Admin Cars Access", True, "Correctly blocked non-admin from creating cars")
        else:
            log_test("Non-Admin Cars Access", False, "Wrong error message")
    else:
        log_test("Non-Admin Cars Access", False, f"Expected 403, got {response.status_code if response else 'None'}")

def run_all_tests():
    """Run all test suites"""
    print("🚀 Starting Kasika Self Drive Car Backend API Tests - CORRECTED VERSION")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 60)
    
    try:
        test_auth()
        test_cars()
        test_coupons()
        test_bookings()
        test_subscriptions()
        test_blogs()
        test_admin_endpoints()
        test_authorization()
        
        print("=" * 60)
        print("🏁 All tests completed!")
        
    except Exception as e:
        print(f"❌ Test suite failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_all_tests()