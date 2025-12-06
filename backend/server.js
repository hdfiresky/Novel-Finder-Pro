
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'novel_finder_db',
    port: process.env.DB_PORT || 3307
};

let pool;

async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log(`Connected to MySQL on port ${dbConfig.port}`);
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

initDb();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user exists
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        const user = { id: result.insertId.toString(), username, email };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const userRecord = rows[0];
        const validPassword = await bcrypt.compare(password, userRecord.password_hash);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

        const user = { id: userRecord.id.toString(), username: userRecord.username, email: userRecord.email };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// --- USER DATA ROUTES ---

// Favorites
app.get('/api/user/favorites', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT novel_id FROM favorites WHERE user_id = ?', [req.user.id]);
        const favorites = rows.map(r => r.novel_id);
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/user/favorites', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user.id;
        const { favorites } = req.body; // Array of novel IDs
        
        // Simple approach: Delete all and re-insert. In prod, strict diffing is better.
        await connection.execute('DELETE FROM favorites WHERE user_id = ?', [userId]);
        
        if (favorites.length > 0) {
            const placeholders = favorites.map(() => '(?, ?)').join(', ');
            const values = favorites.flatMap(nid => [userId, nid]);
            await connection.execute(`INSERT INTO favorites (user_id, novel_id) VALUES ${placeholders}`, values);
        }

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        connection.release();
    }
});

// Wishlist
app.get('/api/user/wishlist', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT novel_id FROM wishlist WHERE user_id = ?', [req.user.id]);
        const wishlist = rows.map(r => r.novel_id);
        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/user/wishlist', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user.id;
        const { wishlist } = req.body; 
        
        await connection.execute('DELETE FROM wishlist WHERE user_id = ?', [userId]);
        
        if (wishlist.length > 0) {
            const placeholders = wishlist.map(() => '(?, ?)').join(', ');
            const values = wishlist.flatMap(nid => [userId, nid]);
            await connection.execute(`INSERT INTO wishlist (user_id, novel_id) VALUES ${placeholders}`, values);
        }

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        connection.release();
    }
});

// Reviews
app.get('/api/user/reviews', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT novel_id, rating, review_text as text FROM reviews WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/user/reviews/:novelId', authenticateToken, async (req, res) => {
    const { rating, text } = req.body;
    const { novelId } = req.params;
    try {
        await pool.execute(
            `INSERT INTO reviews (user_id, novel_id, rating, review_text) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE rating = ?, review_text = ?`,
            [req.user.id, novelId, rating, text, rating, text]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/user/reviews/:novelId', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM reviews WHERE user_id = ? AND novel_id = ?', [req.user.id, req.params.novelId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Settings
app.get('/api/user/settings', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT show_favorite_button, show_wishlist_button, show_nsfw_content FROM user_settings WHERE user_id = ?', [req.user.id]);
        if (rows.length > 0) {
            res.json({
                showFavoriteButton: !!rows[0].show_favorite_button,
                showWishlistButton: !!rows[0].show_wishlist_button,
                showNsfw: !!rows[0].show_nsfw_content
            });
        } else {
            res.json({}); // Defaults handled by frontend
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/api/user/settings', authenticateToken, async (req, res) => {
    const { showFavoriteButton, showWishlistButton, showNsfw } = req.body;
    try {
        // Upsert settings
        await pool.execute(
            `INSERT INTO user_settings (user_id, show_favorite_button, show_wishlist_button, show_nsfw_content)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                show_favorite_button = COALESCE(?, show_favorite_button),
                show_wishlist_button = COALESCE(?, show_wishlist_button),
                show_nsfw_content = COALESCE(?, show_nsfw_content)`,
            [
                req.user.id, showFavoriteButton, showWishlistButton, showNsfw,
                showFavoriteButton, showWishlistButton, showNsfw
            ]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
