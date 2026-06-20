import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Vote } from 'lucide-react';
import SEO from '../components/SEO';

export default function RulesPage() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO 
        title="Competition Rules & Guidelines"
        description="Learn about the UNI9JA MEDIA Face of the Week competition rules. Access our terms, conditions, contestant codes of conduct, and voting principles."
      />
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-neutral-900 mb-4">Competition Rules & Guidelines</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">Please review the guidelines carefully to ensure a fair competition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-blue-500" /> General Rules
          </h3>
          <div className="text-neutral-600 space-y-3 leading-relaxed whitespace-pre-wrap flex-grow font-medium">
            {settings.rules_general || "1. Be respectful to all participants.\n2. Do not use bots to generate votes."}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-neutral-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
             <UserCheck className="w-8 h-8 text-purple-500" /> Contestant Rules
          </h3>
          <div className="text-neutral-600 space-y-3 leading-relaxed whitespace-pre-wrap flex-grow font-medium">
            {settings.rules_contestant || "1. Keep your profile appropriate for all audiences.\n2. Have fun and be a great representative of UNI9JA MEDIA."}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-neutral-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-[#D60000]"></div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
             <Vote className="w-8 h-8 text-[#D60000]" /> Voting Rules
          </h3>
          <div className="text-neutral-600 space-y-3 leading-relaxed whitespace-pre-wrap flex-grow font-medium mb-6">
            {settings.rules_voting || "1. Each vote costs N100.\n2. You can vote as many times as you like."}
          </div>
          <div className="mt-auto pt-6 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Rate</span>
            <span className="text-xl font-black text-[#D60000]">₦{settings.vote_cost || '100'} / Vote</span>
          </div>
        </div>
      </div>
    </div>
  );
}
