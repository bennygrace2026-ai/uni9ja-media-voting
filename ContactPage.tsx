import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import SEO from '../components/SEO';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [settings, setSettings] = useState<any>({});

  React.useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to send message');
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO 
        title="Contact Us & Support"
        description="Connect with UNI9JA MEDIA. Reach out for sponsorships, questions, partner integrations, or technical support on the platform."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-6">Get in Touch</h1>
          <p className="text-neutral-600 mb-8 leading-relaxed">Have questions about the competition, sponsorship, or partnerships? Reach out to us directly through any of our channels or send a message below.</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 text-[#D60000] p-3 rounded-full"><MapPin className="w-6 h-6" /></div>
              <div><h4 className="font-bold text-neutral-900">Address</h4><p className="text-neutral-600">{settings?.site_address || 'Lagos, Nigeria'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-50 text-[#D60000] p-3 rounded-full"><Phone className="w-6 h-6" /></div>
              <div><h4 className="font-bold text-neutral-900">Phone</h4><p className="text-neutral-600">{settings?.site_phone || '+234 123 456 7890'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-50 text-[#D60000] p-3 rounded-full"><Mail className="w-6 h-6" /></div>
              <div><h4 className="font-bold text-neutral-900">Email</h4><p className="text-neutral-600">{settings?.site_email || 'hello@uni9jamedia.com'}</p></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'success' && <div className="p-4 bg-green-50 text-green-700 rounded-xl mb-4">Message sent successfully!</div>}
            {status === 'error' && <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-4">Failed to send message.</div>}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Your Name</label>
              <input required type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Email Address</label>
              <input required type="email" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Message</label>
              <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
            </div>
            <button type="submit" disabled={status === 'sending'} className="w-full py-4 bg-[#D60000] hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2">
              <Send className="w-5 h-5" /> {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
