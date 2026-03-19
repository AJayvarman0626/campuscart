
---

# 🏫 CampusCart

CampusCart is a **full-stack campus marketplace** where students can buy and sell **books, notes, and gadgets** within their college community.
It includes **ML-powered product recommendations**, real-time chat, Google authentication, and a modern responsive UI.

🔗 **Live Site:** [https://campuscart.onrender.com](https://campuscart.onrender.com)
🔗 **Backend API:** [https://campuscart-service.onrender.com](https://campuscart-service.onrender.com)
🔗 **ML Recommendation Service:** [https://campus-cart-ml.onrender.com](https://campus-cart-ml.onrender.com)

---

## 🚀 Features

### 🛍️ Marketplace

* List and browse campus products
* Categories: **Books, Notes, Gadgets**
* Product details with seller profile
* Mark products as sold

### 🧠 ML Recommendations

* Python ML microservice (FastAPI)
* Recommends products based on:

  * Regulation
  * Semester
  * Category
* Integrated seamlessly into product detail page

### 🛒 Cart System

* Add/remove products
* Stored locally for fast access
* Accessible from Dashboard

### 💬 Chat System

* One-to-one buyer ↔ seller chat
* Auto greeting message on contact

### 🔐 Authentication

* Email & password login
* Google OAuth login
* JWT-based secure auth

### 🎨 UI / UX

* Fully responsive (mobile + desktop)
* Dark / light mode
* Skeleton loaders
* Image zoom & fullscreen modal
* Smooth animations (Framer Motion)

---

## 🧩 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Cloudinary (image uploads)

### ML Microservice

* Python
* FastAPI
* Scikit-learn
* Joblib
* Deployed independently

---

## 📂 Project Structure

```
campuscart/
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── utils/
│   └── .env
│
├── server/                # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── .env
│
└── campus-cart-ml/        # ML recommendation service
    ├── app/
    ├── train.py
    └── requirements.txt
```

---

## ⚙️ Environment Variables

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=https://campuscart-service.onrender.com
```

### Backend (`server/.env`)

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
GOOGLE_CLIENT_ID=xxxx
```

---

## 🧪 Local Development

### Clone the repo

```bash
git clone https://github.com/AJayvarman0626/campuscart.git
cd campuscart
```

### Run Backend

```bash
cd server
npm install
npm run dev
```

### Run Frontend

```bash
cd client
npm install
npm run dev
```

### Run ML Service (optional)

```bash
cd campus-cart-ml
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train.py
uvicorn app.main:app --reload
```

---

## ⚠️ Notes on Google Login (Important)

* Google OAuth works **perfectly in production**
* Localhost may block popup due to browser COOP policies
* This is expected behavior and not a bug

---

## 🎯 What This Project Demonstrates

* Full-stack MERN development
* Microservice architecture
* ML model integration into real product
* Clean UI/UX design
* Production deployment & debugging

---

## 👨‍💻 Author

**Ajayvarman**
MERN Stack Developer
---
