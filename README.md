# NOYZ - Audio NFT Marketplace (Inactive)

## 🚨 Project Status: No Longer Active
This project is no longer actively maintained, but the code is available for reference and use.

---

## 🎵 Project Overview
NOYZ is an innovative audio NFT marketplace where users can buy, sell, and manage digital audio assets. The platform allows users to listen to audio samples and purchase them as NFTs. Additionally, users can switch to "Artist Mode" to create and upload their own tracks for sale. A royalty system ensures artists earn a percentage from every resale.

### 🔥 Key Features
- **User Mode:** Sign up, listen to samples, buy music NFTs, and manage a wishlist.
- **Artist Mode:** Upload audio tracks, sell them as NFTs, and earn royalties.
- **Album Creation:** Artists can group multiple tracks into an album and sell them as a collection.
- **Finance Module:** Artists can track total sales, and earnings, and withdraw or deposit funds via a dedicated wallet.
- **Admin Panel:** Manage user accounts, approve artist requests, and control platform activity.
- **Social Features:** Follow favorite artists, track followers, and follow lists.

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, MongoDB
- **Frontend:** React.js, TypeScript, JavaScript
- **Authentication:** Google & Apple OAuth, JWT authentication, Bcrypt encryption
- **File Handling:** Multer
- **NFT Storage:** Pinata (for NFT track uploads)
- **Email Services:** SendGrid SDK

---

## 📊 Database Schema & ERD
The platform follows a structured schema to efficiently manage users, artists, NFTs, transactions, and finances.

### **Entities and Relationships:**
- **User:** Stores user details, authentication, and role (buyer/artist/admin).
- **Artist:** Extended user profile with uploaded tracks, sales, and earnings.
- **NFT:** Represents the audio track with metadata, price, and ownership history.
- **Album:** Collection of multiple NFTs grouped and sold together.
- **Transaction:** Manages purchases, royalty distributions, and financial breakdowns.
- **Wallet:** Tracks user balances, deposits, and withdrawals.
- **Wishlist:** Stores favorite tracks added by users.
- **Followers:** Manages artist-followers relationships.

### **Entity-Relationship Diagram (ERD):**

![ERD NOYZ](https://github.com/user-attachments/assets/30eff317-73cd-4c4e-b1d0-ecac80553812)

---

## 📝 Code Snippets & Highlights
### Authentication (JWT, OAuth)
Handles user authentication with JWT tokens and OAuth integrations (Google & Apple).

### Business Logic (Controllers & Services)
The application follows an MVC architecture with controllers handling API requests and services managing core business logic.

### Security Practices (Middleware, Rate Limiting, Validation)
- Middleware for request validation and authentication.
- Rate limiting to prevent API abuse.
- Data validation to ensure secure input handling.

---

## 📌 Project Summary for Portfolio
### What was the purpose?
To create a decentralized marketplace for audio NFTs where users can buy and sell digital audio assets while ensuring artists receive royalties.

### Technologies Used
- **Frontend:** React.js, TypeScript, JavaScript
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** Google & Apple OAuth, JWT authentication
- **File Handling:** Multer, Pinata for NFT storage
- **Email Services:** SendGrid SDK

### What challenges did you solve?
- Implemented a secure and scalable authentication system with JWT and OAuth.
- Designed a royalty system to ensure fair artist compensation.
- Developed a seamless user experience for purchasing and selling NFTs.
- Built a finance module for tracking earnings, transactions, and wallet balances.
- Introduced an album creation feature for artists to package and sell multiple tracks.

---

### 📌 Note:
Though this project is inactive, the source code remains accessible for reference purposes.

