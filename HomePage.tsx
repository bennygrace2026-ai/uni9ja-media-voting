import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Vote, Trophy, ArrowRight, CheckCircle2, Medal, Crown, Clock, ShieldCheck, UserCheck, X } from 'lucide-react';
import SEO from '../components/SEO';

export default function HomePage() {
  const [activeComp, setActiveComp] = useState<any>(null);
  const [homeImage, setHomeImage] = useState<string>('');
  const [settings, setSettings] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      setSettings(data);
      if (data.home_image) setHomeImage(data.home_image);
    }).catch(console.error);

    fetch('/api/competitions/active')
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) return;
        setActiveComp(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeComp || !activeComp.end_date) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(activeComp.end_date).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeComp]);

  return (
    <div className="flex flex-col">
      <SEO 
        title="College Talent Voting & Spotlight Hub"
        description="Welcome to UNI9JA MEDIA. Find, review, and vote for the most talented and inspiring college contestants in Nigeria. Join our community and support your peers!"
        image={homeImage || undefined}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff8080] to-[#D60000] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#D60000] text-sm font-semibold mb-6 border border-red-100">
                <Crown className="w-4 h-4" /> Face of the Week Competition
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight">
                Vote, Support, and Celebrate <span className="text-[#D60000]">Outstanding Students</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-10 leading-relaxed">
                Join thousands of students across Nigeria in recognizing excellence, popularity, leadership, and outstanding campus representation.
              </p>
              <div className="flex flex-col flex-wrap sm:flex-row items-start gap-4 mb-12">
                <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#D60000] hover:bg-red-700 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2">
                  Register as Contestant <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/leaderboard" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-neutral-50 border-2 border-neutral-200 text-neutral-800 rounded-full font-semibold text-lg transition-all shadow-sm flex items-center justify-center">
                  View Leaderboard
                </Link>
              </div>

              {/* Countdown Timer */}
              {activeComp && timeLeft && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-block bg-white/80 backdrop-blur-sm border border-neutral-200 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-2 text-neutral-500 font-semibold mb-3">
                    <Clock className="w-5 h-5 text-[#D60000]" />
                    <span className="uppercase tracking-wider text-sm">Voting Closes In</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono">{String(timeLeft.d).padStart(2, '0')}</span>
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">Days</span>
                    </div>
                    <span className="text-2xl font-black text-neutral-300 pb-4">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono">{String(timeLeft.h).padStart(2, '0')}</span>
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">Hours</span>
                    </div>
                    <span className="text-2xl font-black text-neutral-300 pb-4">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono">{String(timeLeft.m).padStart(2, '0')}</span>
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">Mins</span>
                    </div>
                    <span className="text-2xl font-black text-neutral-300 pb-4">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl font-black text-[#D60000] font-mono">{String(timeLeft.s).padStart(2, '0')}</span>
                      <span className="text-xs font-semibold text-red-400 uppercase tracking-widest mt-1">Secs</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Editable Image on the Right */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="relative h-full flex items-center justify-center">
              {homeImage ? (
                <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={homeImage} alt="Home Promo Banner" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-[400px] rounded-3xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-sm font-medium">
                  {/* Empty placeholder if no image is set */}
                  Set promotional image in Admin Config
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-neutral-800 rounded-2xl mb-4 text-[#FF4D4D]"><Users className="w-8 h-8" /></div>
              <span className="text-4xl font-bold mb-1">2.4k+</span>
              <span className="text-neutral-400 font-medium">Total Contestants</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-neutral-800 rounded-2xl mb-4 text-[#FF4D4D]"><Vote className="w-8 h-8" /></div>
              <span className="text-4xl font-bold mb-1">150k+</span>
              <span className="text-neutral-400 font-medium">Votes Cast</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-neutral-800 rounded-2xl mb-4 text-[#FF4D4D]"><Trophy className="w-8 h-8" /></div>
              <span className="text-4xl font-bold mb-1">45</span>
              <span className="text-neutral-400 font-medium">Previous Winners</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-neutral-800 rounded-2xl mb-4 text-[#FF4D4D]"><Medal className="w-8 h-8" /></div>
              <span className="text-4xl font-bold mb-1">100+</span>
              <span className="text-neutral-400 font-medium">Institutions</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">How It Works</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Your journey to becoming the next UNI9JA MEDIA Face of the Week.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: 1, title: 'Register & Create Profile', desc: 'Sign up, fill in your institution details, and upload your best photo.' },
              { step: 2, title: 'Share Your Link', desc: 'Get your unique tracking link and share it across your social networks.' },
              { step: 3, title: 'Gather Votes', desc: 'Supporters can vote for you securely using Paystack or Flutterwave.' },
              { step: 4, title: 'Climb Leaderboard', desc: 'Watch your rank improve in real-time as votes come in from your supporters.' },
              { step: 5, title: 'Win & Celebrate', desc: 'Top the chart at the end of the week to become the Face of the Week.' },
              { step: 6, title: 'Get Certified', desc: 'Receive your official certificate and feature on our platform.' }
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 bg-neutral-50 rounded-3xl border border-neutral-100 overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl font-black text-neutral-200/50 leading-none select-none z-0">{s.step}</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#D60000] text-white rounded-2xl flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-red-200">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{s.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Section (Tablets) */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Competition Rules</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Please review the guidelines carefully to ensure a fair competition.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* General Rules Tablet */}
            <div className="bg-white p-8 rounded-[2rem] border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                 <ShieldCheck className="w-8 h-8 text-blue-500" /> General Rules
              </h3>
              <div className="text-neutral-600 space-y-3 leading-relaxed whitespace-pre-wrap flex-grow font-medium">
                {settings.rules_general || "1. Be respectful to all participants.\n2. Do not use bots to generate votes."}
              </div>
            </div>

            {/* Contestant Rules Tablet */}
            <div className="bg-white p-8 rounded-[2rem] border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                 <UserCheck className="w-8 h-8 text-purple-500" /> Contestant Rules
              </h3>
              <div className="text-neutral-600 space-y-3 leading-relaxed whitespace-pre-wrap flex-grow font-medium">
                {settings.rules_contestant || "1. Keep your profile appropriate for all audiences.\n2. Have fun and be a great representative of UNI9JA MEDIA."}
              </div>
            </div>

            {/* Voting Rules Tablet */}
            <div className="bg-white p-8 rounded-[2rem] border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
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
      </section>

      {/* CTA */}
      <section className="py-24 bg-neutral-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#D60000]/20 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to Become the Next Face of the Week?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#D60000] hover:bg-red-600 text-white rounded-full font-semibold text-lg transition-all shadow-lg flex items-center justify-center">
              Register Now
            </Link>
            <Link to="/contestants" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-semibold text-lg transition-all flex items-center justify-center">
              Vote for a Contestant
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <RecentBlogs />

    </div>
  );
}

function RecentBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  useEffect(() => {
    fetch('/api/blogs').then(res => res.json()).then(data => setBlogs(data.slice(0, 3))).catch(console.error);
  }, []);

  if (blogs.length === 0) return null;

  return (
    <section className="py-24 bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Latest News & Updates</h2>
            <p className="text-neutral-600 max-w-2xl">Stay informed with the latest updates from UNI9JA MEDIA.</p>
          </div>
          <Link to="/blog" className="hidden sm:flex px-6 py-2 bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 rounded-full font-semibold transition-colors items-center gap-2">
            View All Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200 flex flex-col h-full hover:-translate-y-1 transition-all">
              <div className="h-48 bg-neutral-200 relative overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setSelectedBlog(blog)}>
                <div 
                  style={{ backgroundImage: `url(${blog.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60'})` }}
                  className="w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-500 flex items-center justify-center relative"
                >
                  <div className="absolute inset-0 bg-black/20" />
                  {!blog.image_url && (
                    <div className="relative z-10 text-white font-extrabold uppercase tracking-widest text-xs drop-shadow bg-black/30 px-3 py-1.5 rounded-full">UNI9JA MEDIA</div>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-2 cursor-pointer hover:text-[#D60000] transition-colors" onClick={() => setSelectedBlog(blog)}>{blog.title}</h3>
                <p className="text-neutral-600 line-clamp-3 mb-6 flex-grow text-sm leading-relaxed">{blog.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-auto">
                  <button onClick={() => setSelectedBlog(blog)} className="text-[#D60000] font-bold text-sm hover:underline transition-all">Read More →</button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.origin + '/blog')}`, '_blank')} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Share on Twitter">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </button>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(blog.title + ' - ' + window.location.origin + '/blog')}`, '_blank')} className="w-8 h-8 rounded-full bg-green-50 text-green-500 hover:bg-green-100 flex items-center justify-center transition-colors" title="Share on WhatsApp">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 sm:hidden">
          <Link to="/blog" className="flex justify-center w-full px-6 py-4 bg-white text-neutral-900 border border-neutral-200 rounded-full font-semibold">
            View All Posts <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
      
      {/* Blog Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setSelectedBlog(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-900 hover:bg-white inset-shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto">
                <div className="h-64 sm:h-80 bg-neutral-100 relative">
                  <div 
                    style={{ backgroundImage: `url(${selectedBlog.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80'})` }}
                    className="w-full h-full bg-cover bg-center flex items-center justify-center relative"
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    {!selectedBlog.image_url && (
                      <div className="relative z-10 text-white font-extrabold uppercase tracking-widest text-lg drop-shadow bg-black/40 px-4 py-2 rounded-full">UNI9JA MEDIA</div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 sm:p-12">
                  <div className="flex items-center text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(selectedBlog.created_at).toLocaleDateString()}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-8 leading-tight">
                    {selectedBlog.title}
                  </h2>
                  <div className="prose prose-lg text-neutral-700 max-w-none whitespace-pre-wrap">
                    {selectedBlog.content}
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-between">
                    <span className="font-bold text-neutral-900">Share this post</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedBlog.title)}&url=${encodeURIComponent(window.location.origin + '/blog')}`, '_blank')} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors flex items-center gap-2">
                        Twitter
                      </button>
                      <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(selectedBlog.title + ' - ' + window.location.origin + '/blog')}`, '_blank')} className="px-4 py-2 rounded-xl bg-green-50 text-green-600 font-bold hover:bg-green-100 transition-colors flex items-center gap-2">
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
