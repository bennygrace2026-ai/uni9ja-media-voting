import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = React.useState<any>({});

  React.useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings).catch(console.error);
  }, []);

  return (
    <footer className="bg-neutral-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-[#D60000] p-1.5 rounded-lg">
                 <Trophy className="h-5 w-5 text-white" />
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-lg tracking-tight leading-none text-white">UNI9JA MEDIA</span>
                 <span className="text-[9px] uppercase font-semibold text-neutral-400 tracking-wider">Become Informed</span>
               </div>
            </div>
            <p className="text-neutral-400 text-sm max-w-sm mb-6">
              The premier platform recognizing excellence, popularity, leadership, and outstanding campus representation among students across Nigeria.
            </p>
            <div className="flex space-x-4">
              <a href={settings?.social_facebook || "#"} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={settings?.social_instagram || "#"} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={settings?.social_twitter || "#"} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href={settings?.social_tiktok || "#"} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 font-bold">
                <span className="w-5 h-5 flex items-center justify-center bg-neutral-400 text-neutral-900 rounded-sm hover:bg-white text-[10px]">TikTok</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/rules" className="hover:text-white transition-colors">Rules</Link></li>
              <li><Link to="/contestants" className="hover:text-white transition-colors">Contestants</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} UNI9JA MEDIA. All rights reserved.
          </div>
          <div>
            <Link to="/admin-login" className="opacity-10 hover:opacity-100 transition-opacity text-xs" title="Admin Portal">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
