# ApexTrades - Crypto Copy Trading Platform

## Project Overview
ApexTrades is a modern, responsive crypto copy trading platform that allows users to subscribe to AI-powered trading bots at different tiers. The platform includes:

- User authentication (signup/login)
- Dashboard with account stats
- Profile management
- Transaction history
- Account settings
- Tiered subscription plans ($500, $1000, $1500, $3000)
- Cryptocurrency payment integration (USDT on Ethereum/BSC, USDC on Solana)

## Features
- Responsive design for all devices
- Clean, modern UI with dark/light themes
- User profile with personal information
- Transaction history with filtering
- Account settings with security options
- QR code generation for easy payments

## Image Assets
The following images are required in the assets/images folder:
- logo.svg - Website logo
- hero-image.png - Hero section image
- dashboard-bg.png - Dashboard background
- eth-qr.png - Ethereum QR code
- bsc-qr.png - Binance Smart Chain QR code
- sol-qr.png - Solana QR code
- user-avatar.png - Default user avatar
- bot-icon.png - Trading bot icon
- wallet-icon.png - Wallet icon
- transaction-icon.png - Transaction icon

## Deployment Instructions

1. **Hosting Requirements**:
   - static website hosting service (Netlify, Vercel, GitHub Pages, etc.) for frontend 
   - server-side requirements for the demo (uses node, express)
   - uses postgresql for database (check database schema)
   - Vercel config to remove .html from urls (modify to suite your environment)

2. **Deployment Steps**:
   - Upload all files to your hosting provider 
   - Target to frontend directory for entry
   - Ensure all file paths are correct in HTML files
   - start the backend server 
   - The website should be fully functional after deployment

3. **For Production**:
   - Replaced localStorage with a proper backend database(express)
   - Implemented proper password hashing (bcryptjs)
   - Add SSL certificate for security
   - Consider using a framework like React or Vue for better maintainability

4. **Payment Integration**:
   - Wallet addresses:
     - Ethereum (USDT): 0x2a2B73a1dA165Aec951C0fc3B576E575AFC30Ab3
     - BSC (USDT): 0x2a2B73a1dA165Aec951C0fc3B576E575AFC30Ab3
     - Solana (USDC): 97Qv49f1pKqUhCWjFohgL9dCLkqKTFXkWt7gMExtQFsM
   - QR code images placed in assets/images folder(modify to suite yours)

5. **Testing**:
   - Test all forms and navigation
   - Verify all pages work after login
   - Check the payment page with different plan selections
   - Test responsiveness on various devices