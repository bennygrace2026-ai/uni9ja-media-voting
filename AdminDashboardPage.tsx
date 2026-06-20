import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Vote, DollarSign, CheckCircle } from 'lucide-react';
import AdminCmsSection from '../components/AdminCmsSection';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalContestants: 0, totalVotes: 0, revenue: 0 });
  const [contestants, setContestants] = useState([]);
  const [authError, setAuthError] = useState(false);
  const [activeComp, setActiveComp] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);
  const [voteCost, setVoteCost] = useState('100');
  const [isLoading, setIsLoading] = useState(true);

  const showMessage = (text: string, type: 'success'|'error' = 'success') => {
    setMessage({text, type});
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthError(true); return; }

    setIsLoading(true);

    Promise.all([
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => { if (!res.ok) throw new Error('Auth'); return res.json(); })
        .then(data => setStats(data)),

      fetch('/api/admin/contestants', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setContestants(data || [])),

      fetch('/api/admin/transactions', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setVotes(data || [])),

      fetch('/api/admin/competitions/active', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setActiveComp(data)),

      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.vote_cost) setVoteCost(data.vote_cost);
        })
    ])
    .catch((err) => {
      console.error(err);
      if (err.message === 'Auth') {
        setAuthError(true);
      }
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  const verifyVote = async (tx_ref: string, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/transactions/${tx_ref}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error(await res.text());
      showMessage(`Payment marked as ${status}`);
    } catch (err: any) {
      showMessage(err.message || 'Error updating transaction', 'error');
    }
    // Refresh stats & votes & contestants
    const resStats = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
    if (resStats.ok) setStats(await resStats.json());
    const resVotes = await fetch('/api/admin/transactions', { headers: { Authorization: `Bearer ${token}` } });
    if (resVotes.ok) setVotes(await resVotes.json());
    const resCont = await fetch('/api/admin/contestants', { headers: { Authorization: `Bearer ${token}` } });
    if (resCont.ok) setContestants(await resCont.json());
  };

  const saveCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin/competitions/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(activeComp)
      });
      showMessage('Competition settings saved successfully.');
    } catch (err: any) {
      showMessage('Error saving settings', 'error');
    }
  };

  const saveVoteCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'vote_cost', value: voteCost })
      });
      showMessage('Vote cost updated successfully.');
    } catch (err: any) {
      showMessage('Error saving vote cost', 'error');
    }
  };

  const [isResettingDashboard, setIsResettingDashboard] = useState(false);
  const [isClearingContestants, setIsClearingContestants] = useState(false);
  const [isClearingVotes, setIsClearingVotes] = useState(false);

  const resetDashboard = async () => {
    setIsResettingDashboard(true);
    // Optimistic fast UI updates
    setStats({ totalContestants: 0, totalVotes: 0, revenue: 0 });
    setContestants([]);
    setVotes([]);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/reset-dashboard', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      showMessage('Dashboard reset successfully.');
      
      // Refresh all
      const resStats = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (resStats.ok) setStats(await resStats.json());
      const resVotes = await fetch('/api/admin/transactions', { headers: { Authorization: `Bearer ${token}` } });
      if (resVotes.ok) setVotes(await resVotes.json());
      const resCont = await fetch('/api/admin/contestants', { headers: { Authorization: `Bearer ${token}` } });
      if (resCont.ok) setContestants(await resCont.json());
      const resComp = await fetch('/api/admin/competitions/active', { headers: { Authorization: `Bearer ${token}` } });
      if (resComp.ok) setActiveComp(await resComp.json());
      
    } catch (err: any) {
      showMessage(err.message || 'Error resetting dashboard', 'error');
    } finally {
      setIsResettingDashboard(false);
    }
  };

  const clearContestantsData = async () => {
    setIsClearingContestants(true);
    // Optimistic fast UI updates
    setStats(prev => ({ ...prev, totalContestants: 0, totalVotes: 0, revenue: 0 }));
    setContestants([]);
    setVotes([]);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/clear-contestants', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      showMessage('Contestants cleared successfully.');
      
      // Refresh all
      const resStats = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (resStats.ok) setStats(await resStats.json());
      const resVotes = await fetch('/api/admin/transactions', { headers: { Authorization: `Bearer ${token}` } });
      if (resVotes.ok) setVotes(await resVotes.json());
      const resCont = await fetch('/api/admin/contestants', { headers: { Authorization: `Bearer ${token}` } });
      if (resCont.ok) setContestants(await resCont.json());
    } catch (err: any) {
      showMessage(err.message || 'Error clearing contestants', 'error');
    } finally {
      setIsClearingContestants(false);
    }
  };

  const clearVotesData = async () => {
    setIsClearingVotes(true);
    // Optimistic fast UI updates
    setStats(prev => ({ ...prev, totalVotes: 0, revenue: 0 }));
    setVotes([]);
    setContestants(prev => prev.map((c: any) => ({ ...c, total_votes: 0 })));

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/clear-votes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      showMessage('Payments and votes cleared successfully.');
      
      // Refresh all
      const resStats = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (resStats.ok) setStats(await resStats.json());
      const resVotes = await fetch('/api/admin/transactions', { headers: { Authorization: `Bearer ${token}` } });
      if (resVotes.ok) setVotes(await resVotes.json());
      const resCont = await fetch('/api/admin/contestants', { headers: { Authorization: `Bearer ${token}` } });
      if (resCont.ok) setContestants(await resCont.json());
    } catch (err: any) {
      showMessage(err.message || 'Error clearing payments and votes', 'error');
    } finally {
      setIsClearingVotes(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/admin/contestants/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      showMessage(`Contestant status changed to ${status}`);
    } catch (err: any) {
      showMessage('Error updating status', 'error');
    }
    // Refresh contestants
    fetch('/api/admin/contestants', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setContestants(data || []));
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (authError || !user || user.role !== 'admin') return <Navigate to="/admin-login" replace />;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        {/* Title & Reset Button Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="h-8 bg-neutral-200 rounded-2xl w-1/3"></div>
          <div className="h-10 bg-neutral-200 rounded-xl w-full md:w-56 animate-pulse"></div>
        </div>

        {/* 3 Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-2xl animate-pulse"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-neutral-100 rounded-lg w-1/3 animate-pulse"></div>
                <div className="h-7 bg-neutral-200 rounded-lg w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Competition Settings Block Skeleton */}
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden mb-12 shadow-sm animate-pulse">
          <div className="p-6 border-b border-neutral-200 bg-neutral-50/50">
            <div className="h-6 bg-neutral-200 rounded-lg w-1/4"></div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-1/3"></div>
                  <div className="h-10 bg-neutral-150 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contestants Table Skeleton */}
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm mb-12 pb-4 animate-pulse">
          <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
            <div className="h-6 bg-neutral-200 rounded-lg w-1/4"></div>
            <div className="h-8 bg-neutral-200 rounded-xl w-32 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-5">
            {[1, 2, 3].map((k) => (
              <div key={k} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-none">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-neutral-100 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-4 bg-neutral-200 rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-neutral-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-9 bg-neutral-205 rounded-lg w-28 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Admin Dashboard</h1>
        <button 
          onClick={resetDashboard} 
          disabled={isResettingDashboard}
          className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all border shadow-sm active:scale-95 ${
            isResettingDashboard 
              ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed animate-pulse' 
              : 'bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 border-red-200'
          }`}
        >
          {isResettingDashboard ? 'Resetting...' : 'Reset Dashboard Data'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 p-4 rounded-2xl text-purple-600"><Users className="w-8 h-8" /></div>
          <div>
            <div className="text-sm text-neutral-500 font-medium mb-1">Total Contestants</div>
            <div className="text-3xl font-black text-neutral-900">{stats.totalContestants}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><Vote className="w-8 h-8" /></div>
          <div>
            <div className="text-sm text-neutral-500 font-medium mb-1">Total Votes</div>
            <div className="text-3xl font-black text-neutral-900">{stats.totalVotes}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-2xl text-green-600"><DollarSign className="w-8 h-8" /></div>
          <div>
             <div className="text-sm text-neutral-500 font-medium mb-1">Revenue</div>
             <div className="text-3xl font-black text-neutral-900 font-mono">₦{stats.revenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden mb-12">
        <div className="p-6 border-b border-neutral-200">
           <h2 className="text-xl font-bold text-neutral-900">Manage Competition Settings</h2>
        </div>
        <div className="p-6">
           {activeComp ? (
             <form onSubmit={saveCompetition} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
               <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1">Competition Title</label>
                  <input type="text" value={activeComp.title || ''} onChange={e => setActiveComp({...activeComp, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1">Start Date</label>
                  <input type="datetime-local" value={activeComp.start_date?.slice(0, 16) || ''} onChange={e => {
                     const val = e.target.value;
                     if (!val) {
                       setActiveComp({...activeComp, start_date: ''});
                     } else {
                       const d = new Date(val);
                       if (!isNaN(d.getTime())) {
                         setActiveComp({...activeComp, start_date: d.toISOString()});
                       } else {
                         setActiveComp({...activeComp, start_date: val});
                       }
                     }
                   }} className="w-full px-4 py-2 border rounded-xl" required />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1">End Date</label>
                  <input type="datetime-local" value={activeComp.end_date?.slice(0, 16) || ''} onChange={e => {
                     const val = e.target.value;
                     if (!val) {
                       setActiveComp({...activeComp, end_date: ''});
                     } else {
                       const d = new Date(val);
                       if (!isNaN(d.getTime())) {
                         setActiveComp({...activeComp, end_date: d.toISOString()});
                       } else {
                         setActiveComp({...activeComp, end_date: val});
                       }
                     }
                   }} className="w-full px-4 py-2 border rounded-xl" required />
               </div>
                <div className="md:col-span-3 flex justify-end mt-4">
                 <button type="submit" className="w-full sm:w-auto bg-[#D60000] hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                   Save Settings
                 </button>
               </div>
             </form>
           ) : (
             <p className="text-neutral-500 mb-6">Loading competition data...</p>
           )}

           <hr className="my-8 border-neutral-100" />

           <form onSubmit={saveVoteCost} className="flex flex-col sm:flex-row sm:items-end gap-6 max-w-lg">
             <div className="flex-grow">
                <label className="block text-sm font-semibold text-neutral-900 mb-1">Vote Price (₦)</label>
                <input type="number" min="0" value={voteCost} onChange={e => setVoteCost(e.target.value)} className="w-full px-4 py-2 border rounded-xl" required />
             </div>
             <button type="submit" className="w-full sm:w-auto bg-[#D60000] hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 focus:outline-none">
               Save Price
             </button>
           </form>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <h2 className="text-xl font-bold text-neutral-900">Manage Contestants</h2>
           <button 
             onClick={clearContestantsData} 
             disabled={isClearingContestants}
             className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm active:scale-95 ${
               isClearingContestants 
                 ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed animate-pulse' 
                 : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-100'
             }`}
           >
             {isClearingContestants ? 'Clearing...' : 'Clear Contestants'}
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Institution</th>
                <th className="p-4 font-semibold text-center">Votes</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
               {contestants.map((c: any) => (
                 <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{c.name}</div>
                      <div className="text-sm text-neutral-500">{c.email}</div>
                    </td>
                    <td className="p-4 text-neutral-600">{c.institution}</td>
                    <td className="p-4 text-center font-bold">{c.total_votes}</td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                         c.status === 'approved' ? 'bg-green-100 text-green-800' : 
                         c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                       }`}>
                         {c.status}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex flex-col sm:flex-row justify-end gap-2">
                         {c.status !== 'approved' && (
                           <button onClick={() => updateStatus(c.id, 'approved')} className="w-full sm:w-auto px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">Approve</button>
                         )}
                         {c.status !== 'rejected' && c.status !== 'suspended' && (
                           <button onClick={() => updateStatus(c.id, 'rejected')} className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">Reject</button>
                         )}
                       </div>
                    </td>
                 </tr>
               ))}
               {contestants.length === 0 && (
                 <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No contestants found.</td></tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden mb-12">
        <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <h2 className="text-xl font-bold text-neutral-900">Verify Payments & Votes</h2>
           <button 
             onClick={clearVotesData} 
             disabled={isClearingVotes}
             className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm active:scale-95 ${
               isClearingVotes 
                 ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed animate-pulse' 
                 : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-100'
             }`}
           >
             {isClearingVotes ? 'Clearing...' : 'Clear Payments & Votes'}
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Voter Name</th>
                <th className="p-4 font-semibold">Contestant</th>
                <th className="p-4 font-semibold text-center">Amount (Votes)</th>
                <th className="p-4 font-semibold text-center">Proof</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
               {votes.map((v: any) => (
                 <tr key={v.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{v.voter_name}</div>
                      <div className="text-sm text-neutral-500">{v.voter_email}</div>
                    </td>
                    <td className="p-4 text-neutral-600">{v.contestant_name}</td>
                    <td className="p-4 text-center font-bold">₦{Number(v.price_paid).toLocaleString()} ({v.amount} Votes)</td>
                    <td className="p-4 text-center">
                       {v.proof_url ? (
                         <a href={v.proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">View Image</a>
                       ) : <span className="text-sm text-neutral-400">None</span>}
                    </td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                         v.status === 'success' ? 'bg-green-100 text-green-800' : 
                         v.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                       }`}>
                         {v.status}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex flex-col sm:flex-row justify-end gap-2">
                         {v.status === 'pending' && (
                           <>
                             <button onClick={() => verifyVote(v.tx_ref, 'success')} className="w-full sm:w-auto px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">Approve</button>
                             <button onClick={() => verifyVote(v.tx_ref, 'failed')} className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">Reject</button>
                           </>
                         )}
                       </div>
                    </td>
                 </tr>
               ))}
               {votes.length === 0 && (
                 <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No transactions found.</td></tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminCmsSection />
    </div>
  );
}
