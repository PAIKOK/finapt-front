// API base URL - change this to your backend URL
const API_BASE_URL = 'https://finapt-back.onrender.com/api';

// DOM elements
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

// Show message function
function showMessage(message, type = 'error') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Validate form
function validateForm(formData) {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields');
        return false;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long');
        return false;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address');
        return false;
    }

    return true;
}

// Handle form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };

    if (!validateForm(data)) {
        return;
    }

    const submitBtn = registerForm.querySelector('.auth-btn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                password: data.password
            })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Registration successful! Redirecting to login...', 'success');

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(result.msg || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error. Please check your connection and try again.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Real-time password validation
document.getElementById('confirmPassword').addEventListener('input', (e) => {
    const password = document.getElementById('password').value;
    const confirmPassword = e.target.value;

    if (confirmPassword && password !== confirmPassword) {
        e.target.style.borderColor = '#dc3545';
    } else {
        e.target.style.borderColor = '#e1e5e9';
    }
});