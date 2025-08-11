class OrderManager {
    constructor() {
        this.ordersContainer = document.getElementById('ordersList');
        this.loadOrders();
        
        setInterval(() => {
            if (window.apiService && window.apiService.token) {
                this.loadOrders();
            }
        }, 5000);
    }
    
    async loadOrders() {
        if (!window.apiService || !window.apiService.token) {
            this.ordersContainer.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center;">Login to view your orders</p>';
            return;
        }
        
        try {
            const orders = await window.apiService.getOrders();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            this.ordersContainer.innerHTML = '<p style="color: #dc3545; text-align: center;">Failed to load orders</p>';
        }
    }
    
    renderOrders(orders) {
        if (!orders || orders.length === 0) {
            this.ordersContainer.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center;">No orders yet</p>';
            return;
        }
        
        this.ordersContainer.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-details">
                    <div class="order-tokens">
                        ${order.amount} ${order.from_token.toUpperCase()} → ${order.to_token.toUpperCase()}
                    </div>
                    <div class="order-amount">
                        Rate: ${order.exchange_rate.toFixed(4)} | Created: ${new Date(order.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div class="order-status ${order.status}">
                    ${order.status}
                </div>
                ${order.status === 'pending' ? `
                    <div class="order-actions">
                        <button class="cancel-order-btn" onclick="window.orderManager.cancelOrder(${order.id})">
                            Cancel
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    async cancelOrder(orderId) {
        try {
            await window.apiService.cancelOrder(orderId);
            this.loadOrders();
        } catch (error) {
            alert('Failed to cancel order: ' + error.message);
        }
    }
}

window.orderManager = new OrderManager();
