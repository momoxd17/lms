import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LayoutDashboard, Settings, LogOut, Code, Sparkles, Sun, Moon, Menu, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './Chatbot';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isHome ? 'glass dark:glass-dark border-b border-white/20 dark:border-white/10' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <BookOpen size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Learn<span className="text-primary-600 dark:text-primary-400">Hub</span></span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={() => setDarkMode(prev => !prev)} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700" aria-label="Toggle dark mode" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button type="button" onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" aria-label="Open menu">
              <Menu size={24} />
            </button>

            <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/courses" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Explore</Link>

            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/profile" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                {(user.role === 'instructor' || user.role === 'admin') && (
                  <Link to="/instructor/courses" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <Sparkles size={18} />
                    <span>Teaching</span>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <Settings size={18} />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <button onClick={logout} className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5">
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign in</Link>
                <Link to="/register" className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium">
                  Get Started
                </Link>
              </div>
            )}
            </nav>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              aria-hidden="true"
            />
            <motion.nav
              key="mobile-nav"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col p-4 gap-1 font-medium">
                <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="py-3 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400">
                  Explore
                </Link>
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-3 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2">
                      <LayoutDashboard size={20} />
                      Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-3 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2">
                      <User size={20} />
                      Profile
                    </Link>
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <Link to="/instructor/courses" onClick={() => setMobileMenuOpen(false)} className="py-3 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2">
                        <Sparkles size={20} />
                        Teaching
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-3 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2">
                        <Settings size={20} />
                        Admin
                      </Link>
                    )}
                    <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
                    <button type="button" onClick={() => { setMobileMenuOpen(false); logout(); }} className="py-3 px-3 rounded-lg text-left text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 w-full">
                      <LogOut size={20} />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                      Sign in
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="py-3 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col pt-20 relative z-10">
        <Outlet />
        <Chatbot />
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <BookOpen className="text-primary-500" size={24} />
                <span className="text-xl font-bold text-slate-900 dark:text-white">LearnHub</span>
              </Link>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">Empowering the world to learn skills that matter. Join our community of lifelong learners and top-tier instructors.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li><Link to="/courses" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Browse Courses</Link></li>
                <li>
                  {user ? (
                    <Link to="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Become a Student</Link>
                  ) : (
                    <Link to="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Become a Student</Link>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link to={(user.role === 'instructor' || user.role === 'admin') ? '/instructor/courses' : '/profile'} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Teach on LearnHub</Link>
                  ) : (
                    <Link to="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Teach on LearnHub</Link>
                  )}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li><Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} LearnHub Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <Code size={18} className="cursor-pointer hover:text-primary-500 dark:hover:text-primary-400 transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
