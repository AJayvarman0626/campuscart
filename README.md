<div align="center">

<h1>🏫 CampusCart</h1>

<p><strong>A peer-to-peer campus marketplace for students to buy, sell, and exchange academic resources.</strong></p>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen?style=for-the-badge)](https://campuscart-fl2c.onrender.com)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Table of Contents

- [About](#-about)
- [Live Links](#-live-links)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [What This Project Demonstrates](#-what-this-project-demonstrates)
- [Author](#-author)

---

## 📖 About

CampusCart is a full-stack **peer-to-peer marketplace** built exclusively for college students. Students can list used books, notes, and gadgets — and buy from other students within their campus community.

What makes it different from a generic marketplace:
- 🧠 **ML-powered recommendations** — suggests products based on your semester, regulation, and category
- 💬 **Real-time chat** — buyers and sellers communicate instantly inside the app
- 🔐 **Google OAuth + JWT auth** — secure and frictionless login
- 🎨 **Polished UI** — dark/light mode, skeleton loaders, smooth Framer Motion animations

> Built as a final-year project to solve a real problem: students either throw away study materials or can't find affordable ones.

---

## 🔗 Live Links

| Service | URL |
|--------|-----|
| 🌐 Frontend | [campuscart.onrender.com](https://campuscart-fl2c.onrender.com) |
| ⚙️ Backend API | [campuscart-service.onrender.com](https://campuscart-service.onrender.com) |
| 🧠 ML Service | [campus-cart-ml.onrender.com](https://campus-cart-ml.onrender.com) |

---

## 🚀 Features

### 🛍️ Marketplace
- List and browse campus products (Books, Notes, Gadgets)
- Product details with seller profile
- Mark products as sold

### 🧠 ML Recommendations
- Python FastAPI microservice with Scikit-learn model
- Recommends products based on **Regulation**, **Semester**, and **Category**
- Seamlessly integrated into the product detail page

### 💬 Real-Time Chat
- One-to-one buyer ↔ seller chat powered by **Socket.io**
- Auto greeting message when buyer initiates contact

### 🛒 Cart System
- Add / remove products
- Locally stored for fast access
- Accessible from the Dashboard

### 🔐 Authentication
- Email & password login
- **Google OAuth** login
- **JWT**-based secure session management
- Cloudinary for image uploads

### 🎨 UI / UX
- Fully responsive (mobile + desktop)
- Dark / Light mode toggle
- Skeleton loaders for smooth experience
- Image zoom & fullscreen modal
- Framer Motion animations throughout

---

## 🧩 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React (Vite) | UI framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Socket.io Client | Real-time chat |
| Axios | API calls |
| React Router | Navigation |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT + bcrypt | Authentication |
| Socket.io | Real-time communication |
| Cloudinary | Image storage |
| Google OAuth 2.0 | Social login |

### ML Microservice
| Technology | Purpose |
|-----------|---------|
| Python + FastAPI | Microservice API |
| Scikit-learn | Recommendation model |
| Joblib | Model serialization |

---

## 🏗️ Architecture

```
┌─────────────────┐        ┌─────────────────────┐
│  React Frontend │ ──────▶│  Node.js + Express  │
│  (Vite + TW)    │        │  REST API + Socket   │
└─────────────────┘        └─────────┬───────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  MongoDB (Mongoose)  │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  Python ML Service  │
                          │  (FastAPI + sklearn) │
                          └─────────────────────┘
```

---

## 📂 Project Structure

```
campuscart/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Route-level components
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth & Cart context
│   │   └── utils/           # Helper functions
│   └── .env
│
├── server/                  # Node.js + Express backend
│   ├── controllers/         # Route logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── utils/               # Middleware & helpers
│   └── .env
│
└── campus-cart-ml/          # ML recommendation microservice
    ├── app/                 # FastAPI app
    ├── train.py             # Model training script
    └── requirements.txt
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Python 3.9+

### 1. Clone the repo

```bash
git clone https://github.com/AJayvarman0626/campuscart.git
cd campuscart
```

### 2. Run the Backend

```bash
cd server
npm install
npm run dev
```

### 3. Run the Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Run ML Service (optional)

```bash
cd campus-cart-ml
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
python train.py
uvicorn app.main:app --reload
```

---

## ⚙️ Environment Variables

**Frontend** (`client/.env`)
```env
VITE_API_BASE_URL=https://campuscart-service.onrender.com
```

**Backend** (`server/.env`)
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
GOOGLE_CLIENT_ID=xxxx
```

> ⚠️ **Google OAuth Note:** Google login works perfectly in production. On localhost, browser COOP policies may block the popup — this is expected behavior, not a bug.

---

## 🎯 What This Project Demonstrates

- ✅ Full-stack MERN development with clean architecture
- ✅ Real-time features using Socket.io
- ✅ Microservice architecture (separate ML service)
- ✅ ML model integration into a real production app
- ✅ Third-party integrations: Google OAuth, Cloudinary
- ✅ Production deployment & environment management
- ✅ Responsive, accessible, and polished UI/UX

---

## 👨‍💻 Author

**Ajayvarman K**
Final Year CS Student | MERN Stack Developer

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio-ajay06.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ajayvarman-26x)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AJayvarman0626)

---

<div align="center">
  <sub>If this project helped you, consider giving it a ⭐</sub>
</div>
