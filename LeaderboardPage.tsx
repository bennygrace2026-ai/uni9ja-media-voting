import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award } from 'lucide-react';
import SEO from '../components/SEO';

import { apiFetch } from '../lib/api';

export default function LeaderboardPage() {
  const [contestants, setContestants] = useState([]);

  useEffect(() => {
    apiFetch('/api/contestants')
      .then(data => setContestants(data || []))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title="Leaderboard & Standings"
        description="See running candidates and check real-time positions for the Face of the Week title. Keep voting to push your favorite contestant to the top!"
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-4 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-[#D60000]" /> Weekly Leaderboard
        </h1>
        <p className="text-neutral-500 text-lg">Top contestants competing for the Face of the Week title.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold text-center w-20">Rank</th>
              <th className="p-4 font-semibold">Contestant</th>
              <th className="p-4 font-semibold hidden sm:table-cell">Institution</th>
              <th className="p-4 font-semibold text-right">Votes</th>
              <th className="p-4 font-semibold w-24"></th>
            </tr>
          </thead>
          <tbody>
            {contestants.map((c: any, idx) => (
              <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                <td className="p-4 text-center">
                  {idx === 0 ? <Medal className="w-8 h-8 text-yellow-500 mx-auto" /> :
                   idx === 1 ? <Medal className="w-8 h-8 text-slate-400 mx-auto" /> :
                   idx === 2 ? <Medal className="w-8 h-8 text-amber-600 mx-auto" /> :
                   <span className="text-xl font-bold text-neutral-400">{idx + 1}</span>}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No Pic</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">{c.name}</div>
                      <div className="text-sm text-neutral-500 sm:hidden">{c.institution}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-neutral-600 hidden sm:table-cell">{c.institution}</td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1.5 font-black text-lg text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                    {c.total_votes}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Link to={`/contestants/${c.id}?vote=true`} className="text-[#D60000] font-semibold hover:text-red-700 hover:underline">Vote</Link>
                </td>
              </tr>
            ))}
            {contestants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">No contestants found on the leaderboard.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
