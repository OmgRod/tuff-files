# TuffFiles

TuffFiles is a modern, fast, and secure file sharing platform. It features a sleek glassmorphism UI built with React & Vite, and a lightweight Node.js/Express backend using `lowdb`.

## Features
- **User Authentication**: Secure JWT-based login and admin controls.
- **Granular File Visibility**: Set files to Private, Public, or Unlisted.
- **Public Feed**: Discover files uploaded by others that have been marked as Public.
- **Live Upload Progress**: See a visual progress bar as your files upload.
- **Dedicated File Pages**: Share beautiful landing pages for your files instead of direct download links.

## Tech Stack
- **Frontend**: React, Vite, Axios, React Router, vanilla CSS
- **Backend**: Node.js, Express, Multer, Lowdb, bcrypt, jsonwebtoken

## Running with Docker (Recommended)

You can easily run the entire application stack using Docker Compose. The frontend will be built for production and served via Nginx, and the backend API will be orchestrated automatically.

1.  Make sure you have Docker and Docker Compose installed.
2.  Clone the repository and navigate into it:
    ```bash
    git clone <repository-url>
    cd tufffiles
    ```
3.  Start the containers:
    ```bash
    docker-compose up -d --build
    ```
4.  Open your browser and navigate to `http://localhost` to access the app.
    *(Note: If you have something else running on port 80, you can change the port mapping in `docker-compose.yml`)*

## Running Manually

If you prefer to run the development servers directly on your machine:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

## First-Time Setup
The first user to register on the platform will automatically be granted **Admin** privileges. Make sure to create this account right away! Admins have the ability to create additional users and delete any files.
