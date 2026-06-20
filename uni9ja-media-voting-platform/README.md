# 🚀 UNI9JA MEDIA Voting Platform - Deployment Guide

This project is a **Full-Stack Application** (Vite Frontend + Express Backend). 

## ❌ Why Netlify is failing (The "Unexpected token '<'" Error)
If you see the error `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`, it means you deployed the app to **Netlify** (or another static host) as a "Static Site".
- Netlify does not run the backend server (`server.ts`).
- When the frontend tries to login, it asks the server for data, but Netlify just gives it the `index.html` file instead, which starts with `<!DOCTYPE html>`.
- To fix this, you must deploy to a host that supports **Node.js Servers**.

---

## ✅ Recommended Deployment: Render.com (FREE)
Render is the easiest way to host this project for free.

1. **Upload your code to a New GitHub Repository**.
2. **Go to Render.com** and create a new **Web Service**.
3. **Connect your GitHub Repo**.
4. **Settings**:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables** (Very Important):
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `any-long-random-string`
   - `DATABASE_URL`: (Optional) Your Supabase string if you followed the Supabase step.

---

## 🛠️ How to Republish to GitHub
1. **Download the ZIP** from AI Studio settings.
2. **Extract** it into a folder on your computer.
3. Open a terminal in that folder and run:
   ```bash
   git init
   git add .
   git commit -m "Republishing project"
   git remote add origin https://github.com/your-username/your-new-repo.git
   git branch -M main
   git push -u origin main
   ```

## 📂 Data & Images
- **Images**: All current contestant images are in the `uploads/` folder. They are included in this export.
- **Login**: 
  - **Admin Email**: `bennygrace2026@gmail.com`
  - **Password**: `Uni9jamedia95#`
- **Database**: The project uses `database.sqlite` by default. If you use a host like Render, images and data might be deleted when the server restarts unless you use a "Persistent Disk". 
- **Recommendation**: Use **Supabase** (PostgreSQL) for permanent data storage. I have included `supabase_schema.sql` for you to run in Supabase.
