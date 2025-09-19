# 🔐 SecurePass (DES332 Computer and Network Security Project)

## 📌 Overview
SecurePass is an **offline-capable password manager** that stores credentials **locally** with strong cryptography:
1. **AES encryption** protects saved site/app passwords in the user’s vault.  
2. **bcrypt hashing** secures user authentication (master password).  

All encryption/decryption happens **client-side**, and encrypted records are stored in a local **SQLite** database.

---

## 🚀 Features
- **Strong Authentication (bcrypt)**
  - One-way password hashing with automatic salting.
  - Resistant to brute-force attacks by design.
- **Confidential Storage (AES)**
  - Encrypts/decrypts vault entries on the client.
  - AES key is **derived from the user’s password** (via SHA-256) before use.
- **Local Database (SQLite)**
  - Offline-first, lightweight storage.
  - Stores only **ciphertext** (no plaintext secrets at rest).
- **End-to-End Flow**
  - **Signup** → bcrypt-hash master password → store hash.
  - **Login** → verify bcrypt → derive AES key → unlock vault.
  - **Vault Ops** → Create/Read/Update/Delete encrypted entries (CRUD).

---

## 📊 Results
Functional tests and expected outcomes:

| Test Case                                   | Expected Outcome                        | Status |
|---------------------------------------------|-----------------------------------------|--------|
| Account signup (hash stored, not plaintext) | bcrypt hash saved in DB                 | ✅     |
| Login verification                          | Input password matches stored bcrypt    | ✅     |
| Add vault entry                             | Entry encrypted via AES before storage  | ✅     |
| Retrieve vault entry                        | AES decrypts to correct plaintext       | ✅     |
| Update/Delete entry                         | CRUD operations preserved encryption    | ✅     |

✅ Plaintext secrets never touch storage; only encrypted data is persisted.

---

## 🛠️ Tech Stack
- **Language/Runtime:** Web app (client-side crypto)
- **Crypto:** **AES** (symmetric encryption), **bcrypt** (password hashing), **SHA-256** (key derivation)
- **Storage:** **SQLite** (local, offline-capable)
- **Libraries/Tools:** CryptoJS (AES), bcrypt implementation, SQLite bindings

---

## 👥 Team members
Kanapitch Khamjorn  

Witchapas Chotichaiyon  

Kueakul Jongpermponwattana
