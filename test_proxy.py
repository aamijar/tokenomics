import requests
import json

BASE_URL = 'http://localhost:8000'

def test_proxy_functionality():
    print("Testing Proxy Layer Functionality")
    print("=" * 50)
    
    try:
        response = requests.get(f'{BASE_URL}/')
        print('✅ Server is running:', response.json())
    except Exception as e:
        print(f'❌ Server not running: {e}')
        return False
    
    print("\n1. Testing API Key Registration...")
    register_data = {
        'username': 'seller_test',
        'email': 'seller@test.com',
        'password': 'testpass123'
    }
    
    reg_response = requests.post(f'{BASE_URL}/api/auth/register', json=register_data)
    if reg_response.status_code == 200:
        print('✅ Seller registered')
        token = reg_response.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        api_key_data = {
            'token_type': 'openai',
            'api_key': 'sk-test-key-12345'
        }
        
        key_response = requests.post(f'{BASE_URL}/api/seller/keys/register', json=api_key_data, headers=headers)
        if key_response.status_code == 200:
            print('✅ API key registered successfully')
        else:
            print(f'❌ API key registration failed: {key_response.status_code}')
    
    print("\n2. Testing Buyer Registration and Token Balance...")
    buyer_data = {
        'username': 'buyer_test',
        'email': 'buyer@test.com',
        'password': 'testpass123'
    }
    
    buyer_reg = requests.post(f'{BASE_URL}/api/auth/register', json=buyer_data)
    if buyer_reg.status_code == 200:
        print('✅ Buyer registered')
        buyer_token = buyer_reg.json()['access_token']
        buyer_headers = {'Authorization': f'Bearer {buyer_token}'}
        
        print("\n3. Testing Proxy Request (should fail with insufficient tokens)...")
        proxy_data = {
            'method': 'POST',
            'data': {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': 'Hello'}]
            }
        }
        
        proxy_response = requests.post(
            f'{BASE_URL}/api/proxy/openai/chat/completions',
            json=proxy_data,
            headers=buyer_headers
        )
        
        if proxy_response.status_code == 400:
            error_msg = proxy_response.json().get('detail', '')
            if 'Insufficient' in error_msg:
                print('✅ Proxy correctly blocks requests with insufficient tokens')
            else:
                print(f'❌ Unexpected error: {error_msg}')
        else:
            print(f'❌ Expected 400 error, got: {proxy_response.status_code}')
    
    print("\n4. Testing Proxy Health Endpoint...")
    health_response = requests.get(f'{BASE_URL}/api/proxy/health')
    if health_response.status_code == 200:
        print('✅ Proxy health endpoint working')
    else:
        print(f'❌ Proxy health endpoint failed: {health_response.status_code}')

if __name__ == "__main__":
    test_proxy_functionality()
