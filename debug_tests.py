#!/usr/bin/env python3
"""
Debug specific failing tests to understand the issues
"""

import requests
import json
import uuid

BASE_URL = "https://48c838e8-d60e-4a3b-967c-81c73821cdf5.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def debug_test(name, method, endpoint, data=None, headers=None, expected_status=200):
    """Debug a specific test case"""
    print(f"\n=== DEBUGGING: {name} ===")
    url = f"{API_BASE}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        
        print(f"Request: {method} {url}")
        if data:
            print(f"Data: {json.dumps(data, indent=2)}")
        if headers:
            print(f"Headers: {headers}")
        
        print(f"Response Status: {response.status_code} (expected: {expected_status})")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"Response Body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
        return response
        
    except Exception as e:
        print(f"Request failed: {str(e)}")
        return None

# Test the failing cases
print("🔍 Debugging failing test cases...")

# 1. Test wrong password login
debug_test(
    "Wrong Password Login",
    "POST", 
    "/auth/login",
    {"email": "admin@kasika.com", "password": "wrongpassword"},
    expected_status=401
)

# 2. Test invalid coupon
debug_test(
    "Invalid Coupon",
    "POST",
    "/coupons/validate", 
    {"code": "INVALID", "amount": 5000},
    expected_status=400
)

# 3. Test coupon below minimum
debug_test(
    "Coupon Below Minimum",
    "POST",
    "/coupons/validate",
    {"code": "FLAT500", "amount": 1000},
    expected_status=400
)

# 4. Test booking without auth
debug_test(
    "Booking Without Auth",
    "POST",
    "/bookings/create-order",
    {"carId": "test", "startDate": "2025-01-20", "endDate": "2025-01-23"},
    expected_status=401
)

# 5. Test invalid subscription plan
debug_test(
    "Invalid Subscription Plan",
    "POST",
    "/subscriptions/create-order",
    {"planId": "invalid"},
    headers={"Authorization": "Bearer fake_token"},
    expected_status=400
)

# First, let's get a real user token for authorization tests
print("\n=== Getting real user token ===")
signup_response = debug_test(
    "Signup for Auth Test",
    "POST",
    "/auth/signup",
    {
        "name": "Auth Test User",
        "email": f"authtest_{uuid.uuid4().hex[:8]}@example.com",
        "password": "testpass123",
        "phone": "9876543210"
    }
)

if signup_response and signup_response.status_code == 200:
    user_token = signup_response.json().get("token")
    if user_token:
        print(f"Got user token: {user_token[:20]}...")
        
        # 6. Test non-admin access to admin endpoints
        debug_test(
            "Non-Admin Users Access",
            "GET",
            "/admin/users",
            headers={"Authorization": f"Bearer {user_token}"},
            expected_status=403
        )
        
        debug_test(
            "Non-Admin Cars Access", 
            "POST",
            "/admin/cars",
            {"name": "Unauthorized Car", "pricePerDay": 1000},
            headers={"Authorization": f"Bearer {user_token}"},
            expected_status=403
        )