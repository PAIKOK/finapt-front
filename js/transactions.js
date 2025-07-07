// Global variables
let transactions = [];
let filteredTransactions = [];
let editingTransactionId = null;
let deleteTransactionId = null;

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Categories configuration
const CATEGORIES = {
    income: [
        'Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Other Income'
    ],
    expense: [
        'Food', 'Transportation', 'Housing', 'Utilities', 'Healthcare',
        'Entertainment', 'Shopping', 'Education', 'Travel', 'Other Expense'
    ]
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    checkAuthentication();
    setTodayDate();
    loadTransactions();
    setupEventListeners();
    populateFilterCategories();
});

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

// Get authentication headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Set today's date as default
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('transactionForm').addEventListener('submit', handleFormSubmit);

    // Modal close events
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('transactionModal');
        const deleteModal = document.getElementById('deleteModal');

        if (event.target === modal) {
            closeModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// Populate filter categories
function populateFilterCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense];

    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Load transactions from API
async function loadTransactions() {
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/transactions`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        transactions = await response.json();
        filteredTransactions = [...transactions];

        hideLoading();
        displayTransactions();

    } catch (error) {
        console.error('Error loading transactions:', error);
        hideLoading();
        showError('Failed to load transactions. Please try again.');
    }
}

// Display transactions
function displayTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    const emptyState = document.getElementById('emptyState');

    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    const transactionsHTML = filteredTransactions.map(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';

        return `
            <div class="transaction-item">
                <div class="transaction-date">${date}</div>
                <div class="transaction-description">${transaction.description || 'No description'}</div>
                <div class="transaction-category">${transaction.category}</div>
                <div class="transaction-type ${transaction.type}">${transaction.type}</div>
                <div class="transaction-amount ${amountClass}">${amountPrefix}₹${transaction.amount.toFixed(2)}</div>
                <div class="transaction-actions">
                    <button class="edit-btn" onclick="editTransaction('${transaction._id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteTransaction('${transaction._id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    transactionsList.innerHTML = transactionsHTML;
}

// Filter transactions
function filterTransactions() {
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    filteredTransactions = transactions.filter(transaction => {
        const matchesType = !typeFilter || transaction.type === typeFilter;
        const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
        const matchesDate = !dateFilter || new Date(transaction.date).toISOString().split('T')[0] === dateFilter;

        return matchesType && matchesCategory && matchesDate;
    });

    displayTransactions();
}

// Open add transaction modal
function openAddModal() {
    editingTransactionId = null;
    document.getElementById('modalTitle').textContent = 'Add Transaction';
    document.getElementById('transactionForm').reset();
    setTodayDate();
    updateCategories();
    document.getElementById('transactionModal').style.display = 'block';
}

// Edit transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t._id === id);
    if (!transaction) return;

    editingTransactionId = id;
    document.getElementById('modalTitle').textContent = 'Edit Transaction';

    // Populate form with transaction data
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.type;
    document.getElementById('description').value = transaction.description || '';
    document.getElementById('date').value = new Date(transaction.date).toISOString().split('T')[0];

    updateCategories();
    document.getElementById('category').value = transaction.category;

    document.getElementById('transactionModal').style.display = 'block';
}

// Delete transaction
function deleteTransaction(id) {
    deleteTransactionId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Confirm delete
async function confirmDelete() {
    if (!deleteTransactionId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${deleteTransactionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to delete transaction');
        }

        await loadTransactions();
        closeDeleteModal();
        // Success message removed - transaction will be deleted silently

    } catch (error) {
        console.error('Error deleting transaction:', error);
        showError('Failed to delete transaction. Please try again.');
    }
}

// Update categories based on selected type
function updateCategories() {
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const selectedType = typeSelect.value;

    categorySelect.innerHTML = '<option value="">Select Category</option>';

    if (selectedType && CATEGORIES[selectedType]) {
        CATEGORIES[selectedType].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const transactionData = {
        amount: parseFloat(formData.get('amount')),
        type: formData.get('type'),
        category: formData.get('category'),
        description: formData.get('description'),
        date: formData.get('date')
    };

    try {
        const url = editingTransactionId
            ? `${API_BASE_URL}/transactions/${editingTransactionId}`
            : `${API_BASE_URL}/transactions`;

        const method = editingTransactionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            throw new Error('Failed to save transaction');
        }

        await loadTransactions();
        closeModal();

        // Success messages removed - transaction will be added/updated silently

    } catch (error) {
        console.error('Error saving transaction:', error);
        showError('Failed to save transaction. Please try again.');
    }
}

// Close modal
function closeModal() {
    document.getElementById('transactionModal').style.display = 'none';
    editingTransactionId = null;
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteTransactionId = null;
}

// Show loading state
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('transactionsList').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('transactionsList').style.display = 'block';
}

// Show success message (now unused but kept for potential future use)
function showSuccess(message) {
    // Success messages disabled - transactions will be added silently
    console.log('Success:', message);
}

// Show error message
function showError(message) {
    alert(message); // You can replace this with a toast notification
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'logout.html';
}

// Export functions for global access
window.openAddModal = openAddModal;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.confirmDelete = confirmDelete;
window.updateCategories = updateCategories;
window.filterTransactions = filterTransactions;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;
window.logout = logout;