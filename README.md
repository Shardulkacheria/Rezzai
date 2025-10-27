# 🧠 RezzAI – AI-Powered Job Automation Platform

RezzAI is an **AI-driven job automation system** built with **Next.js**, designed to simplify and speed up the job search and application process.  
It combines **AI-based job discovery**, **resume customization**, and **automated job applications** through a modern dashboard and a Chrome extension — with **GSAP-powered animations** for a smooth, interactive user experience.

🌐 **Live App:** [https://rezzai.vercel.app](https://rezzai.vercel.app)

---

## 🚀 Features

- 🔍 **AI Job Search:** Fetches and filters relevant job listings in real time using the **Adzuna API**.
- 🤖 **AI Resume Optimization:** Uses **Gemini API** to tailor your resume and cover letters for each job.
- 🧾 **Automated Job Applications:** Automatically fills and submits job applications using intelligent automation.
- 🧩 **Chrome Extension Integration:** Apply to jobs directly from portals like LinkedIn or Indeed in one click.
- 📊 **Smart Dashboard:** Track saved jobs, application progress, and AI suggestions in one place.
- 🔒 **Secure Authentication:** JWT-based login integrated with **Firebase Authentication**.
- ☁️ **Cloud Data Storage:** User and job data securely stored in **MongoDB**.
- 🎨 **Modern UI & Animation:** Built with **Material UI**, **Lucide React**, and **GSAP** for rich, responsive motion effects.

---

## 🧰 Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Frontend** | Next.js, React, Material UI, Lucide React, GSAP |
| **Backend** | Next.js API Routes, Node.js, Firebase |
| **Database** | MongoDB |
| **Authentication** | Firebase Auth, JWT |
| **APIs / AI** | Gemini API (Google AI), Adzuna API (Job Search) |
| **Extensions** | Chrome Extension for Job Auto-Apply |
| **Hosting** | Vercel |

---

## 📁 Project Structure
```
RezzAI/
│
├── chrome-extension/ # Chrome extension for one-click job application
│ ├── manifest.json
│ ├── background.js
│ ├── content.js
│ └── popup/
│
├── src/
│ ├── app/ # Next.js App Router pages and layouts
│ ├── components/ # UI components and modules
│ ├── contexts/ # Context providers (Auth, Theme, etc.)
│ ├── lib/ # API integrations and utility logic
│ ├── hooks/ # Custom React hooks
│ ├── styles/ # Global and component-level styles
│ └── config/ # Firebase, Mongo, and API configurations
│
├── public/ # Static assets (icons, images, manifest)
│
├── .gitignore
├── components.json
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Shardulkacheria/Rezzai.git
cd Rezzai
2️⃣ Install Dependencies
bash
Copy code
npm install
3️⃣ Configure Environment Variables
Create a .env.local file in the root folder and add:

env
Copy code
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MongoDB Config
MONGODB_URI=your_mongodb_connection_string

# External APIs
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
GEMINI_API_KEY=your_gemini_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret
4️⃣ Run the Development Server
bash
Copy code
npm run dev
Now visit http://localhost:3000.

🧠 How It Works
Authentication:
Users log in via Firebase Auth, generating secure JWT tokens for protected API access.

Job Discovery:
The Adzuna API fetches current job listings based on search criteria.

AI Resume Enhancement:
Gemini AI analyzes job descriptions and recommends tailored resume or cover letter content.

Chrome Extension:
Allows users to auto-fill and apply directly from job platforms.

Data Management:
Application data is saved in MongoDB for tracking progress and analytics.

Smooth Animations:
GSAP brings fluid motion and micro-interactions to enhance UX across components and transitions.

🖥️ Core Functional Modules
Module	Description
Auth System	Handles registration, login, JWT validation, and user sessions.
Job Search	Fetches job listings via Adzuna API with filtering options.
AI Resume Builder	Uses Gemini API for personalized resume/cover letter generation.
Job Tracker	Stores user applications and statuses in MongoDB.
Chrome Extension	Auto-fills application forms from job boards.
Dashboard	Displays analytics, saved jobs, and application stats.
UI Animations	Smooth transitions, loaders, and visual effects via GSAP.

🧩 API Integrations
🔹 Adzuna API
Fetches live job postings based on keywords, role, or location.
👉 Adzuna Developer Portal

🔹 Gemini API
Provides AI-generated text for resume and cover letter optimization.
👉 Gemini AI API

🎨 UI & Design
RezzAI’s interface is built for a modern and intuitive user experience, powered by:

Material UI for consistent design and responsiveness

Lucide React for clean, scalable icons

GSAP (GreenSock Animation Platform) for seamless motion and transitions

Framer Motion (optional) for scroll-based animations

📸 Screenshots (Add yours later)
Dashboard	AI Resume Builder	Chrome Extension

🧑‍💻 Author
👋 Shardul Kacheria
Full Stack Developer | React | Next.js | Spring Boot | DevOps | GSAP
📫 LinkedIn
🌐 Live App
⭐ If you like this project, please consider giving it a star on GitHub!

📜 License
This project is licensed under the MIT License.
You can use and modify it with attribution.

💡 Future Enhancements
 Job tracking analytics with AI insights

 Email alerts for new matching jobs

 Multi-platform support (LinkedIn, Indeed, etc.)

 Resume upload and auto-parsing

 Theme toggle (Dark/Light)

 Advanced animation sequences with GSAP timelines

💫 Acknowledgements
Next.js

Firebase

MongoDB

Adzuna API

Gemini AI

Material UI

Lucide React

GSAP

“RezzAI empowers job seekers with automation and AI — saving time, enhancing resumes, and boosting success.”



---



