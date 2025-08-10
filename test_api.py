import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing Tokenomics API...")
    
    print("\n1. Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health check: {response.status_code} - {response.json()}")
    
    print("\n2. Testing user registration...")
    timestamp = int(time.time())
    register_data = {
        "username": f"testuser{timestamp}",
        "email": f"test{timestamp}@example.com",
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    print(f"Registration: {response.status_code}")
    if response.status_code == 200:
        auth_data = response.json()
        token = auth_data["access_token"]
        print(f"Token received: {token[:20]}...")
    else:
        print(f"Registration failed: {response.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n3. Testing token types...")
    response = requests.get(f"{BASE_URL}/api/tokens/types")
    print(f"Token types: {response.status_code} - {len(response.json())} types")
    
    print("\n4. Testing user balance...")
    response = requests.get(f"{BASE_URL}/api/user/balance", headers=headers)
    print(f"User balance: {response.status_code}")
    if response.status_code == 200:
        balances = response.json()
        for balance in balances:
            print(f"  {balance['token_type']}: {balance['balance']}")
    
    print("\n5. Testing trade creation...")
    trade_data = {
        "from_token": "openai",
        "to_token": "anthropic",
        "exchange_rate": 1.2,
        "amount": 100.0
    }
    response = requests.post(f"{BASE_URL}/api/trades/create", json=trade_data, headers=headers)
    print(f"Trade creation: {response.status_code}")
    if response.status_code == 200:
        trade = response.json()
        print(f"Trade created: ID {trade['id']}")
    
    print("\n6. Testing trade listing...")
    response = requests.get(f"{BASE_URL}/api/trades/list", headers=headers)
    print(f"Trade listing: {response.status_code} - {len(response.json())} trades")
    
    print("\n7. Testing market prices...")
    response = requests.get(f"{BASE_URL}/api/market/prices")
    print(f"Market prices: {response.status_code}")
    if response.status_code == 200:
        prices = response.json()
        for price in prices:
            print(f"  {price['token_type']}: ${price['price_usd']} ({price['price_btc']} BTC)")
    
    print("\nAPI testing completed!")

if __name__ == "__main__":
    test_api()
