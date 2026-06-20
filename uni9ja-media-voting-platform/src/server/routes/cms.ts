import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

router.get('/faqs', async (req, res) => {
  const db = getDb();
  try {
    const data = await db.prepare('SELECT * FROM faqs ORDER BY created_at ASC').all();
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/blogs', async (req, res) => {
  const db = getDb();
  try {
    const data = await db.prepare('SELECT * FROM blogs ORDER BY created_at DESC').all();
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/contacts', async (req, res) => {
  const { name, email, message } = req.body;
  const db = getDb();
  try {
    await db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/settings', async (req, res) => {
  const db = getDb();
  try {
    const data = await db.prepare('SELECT * FROM settings').all() as any[];
    const settingsObj = data.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
    res.json(settingsObj);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
