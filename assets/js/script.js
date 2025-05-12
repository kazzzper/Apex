// API Base URL
const API_BASE_URL = window.location.origin; // Or your specific Render URL

// DOM Elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Current User (now stored in memory with token)
let currentUser = null;
let authToken = localStorage.getItem('apextrades_token');

// Initialize the app
async function initApp() {
    await checkAuth();
    updateUserDisplay();
    setupTabSwitching();
    setupCopyButtons();
    setupPaymentPage();
    setupForms();
}

// Check authentication status
async function checkAuth() {
    if (authToken) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.ok) {
                currentUser = await response.json();
            } else {
                localStorage.removeItem('apextrades_token');
                authToken = null;
                if (isProtectedPage()) {
                    window.location.href = 'login.html';
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    } else if (isProtectedPage()) {
        window.location.href = 'login.html';
    }
}

// Update user display across all pages
function updateUserDisplay() {
    if (currentUser) {
        // Update dashboard elements
        if (document.getElementById('username')) {
            document.getElementById('username').textContent = currentUser.fullname.split(' ')[0];
        }
        if (document.getElementById('userNameDisplay')) {
            document.getElementById('userNameDisplay').textContent = currentUser.fullname;
        }
        if (document.getElementById('profileName')) {
            document.getElementById('profileName').textContent = currentUser.fullname;
        }
        if (document.getElementById('profileEmail')) {
            document.getElementById('profileEmail').textContent = currentUser.email;
        }
        if (document.getElementById('fullName')) {
            document.getElementById('fullName').value = currentUser.fullname;
        }
        if (document.getElementById('email')) {
            document.getElementById('email').value = currentUser.email;
        }
        if (document.getElementById('memberSince')) {
            const joinedDate = new Date(currentUser.joined);
            document.getElementById('memberSince').textContent = joinedDate.toLocaleDateString();
        }
        if (document.getElementById('currentPlan')) {
            document.getElementById('currentPlan').textContent = currentUser.plan || 'Free';
        }
    }
}

// Setup tab switching functionality (unchanged)
function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup copy buttons for wallet addresses (unchanged)
function setupCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const address = this.getAttribute('data-address');
            navigator.clipboard.writeText(address).then(() => {
                const originalHtml = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = originalHtml;
                }, 2000);
            });
        });
    });
}

// Setup payment page functionality
async function setupPaymentPage() {
    if (window.location.pathname.includes('payment.html')) {
        // Get plan from URL
        const urlParams = new URLSearchParams(window.location.search);
        const plan = urlParams.get('plan');
        
        // Plan details (unchanged)
        const plans = {
            starter: { /* ... */ },
            advanced: { /* ... */ },
            professional: { /* ... */ },
            enterprise: { /* ... */ }
        };
        
        const selectedPlan = plans[plan] || plans.advanced;
        
        // Update plan info (unchanged)
        document.getElementById('planName').textContent = selectedPlan.name;
        document.getElementById('planPrice').textContent = `$${selectedPlan.price}`;
        
        const featuresList = document.getElementById('planFeatures');
        featuresList.innerHTML = '';
        selectedPlan.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
            featuresList.appendChild(li);
        });
        
        // Update amounts (unchanged)
        document.getElementById('ethAmount').textContent = `${selectedPlan.amount} USDT`;
        document.getElementById('bscAmount').textContent = `${selectedPlan.amount} USDT`;
        document.getElementById('solAmount').textContent = `${selectedPlan.amount} Worth of USD`;
        
        // Confirm payment button
        document.getElementById('confirmPayment').addEventListener('click', async function() {
            if (currentUser) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/user/plan`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ plan })
                    });
                    
                    if (response.ok) {
                        currentUser.plan = plan;
                        alert('Thank you for your payment! Kindly wait for your account to be upgraded.');
                        window.location.href = 'dashboard.html';
                    } else {
                        const error = await response.json();
                        alert(error.message || 'Failed to update plan');
                    }
                } catch (error) {
                    console.error('Plan update error:', error);
                    alert('Error updating plan');
                }
            }
        });
    }
}

// Setup form submissions
function setupForms() {
    // Sign Up Form
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate password (unchanged)
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
                alert('Password must be at least 8 characters with at least one uppercase letter, one number, and one special character!');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fullname, email, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    currentUser = data.user;
                    authToken = data.token;
                    localStorage.setItem('apextrades_token', authToken);
                    updateUserDisplay();
                    window.location.href = 'dashboard.html';
                } else {
                    const error = await response.json();
                    alert(error.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Error during registration');
            }
        });
    }
    
    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    currentUser = data.user;
                    authToken = data.token;
                    localStorage.setItem('apextrades_token', authToken);
                    updateUserDisplay();
                    window.location.href = 'dashboard.html';
                } else {
                    const error = await response.json();
                    alert(error.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Error during login');
            }
        });
    }
    
    // Logout Button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('apextrades_token');
            currentUser = null;
            authToken = null;
            window.location.href = 'login.html';
        });
    }
    
    // Personal Info Form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/user`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ fullname: fullName, email, phone })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    currentUser = data.user;
                    updateUserDisplay();
                    alert('Personal information updated successfully!');
                } else {
                    const error = await response.json();
                    alert(error.message || 'Update failed');
                }
            } catch (error) {
                console.error('Update error:', error);
                alert('Error updating profile');
            }
        });
    }
    
    // Security Form
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }
            
            if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
                alert('Password must be at least 8 characters with at least one uppercase letter, one number, and one special character!');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                
                if (response.ok) {
                    alert('Password updated successfully!');
                    securityForm.reset();
                } else {
                    const error = await response.json();
                    alert(error.message || 'Password update failed');
                }
            } catch (error) {
                console.error('Password update error:', error);
                alert('Error updating password');
            }
        });
    }
}

// Helper function to check protected pages
function isProtectedPage() {
    return window.location.pathname.includes('dashboard.html') || 
           window.location.pathname.includes('profile.html') || 
           window.location.pathname.includes('transactions.html') || 
           window.location.pathname.includes('settings.html') || 
           window.location.pathname.includes('payment.html');
}

// Mobile Menu Toggle (unchanged)
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
    hamburger.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);