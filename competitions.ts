import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

router.get('/active', async (req, res) => {
  const db = getDb();
  try {
    const comp = await db.prepare('SELECT * FROM competitions WHERE is_active = 1 LIMIT 1').get();
    if (!comp) return res.status(404).json({ error: 'No active competition' });
    res.json(comp);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
