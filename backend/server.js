import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, initDb } from './db.js';
import { authenticate, isAdmin } from './middleware/auth.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Optional auth middleware
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
  } catch (ex) {
    req.user = null;
  }
  next();
};

const dataDir = path.join(__dirname, '..', 'data');
const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Initialize DB
initDb().then(() => {
  console.log('Database initialized');
}).catch(err => console.error(err));

// Health/status endpoint
app.get('/api/status', async (req, res) => {
  await db.read();
  const hasUsers = !!(db.data.users && db.data.users.length > 0);
  res.json({ hasUsers });
});

// Auth Routes
app.post('/api/register-first', async (req, res) => {
  await db.read();
  const { username, password } = req.body;
  if (db.data.users.length > 0) {
    return res.status(400).json({ error: 'First user already registered' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), username, password: hashedPassword, isAdmin: true, storageCap: 500, storageCapEnabled: true };
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json({ message: 'Admin user created successfully' });
});

app.post('/api/login', async (req, res) => {
  await db.read();
  const { username, password } = req.body;
  const user = db.data.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Invalid username or password' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

  const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' });
  res.json({ token, isAdmin: user.isAdmin, username: user.username });
});

// Admin Routes
app.put('/api/admin/users/:id/cap', authenticate, isAdmin, async (req, res) => {
  await db.read();
  const { id } = req.params;
  const { capMB, storageCapEnabled } = req.body;

  const user = db.data.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (capMB !== undefined) {
    if (typeof capMB !== 'number' || capMB <= 0) {
      return res.status(400).json({ error: 'Invalid capMB value' });
    }
    user.storageCap = capMB;
  }

  if (storageCapEnabled !== undefined) {
    if (typeof storageCapEnabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid storageCapEnabled value' });
    }
    user.storageCapEnabled = storageCapEnabled;
  }

  await db.write();
  res.json({ message: 'Storage cap updated', user: { username: user.username, storageCap: user.storageCap, storageCapEnabled: user.storageCapEnabled } });
});

app.post('/api/admin/users', authenticate, isAdmin, async (req, res) => {
  await db.read();
  const { username, password, isAdminUser } = req.body;
  if (db.data.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), username, password: hashedPassword, isAdmin: !!isAdminUser, storageCap: 500, storageCapEnabled: true };
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json({ message: 'User created successfully', user: { username: newUser.username, isAdmin: newUser.isAdmin } });
});

// User Settings Routes
app.put('/api/users/username', authenticate, async (req, res) => {
  await db.read();
  const { newUsername } = req.body;
  if (!newUsername || newUsername.trim() === '') return res.status(400).json({ error: 'Invalid username' });
  
  if (db.data.users.find(u => u.username === newUsername)) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const oldUsername = user.username;
  user.username = newUsername;

  // Update uploadedBy in files
  db.data.files.forEach(f => {
    if (f.uploadedBy === oldUsername) {
      f.uploadedBy = newUsername;
    }
  });

  await db.write();
  const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' });
  res.json({ message: 'Username updated', token, username: user.username });
});

app.put('/api/users/password', authenticate, async (req, res) => {
  await db.read();
  const { currentPassword, newPassword } = req.body;
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const validPassword = await bcrypt.compare(currentPassword, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Incorrect current password' });

  user.password = await bcrypt.hash(newPassword, 10);
  await db.write();
  res.json({ message: 'Password updated successfully' });
});

// File Routes
app.post('/api/files', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Enforce per‑user storage cap (optional)
  const userRecord = db.data.users.find(u => u.username === req.user.username);
  const capEnabled = userRecord?.storageCapEnabled ?? true;
  const capBytes = capEnabled ? (userRecord?.storageCap ?? 500) * 1024 * 1024 : Infinity;
  const usedBytes = db.data.files
    .filter(f => f.uploadedBy === req.user.username)
    .reduce((sum, f) => sum + f.size, 0);
  if (usedBytes + req.file.size > capBytes) {
    // Delete the newly saved file to avoid orphaned data
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: `Storage cap exceeded. Max ${userRecord.storageCap} MB allowed.` });
  }

  const { visibility } = req.body;
  const newFile = {
    id: uuidv4(),
    filename: req.file.originalname,
    storedName: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedBy: req.user.username,
    uploadDate: new Date().toISOString(),
    visibility: visibility
  };
  db.data.files.push(newFile);
  await db.write();
  res.status(201).json(newFile);
});

app.get('/api/files', authenticate, async (req, res) => {
  await db.read();
  let files = db.data.files;
  if (!req.user.isAdmin) {
    files = files.filter(f => f.uploadedBy === req.user.username);
  }
  res.json(files);
});

app.get('/api/public/files', async (req, res) => {
  await db.read();
  const publicFiles = db.data.files.filter(f => f.visibility === 'public');
  res.json(publicFiles);
});

app.get('/api/files/:id/metadata', optionalAuth, async (req, res) => {
  await db.read();
  const file = db.data.files.find(f => f.id === req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  
  if (file.visibility === 'private') {
    if (!req.user || (file.uploadedBy !== req.user.username && !req.user.isAdmin)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  // Return safe metadata without storedName
  res.json({
    id: file.id,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    uploadedBy: file.uploadedBy,
    uploadDate: file.uploadDate,
    visibility: file.visibility
  });
});

app.get('/api/files/:id/download', optionalAuth, async (req, res) => {
  await db.read();
  const file = db.data.files.find(f => f.id === req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  
  if (file.visibility === 'private') {
    if (!req.user || (file.uploadedBy !== req.user.username && !req.user.isAdmin)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  const filePath = path.join(uploadDir, file.storedName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });

  res.download(filePath, file.filename);
});

app.delete('/api/files/:id', authenticate, async (req, res) => {
  await db.read();
  const fileIndex = db.data.files.findIndex(f => f.id === req.params.id);
  if (fileIndex === -1) return res.status(404).json({ error: 'File not found' });

  const file = db.data.files[fileIndex];
  
  // Only the uploader or an admin can delete a file
  if (file.uploadedBy !== req.user.username && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const filePath = path.join(uploadDir, file.storedName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.data.files.splice(fileIndex, 1);
  await db.write();
  res.json({ message: 'File deleted successfully' });
});

app.put('/api/files/:id/visibility', authenticate, async (req, res) => {
  await db.read();
  const file = db.data.files.find(f => f.id === req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  if (file.uploadedBy !== req.user.username && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { visibility } = req.body;
  if (!['public', 'private', 'unlisted'].includes(visibility)) {
    return res.status(400).json({ error: 'Invalid visibility' });
  }

  file.visibility = visibility;
  await db.write();
  res.json(file);
});

app.get('/api/users/me', authenticate, async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const capMB = user.storageCap ?? 500;
  res.json({ username: user.username, storageCap: capMB });
});

// Delete own account
app.delete('/api/users/me', authenticate, async (req, res) => {
  await db.read();
  const userIndex = db.data.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  // Optionally remove files owned by this user
  db.data.files = db.data.files.filter(f => f.uploadedBy !== req.user.username);
  db.data.users.splice(userIndex, 1);
  await db.write();
  res.json({ message: 'Account deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
