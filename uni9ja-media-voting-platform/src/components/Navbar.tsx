import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  // Basic mock auth state
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
             <Link to="/" className="flex items-center gap-3 group">
               <div className="group-hover:scale-105 transition-transform flex items-center">
                 <img 
                   src="https://i.ibb.co/JjBPj7JY/Uni9ja-Media.png" 
                   alt="Uni9ja Media" 
                   className="h-12 w-auto object-contain" 
                   referrerPolicy="no-referrer"
                 />
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-xl tracking-tight leading-tight">UNI9JA MEDIA</span>
                 <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">Become Informed</span>
               </div>
             </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-neutral-600 hover:text-[#D60000] font-medium transition-colors">Home</Link>
            <Link to="/contestants" className="text-neutral-600 hover:text-[#D60000] font-medium transition-colors">Contestants</Link>
            <Link to="/leaderboard" className="text-neutral-600 hover:text-[#D60000] font-medium transition-colors">Leaderboard</Link>
            <Link to="/blog" className="text-neutral-600 hover:text-[#D60000] font-medium transition-colors">Blog</Link>
            <Link to="/faq" className="text-neutral-600 hover:text-[#D60000] font-medium transition-colors">FAQ</Link>
            <Link to="/contact" className="text-neutral-600 hover:text-[#D60000] font-medium transition-colors">Contact</Link>
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-full transition-colors">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-neutral-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link to="/login" className="text-neutral-600 font-medium hover:text-neutral-900">Sign In</Link>
                <Link to="/register" className="bg-[#D60000] hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm">
                  Register as Contestant
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-neutral-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 pt-2 pb-6 space-y-4 shadow-xl absolute w-full">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-800">Home</Link>
          <Link to="/contestants" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-800">Contestants</Link>
          <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-800">Leaderboard</Link>
          <Link to="/blog" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-800">Blog</Link>
          <Link to="/faq" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-800">FAQ</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-neutral-800">Contact</Link>
          <div className="pt-4 border-t border-neutral-100">
            {user ? (
               <div className="flex flex-col gap-3">
                 <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="block px-3 py-2 bg-neutral-100 rounded-lg text-center font-medium">Dashboard</Link>
                 <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-red-600 font-medium">Sign Out</button>
               </div>
            ) : (
               <div className="flex flex-col gap-3">
                 <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 border border-neutral-200 rounded-lg text-center font-medium">Sign In</Link>
                 <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 bg-[#D60000] text-white rounded-lg text-center font-medium">Register</Link>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
