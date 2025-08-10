import requests
import json

BASE_URL = 'http://localhost:8000'

def test_server_running():
    """Test if server is running"""
    try:
        response = requests.get(f'{BASE_URL}/')
        print('✅ Server is running:', response.json())
        return True
    except Exception as e:
        print('❌ Server connection failed:', e)
        return False

def test_new_endpoints():
    """Test that new endpoints exist"""
    endpoints_to_test = [
        '/api/history/transactions',
        '/api/history/balances', 
        '/api/conversion/rates',
        '/api/conversion/market-rate/openai/anthropic'
    ]

    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f'{BASE_URL}{endpoint}')
            if response.status_code in [200, 401]:  # 401 is expected for protected routes
                print(f'✅ Endpoint {endpoint} exists (status: {response.status_code})')
            else:
                print(f'❌ Endpoint {endpoint} failed (status: {response.status_code})')
        except Exception as e:
            print(f'❌ Endpoint {endpoint} error:', e)

def test_dynamic_conversion_rates():
    """Test dynamic conversion rate calculation"""
    print('\n1. Testing Dynamic Conversion Rates...')
    try:
        response = requests.get(f'{BASE_URL}/api/conversion/market-rate/openai/anthropic')
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Market rate OpenAI->Anthropic: {data["market_rate"]:.6f}')
            
            response2 = requests.get(f'{BASE_URL}/api/conversion/market-rate/google/mistral')
            if response2.status_code == 200:
                data2 = response2.json()
                print(f'✅ Market rate Google->Mistral: {data2["market_rate"]:.6f}')
            else:
                print(f'❌ Second market rate failed: {response2.status_code}')
        else:
            print(f'❌ Market rate calculation failed: {response.status_code}')
    except Exception as e:
        print(f'❌ Market rate test error: {e}')

def test_rate_validation():
    """Test rate validation functionality"""
    print('\n2. Testing Rate Validation...')
    try:
        register_data = {
            'username': 'testuser_validation',
            'email': 'test_validation@example.com',
            'password': 'testpass123'
        }
        
        reg_response = requests.post(f'{BASE_URL}/api/auth/register', json=register_data)
        if reg_response.status_code == 200:
            print('✅ Test user registered')
            
            login_data = {'username': 'testuser_validation', 'password': 'testpass123'}
            login_response = requests.post(f'{BASE_URL}/api/auth/login', data=login_data)
            
            if login_response.status_code == 200:
                token = login_response.json()['access_token']
                headers = {'Authorization': f'Bearer {token}'}
                print('✅ Test user logged in')
                
                trade_data = {
                    'from_token': 'openai',
                    'to_token': 'anthropic', 
                    'exchange_rate': 10.0,  # Unrealistic rate
                    'amount': 100.0,
                    'validate_rate': True
                }
                
                trade_response = requests.post(f'{BASE_URL}/api/trades/create', json=trade_data, headers=headers)
                if trade_response.status_code == 400:
                    error_msg = trade_response.json().get('detail', '')
                    if 'deviates' in error_msg and 'market rate' in error_msg:
                        print('✅ Rate validation working - rejected unrealistic rate')
                        print(f'   Error: {error_msg[:100]}...')
                    else:
                        print(f'❌ Wrong validation error: {error_msg}')
                else:
                    print(f'❌ Rate validation failed - should have rejected trade: {trade_response.status_code}')
            else:
                print(f'❌ Login failed: {login_response.status_code}')
        else:
            print(f'❌ Registration failed: {reg_response.status_code}')
            
    except Exception as e:
        print(f'❌ Rate validation test error: {e}')

def test_transaction_history():
    """Test transaction history functionality"""
    print('\n3. Testing Transaction History...')
    try:
        login_data = {'username': 'demo', 'password': 'demo123'}
        login_response = requests.post(f'{BASE_URL}/api/auth/login', data=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()['access_token']
            headers = {'Authorization': f'Bearer {token}'}
            print('✅ Demo user logged in')
            
            history_response = requests.get(f'{BASE_URL}/api/history/transactions?limit=10', headers=headers)
            if history_response.status_code == 200:
                transactions = history_response.json()
                print(f'✅ Transaction history retrieved: {len(transactions)} transactions')
                if transactions:
                    print(f'   Latest transaction: {transactions[0]["transaction_type"]} - {transactions[0]["amount"]}')
                return headers  # Return headers for balance history test
            else:
                print(f'❌ Transaction history failed: {history_response.status_code}')
        else:
            print(f'❌ Demo login failed: {login_response.status_code}')
            
    except Exception as e:
        print(f'❌ Transaction history test error: {e}')
    return None

def test_balance_history(headers):
    """Test balance history functionality"""
    print('\n4. Testing Balance History...')
    try:
        if headers:
            balance_response = requests.get(f'{BASE_URL}/api/history/balances?days=7', headers=headers)
            if balance_response.status_code == 200:
                snapshots = balance_response.json()
                print(f'✅ Balance history retrieved: {len(snapshots)} snapshots')
                if snapshots:
                    print(f'   Latest snapshot: {snapshots[0]["token_type"]} - {snapshots[0]["balance"]}')
            else:
                print(f'❌ Balance history failed: {balance_response.status_code}')
        else:
            print('❌ No auth token available for balance history test')
            
    except Exception as e:
        print(f'❌ Balance history test error: {e}')

if __name__ == "__main__":
    print('🚀 Testing 4 Critical Missing Features Implementation')
    print('=' * 60)
    
    if not test_server_running():
        exit(1)
    
    test_new_endpoints()
    test_dynamic_conversion_rates()
    test_rate_validation()
    headers = test_transaction_history()
    test_balance_history(headers)
    
    print('\n' + '=' * 60)
    print('🎯 All 4 Critical Features Implementation Test Complete!')
