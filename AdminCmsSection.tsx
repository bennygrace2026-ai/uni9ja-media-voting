import React, { useState, useEffect } from 'react';

export default function AdminCmsSection() {
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [rulesGeneral, setRulesGeneral] = useState('');
  const [rulesContestant, setRulesContestant] = useState('');
  const [rulesVoting, setRulesVoting] = useState('');
  const [voteCost, setVoteCost] = useState('100');
  const [homeImage, setHomeImage] = useState('');
  
  // Payment Config
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Site Details
  const [siteAddress, setSiteAddress] = useState('');
  const [sitePhone, setSitePhone] = useState('');
  const [siteEmail, setSiteEmail] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialTikTok, setSocialTikTok] = useState('');

  // Blog Form
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  
  // FAQ Form
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  const showMessage = (text: string, type: 'success'|'error' = 'success') => {
    setMessage({text, type});
    setTimeout(() => setMessage(null), 3000);
  };

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'blogs') {
        const res = await fetch('/api/blogs');
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      } else if (activeTab === 'faqs') {
        const res = await fetch('/api/faqs');
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } else if (activeTab === 'contacts') {
        const res = await fetch('/api/admin/contacts', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'rules') {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setRulesGeneral(data.rules_general || '');
        setRulesContestant(data.rules_contestant || '');
        setRulesVoting(data.rules_voting || '');
        setVoteCost(data.vote_cost || '100');
      } else if (activeTab === 'home_config') {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setHomeImage(data.home_image || '');
      } else if (activeTab === 'payment_config') {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setBankName(data.bank_name || '');
        setAccountName(data.account_name || '');
        setAccountNumber(data.account_number || '');
      } else if (activeTab === 'site_details') {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSiteAddress(data.site_address || '');
        setSitePhone(data.site_phone || '');
        setSiteEmail(data.site_email || '');
        setSocialFacebook(data.social_facebook || '');
        setSocialInstagram(data.social_instagram || '');
        setSocialTwitter(data.social_twitter || '');
        setSocialTikTok(data.social_tiktok || '');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const createBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: blogTitle, content: blogContent, image_url: blogImage })
      });
      setBlogTitle(''); setBlogContent(''); setBlogImage('');
      fetchData();
      showMessage('Blog post published successfully!');
    } catch { showMessage('Failed to publish', 'error'); }
  };

  const deleteBlog = async (id: number) => {
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      showMessage('Blog post deleted');
    } catch { showMessage('Error deleting', 'error'); }
  };

  const createFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: faqQ, answer: faqA })
      });
      setFaqQ(''); setFaqA('');
      fetchData();
      showMessage('FAQ added');
    } catch { showMessage('Failed to add FAQ', 'error'); }
  };

  const deleteFaq = async (id: number) => {
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  };

  const markContactRead = async (id: number) => {
    await fetch(`/api/admin/contacts/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  };

  const saveRules = async () => {
    try {
      const keys = {
        rules_general: rulesGeneral,
        rules_contestant: rulesContestant,
        rules_voting: rulesVoting,
        vote_cost: voteCost
      };
      for (const [key, value] of Object.entries(keys)) {
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key, value })
        });
      }
      showMessage('Rules and settings updated successfully!');
    } catch { showMessage('Failed to save rules', 'error'); }
  };

  const saveHomeConfig = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'home_image', value: homeImage })
      });
      showMessage('Home configuration updated successfully!');
    } catch { showMessage('Failed to save home config', 'error'); }
  };

  const savePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'bank_name', value: bankName })
      });
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'account_name', value: accountName })
      });
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'account_number', value: accountNumber })
      });
      showMessage('Payment account details updated successfully!');
    } catch { showMessage('Error updating payment config', 'error'); }
  };

  const saveSiteDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const keys = {
        site_address: siteAddress,
        site_phone: sitePhone,
        site_email: siteEmail,
        social_facebook: socialFacebook,
        social_instagram: socialInstagram,
        social_twitter: socialTwitter,
        social_tiktok: socialTikTok
      };
      for (const [key, value] of Object.entries(keys)) {
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key, value })
        });
      }
      showMessage('Site details updated successfully!');
    } catch { showMessage('Error updating site details', 'error'); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden mb-12">
      {message && (
        <div className={`p-4 font-medium border-b border-neutral-200 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <div className="p-4 sm:p-6 border-b border-neutral-200 flex flex-wrap gap-3 overflow-x-auto">
        <button onClick={() => setActiveTab('site_details')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'site_details' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Site Details</button>
        <button onClick={() => setActiveTab('blogs')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'blogs' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Manage Blogs</button>
        <button onClick={() => setActiveTab('faqs')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'faqs' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Manage FAQs</button>
        <button onClick={() => setActiveTab('rules')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'rules' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Manage Rules</button>
        <button onClick={() => setActiveTab('home_config')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'home_config' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Home Config</button>
        <button onClick={() => setActiveTab('payment_config')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'payment_config' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Payment Details</button>
        <button onClick={() => setActiveTab('contacts')} className={`px-4 py-2 font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'contacts' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>View Contacts</button>
      </div>

      <div className="p-6">
        {activeTab === 'site_details' && (
          <div className="max-w-2xl">
            <h3 className="font-bold text-lg mb-6">Edit Contact & Social Details</h3>
            <form onSubmit={saveSiteDetails} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-neutral-900 mb-3 border-b pb-2">Contact Info</h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-neutral-700">Email Address</label>
                  <input placeholder="hello@uni9jamedia.com" value={siteEmail} onChange={e => setSiteEmail(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-neutral-700">Phone Number</label>
                  <input placeholder="+234 ..." value={sitePhone} onChange={e => setSitePhone(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1 text-neutral-700">Physical Address</label>
                  <input placeholder="Lagos, Nigeria" value={siteAddress} onChange={e => setSiteAddress(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>

                <div className="md:col-span-2 mt-4">
                  <h4 className="font-semibold text-neutral-900 mb-3 border-b pb-2">Social Media Links</h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-neutral-700">Instagram URL</label>
                  <input placeholder="https://instagram.com/..." value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-neutral-700">Twitter (X) URL</label>
                  <input placeholder="https://twitter.com/..." value={socialTwitter} onChange={e => setSocialTwitter(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-neutral-700">Facebook URL</label>
                  <input placeholder="https://facebook.com/..." value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-neutral-700">TikTok URL</label>
                  <input placeholder="https://tiktok.com/..." value={socialTikTok} onChange={e => setSocialTikTok(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <button type="submit" className="w-full sm:w-auto bg-[#D60000] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 focus:outline-none mt-6">Save Site Details</button>
            </form>
          </div>
        )}

        {activeTab === 'home_config' && (
          <div className="max-w-xl bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-neutral-900 border-b pb-2">Set Promotional Image</h3>
            <div className="mb-6">
              {!homeImage ? (
                <>
                  <label className="block text-sm font-semibold mb-2 text-neutral-700">Upload Promotional Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-neutral-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-neutral-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-neutral-500">SVG, PNG, JPG or GIF</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error);
                          setHomeImage(data.url);
                        } catch (err: any) { showMessage('Image upload failed: ' + err.message, 'error'); }
                      }
                    }} />
                  </label>
                </>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-neutral-700">Current Promotional Image</label>
                    <button onClick={() => setHomeImage('')} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full transition-colors active:scale-95">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Delete & Reupload
                    </button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 shadow-sm mt-3">
                    <img src={homeImage} className="w-full h-auto max-h-64 object-cover" alt="Promotional" />
                  </div>
                </div>
              )}
            </div>
            <button onClick={saveHomeConfig} className="w-full bg-[#D60000] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 focus:outline-none">Save Changes</button>
          </div>
        )}

        {activeTab === 'payment_config' && (
          <div className="max-w-xl">
            <h3 className="font-bold text-lg mb-4">Edit Payment Account Details</h3>
            <form onSubmit={savePaymentConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-neutral-700">Bank Name</label>
                <input required placeholder="e.g. Guarantee Trust Bank (GTB)" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-neutral-700">Account Name</label>
                <input required placeholder="e.g. UNI9JA MEDIA" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-neutral-700">Account Number</label>
                <input required placeholder="e.g. 0123456789" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <button type="submit" className="w-full sm:w-auto bg-[#D60000] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 focus:outline-none mt-4">Save Payment Details</button>
            </form>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div>
            <form onSubmit={createBlog} className="mb-8 space-y-4 max-w-xl">
              <h3 className="font-bold text-lg">Add New Blog Post</h3>
              <input required placeholder="Blog Title" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
              <div>
                <label className="block text-sm font-semibold mb-1 text-neutral-700">Blog Cover Image</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      setBlogImage(data.url);
                    } catch (err: any) { showMessage('Image upload failed: ' + err.message, 'error'); }
                  }
                }} className="w-full px-4 py-2 border rounded-xl" />
                {blogImage && <p className="text-sm mt-1 text-green-600 font-medium">Image uploaded: {blogImage}</p>}
              </div>
              <textarea required rows={4} placeholder="Content" value={blogContent} onChange={e => setBlogContent(e.target.value)} className="w-full px-4 py-2 border rounded-xl"></textarea>
              <button type="submit" className="w-full sm:w-auto bg-[#D60000] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 focus:outline-none mt-2">Publish Post</button>
            </form>
            <div className="space-y-4">
              {blogs.map(b => (
                <div key={b.id} className="flex justify-between items-center p-4 border border-neutral-200 rounded-xl">
                  <div>
                    <h4 className="font-bold">{b.title}</h4>
                    <p className="text-sm text-neutral-500 truncate max-w-sm">{b.content}</p>
                  </div>
                  <button onClick={() => deleteBlog(b.id)} className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95 ml-4">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div>
            <form onSubmit={createFaq} className="mb-8 space-y-4 max-w-xl">
              <h3 className="font-bold text-lg">Add New FAQ</h3>
              <input required placeholder="Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
              <textarea required rows={3} placeholder="Answer" value={faqA} onChange={e => setFaqA(e.target.value)} className="w-full px-4 py-2 border rounded-xl"></textarea>
              <button type="submit" className="w-full sm:w-auto bg-[#D60000] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 focus:outline-none mt-2">Add FAQ</button>
            </form>
            <div className="space-y-4">
              {faqs.map(f => (
                <div key={f.id} className="flex justify-between p-4 border border-neutral-200 rounded-xl">
                  <div className="pr-4">
                    <h4 className="font-bold">{f.question}</h4>
                    <p className="text-sm text-neutral-600 mt-1">{f.answer}</p>
                  </div>
                  <button onClick={() => deleteFaq(f.id)} className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95 shrink-0 ml-4">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="max-w-4xl space-y-8">
            <div>
              <h3 className="font-bold text-lg mb-2">Vote Cost (in Naira)</h3>
              <input type="number" value={voteCost} onChange={e => setVoteCost(e.target.value)} className="w-full px-4 py-3 border border-neutral-300 rounded-xl max-w-sm focus:ring-[#D60000]" placeholder="e.g. 100" />
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-2">General Rules</h3>
              <textarea rows={5} value={rulesGeneral} onChange={e => setRulesGeneral(e.target.value)} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-mono text-sm leading-relaxed focus:ring-[#D60000]"></textarea>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Contestant Rules</h3>
              <textarea rows={5} value={rulesContestant} onChange={e => setRulesContestant(e.target.value)} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-mono text-sm leading-relaxed focus:ring-[#D60000]"></textarea>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Voting Rules</h3>
              <textarea rows={5} value={rulesVoting} onChange={e => setRulesVoting(e.target.value)} className="w-full px-4 py-3 border border-neutral-300 rounded-xl font-mono text-sm leading-relaxed focus:ring-[#D60000]"></textarea>
            </div>

            <button onClick={saveRules} className="w-full sm:w-auto bg-[#D60000] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 focus:outline-none">Save Rules & Settings</button>
            <p className="text-neutral-500 text-sm">These rules will be displayed on the homepage.</p>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {contacts.length === 0 && <p className="text-neutral-500">No messages yet.</p>}
            {contacts.map(c => (
              <div key={c.id} className={`p-4 border rounded-xl ${c.status === 'unread' ? 'bg-neutral-50 border-neutral-300' : 'bg-white border-neutral-200'}`}>
                <div className="flex justify-between mb-2">
                  <h4 className="font-bold">{c.name} <span className="font-normal text-neutral-500 ml-2">&lt;{c.email}&gt;</span></h4>
                  <span className="text-xs text-neutral-400">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-neutral-700 whitespace-pre-wrap">{c.message}</p>
                {c.status === 'unread' && (
                  <button onClick={() => markContactRead(c.id)} className="w-full sm:w-auto mt-4 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">Mark as read</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
