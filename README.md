# NOYZ - Audio NFT Marketplace (Inactive)

## 🚨 Project Status: No Longer Active
This project is no longer actively maintained, but the code is available for reference and use.

---

## 🎵 Project Overview
NOYZ is an innovative audio NFT marketplace where users can buy, sell, and manage digital audio assets. The platform allows users to listen to audio samples and purchase them as NFTs. Additionally, users can switch to "Artist Mode" to create and upload their own tracks for sale. A royalty system ensures artists earn a percentage from every resale.

### 🔥 Key Features
- **User Mode:** Sign up, listen to samples, buy music NFTs, and manage a wishlist.
- **Artist Mode:** Upload audio tracks, sell them as NFTs, and earn royalties.
- **Finance Module:** Artists can track total sales, earnings, and withdraw or deposit funds via a dedicated wallet.
- **Admin Panel:** Manage user accounts, approve artist requests, and control platform activity.
- **Social Features:** Follow favorite artists, track followers and following lists.

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
The platform follows a structured schema to manage users, artists, NFTs, transactions, and finances efficiently.

### **Entities and Relationships:**
- **User:** Stores user details, authentication, and role (buyer/artist/admin).
- **Artist:** Extended user profile with uploaded tracks, sales, and earnings.
- **NFT:** Represents the audio track with metadata, price, and ownership history.
- **Transaction:** Manages purchases, royalty distributions, and financial breakdowns.
- **Wallet:** Tracks user balances, deposits, and withdrawals.
- **Wishlist:** Stores favorite tracks added by users.
- **Followers:** Manages artist-followers relationships.

### **Entity-Relationship Diagram (ERD):**

![Blank diagram](https://github.com/user-attachments/assets/01e7265d-2f3a-4ab1-82a9-7f86c44834aa)

---

### 📌 Note:
Though this project is inactive, the source code remains accessible for learning and reference purposes.

