// User Authentication System
const users = JSON.parse(localStorage.getItem('apextrades_users')) || [];

// DOM Elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Current User
let currentUser = JSON.parse(sessionStorage.getItem('apextrades_currentUser'));

// Initialize the app
function initApp() {
    updateUserDisplay();
    setupTabSwitching();
    setupCopyButtons();
    setupPaymentPage();
    setupForms();
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
function setupPaymentPage() {
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
        document.getElementById('planName').textContent = selectedPlan.name;
        document.getElementById('planPrice').textContent = `$${selectedPlan.price}`;
        
        const featuresList = document.getElementById('planFeatures');
        featuresList.innerHTML = '';
        selectedPlan.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
            featuresList.appendChild(li);
        });
        
        // Update amounts
        document.getElementById('ethAmount').textContent = `${selectedPlan.amount} USDT`;
        document.getElementById('bscAmount').textContent = `${selectedPlan.amount} USDT`;
        document.getElementById('solAmount').textContent = `${selectedPlan.amount} Worth of USD`;
        
        // Confirm payment button
        document.getElementById('confirmPayment').addEventListener('click', function() {
            if (currentUser) {
                currentUser.plan = plan;
                sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                
                // Update user in local storage
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    localStorage.setItem('apextrades_users', JSON.stringify(users));
                }
                
                alert('Thank you for your payment! Kindly wait for your account to be upgraded.');
                window.location.href = 'dashboard.html';
            }
        });
    }
}

// Setup form submissions
function setupForms() {
    // Sign Up Form
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
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
            
            // Check if user already exists
            const userExists = users.some(user => user.email === email);
            if (userExists) {
                alert('User with this email already exists!');
                return;
            }
            
            // Create new user
            const newUser = {
                fullname,
                email,
                password, // Note: In a real app, you should hash the password
                plan: 'free',
                balance: 0,
                joined: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('apextrades_users', JSON.stringify(users));
            
            // Log the user in
            currentUser = newUser;
            sessionStorage.setItem('apextrades_currentUser', JSON.stringify(newUser));
            updateUserDisplay();
            window.location.href = 'dashboard.html';
        });
    }
    
    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Find user
            const user = users.find(user => user.email === email && user.password === password);
            
            if (user) {
                currentUser = user;
                sessionStorage.setItem('apextrades_currentUser', JSON.stringify(user));
                updateUserDisplay();
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password!');
            }
        });
    }
    
    // Logout Button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('apextrades_currentUser');
            currentUser = null;
            window.location.href = 'login.html';
        });
    }
    
    // Personal Info Form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            if (currentUser) {
                currentUser.fullname = fullName;
                currentUser.email = email;
                currentUser.phone = phone;
                
                sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                
                // Update user in local storage
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    localStorage.setItem('apextrades_users', JSON.stringify(users));
                }
                
                updateUserDisplay();
                alert('Personal information updated successfully!');
            }
        });
    }
    
    // Security Form
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!currentUser || currentUser.password !== currentPassword) {
                alert('Current password is incorrect!');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }
            
            if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
                alert('Password must be at least 8 characters with at least one uppercase letter, one number, and one special character!');
                return;
            }
            
            currentUser.password = newPassword;
            sessionStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
            
            // Update user in local storage
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('apextrades_users', JSON.stringify(users));
            }
            
            alert('Password updated successfully!');
            securityForm.reset();
        });
    }
}

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
    hamburger.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Check if user is logged in for protected pages
if (window.location.pathname.includes('dashboard.html') || 
    window.location.pathname.includes('profile.html') || 
    window.location.pathname.includes('transactions.html') || 
    window.location.pathname.includes('settings.html') || 
    window.location.pathname.includes('payment.html')) {
    if (!currentUser) {
        window.location.href = 'login.html';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);