import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

router.post('/initialize', async (req, res) => {
  // Saving the proof of payment
  const { contestant_id, amount, price, voter_name, voter_email, proof_url } = req.body;
  const db = getDb();
  
  try {
    // Check if competition is active and hasn't ended
    const comp = await db.prepare('SELECT * FROM competitions WHERE is_active = 1 LIMIT 1').get() as any;
    if (!comp) {
      return res.status(400).json({ error: 'Voting is locked/closed as there is no active competition.' });
    }
    
    const now = new Date();
    const startDate = new Date(comp.start_date);
    const endDate = new Date(comp.end_date);
    
    if (now < startDate) {
      return res.status(400).json({ error: 'Voting has not started yet.' });
    }
    
    if (now > endDate) {
      return res.status(400).json({ error: 'Voting has ended. The system is locked.' });
    }

    const tx_ref = 'UNI9JA-' + Date.now() + Math.random().toString(36).substring(7);
  
    await db.prepare(`
      INSERT INTO votes (contestant_id, amount, price_paid, voter_name, voter_email, tx_ref, proof_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(contestant_id, amount, price, voter_name, voter_email, tx_ref, proof_url);
    
    // Return tx_ref
    res.json({ tx_ref, authorization_url: `/payment/mock?tx_ref=${tx_ref}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', (req, res) => {
  const { tx_ref } = req.body;
  
  // Notice: We don't instantly approve and add votes anymore. 
  // Admin will manually verify via the dashboard.
  try {
    res.json({ message: 'Payment submitted for verification successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
