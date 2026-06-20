import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const db = getDb();
  const contestants = await db.prepare(`
    SELECT c.*, u.name, u.email 
    FROM contestants c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'approved'
    ORDER BY c.total_votes DESC
  `).all();
  res.json(contestants);
});

router.get('/:id', async (req, res) => {
  const db = getDb();
  const contestant = await db.prepare(`
    SELECT c.*, u.name, u.email 
    FROM contestants c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(req.params.id);
  if (!contestant) return res.status(404).json({ error: 'Not found' });
  res.json(contestant);
});

export default router;
