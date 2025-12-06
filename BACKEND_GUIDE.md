
# Novel Finder Pro - Backend Setup Guide

This guide explains how to set up the Express.js + MySQL backend for Novel Finder Pro.

## 1. Prerequisites

*   **Node.js** (v14 or higher)
*   **MySQL Server** (installed locally or a cloud instance like AWS RDS or PlanetScale)

## 2. Configuration

1.  Open `config.ts` in the root directory.
2.  Set `USE_BACKEND` to `true`.
    ```typescript
    export const CONFIG = {
      USE_BACKEND: true,
      API_URL: 'http://localhost:3001/api'
    };
    ```

## 3. Database Setup (Schema)

Create a new database named `novel_finder_db`. Run the following SQL commands to create the required tables.

```sql
CREATE DATABASE IF NOT EXISTS novel_finder_db;
USE novel_finder_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT NOT NULL,
    novel_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, novel_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    user_id INT NOT NULL,
    novel_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, novel_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    user_id INT NOT NULL,
    novel_id VARCHAR(255) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, novel_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT PRIMARY KEY,
    show_favorite_button BOOLEAN DEFAULT FALSE,
    show_wishlist_button BOOLEAN DEFAULT TRUE,
    show_nsfw_content BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 4. Backend Dependencies

Navigate to the root directory (or creating a separate `backend` folder structure is fine, but the script is located at `backend/server.js`).

You need to install the following packages for the backend to run:

```bash
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
```

## 5. Environment Variables

Create a `.env` file in your root (or where you run the server from) to configure the database connection.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=novel_finder_db
DB_PORT=3307
JWT_SECRET=your_super_secret_key
```

## 6. Running the Backend

Open a terminal and run:

```bash
node backend/server.js
```

The server should start on port `3001`.

## 7. Running the Frontend

Open a separate terminal and run your frontend development server (e.g., `npm run dev` or the command you usually use).

The app will now communicate with your local MySQL database!
