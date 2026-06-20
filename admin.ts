import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { sendVoteReceipt } from '../email.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const adminAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') throw new Error('Not admin');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Forbidden' });
  }
};

router.use(adminAuth);

router.get('/stats', async (req, res) => {
  const db = getDb();
  try {
    const totalContestants = await db.prepare('SELECT COUNT(*) as count FROM contestants').get() as any;
    const totalVotes = await db.prepare("SELECT COALESCE(SUM(amount), 0) as count FROM votes WHERE status='success'").get() as any;
    const revenue = await db.prepare("SELECT COALESCE(SUM(price_paid), 0) as sum FROM votes WHERE status='success'").get() as any;
    
    res.json({
      totalContestants: totalContestants?.count || 0,
      totalVotes: totalVotes?.count || 0,
      revenue: revenue?.sum || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/contestants', async (req, res) => {
  const db = getDb();
  try {
    const contestants = await db.prepare(`
      SELECT c.*, u.name, u.email 
      FROM contestants c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(contestants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/contestants/:id/status', async (req, res) => {
  const { status } = req.body;
  const db = getDb();
  try {
    await db.prepare('UPDATE contestants SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Status updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/transactions', async (req, res) => {
  const db = getDb();
  try {
    // Get votes with contestant names
    const votes = await db.prepare(`
      SELECT v.*, u.name as contestant_name
      FROM votes v
      JOIN contestants c ON v.contestant_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY v.created_at DESC
    `).all();
    res.json(votes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transactions/:tx_ref/verify', async (req, res) => {
  const { status } = req.body; // 'success' or 'failed'
  const { tx_ref } = req.params;
  const db = getDb();
  
  try {
    let voteInfo: any = null;
    let contestantName = 'Unknown Contestant';

    await db.transaction(async () => {
      const vote = await db.prepare('SELECT * FROM votes WHERE tx_ref = ?').get(tx_ref) as any;
      if (!vote || vote.status !== 'pending') {
        throw new Error('Invalid or already processed transaction');
      }
      
      await db.prepare("UPDATE votes SET status = ? WHERE tx_ref = ?").run(status, tx_ref);
      
      if (status === 'success') {
        await db.prepare('UPDATE contestants SET total_votes = total_votes + ? WHERE id = ?').run(vote.amount, vote.contestant_id);
      }
      
      voteInfo = vote;
      
      const contestant = await db.prepare(`
        SELECT u.name 
        FROM contestants c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `).get(vote.contestant_id) as any;
      if (contestant) {
        contestantName = contestant.name;
      }
    })();
    
    if (status === 'success' && voteInfo && voteInfo.voter_email) {
      sendVoteReceipt(
        voteInfo.voter_email,
        voteInfo.voter_name || 'Supporter',
        voteInfo.amount,
        Number(voteInfo.price_paid),
        contestantName,
        tx_ref
      ).catch(err => console.error('[EMAIL ERROR]', err));
    }
    
    res.json({ message: `Payment ${status} successfully.` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/competitions/active', async (req, res) => {
  const db = getDb();
  try {
    const comp = await db.prepare('SELECT * FROM competitions WHERE is_active = 1 LIMIT 1').get();
    res.json(comp || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/competitions/active', async (req, res) => {
  const { title, start_date, end_date } = req.body;
  const db = getDb();
  try {
    const comp = await db.prepare('SELECT id FROM competitions WHERE is_active = 1 LIMIT 1').get() as any;
    if (comp) {
      await db.prepare('UPDATE competitions SET title = ?, start_date = ?, end_date = ? WHERE id = ?').run(title, start_date, end_date, comp.id);
    } else {
      await db.prepare('INSERT INTO competitions (title, start_date, end_date, is_active) VALUES (?, ?, ?, 1)').run(title, start_date, end_date);
    }
    res.json({ message: 'Competition updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CMS Routes
router.post('/blogs', async (req, res) => {
  const { title, content, image_url } = req.body;
  const db = getDb();
  try {
    const finalImageUrl = image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60';
    await db.prepare('INSERT INTO blogs (title, content, image_url) VALUES (?, ?, ?)').run(title, content, finalImageUrl);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/blogs/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.prepare('DELETE FROM blogs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/faqs', async (req, res) => {
  const { question, answer } = req.body;
  try {
    const db = getDb();
    await db.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)').run(question, answer);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/faqs/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/contacts', async (req, res) => {
  try {
    const db = getDb();
    const contacts = await db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json(contacts);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/contacts/:id/read', async (req, res) => {
  try {
    const db = getDb();
    await db.prepare("UPDATE contacts SET status = 'read' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    const db = getDb();
    await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/reset-dashboard', async (req, res) => {
  const db = getDb();
  try {
    await db.transaction(async () => {
      await db.prepare('DELETE FROM votes').run();
      await db.prepare('DELETE FROM contestants').run();
      await db.prepare("DELETE FROM users WHERE role = 'contestant'").run();
      await db.prepare('DELETE FROM competitions').run();
      
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await db.prepare('INSERT INTO competitions (title, start_date, end_date, is_active) VALUES (?, ?, ?, ?)').run(
        'Face of the Week - Week 1',
        now.toISOString(),
        nextWeek.toISOString(),
        1
      );
    })();
    res.json({ message: 'Dashboard reset successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clear-contestants', async (req, res) => {
  const db = getDb();
  try {
    await db.transaction(async () => {
      await db.prepare('DELETE FROM votes').run();
      await db.prepare('DELETE FROM contestants').run();
      await db.prepare("DELETE FROM users WHERE role = 'contestant'").run();
    })();
    res.json({ message: 'All contestants cleared successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clear-votes', async (req, res) => {
  const db = getDb();
  try {
    await db.transaction(async () => {
      await db.prepare('DELETE FROM votes').run();
      await db.prepare('UPDATE contestants SET total_votes = 0').run();
    })();
    res.json({ message: 'All payments and votes cleared successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
