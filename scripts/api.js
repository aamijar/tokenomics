class ApiService {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('auth_token');
    }

    async register(username, email, password) {
        const response = await fetch(`${this.baseURL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        
        const data = await response.json();
        this.setToken(data.access_token);
        return data;
    }

    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${this.baseURL}/api/auth/login`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        
        const data = await response.json();
        this.setToken(data.access_token);
        return data;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    getAuthHeaders() {
        return this.token ? {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    async createTrade(fromToken, toToken, amount, exchangeRate) {
        const response = await fetch(`${this.baseURL}/api/trades/create`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                from_token: fromToken,
                to_token: toToken,
                amount: amount,
                exchange_rate: exchangeRate,
                validate_rate: true
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Trade creation failed');
        }
        
        return await response.json();
    }

    async getUserBalances() {
        const response = await fetch(`${this.baseURL}/api/users/me/tokens`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get balances');
        }
        
        return await response.json();
    }

    async getAvailableTrades() {
        const response = await fetch(`${this.baseURL}/api/trades/list`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get trades');
        }
        
        return await response.json();
    }

    async createOrder(fromToken, toToken, amount, exchangeRate) {
        const response = await fetch(`${this.baseURL}/api/orders/create`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                from_token: fromToken,
                to_token: toToken,
                amount: amount,
                exchange_rate: exchangeRate
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Order creation failed');
        }
        
        return await response.json();
    }

    async getOrders() {
        const response = await fetch(`${this.baseURL}/api/orders/list`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get orders');
        }
        
        return await response.json();
    }

    async cancelOrder(orderId) {
        const response = await fetch(`${this.baseURL}/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to cancel order');
        }
        
        return await response.json();
    }

    async addApiKey(tokenType, apiKey, userType = 'seller') {
        const response = await fetch(`${this.baseURL}/api/seller/keys/register`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                token_type: tokenType,
                api_key: apiKey,
                user_type: userType
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add API key');
        }
        
        return await response.json();
    }

    async getApiKeys() {
        const response = await fetch(`${this.baseURL}/api/seller/keys/list`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get API keys');
        }
        
        return await response.json();
    }
}

window.apiService = new ApiService();
