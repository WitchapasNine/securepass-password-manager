const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./securepass.db', (err) => {
  if (err) throw err;
  console.log(`[${new Date().toISOString()}] Database opened: securepass.db`);
});
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      passwordHash TEXT NOT NULL,
      vault TEXT NOT NULL
    )`,
    () => console.log(`[${new Date().toISOString()}] Table 'users' ensured.`)
  );
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, password, encryptedVault } = req.body;
  console.log(`[${new Date().toISOString()}] Signup attempt: user=${username}`);
  if (!username || !password || !encryptedVault) {
    console.log(`[${new Date().toISOString()}] Signup failed: Missing fields for user=${username}`);
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, passwordHash, vault) VALUES (?, ?, ?)');
    stmt.run(username, hash, encryptedVault, function (err) {
      if (err) {
        console.log(`[${new Date().toISOString()}] Signup failed: Username exists user=${username}`);
        return res.status(409).json({ error: 'Username already exists' });
      }
      console.log(`[${new Date().toISOString()}] Signup successful: user=${username}`);
      res.json({ success: true });
    });
    stmt.finalize();
  } catch (e) {
    console.log(`[${new Date().toISOString()}] Signup error: user=${username} error=${e.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[${new Date().toISOString()}] Login attempt: user=${username}`);
  if (!username || !password) {
    console.log(`[${new Date().toISOString()}] Login failed: Missing fields for user=${username}`);
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.get('SELECT passwordHash, vault FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.log(`[${new Date().toISOString()}] Login error: user=${username} db-error=${err.message}`);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!row) {
      console.log(`[${new Date().toISOString()}] Login failed: User not found user=${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, row.passwordHash);
    if (!match) {
      console.log(`[${new Date().toISOString()}] Login failed: Wrong password user=${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(`[${new Date().toISOString()}] Login successful: user=${username}`);
    res.json({ encryptedVault: row.vault });
  });
});

// Update vault endpoint
app.post('/vault', (req, res) => {
  const { username, encryptedVault } = req.body;
  console.log(`[${new Date().toISOString()}] Vault update attempt: user=${username}`);
  if (!username || !encryptedVault) {
    console.log(`[${new Date().toISOString()}] Vault update failed: Missing fields user=${username}`);
    return res.status(400).json({ error: 'Missing fields' });
  }
  const stmt = db.prepare('UPDATE users SET vault = ? WHERE username = ?');
  stmt.run(encryptedVault, username, function (err) {
    if (err) {
      console.log(`[${new Date().toISOString()}] Vault update error: user=${username} error=${err.message}`);
      return res.status(500).json({ error: 'Server error' });
    }
    if (this.changes === 0) {
      console.log(`[${new Date().toISOString()}] Vault update failed: User not found user=${username}`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`[${new Date().toISOString()}] Vault update successful: user=${username}`);
    res.json({ success: true });
  });
  stmt.finalize();
});

app.listen(PORT, () => console.log(`[${new Date().toISOString()}] SecurePass server running on port ${PORT}`));

