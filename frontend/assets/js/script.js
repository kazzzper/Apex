

let currentUser = null;

// ------------------------- INIT -------------------------
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    const storedUser = localStorage.getItem('apextrades_currentUser');
    if (storedUser) currentUser = JSON.parse(storedUser);

    updateUserDisplay();
    setupTabSwitching();
    setupCopyButtons();
    setupForms();
    setupPaymentPage();
    checkProtectedPages();
}

// ------------------------- TAB SWITCHING -------------------------
function setupTabSwitching() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ------------------------- COPY BUTTONS -------------------------
function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function () {
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

// ------------------------- PAYMENT PAGE -------------------------
function setupPaymentPage() {
    if (!window.location.pathname.includes('payment.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');

    const plans = {
        starter: {
            name: 'Starter Plan',
            price: "299 - 999",
            features: ['Basic strategies', '5% monthly returns', 'Email support'],
            amount: "299 - 999"
        },
        advanced: {
            name: 'Advanced Plan',
            price: "1000 - 9999",
            features: ['Advanced strategies', '10% monthly returns', 'Live chat support'],
            amount: "1000 - 9999"
        },
        professional: {
            name: 'Professional Plan',
            price: "10000 - 50000",
            features: ['VIP strategies', '15% monthly returns', 'Dedicated manager'],
            amount: "10000 - 50000"
        },
        enterprise: {
            name: 'Enterprise Plan',
            price: "50000 - 100000",
            features: ['Custom strategies', '25% monthly returns', '24/7 priority support'],
            amount: "50000 - 100000"
        }
    };

    const selectedPlan = plans[plan] || plans.advanced;

    document.getElementById('planName').textContent = selectedPlan.name;
    document.getElementById('planPrice').textContent = `$${selectedPlan.price}`;

    const featuresList = document.getElementById('planFeatures');
    featuresList.innerHTML = '';
    selectedPlan.features.forEach(feature => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
        featuresList.appendChild(li);
    });

    document.getElementById('ethAmount').textContent = `${selectedPlan.amount} USDT`;
    document.getElementById('bscAmount').textContent = `${selectedPlan.amount} USDT`;
    document.getElementById('solAmount').textContent = `${selectedPlan.amount} Worth of USD`;

    document.getElementById('confirmPayment')?.addEventListener('click', async () => {
        if (!currentUser) return alert('Not logged in.');
        try {
            const res = await fetch('https://apex-1-vigv.onrender.com/api/users/update-plan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, plan })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            currentUser = await res.json();
            localStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
            alert('Payment confirmed. Please wait for account upgrade.');
            window.location.href = 'dashboard.html';
        } catch (err) {
            alert(err.message);
        }
    });
}

// ------------------------- USER DISPLAY -------------------------
function updateUserDisplay() {
    if (!currentUser) return;

    const nameParts = currentUser.fullname?.split(' ') || ['Trader'];

    document.getElementById('username') && (document.getElementById('username').textContent = nameParts[0]);
    document.getElementById('userNameDisplay') && (document.getElementById('userNameDisplay').textContent = currentUser.fullname);
    document.getElementById('profileName') && (document.getElementById('profileName').textContent = currentUser.fullname);
    document.getElementById('profileEmail') && (document.getElementById('profileEmail').textContent = currentUser.email);
    document.getElementById('accountBalance') && (document.getElementById('accountBalance').textContent = `$${Number(currentUser.balance).toFixed(2)}`);
    document.getElementById('currentPlan') && (document.getElementById('currentPlan').textContent = currentUser.plan || 'Free');
    document.getElementById('memberSince') && (document.getElementById('memberSince').textContent = new Date(currentUser.joined).toLocaleDateString());
}


// ------------------------- FORMS -------------------------
function setupForms() {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) return alert('Passwords do not match!');

            try {
                const res = await fetch('https://apex-1-vigv.onrender.com/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email, password })
                });
                if (!res.ok) throw new Error((await res.json()).message);
                currentUser = await res.json();
                localStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                updateUserDisplay();
                window.location.href = 'dashboard.html';
            } catch (err) {
                alert(err.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('https://apex-1-vigv.onrender.com/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (!res.ok) throw new Error((await res.json()).message);
                currentUser = await res.json();
                localStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                updateUserDisplay();
                window.location.href = 'dashboard.html';
            } catch (err) {
                alert(err.message);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('apextrades_currentUser');
            currentUser = null;
            window.location.href = 'login.html';
        });
    }

    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const fullname = document.getElementById('fullName').value;
            const email = currentUser.email;
            try {
                const res = await fetch('https://apex-1-vigv.onrender.com/api/users/update-info', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email })
                });
                if (!res.ok) throw new Error((await res.json()).message);
                currentUser = await res.json();
                localStorage.setItem('apextrades_currentUser', JSON.stringify(currentUser));
                updateUserDisplay();
                alert('Info updated!');
            } catch (err) {
                alert(err.message);
            }
        });
    }

    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (newPassword !== confirmPassword) return alert('Passwords do not match!');

            try {
                const res = await fetch('https://apex-1-vigv.onrender.com/api/users/update-password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, currentPassword, newPassword })
                });
                if (!res.ok) throw new Error((await res.json()).message);
                alert('Password updated!');
                securityForm.reset();
            } catch (err) {
                alert(err.message);
            }
        });
    }
}

// ------------------------- PROTECTED ROUTES -------------------------
function checkProtectedPages() {
    const protectedPages = ['dashboard.html', 'profile.html', 'transactions.html', 'settings.html', 'payment.html'];
    if (protectedPages.some(page => window.location.pathname.includes(page)) && !currentUser) {
        window.location.href = 'login.html';
    }
}

// ------------------------- MOBILE NAV -------------------------
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
    hamburger.addEventListener('click', function () {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && e.target !== mobileMenuToggle) {
            sidebar.classList.remove('active');
        }
    });
});