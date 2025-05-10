// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Current User
let currentUser = JSON.parse(sessionStorage.getItem('apextrades_currentUser')) || null;

// Initialize the app
function initApp() {
    // Check authentication for protected pages
    checkAuth();
    
    // If user is logged in, fetch fresh data
    if (currentUser) {
        fetchUserData();
    }
    
    updateUserDisplay();
    setupTabSwitching();
    setupCopyButtons();
    setupPaymentPage();
    setupForms();
    setupMobileMenu();
}

// Check authentication for protected pages
function checkAuth() {
    const protectedPages = [
        'dashboard.html',
        'profile.html',
        'transactions.html',
        'settings.html',
        'payment.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }
}

// Fetch user data from server
async function fetchUserData() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        currentUser = { ...currentUser, ...userData };
        sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
        updateUserDisplay();
    } catch (error) {
        console.error('Error fetching user data:', error);
        // If there's an error (like token expired), log out the user
        logout();
    }
}

// Update user display across all pages
function updateUserDisplay() {
    if (currentUser) {
        // Update dashboard elements
        if (document.getElementById('username')) {
            document.getElementById('username').textContent = currentUser.fullname ? currentUser.fullname.split(' ')[0] : 'User';
        }
        if (document.getElementById('userNameDisplay')) {
            document.getElementById('userNameDisplay').textContent = currentUser.fullname || 'User';
        }
        if (document.getElementById('profileName')) {
            document.getElementById('profileName').textContent = currentUser.fullname || 'User';
        }
        if (document.getElementById('profileEmail')) {
            document.getElementById('profileEmail').textContent = currentUser.email || '';
        }
        if (document.getElementById('fullName')) {
            document.getElementById('fullName').value = currentUser.fullname || '';
        }
        if (document.getElementById('email')) {
            document.getElementById('email').value = currentUser.email || '';
        }
        if (document.getElementById('phone')) {
            document.getElementById('phone').value = currentUser.phone || '';
        }
        if (document.getElementById('memberSince')) {
            const joinedDate = currentUser.joined ? new Date(currentUser.joined) : new Date();
            document.getElementById('memberSince').textContent = joinedDate.toLocaleDateString();
        }
        if (document.getElementById('currentPlan')) {
            document.getElementById('currentPlan').textContent = currentUser.plan || 'Free';
        }
    }
}

// Setup tab switching functionality
function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup copy buttons for wallet addresses
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
        
        // Plan details
        const plans = {
            starter: {
                name: 'Starter Plan',
                price: "299 - 999",
                features: [
                    'Basic strategies',
                    '5% monthly returns',
                    'Email support'
                ],
                amount: "299 - 999"
            },
            advanced: {
                name: 'Advanced Plan',
                price: "1000 - 9999",
                features: [
                    'Advanced strategies',
                    '10% monthly returns',
                    'Live chat support'
                ],
                amount: "1000 - 9999"
            },
            professional: {
                name: 'Professional Plan',
                price: "10000 - 50000",
                features: [
                    'VIP strategies',
                    '15% monthly returns',
                    'Dedicated manager'
                ],
                amount: "10000 - 50000"
            },
            enterprise: {
                name: 'Enterprise Plan',
                price: "50000 - 100000",
                features: [
                    'Custom strategies',
                    '25% monthly returns',
                    '24/7 priority support'
                ],
                amount: "50000 - 10000"
            }
        };
        
        const selectedPlan = plans[plan] || plans.advanced;
        
        // Update plan info
        if (document.getElementById('planName')) {
            document.getElementById('planName').textContent = selectedPlan.name;
        }
        if (document.getElementById('planPrice')) {
            document.getElementById('planPrice').textContent = `$${selectedPlan.price}`;
        }
        
        const featuresList = document.getElementById('planFeatures');
        if (featuresList) {
            featuresList.innerHTML = '';
            selectedPlan.features.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
                featuresList.appendChild(li);
            });
        }
        
        // Update amounts
        if (document.getElementById('ethAmount')) {
            document.getElementById('ethAmount').textContent = `${selectedPlan.amount} USDT`;
        }
        if (document.getElementById('bscAmount')) {
            document.getElementById('bscAmount').textContent = `${selectedPlan.amount} USDT`;
        }
        if (document.getElementById('solAmount')) {
            document.getElementById('solAmount').textContent = `${selectedPlan.amount} Worth of USD`;
        }
        
        // Confirm payment button
        const confirmPaymentBtn = document.getElementById('confirmPayment');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', async function() {
                if (currentUser) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/user/plan`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentUser.token}`
                            },
                            body: JSON.stringify({ plan })
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to update plan');
                        }
                        
                        // Update local user data
                        currentUser.plan = plan;
                        sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                        
                        alert('Thank you for your payment! Kindly wait for your account to be upgraded.');
                        window.location.href = 'dashboard.html';
                    } catch (error) {
                        console.error('Error updating plan:', error);
                        alert(error.message || 'Failed to process payment. Please try again.');
                    }
                }
            });
        }
    }
}

// Setup form submissions
function setupForms() {
    // Sign Up Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate password
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
                alert('Password must be at least 8 characters with at least one uppercase letter, one number, and one special character!');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullname,
                        email,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                
                // Store user data and token
                currentUser = {
                    ...data.user,
                    token: data.token
                };
                sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Registration error:', error);
                alert(error.message || 'Registration failed. Please try again.');
            }
        });
    }
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                
                // Store user data and token
                currentUser = {
                    ...data.user,
                    token: data.token
                };
                sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                alert(error.message || 'Invalid email or password!');
            }
        });
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
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
                const response = await fetch(`${API_BASE_URL}/user`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.token}`
                    },
                    body: JSON.stringify({
                        fullname: fullName,
                        email,
                        phone
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update profile');
                }
                
                // Update local user data
                currentUser = {
                    ...currentUser,
                    ...data.user
                };
                sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                
                updateUserDisplay();
                alert('Personal information updated successfully!');
            } catch (error) {
                console.error('Profile update error:', error);
                alert(error.message || 'Failed to update profile. Please try again.');
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
                const response = await fetch(`${API_BASE_URL}/user/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.token}`
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update password');
                }
                
                alert('Password updated successfully!');
                securityForm.reset();
            } catch (error) {
                console.error('Password update error:', error);
                alert(error.message || 'Failed to update password. Please try again.');
            }
        });
    }
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            }
        });
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('apextrades_currentUser');
    currentUser = null;
    window.location.href = 'login.html';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);