import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, GraduationCap } from 'lucide-react';
import SEO from '../components/SEO';

export default function ContestantsPage() {
  const [contestants, setContestants] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/contestants')
      .then(res => res.json())
      .then(data => setContestants(data || []))
      .catch(console.error);
  }, []);

  const filtered = contestants.filter((c: any) => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.institution?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title="Meet Our Contestants"
        description="Browse, search, and support UNI9JA MEDIA contestants. View their bios, institutions, and vote to support your favorites!"
      />
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">Contestants</h1>
          <p className="text-neutral-500 text-lg">Support your favorite candidate for Face of the Week.</p>
        </div>
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl leading-5 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D60000] focus:border-[#D60000] sm:text-sm transition-shadow shadow-sm"
            placeholder="Search by name or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-neutral-200">
          <p className="text-neutral-500 text-lg">No contestants found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((c: any) => (
            <div key={c.id} className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
              <div className="aspect-[4/5] bg-neutral-100 relative overflow-hidden">
                {c.photo_url ? (
                  <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 font-medium">No Photo</div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-bold text-neutral-900 shadow-sm">
                  {c.total_votes} Votes
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-neutral-900 mb-2 truncate">{c.name}</h3>
                <div className="flex items-center text-neutral-500 text-sm mb-2 truncate">
                  <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{c.institution}</span>
                </div>
                <div className="flex items-center text-neutral-500 text-sm mb-6 truncate">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{c.department} - {c.level}L</span>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Link to={`/contestants/${c.id}?vote=true`} className="bg-[#D60000] hover:bg-red-700 text-white text-center py-2.5 rounded-xl font-semibold transition-colors">
                    Vote Now
                  </Link>
                  <Link to={`/contestants/${c.id}`} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-center py-2.5 rounded-xl font-semibold transition-colors">
                    Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
