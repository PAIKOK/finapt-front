// Authentication utilities
const auth = {
    redirectIfAuthenticated: function () {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token is still valid (you might want to add API call here)
            window.location.href = 'dashboard.html';
        }
    },

    logout: function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    isAuthenticated: function () {
        return !!localStorage.getItem('token');
    }
};

// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already authenticated
    auth.redirectIfAuthenticated();

    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Handle registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        const response = await api.login({ email, password });

        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        utils.showMessage('Login successful!', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        utils.showMessage(error.message || 'Login failed', 'error');

        // Re-enable button
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Basic validation
    if (password.length < 6) {
        utils.showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';

        const response = await api.register({ name, email, password });

        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        utils.showMessage('Registration successful!', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        utils.showMessage(error.message || 'Registration failed', 'error');

        // Re-enable button
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Register';
    }
}

// Handle logout (for other pages)
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
    }
}