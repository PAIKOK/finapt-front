// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    // Set current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-date').textContent = currentDate;

    // Load dashboard data
    loadDashboardData();
    loadTrendsData();
});

// API base URL
const API_BASE_URL = 'https://finapt-back.onrender.com/api';

// Get auth headers
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        // Update stats
        document.getElementById('total-income').textContent = `₹${data.income.toFixed(2)}`;
        document.getElementById('total-expense').textContent = `₹${data.expense.toFixed(2)}`;
        document.getElementById('current-balance').textContent = `₹${data.balance.toFixed(2)}`;

        // Update balance color based on positive/negative
        const balanceElement = document.getElementById('current-balance');
        if (data.balance >= 0) {
            balanceElement.style.color = '#4ecdc4';
        } else {
            balanceElement.style.color = '#ff6b6b';
        }

        // Load recent transactions
        loadRecentTransactions(data.recent);

        // Load category breakdown chart
        loadCategoryChart(data.categoryBreakdown);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Load recent transactions
function loadRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions');

    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p class="loading">No recent transactions</p>';
        return;
    }

    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-category">${transaction.category}</span>
                <span class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</span>
            </div>
            <span class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
            </span>
        </div>
    `).join('');
}

// Load trends data and chart
async function loadTrendsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/trends`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trends data');
        }

        const data = await response.json();
        loadTrendsChart(data);

    } catch (error) {
        console.error('Error loading trends data:', error);
        showError('Failed to load trends data');
    }
}

// Load trends chart (Updated to use bar chart)
function loadTrendsChart(data) {
    const ctx = document.getElementById('trendsChart').getContext('2d');

    const labels = data.map(item => {
        const date = new Date(item.month + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    const incomeData = data.map(item => item.income);
    const expenseData = data.map(item => item.expense);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(78, 205, 196, 0.8)',
                borderColor: '#4ecdc4',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }, {
                label: 'Expense',
                data: expenseData,
                backgroundColor: 'rgba(255, 107, 107, 0.8)',
                borderColor: '#ff6b6b',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function (value) {
                            return '₹' + value.toFixed(0);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Load category breakdown chart
function loadCategoryChart(categoryData) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    if (!categoryData || categoryData.length === 0) {
        ctx.canvas.parentElement.innerHTML = '<p class="loading">No category data available</p>';
        return;
    }

    const labels = categoryData.map(item => item._id);
    const data = categoryData.map(item => item.total);
    const colors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
        '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
    ];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Error handling
function showError(message) {
    // Simple error display - can be enhanced with toast notifications
    console.error(message);
    alert(message);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}