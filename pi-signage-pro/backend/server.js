const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// Directories
const dbDir = path.join(__dirname, 'db');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Database Setup
const dbPath = path.join(dbDir, 'signage.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    originalname TEXT,
    mimetype TEXT,
    size INTEGER,
    uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS layouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    isActive BOOLEAN DEFAULT 0,
    widgets TEXT -- JSON string
  )`);

  // Default Admin User
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('admin123', salt);
      db.run("INSERT INTO users (username, password) VALUES ('admin', ?)", [hash]);
      console.log('Default admin user created (admin/admin123)');
    }
  });

  // Default Layout
  db.get("SELECT * FROM layouts", (err, row) => {
    if (!row) {
      const defaultWidgets = JSON.stringify([]);
      db.run("INSERT INTO layouts (name, isActive, widgets) VALUES ('Default', 1, ?)", [defaultWidgets]);
    }
  });
});

// Multer Setup (Max 100MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ROUTES ---

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Media Routes
app.get('/api/media', authenticateToken, (req, res) => {
  db.all("SELECT * FROM media ORDER BY uploadDate DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/media/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { filename, originalname, mimetype, size } = req.file;

  db.run("INSERT INTO media (filename, originalname, mimetype, size) VALUES (?, ?, ?, ?)",
    [filename, originalname, mimetype, size],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, filename, originalname, mimetype, size });
    });
});

app.delete('/api/media/:id', authenticateToken, (req, res) => {
  db.get("SELECT filename FROM media WHERE id = ?", [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Media not found' });

    fs.unlink(path.join(uploadsDir, row.filename), (unlinkErr) => {
      // Ignore unlink error if file doesn't exist
      db.run("DELETE FROM media WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// Layout Routes
app.get('/api/layouts/active', (req, res) => {
  db.get("SELECT * FROM layouts WHERE isActive = 1", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json({ widgets: [] });

    try {
      row.widgets = JSON.parse(row.widgets);
      res.json(row);
    } catch (e) {
      res.json({ widgets: [] });
    }
  });
});

app.get('/api/layouts', authenticateToken, (req, res) => {
  db.all("SELECT * FROM layouts", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => ({
      ...row,
      widgets: JSON.parse(row.widgets)
    })));
  });
});

app.post('/api/layouts', authenticateToken, (req, res) => {
  const { name, widgets } = req.body;
  const widgetsStr = JSON.stringify(widgets || []);

  db.run("INSERT INTO layouts (name, widgets) VALUES (?, ?)", [name, widgetsStr], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, widgets });
  });
});

app.put('/api/layouts/:id', authenticateToken, (req, res) => {
  const { name, widgets } = req.body;
  const widgetsStr = JSON.stringify(widgets || []);

  db.run("UPDATE layouts SET name = ?, widgets = ? WHERE id = ?", [name, widgetsStr, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Check if this is the active layout and broadcast to player if so
    db.get("SELECT isActive FROM layouts WHERE id = ?", [req.params.id], (err, row) => {
      if (row && row.isActive) {
        io.emit('layout-updated', { widgets });
      }
    });

    res.json({ success: true });
  });
});

app.post('/api/layouts/:id/activate', authenticateToken, (req, res) => {
  db.serialize(() => {
    db.run("UPDATE layouts SET isActive = 0");
    db.run("UPDATE layouts SET isActive = 1 WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT widgets FROM layouts WHERE id = ?", [req.params.id], (err, row) => {
        if (row) {
          try {
            const widgets = JSON.parse(row.widgets);
            io.emit('layout-updated', { widgets });
          } catch(e) {}
        }
        res.json({ success: true });
      });
    });
  });
});


// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current active layout to new connections immediately
  db.get("SELECT widgets FROM layouts WHERE isActive = 1", (err, row) => {
    if (row && row.widgets) {
      try {
        const widgets = JSON.parse(row.widgets);
        socket.emit('layout-updated', { widgets });
      } catch(e) {}
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
