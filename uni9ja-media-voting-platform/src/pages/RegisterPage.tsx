import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import SEO from '../components/SEO';

import { apiFetch } from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', institution: '', department: '', level: '', bio: '', photo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const btn = document.getElementById('reg_btn');
      if (btn) btn.innerHTML = 'Registration successful! Logging you in...';
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 relative">
      <SEO 
        title="Register as active contestant"
        description="Join the UNI9JA MEDIA competition! Sign up, tell us about your college department or institution, upload your best profile photo, and start gathering votes."
      />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#D60000] -z-10 clip-path-slant rounded-b-[4rem]"></div>
      
      <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-neutral-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-neutral-900">Contestant Registration</h2>
          <p className="mt-2 text-neutral-500">Sign up to become the next Face of the Week.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Full Name</label>
              <input required type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Email Address</label>
              <input required type="email" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Password</label>
              <input required type="password" minLength={6} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Institution</label>
              <input required type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" placeholder="University / Polytechnic" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Department</label>
              <input required type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">Level / Year</label>
              <select required className="w-full px-4 py-3 bg-white rounded-xl border border-neutral-300 focus:ring-[#D60000]" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                <option value="">Select Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500+ Level</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Profile Photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 hover:border-[#D60000] transition-colors">
              <div className="relative group flex-shrink-0">
                {formData.photo_url ? (
                  <img 
                    src={formData.photo_url} 
                    alt="Uploaded preview" 
                    className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-white shadow-md ring-4 ring-green-100" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-neutral-200 flex items-center justify-center border border-neutral-300">
                    <Camera className="w-8 h-8 text-neutral-400" />
                  </div>
                )}
                {loading && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <p className="text-sm font-medium text-neutral-800">
                  {formData.photo_url ? 'Change your profile picture' : 'Upload a profile photo'}
                </p>
                <div className="relative inline-block w-full">
                  <input 
                    required={!formData.photo_url} 
                    type="file" 
                    id="contestant-photo-upload"
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const formDataUpload = new FormData();
                        formDataUpload.append('file', file);
                        try {
                          setLoading(true);
                          const data = await apiFetch('/api/upload', { method: 'POST', body: formDataUpload });
                          setFormData({...formData, photo_url: data.url});
                        } catch (err: any) {
                          setError('Image upload failed: ' + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }} 
                  />
                  <label 
                    htmlFor="contestant-photo-upload" 
                    className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 select-none cursor-pointer transition-colors shadow-sm"
                  >
                    Select Image File
                  </label>
                </div>
                {formData.photo_url ? (
                  <p className="text-xs text-green-600 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    Photo uploaded successfully!
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500">JPG, PNG or GIF. Square crops work best.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1">Biography</label>
            <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" placeholder="Tell us about yourself and why you should be Face of the Week..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
          </div>

          <button id="reg_btn" type="submit" disabled={loading} className="w-full py-4 bg-[#D60000] hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors">
            {loading ? 'Submitting...' : 'Register as Contestant'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-600">
          Already have an account? <Link to="/login" className="font-bold text-[#D60000] hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
