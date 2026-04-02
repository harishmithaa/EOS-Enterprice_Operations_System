# Complete Step-by-Step Deployment Guide for EOS (Render + Vercel + MongoDB Atlas)

This guide will walk you through, click-by-click, the process of deploying the Enterprise Operations System (EOS) to the cloud for free.

---

## Phase 1: Uploading Your Code to GitHub
Both Render and Vercel will pull your code directly from GitHub.

1. **Create a GitHub Account**: If you don't have one, go to [GitHub.com](https://github.com) and sign up.
2. **Create a New Repository**:
   - In the top right corner of GitHub, click the **+** icon and select **New repository**.
   - Name your repository (e.g., `eos-app`).
   - Keep it **Public** or **Private** (both work).
   - Do **NOT** check "Add a README file" or ".gitignore".
   - Click **Create repository**.
3. **Push Your Local Code**:
   - Open your terminal and ensure you are in the `d:\EOS` folder (the root of your project).
   - Run the following commands in order:
     ```bash
     git init
     git add .
     git commit -m "Initial commit for EOS deployment"
     git branch -M main
     ```
   - Copy the command from GitHub that looks like `git remote add origin https://github.com/your-username/eos-app.git` and run it in your terminal.
   - Run: `git push -u origin main`

---

## Phase 2: Setting up the Database (MongoDB Atlas)
Your backend needs a place to store data. We will use MongoDB's free cloud tier.

1. **Sign Up**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and click **Try free**.
2. **Create a Cluster**:
   - After signing in, click **Build a Database** (or Create Cluster).
   - Select the **M0 Free** tier.
   - For Provider/Region, choose whatever is closest to you (e.g., AWS / N. Virginia).
   - Click **Create**.
3. **Database Security Setup**:
   - It will ask you how you would like to authenticate your connection. 
   - **Username**: Enter `eos_admin`
   - **Password**: Click "Autogenerate Secure Password" (Copy this password! You will need it soon). 
   - Click **Create User**.
4. **Network Access**:
   - It will ask from where you would like to connect.
   - Look for **"IP Access List"** or **"Network Access"** on the left menu.
   - Click **Add IP Address**.
   - Click **"Allow Access from Anywhere"** (this sets it to `0.0.0.0/0`). This is necessary so the Render backend can communicate with it.
   - Click **Confirm**.
5. **Get Your Connection String**:
   - Go back to **Database** on the left menu.
   - Click the **Connect** button on your cluster.
   - Select **"Drivers"** (or Connect your application).
   - Copy the connection string. It will look something like this:
     `mongodb+srv://eos_admin:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority`
   - Paste this somewhere safe (like a notepad) and replace `<password>` with the password you generated in Step 3. **This is your `MONGO_URI`.**

---

## Phase 3: Deploying the Backend on Render
The backend (Node.js/Express) will run on Render.

1. **Sign Up**: Go to [Render.com](https://render.com) and sign up using your GitHub account.
2. **Create Web Service**:
   - In the Render Dashboard, click the **New+** button at the top right and select **Web Service**.
   - Connect your GitHub account and select your `eos-app` repository.
3. **Configure the Service**:
   - **Name**: `eos-backend`
   - **Region**: (Any region)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(Crucial: This tells Render to only run the backend folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. **Environment Variables**:
   - Scroll down to "Environment Variables" and click **Add Environment Variable** for each of these:
     1. **Key**: `MONGO_URI`
        **Value**: *(Paste your complete connection string from Phase 2)*
     2. **Key**: `JWT_SECRET`
        **Value**: *(Type a random sequence of letters and numbers, e.g., `my_super_secret_eos_key_123`)*
     3. **Key**: `NODE_ENV`
        **Value**: `production`
5. **Deploy**:
   - Scroll to the bottom and select the **Free** instance type.
   - Click **Create Web Service**.
6. **Get the Backend URL**:
   - Wait a few minutes. You will see logs in the console. When it says "Server running on port...", it is finished.
   - At the top of the page, there is a link like `https://eos-backend-xyz.onrender.com`. Click it. If it says "EOS API is running...", it works!
   - **Copy this URL**.

---

## Phase 4: Deploying the Frontend on Vercel
The frontend (React) will run on Vercel.

1. **Sign Up**: Go to [Vercel.com](https://vercel.com) and sign up using your GitHub account.
2. **Import Project**:
   - Click **Add New** -> **Project**.
   - Find your `eos-app` repository and click **Import**.
3. **Configure the Project**:
   - **Framework Preset**: Vercel should auto-detect "Create React App".
   - **Root Directory**: Click the "Edit" button next to this, select the `frontend` folder, and click Continue.
4. **Environment Variables**:
   - Drop down the "Environment Variables" section.
   - Add the following variables:
     1. **Name**: `REACT_APP_API_URL`
        **Value**: *(Paste your Render URL)*`/api` 
        *(Example: `https://eos-backend-xyz.onrender.com/api`)*
     2. **Name**: `REACT_APP_BACKEND_URL`
        **Value**: *(Paste your Render URL)*
        *(Example: `https://eos-backend-xyz.onrender.com`)*
     Click **Add** for each.
5. **Deploy**:
   - Click the big **Deploy** button.
   - Wait 1-2 minutes for it to build.
   - When it’s done, you will see a screen with confetti. Click **Continue to Dashboard**.
6. **Get the Live Website URL**:
   - At the top of your Vercel project dashboard, you will see your public domains (e.g., `eos-app.vercel.app`).
   - Click it to visit your live site!

---

## Phase 5: Final Testing
1. Visit your Vercel URL.
2. Click **Register** and create a new account. *(Since the database is brand new, your old local accounts aren't there).*
3. Go through the onboarding process.
4. Add a new Product and upload an image.
5. Ensure the product appears correctly.

*(Note: The Render free tier goes to "sleep" after 15 minutes of inactivity. If you haven't opened your site in a while, the very first login might take 30-50 seconds to process while the backend wakes up. Subsequent clicks will be fast.)*
