import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const db = getDb();
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ error: 'Unauthorized role check failed.' });
    }

    let contestantData = null;
    if (user.role === 'contestant') {
      contestantData = await db.prepare('SELECT * FROM contestants WHERE user_id = ?').get(user.id);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, contestant: contestantData } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = getDb();
    const user = await db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(decoded.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });

    let contestantData = null;
    let ranking = null;
    if (user.role === 'contestant') {
      contestantData = await db.prepare('SELECT * FROM contestants WHERE user_id = ?').get(user.id) as any;
      if (contestantData) {
        const allContestants = await db.prepare(`
          SELECT id, total_votes 
          FROM contestants 
          WHERE status = 'approved' OR id = ?
          ORDER BY total_votes DESC
        `).all(contestantData.id) as any[];
        const index = allContestants.findIndex((item: any) => item.id === contestantData.id);
        ranking = index !== -1 ? index + 1 : null;
      }
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, contestant: contestantData, ranking } });
  } catch (err: any) {
    res.status(401).json({ error: 'Session expired or invalid token' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, institution, department, level, bio, photo_url } = req.body;
    const db = getDb();
    
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Default to the first active competition
    const comp = await db.prepare('SELECT id FROM competitions WHERE is_active = 1 LIMIT 1').get() as any;
    const compId = comp ? comp.id : null;

    let userId: any;
    let contestantId: any;
    await db.transaction(async () => {
      const userResult = await db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hash, 'contestant');
      userId = userResult.lastInsertRowid;
      
      const contestantResult = await db.prepare('INSERT INTO contestants (user_id, competition_id, institution, department, level, bio, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)').run(userId, compId, institution, department, level, bio, photo_url);
      contestantId = contestantResult.lastInsertRowid;
    });

    const token = jwt.sign({ id: userId, role: 'contestant' }, JWT_SECRET, { expiresIn: '1d' });
    const contestantData = {
      id: contestantId,
      user_id: userId,
      competition_id: compId,
      institution,
      department,
      level,
      bio,
      photo_url,
      status: 'pending',
      total_votes: 0
    };

    res.status(201).json({ 
      message: 'Registration successful.', 
      token, 
      user: { id: userId, name, email, role: 'contestant', contestant: contestantData } 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
