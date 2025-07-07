// API base URL
const API_BASE_URL = 'https://finapt-back.onrender.com/api';

// DOM elements
const loadingEl = document.getElementById('loading');
const errorMessageEl = document.getElementById('errorMessage');
const investmentContentEl = document.getElementById('investmentContent');
const balanceAmountEl = document.getElementById('balanceAmount');
const riskBadgeEl = document.getElementById('riskBadge');
const suggestionsGridEl = document.getElementById('suggestionsGrid');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    fetchInvestmentData();
});

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Fetch investment data from API
async function fetchInvestmentData() {
    try {
        showLoading();

        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/investments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayInvestmentData(data);

    } catch (error) {
        console.error('Error fetching investment data:', error);
        showError();
    }
}

// Display investment data
function displayInvestmentData(data) {
    hideLoading();
    hideError();

    // Display balance
    const balance = data.balance || 0;
    balanceAmountEl.textContent = formatCurrency(balance);

    // Add negative class if balance is negative
    if (balance < 0) {
        balanceAmountEl.classList.add('negative');
    } else {
        balanceAmountEl.classList.remove('negative');
    }

    // Display risk level
    const riskLevel = data.riskLevel || 'Unknown';
    riskBadgeEl.textContent = riskLevel;
    riskBadgeEl.className = `risk-badge ${riskLevel.toLowerCase()}`;

    // Display suggestions
    displaySuggestions(data.suggestions || []);

    // Show investment content
    investmentContentEl.style.display = 'block';
}

// Display investment suggestions
function displaySuggestions(suggestions) {
    suggestionsGridEl.innerHTML = '';

    if (suggestions.length === 0) {
        suggestionsGridEl.innerHTML = '<p>No investment suggestions available at this time.</p>';
        return;
    }

    suggestions.forEach((suggestion, index) => {
        const suggestionCard = document.createElement('div');
        suggestionCard.className = 'suggestion-card';
        suggestionCard.innerHTML = `
            <p>${suggestion}</p>
        `;

        // Add animation delay for staggered effect
        suggestionCard.style.animationDelay = `${index * 0.1}s`;

        suggestionsGridEl.appendChild(suggestionCard);
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Show loading state
function showLoading() {
    loadingEl.style.display = 'block';
    errorMessageEl.style.display = 'none';
    investmentContentEl.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingEl.style.display = 'none';
}

// Show error state
function showError() {
    hideLoading();
    errorMessageEl.style.display = 'block';
    investmentContentEl.style.display = 'none';
}

// Hide error state
function hideError() {
    errorMessageEl.style.display = 'none';
}

// Logout functionality
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Handle network errors and retry functionality
window.addEventListener('online', () => {
    if (errorMessageEl.style.display === 'block') {
        fetchInvestmentData();
    }
});

// Add some animation classes for better UX
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .suggestion-card {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
    }
    
    .balance-card,
    .suggestions-section,
    .investment-tips {
        animation: fadeInUp 0.6s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Add smooth scrolling for better navigation
document.documentElement.style.scrollBehavior = 'smooth';

// Handle page visibility change to refresh data when user returns
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && investmentContentEl.style.display === 'block') {
        // Refresh data when user returns to the page
        setTimeout(() => {
            fetchInvestmentData();
        }, 1000);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to refresh investment data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchInvestmentData();
    }

    // Escape key to retry if there's an error
    if (e.key === 'Escape' && errorMessageEl.style.display === 'block') {
        fetchInvestmentData();
    }
});

// Add touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartY - touchEndY;

    // Pull down to refresh
    if (swipeDistance < -swipeThreshold && window.scrollY === 0) {
        fetchInvestmentData();
    }
}