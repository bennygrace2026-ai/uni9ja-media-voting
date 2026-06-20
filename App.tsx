import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ContestantsPage from './pages/ContestantsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ContestantProfilePage from './pages/ContestantProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import RulesPage from './pages/RulesPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contestants" element={<ContestantsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/contestants/:id" element={<ContestantProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      <Footer />
      <motion.a 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        href="https://wa.me/2341234567890" 
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-green-600 transition-colors"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
      </motion.a>
    </div>
  );
}
