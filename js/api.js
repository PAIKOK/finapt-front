// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API helper functions
const api = {
    // Generic request method
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            ...options
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Authentication methods
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Dashboard methods
    async getDashboardData() {
        return this.request('/dashboard');
    },

    // Transaction methods
    async getTransactions() {
        return this.request('/transactions');
    },

    async addTransaction(transactionData) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    },

    async updateTransaction(id, transactionData) {
        return this.request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transactionData)
        });
    },

    async deleteTransaction(id) {
        return this.request(`/transactions/${id}`, {
            method: 'DELETE'
        });
    },

    // Investment methods
    async getInvestmentSuggestions() {
        return this.request('/investments/suggestions');
    }
};

// Authentication helper functions
const auth = {
    isAuthenticated() {
        return localStorage.getItem('token') !== null;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    redirectIfNotAuthenticated() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    },

    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'dashboard.html';
        }
    }
};

// Common utility functions
const utils = {
    formatCurrency(amount) {
        return `₹${parseFloat(amount).toFixed(2)}`;
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN');
    },

    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Add to page
        document.body.appendChild(messageDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
};