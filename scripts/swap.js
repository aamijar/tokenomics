// Swap functionality and UI interactions
class SwapInterface {
    constructor() {
        this.currentSellToken = 'GPT';
        this.currentBuyToken = null;
        this.isSwapping = false;
        
        this.initializeElements();
        this.bindEvents();
        this.populateTokenDropdowns();
        this.updateInterface();
    }
    
    initializeElements() {
        // Input elements
        this.sellAmountInput = document.getElementById('sellAmount');
        this.buyAmountInput = document.getElementById('buyAmount');
        
        // Token selectors
        this.sellTokenSelector = document.getElementById('sellTokenSelector');
        this.buyTokenSelector = document.getElementById('buyTokenSelector');
        this.sellTokenDropdown = document.getElementById('sellTokenDropdown');
        this.buyTokenDropdown = document.getElementById('buyTokenDropdown');
        
        // Selected token displays
        this.sellTokenLogo = document.getElementById('sellTokenLogo');
        this.sellTokenName = document.getElementById('sellTokenName');
        
        // Buttons
        this.swapDirectionBtn = document.getElementById('swapDirectionBtn');
        this.getStartedBtn = document.getElementById('getStartedBtn');
        
        // Value displays
        this.sellValue = document.getElementById('sellValue');
        
        // Sections
        this.sellSection = this.sellAmountInput.closest('.swap-section');
        this.buySection = this.buyAmountInput.closest('.swap-section');
    }
    
    bindEvents() {
        // Amount input events
        this.sellAmountInput.addEventListener('input', () => this.onSellAmountChange());
        this.sellAmountInput.addEventListener('focus', () => this.onInputFocus(this.sellAmountInput));
        this.sellAmountInput.addEventListener('blur', () => this.onInputBlur(this.sellAmountInput));
        
        // Token selector events
        this.sellTokenSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown('sell');
        });
        
        this.buyTokenSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown('buy');
        });
        
        // Swap direction button
        this.swapDirectionBtn.addEventListener('click', () => this.swapTokens());
        
        // Get started button
        this.getStartedBtn.addEventListener('click', () => this.onGetStarted());
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => this.closeAllDropdowns());
        
        // Prevent dropdown close when clicking inside
        this.sellTokenDropdown.addEventListener('click', (e) => e.stopPropagation());
        this.buyTokenDropdown.addEventListener('click', (e) => e.stopPropagation());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }
    
    populateTokenDropdowns() {
        this.updateSellTokenDropdown();
        this.updateBuyTokenDropdown();
    }
    
    updateSellTokenDropdown() {
        const availableTokens = TokenManager.getTokensExcluding(this.currentBuyToken);
        this.sellTokenDropdown.innerHTML = '';
        
        availableTokens.forEach(token => {
            const option = TokenManager.createTokenElement(token, true);
            option.addEventListener('click', () => this.selectToken('sell', token.symbol));
            this.sellTokenDropdown.appendChild(option);
        });
    }
    
    updateBuyTokenDropdown() {
        const availableTokens = TokenManager.getTokensExcluding(this.currentSellToken);
        this.buyTokenDropdown.innerHTML = '';
        
        availableTokens.forEach(token => {
            const option = TokenManager.createTokenElement(token, true);
            option.addEventListener('click', () => this.selectToken('buy', token.symbol));
            this.buyTokenDropdown.appendChild(option);
        });
    }
    
    selectToken(type, symbol) {
        if (type === 'sell') {
            this.currentSellToken = symbol;
            this.updateSellTokenDisplay();
            this.updateBuyTokenDropdown(); // Refresh buy options
        } else {
            this.currentBuyToken = symbol;
            this.updateBuyTokenDisplay();
            this.updateSellTokenDropdown(); // Refresh sell options
        }
        
        this.closeAllDropdowns();
        this.updateCalculations();
        this.updateInterface();
    }
    
    updateSellTokenDisplay() {
        const token = TokenManager.getToken(this.currentSellToken);
        if (!token) return;
        
        this.sellTokenLogo.src = token.logo;
        this.sellTokenLogo.alt = token.company;
        this.sellTokenName.textContent = token.symbol;
        
        // Update section styling
        this.sellSection.className = `swap-section sell-section token-context-${token.symbol.toLowerCase()}`;
        
        // Update selected token styling
        const selectedToken = this.sellTokenSelector.querySelector('.selected-token');
        selectedToken.className = `selected-token ${token.className}`;
    }
    
    updateBuyTokenDisplay() {
        const buyTokenContainer = this.buyTokenSelector.querySelector('.selected-token');
        
        if (this.currentBuyToken) {
            const token = TokenManager.getToken(this.currentBuyToken);
            if (!token) return;
            
            buyTokenContainer.innerHTML = `
                <img src="${token.logo}" alt="${token.company}" class="token-logo">
                <span class="token-name">${token.symbol}</span>
                <svg class="chevron-down" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            buyTokenContainer.className = `selected-token ${token.className}`;
            
            // Update section styling
            this.buySection.className = `swap-section buy-section token-context-${token.symbol.toLowerCase()}`;
        } else {
            buyTokenContainer.innerHTML = `
                <div class="token-placeholder">
                    <span class="select-token-text">Select token</span>
                    <svg class="chevron-down" width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            `;
            buyTokenContainer.className = 'selected-token';
            this.buySection.className = 'swap-section buy-section';
        }
    }
    
    toggleDropdown(type) {
        const dropdown = type === 'sell' ? this.sellTokenDropdown : this.buyTokenDropdown;
        const selector = type === 'sell' ? this.sellTokenSelector : this.buyTokenSelector;
        
        // Close other dropdown
        const otherDropdown = type === 'sell' ? this.buyTokenDropdown : this.sellTokenDropdown;
        const otherSelector = type === 'sell' ? this.buyTokenSelector : this.sellTokenSelector;
        otherDropdown.classList.remove('open');
        otherSelector.classList.remove('open');
        
        // Toggle current dropdown
        dropdown.classList.toggle('open');
        selector.classList.toggle('open');
    }
    
    closeAllDropdowns() {
        this.sellTokenDropdown.classList.remove('open');
        this.buyTokenDropdown.classList.remove('open');
        this.sellTokenSelector.classList.remove('open');
        this.buyTokenSelector.classList.remove('open');
    }
    
    swapTokens() {
        if (!this.currentBuyToken || this.isSwapping) return;
        
        this.isSwapping = true;
        
        // Swap the tokens
        const tempToken = this.currentSellToken;
        this.currentSellToken = this.currentBuyToken;
        this.currentBuyToken = tempToken;
        
        // Swap the amounts
        const sellAmount = parseFloat(this.sellAmountInput.value) || 0;
        const buyAmount = parseFloat(this.buyAmountInput.value) || 0;
        
        this.sellAmountInput.value = buyAmount > 0 ? buyAmount.toString() : '';
        
        // Update displays
        this.updateSellTokenDisplay();
        this.updateBuyTokenDisplay();
        this.populateTokenDropdowns();
        this.updateCalculations();
        this.updateInterface();
        
        // Add animation effect
        this.swapDirectionBtn.style.transform = 'translate(-50%, -50%) rotate(180deg)';
        setTimeout(() => {
            this.swapDirectionBtn.style.transform = '';
            this.isSwapping = false;
        }, 300);
    }
    
    onSellAmountChange() {
        this.updateCalculations();
        this.updateValueDisplay();
    }
    
    updateCalculations() {
        const sellAmount = parseFloat(this.sellAmountInput.value) || 0;
        
        if (this.currentBuyToken && sellAmount > 0) {
            const buyAmount = ExchangeCalculator.calculateExchange(
                this.currentSellToken,
                this.currentBuyToken,
                sellAmount
            );
            this.buyAmountInput.value = ExchangeCalculator.formatAmount(buyAmount);
        } else {
            this.buyAmountInput.value = '';
        }
        
        this.updateValueDisplay();
    }
    
    updateValueDisplay() {
        const sellAmount = parseFloat(this.sellAmountInput.value) || 0;
        const value = ExchangeCalculator.calculateValue(this.currentSellToken, sellAmount);
        this.sellValue.textContent = ExchangeCalculator.formatAmount(value);
    }
    
    updateInterface() {
        // Update button state
        const hasValidAmounts = this.sellAmountInput.value && this.currentBuyToken;
        this.getStartedBtn.disabled = !hasValidAmounts;
        
        // Update swap direction button state
        this.swapDirectionBtn.disabled = !this.currentBuyToken;
    }
    
    onInputFocus(input) {
        input.parentElement.classList.add('focused');
    }
    
    onInputBlur(input) {
        input.parentElement.classList.remove('focused');
    }
    
    onGetStarted() {
        if (this.getStartedBtn.disabled) return;
        
        const sellAmount = parseFloat(this.sellAmountInput.value);
        const buyAmount = parseFloat(this.buyAmountInput.value);
        
        // In a real app, this would initiate the swap transaction
        console.log('Swap initiated:', {
            sell: { token: this.currentSellToken, amount: sellAmount },
            buy: { token: this.currentBuyToken, amount: buyAmount }
        });
        
        // Show feedback
        this.showSwapFeedback();
    }
    
    showSwapFeedback() {
        const originalText = this.getStartedBtn.textContent;
        this.getStartedBtn.textContent = 'Swapping...';
        this.getStartedBtn.disabled = true;
        
        setTimeout(() => {
            this.getStartedBtn.textContent = 'Swap Complete!';
            setTimeout(() => {
                this.getStartedBtn.textContent = originalText;
                this.getStartedBtn.disabled = false;
                this.updateInterface();
            }, 2000);
        }, 1500);
    }
    
    handleKeyboardNavigation(e) {
        // Escape key closes dropdowns
        if (e.key === 'Escape') {
            this.closeAllDropdowns();
        }
        
        // Enter key on get started button
        if (e.key === 'Enter' && document.activeElement === this.getStartedBtn) {
            this.onGetStarted();
        }
    }
}

// Initialize swap interface when DOM is loaded
let swapInterface;
if (typeof module === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        swapInterface = new SwapInterface();
    });
}