import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, X } from 'lucide-react';
import SEO from '../components/SEO';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  useEffect(() => {
    fetch('/api/blogs').then(res => res.json()).then(data => setBlogs(data)).catch(console.error);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO 
        title={selectedBlog ? selectedBlog.title : "Our Blog"}
        description={selectedBlog ? selectedBlog.content.slice(0, 150) + '...' : "Get the latest updates, contestant news, interviews, and community highlights on UNI9JA MEDIA."}
        image={selectedBlog?.image_url || undefined}
        type={selectedBlog ? 'article' : 'website'}
      />
      <h1 className="text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">Our Blog</h1>
      <p className="text-xl text-neutral-600 mb-12">Latest news, interviews, and updates from the competition.</p>
      
      {blogs.length === 0 ? (
        <p className="text-neutral-500 text-lg">No blog posts available at the moment. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <motion.div whileHover={{ y: -5 }} key={blog.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200">
              <div className="h-48 bg-neutral-200 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setSelectedBlog(blog)}>
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
              <div className="p-6">
                <div className="flex items-center text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3 cursor-pointer hover:text-[#D60000] transition-colors" onClick={() => setSelectedBlog(blog)}>{blog.title}</h3>
                <p className="text-neutral-600 line-clamp-3 leading-relaxed mb-6">{blog.content}</p>
                <div className="flex items-center justify-between mt-auto border-t border-neutral-100 pt-4">
                  <button onClick={() => setSelectedBlog(blog)} className="font-bold text-[#D60000] hover:text-red-800 transition-colors">Read More &rarr;</button>
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
            </motion.div>
          ))}
        </div>
      )}

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
                    <Calendar className="w-4 h-4 mr-2" />
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
    </motion.div>
  );
}

