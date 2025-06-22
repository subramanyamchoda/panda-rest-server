# 🚀 Panda Restaurants – Backend API (panda-rest-server)

This is the **Backend API** powering the Panda Restaurants ecosystem 🐼🍽️ — including both the **User Portal** and the **Admin Portal**. Built with **Node.js**, **Express**, and **MongoDB**, this server handles all the core operations: authentication, restaurant management, table bookings, and email notifications.

🔗 **Live API**: [https://panda-rest-server.onrender.com/](https://panda-rest-server.onrender.com/)

---

## 🚀 Features

* 🔐 **Google OAuth 2.0 Authentication** (for Users & Admins)
* ⚡ **JWT Token-Based Auth** stored in HTTP-only cookies
* 💼 **Role-based Access Control** (User / Admin)
* 📝 **Manage Restaurants & Tables** (Admin only)
* 📍 **Real-time Table Booking System**
* 📨 **Email Notifications** for login, booking, and admin actions
* 🚀 RESTful API structure with versioning

---

## 🛠️ Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Server     | Node.js + Express      |
| Database   | MongoDB + Mongoose ORM |
| Auth       | Google OAuth + JWT     |
| Mailer     | NodeMailer             |
| Deployment | Render                 |

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/subramanyamchoda/panda-rest-server.git
cd panda-rest-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env` file in the root with the following:

```env
PORT=5000
MONGODB_URI=your-mongo-uri
JWT_SECRET=your-jwt-secret
CLIENT_URL=https://pandarestaurantsuser.vercel.app
ADMIN_URL=https://pandarestaurantsadmin.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password-or-app-password
```

> ⚠️ Replace the placeholder values with your actual credentials.

### 4. Run the Server

```bash
npm start
```

Server will run at: `http://localhost:5000`

---

## 🔒 Authentication & Security

* Google OAuth 2.0 integrated for both user and admin roles
* JWT tokens stored securely in HTTP-only cookies
* Middleware-protected routes for authenticated users/admins

---

## 📨 Email Services

Email notifications are powered via **NodeMailer** for:

* Login confirmations
* Booking confirmations
* Admin alerts (restaurant/table creation)

---

## 📊 API Structure Overview

### Auth Endpoints

* `/api/auth/google` – Login via Google
* `/api/auth/logout` – Clear session cookies

### User Endpoints

* `/api/user/bookings` – Create/view bookings
* `/api/user/me` – Fetch user profile

### Admin Endpoints

* `/api/admin/restaurants` – Add/manage restaurants
* `/api/admin/tables` – Add/manage tables
* `/api/admin/bookings` – View restaurant bookings

### Public Endpoints

* `/api/restaurants` – List all restaurants
* `/api/restaurants/:id/tables` – Available tables

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create a branch:

```bash
git checkout -b feature/YourFeature
```

3. Make your changes and commit:

```bash
git commit -m "Add YourFeature"
```

4. Push to your branch:

```bash
git push origin feature/YourFeature
```

5. Open a Pull Request

---

## 🙌 Acknowledgments

This backend was developed as part of the **Panda Restaurants** full-stack project to gain real-world experience in:

* Full-stack architecture and separation of concerns
* Secure authentication and role management
* REST API design
* Cloud deployment & email workflows

---

## ✨ Related Projects

| Project           | Live Link                                                                              |
| ----------------- | -------------------------------------------------------------------------------------- |
| 🧑‍🍳 User Portal | [https://pandarestaurantsuser.vercel.app/](https://pandarestaurantsuser.vercel.app/)   |
| 💼 Admin Portal   | [https://pandarestaurantsadmin.vercel.app/](https://pandarestaurantsadmin.vercel.app/) |

---

Thanks for checking out the backend! Feel free to clone, contribute, or give feedback 🚀🐼
