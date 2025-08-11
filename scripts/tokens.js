// Token data and configuration
const TOKENS = {
    'GPT': {
        symbol: 'GPT',
        name: 'OpenAI Credits',
        company: 'OpenAI',
        logo: 'assets/logos/openai.png',
        color: '#000000',
        rate: 1.0, // Base rate for calculations
        description: 'GPT-4, ChatGPT, DALL-E',
        className: 'token-gpt'
    },
    'CLU': {
        symbol: 'CLU',
        name: 'Claude Credits',
        company: 'Anthropic',
        logo: 'assets/logos/anthropic.png',
        color: '#C15F3C',
        rate: 0.85,
        description: 'Claude Sonnet, Haiku, Opus',
        className: 'token-clu'
    },
    'GEM': {
        symbol: 'GEM',
        name: 'Gemini Credits',
        company: 'Google',
        logo: 'assets/logos/google.png',
        color: '#4285F4',
        rate: 0.75,
        description: 'Gemini Pro, Gemini Flash',
        className: 'token-gem'
    },
    'LLA': {
        symbol: 'LLA',
        name: 'Llama Credits',
        company: 'Meta',
        logo: 'assets/logos/meta.png',
        color: '#1877F2',
        rate: 0.60,
        description: 'Llama 3.2, Llama 4',
        className: 'token-lla'
    },
    'GROQ': {
        symbol: 'GROQ',
        name: 'Groq Credits',
        company: 'Groq',
        logo: 'assets/logos/groq.png',
        color: '#FF6B35',
        rate: 0.45,
        description: 'Ultra-fast LPU inference',
        className: 'token-groq'
    },
    'COH': {
        symbol: 'COH',
        name: 'Command Credits',
        company: 'Cohere',
        logo: 'assets/logos/cohere.png',
        color: '#39C5BB',
        rate: 0.70,
        description: 'Command-R, Command-R+',
        className: 'token-coh'
    },
    'MIS': {
        symbol: 'MIS',
        name: 'Mistral Credits',
        company: 'Mistral AI',
        logo: 'assets/logos/mistral.svg',
        color: '#FF7000',
        rate: 0.55,
        description: 'Mixtral, Codestral, Mistral Large',
        className: 'token-mis'
    },
    'HF': {
        symbol: 'HF',
        name: 'HF Credits',
        company: 'Hugging Face',
        logo: 'assets/logos/huggingface.png',
        color: '#FFD21E',
        rate: 0.40,
        description: 'Community models, Inference',
        className: 'token-hf'
    },
    'XAI': {
        symbol: 'XAI',
        name: 'xAI Credits',
        company: 'xAI',
        logo: 'assets/logos/x.png',
        color: '#000000',
        rate: 1.20,
        description: 'Grok 4, Real-time X data',
        className: 'token-xai'
    },
    'PPX': {
        symbol: 'PPX',
        name: 'Perplexity Credits',
        company: 'Perplexity AI',
        logo: 'assets/logos/perplexity.png',
        color: '#20B2AA',
        rate: 0.65,
        description: 'Sonar, Web-enabled AI',
        className: 'token-ppx'
    },
    'TOG': {
        symbol: 'TOG',
        name: 'Together Credits',
        company: 'Together AI',
        logo: 'assets/logos/together.png',
        color: '#6366F1',
        rate: 0.35,
        description: '200+ Open Source Models',
        className: 'token-tog'
    },
    'REP': {
        symbol: 'REP',
        name: 'Replicate Credits',
        company: 'Replicate',
        logo: 'assets/logos/replicate.png',
        color: '#000000',
        rate: 0.50,
        description: 'ML Models via API',
        className: 'token-rep'
    },
    'FWS': {
        symbol: 'FWS',
        name: 'Fireworks Credits',
        company: 'Fireworks AI',
        logo: 'assets/logos/fireworks.png',
        color: '#FF4500',
        rate: 0.30,
        description: 'Fast Inference Platform',
        className: 'token-fws'
    }
};

// Token mapping between frontend symbols and backend enum values
const TOKEN_MAPPING = {
    'GPT': 'openai',
    'CLU': 'anthropic', 
    'GEM': 'google',
    'COH': 'cohere',
    'MIS': 'mistral'
};

class TokenMapper {
    static frontendToBackend(frontendSymbol) {
        return TOKEN_MAPPING[frontendSymbol];
    }
    
    static backendToFrontend(backendValue) {
        return Object.keys(TOKEN_MAPPING).find(key => TOKEN_MAPPING[key] === backendValue);
    }
    
    static isSupported(frontendSymbol) {
        return frontendSymbol in TOKEN_MAPPING;
    }
}

// Exchange rate calculations
class ExchangeCalculator {
    static calculateExchange(fromToken, toToken, amount) {
        if (!TOKENS[fromToken] || !TOKENS[toToken] || !amount || amount <= 0) {
            return 0;
        }
        
        const fromRate = TOKENS[fromToken].rate;
        const toRate = TOKENS[toToken].rate;
        
        // Convert to base currency (GPT) then to target token
        const baseAmount = amount * fromRate;
        const exchangedAmount = baseAmount / toRate;
        
        // Add small spread for realism (2%)
        return exchangedAmount * 0.98;
    }
    
    static formatAmount(amount) {
        if (amount === 0) return '0';
        if (amount < 0.01) return '< 0.01';
        if (amount < 1) return amount.toFixed(4);
        if (amount < 100) return amount.toFixed(2);
        if (amount < 10000) return amount.toFixed(1);
        return Math.round(amount).toLocaleString();
    }
    
    static calculateValue(token, amount) {
        if (!TOKENS[token] || !amount || amount <= 0) return 0;
        
        // Mock USD values (in reality would come from API)
        const baseValue = TOKENS[token].rate * 10; // $10 per base unit
        return amount * baseValue;
    }
}

// Token management utilities
class TokenManager {
    static getAllTokens() {
        return Object.values(TOKENS);
    }
    
    static getToken(symbol) {
        return TOKENS[symbol];
    }
    
    static getTokenSymbols() {
        return Object.keys(TOKENS);
    }
    
    static isValidToken(symbol) {
        return symbol in TOKENS;
    }
    
    static getTokensExcluding(excludeSymbol) {
        return Object.values(TOKENS).filter(token => token.symbol !== excludeSymbol);
    }
    
    static createTokenElement(token, isOption = false) {
        const tokenEl = document.createElement('div');
        tokenEl.className = isOption ? `token-option ${token.className}` : 'token-info';
        tokenEl.dataset.symbol = token.symbol;
        
        if (isOption) {
            tokenEl.innerHTML = `
                <img src="${token.logo}" alt="${token.company}" class="token-logo">
                <div class="token-option-info">
                    <div class="token-option-name">${token.name}</div>
                    <div class="token-option-company">${token.description}</div>
                </div>
                <div class="token-option-symbol">${token.symbol}</div>
            `;
        } else {
            tokenEl.innerHTML = `
                <img src="${token.logo}" alt="${token.company}" class="token-logo">
                <span class="token-name">${token.symbol}</span>
            `;
        }
        
        return tokenEl;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOKENS, ExchangeCalculator, TokenManager, TokenMapper };
}
