import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Award, Share2, Copy, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [ranking, setRanking] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user profile');
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          if (data.user.ranking !== undefined) {
            setRanking(data.user.ranking);
          }
          // Sync with localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch(err => {
        console.error(err);
        // Fallback to localStorage if server fails or offline
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (user && user.role !== 'contestant') return <Navigate to="/admin" replace />;

  if (isLoading || !user || !user.contestant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="space-y-3 w-full md:w-1/3">
            <div className="h-8 bg-neutral-200 rounded-2xl w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded-xl w-1/2"></div>
          </div>
          <div className="h-10 bg-neutral-200 rounded-xl w-32"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-2xl animate-pulse"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-neutral-100 rounded-lg w-1/3"></div>
                <div className="h-7 bg-neutral-200 rounded-lg w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <div className="h-6 bg-neutral-200 rounded-xl w-1/3"></div>
              <div className="h-4 bg-neutral-100 rounded-lg w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-12 bg-neutral-100 rounded-xl flex-1"></div>
                <div className="h-12 bg-neutral-200 rounded-xl w-24"></div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div className="h-6 bg-neutral-200 rounded-xl w-1/2"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="h-3 bg-neutral-100 rounded w-1/4"></div>
                    <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const c = user.contestant;
  const profileUrl = `${window.location.origin}/contestants/${c.id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Contestant Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back, {user.name}!</p>
        </div>
        {c.status === 'pending' && (
          <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5" /> Account Pending Approval
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-4 rounded-2xl text-[#D60000]"><Award className="w-8 h-8" /></div>
          <div>
            <div className="text-sm text-neutral-500 font-medium mb-1">Total Votes</div>
            <div className="text-3xl font-black text-neutral-900">{c.total_votes}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><TrendingUp className="w-8 h-8" /></div>
          <div>
            <div className="text-sm text-neutral-500 font-medium mb-1">Current Ranking</div>
            <div className="text-3xl font-black text-neutral-900"># {ranking !== null ? ranking : '?'}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-2xl text-green-600"><BarChart3 className="w-8 h-8" /></div>
          <div>
            <div className="text-sm text-neutral-500 font-medium mb-1">Status</div>
            <div className="text-3xl font-black text-neutral-900 capitalize">{c.status}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Share Your Profile</h2>
            <p className="text-neutral-500 mb-6">Share your unique profile link to gather votes from your supporters.</p>
            <div className="flex">
              <input type="text" readOnly value={profileUrl} className="flex-1 bg-neutral-50 border border-neutral-200 rounded-l-xl px-4 py-3 text-neutral-700 outline-none" />
              <button onClick={(e) => { 
                navigator.clipboard.writeText(profileUrl); 
                const el = e.currentTarget; 
                const orig = el.innerHTML; 
                el.innerHTML = '<span class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!</span>'; 
                setTimeout(() => el.innerHTML = orig, 2000); 
              }} className="whitespace-nowrap bg-[#D60000] hover:bg-red-700 text-white px-6 py-3 rounded-r-xl font-bold flex items-center gap-2 transition-colors">
                <Copy className="w-5 h-5" /> Copy
              </button>
            </div>
            
            <div className="mt-8">
               <Link to={`/contestants/${c.id}`} className="text-[#D60000] font-semibold hover:underline">View Public Profile &rarr;</Link>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
             <h2 className="text-xl font-bold text-neutral-900 mb-4">Profile Details</h2>
             <div className="space-y-4">
               <div>
                  <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Institution</div>
                  <div className="font-medium">{c.institution}</div>
               </div>
               <div>
                  <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Department</div>
                  <div className="font-medium">{c.department}</div>
               </div>
               <div>
                  <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Level</div>
                  <div className="font-medium">{c.level}L</div>
               </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
