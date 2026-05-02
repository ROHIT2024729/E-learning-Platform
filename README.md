# 🚀 EduStream: Advanced MERN E-Learning Ecosystem

[![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Server-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/)

EduStream is a high-performance, full-stack educational platform designed to provide an immersive and interactive learning experience. Beyond traditional video courses, it integrates gamification, real-time competitive systems, and AI-driven assistance to bridge the gap between passive learning and active engagement.

---

## ✨ Key Features

### 🎓 Learning Core
*   **Comprehensive Courses:** On-demand video lectures with structured modules.
*   **Interactive Test Series:** Real-time assessments with detailed performance analysis.
*   **Leaderboard:** Global and course-specific rankings to foster healthy competition.

### 🤖 Intelligent & Social
*   **AI Doubt Bot:** 24/7 instant doubt resolution powered by advanced AI models.
*   **Video Discussions:** Timestamped comments and threaded discussions within lectures.
*   **Real-time Battle System:** 1v1 or group quiz battles for competitive revision.

### 🎮 Gamification & Engagement
*   **Progress Tracking:** Visual representation of student journey and course completion.
*   **Reward System:** Earn badges and points through consistent learning and battle victories.

### 🛠 Administrative Power
*   **Advanced Analytics:** Deep insights into user engagement, sales, and content performance.
*   **Content Management:** Robust dashboard for uploading lectures, managing tests, and monitoring users.
*   **Payment Integration:** Seamless enrollment via secure payment gateways.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **State Management:** Context API (Clean & Scalable)
- **Styling:** Modular CSS (Component-scoped styles)
- **Real-time:** Socket.io Client
- **Icons:** React Icons / Lucide

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt
- **Real-time:** Socket.io
- **File Storage:** Local Uploads / Cloudinary

---

## 📂 Folder Structure

```text
E-Learning/
├── frontend/                # React Application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components (Footer, DoubtBot, etc.)
│   │   ├── context/         # Auth, Course, and Admin contexts
│   │   ├── pages/           # Route-level components (Admin, Dashboard, Battle)
│   │   ├── assets/          # Images and global styles
│   │   └── App.jsx          # Root component & routing
├── server/                  # Node.js Backend
│   ├── controller/          # Business logic for routes
│   ├── models/              # MongoDB Schemas (User, Course, Test, Battle)
│   ├── routes/              # API Endpoints
│   ├── socket/              # Socket.io event handlers
│   ├── middlewares/         # Auth and file upload guards
│   └── index.js             # Entry point
└── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- NPM or Yarn

### 1. Clone the repository
```bash
git clone https://github.com/ROHIT2024729/E-learning-Platform.git
cd E-learning-Platform
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY=your_key
RAZORPAY_SECRET=your_secret
```
Run the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Run the development server:
```bash
npm run dev
```

---

## 🧩 Key Modules

| Module | Description |
| :--- | :--- |
| **Courses** | Dynamic video player, lecture management, and progress synchronization. |
| **Test Series** | Timed examinations, multiple-choice logic, and auto-grading. |
| **Battle System** | WebSockets-driven competitive quiz engine for real-time engagement. |
| **Admin Dashboard** | Comprehensive CRUD for courses and tests with live analytics. |
| **AI Doubt Bot** | Context-aware assistant to help students without waiting for instructors. |

---

## 🔮 Future Improvements

- [ ] **Mobile App:** React Native version for on-the-go learning.
- [ ] **AI Personalization:** Recommendation engine based on student performance.
- [ ] **Live Classes:** Integration with WebRTC for interactive live sessions.
- [ ] **Downloadable Content:** Offline mode for mobile users.
- [ ] **Certificates:** Automated PDF certificate generation upon course completion.

---

## 🤝 Contribution

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for better education.
</p>
