Here is the complete README.md content in a single block. Create a file named README.md in your root folder and paste this directly into it.

Markdown

# 🤖 Physical AI & Humanoid Robotics Textbook

A Next-Gen Interactive Textbook powered by **Generative AI** and **RAG (Retrieval-Augmented Generation)**. 
This platform teaches Physical AI concepts using an immersive "Cyberpunk" interface, personalized content rewriting, and a real-time AI tutor.

![Project Banner](https://github.com/Zohairk344/Docasaurous-Hackathon2/raw/main/book/static/img/docusaurus-social-card.jpg)

## 🌟 Key Features (Hackathon Bonus Points)

* **🧠 RAG Chatbot:** Powered by **Gemini 2.5 Flash** & **Qdrant**, answering context-aware questions about robotics.
* **✨ AI Personalization:** "Beginner Mode" rewrites complex chapters in real-time for students.
* **🌍 Multi-Language:** Instant "Urdu Translation" for accessibility.
* **🛡️ Secure Authentication:** Built with **Better Auth** & **Node.js**, featuring:
    * Password Strength Meter.
    * User Background Capture (Hardware/Software Skills).
    * Dynamic Profile Headers.
* **💰 Freemium Architecture:** "Paywall" system locks advanced chapters and AI tools for guest users.

## 🏗️ Tech Stack

* **Frontend:** Docusaurus (React/TypeScript), CSS Modules (Glassmorphism UI).
* **AI Backend:** Python FastAPI, Google Gemini 2.5, LangChain.
* **Auth Server:** Node.js, Hono, Better Auth.
* **Database:** Neon (PostgreSQL) + Qdrant (Vector DB).

---

## 🚀 How to Run Locally (Judge's Guide)

This project uses a Microservices architecture. You will need **3 terminal windows** to run the full stack.

### 1. Prerequisites
* Node.js & Python installed.
* A `.env` file in the root (see `.env.example`).

### 2. Setup & Install
**Root Terminal:**
```bash
 Backend Setup
cd backend
pip install -r requirements.txt

# Auth Server Setup
cd ../auth-server
npm install

# Frontend Setup
cd ../book
npm install
3. Start the Servers
Run these commands in 3 separate terminals:

Terminal A: Python AI Backend
cd backend
uvicorn src.main:app --reload
# Runs on [http://127.0.0.1:8000](http://127.0.0.1:8000)
Terminal B: Auth Server


cd auth-server
npx tsx index.ts
# Runs on http://localhost:4000
Terminal C: Frontend (Textbook)


cd book
npm start
# Runs on http://localhost:3000
🔑 Environment Variables
To run this locally, you need a .env file in backend/ and auth-server/ with these keys:

backend/.env:
GEMINI_API_KEY=your_gemini_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
NEON_DATABASE_URL=postgres://...
auth-server/.env

DATABASE_URL=postgres://... (Same as above)
BETTER_AUTH_SECRET=random_string
BETTER_AUTH_URL=http://localhost:4000
