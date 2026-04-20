import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password, rememberMe);
      } else {
        await register(fullName, email, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-cream dark:bg-charcoal text-textPrimary-light dark:text-textPrimary-dark overflow-hidden">
      {/* Left Side: Brand Story */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-1/2 relative bg-primary-light flex-col justify-between p-16 overflow-hidden"
      >
        <div className="absolute inset-0 z-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1516483638261-f40af5fa624d?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-light/95 via-primary-light/40 to-transparent z-10"></div>
        
        <div className="relative z-20">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl font-serif text-white tracking-tight flex items-center gap-2"
          >
            <Sparkles className="w-8 h-8 text-white/80" /> Novelle Journal
          </motion.h1>
        </div>

        <div className="relative z-20 max-w-lg mb-12">
          <motion.blockquote 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-4xl font-serif text-white leading-tight mb-8"
          >
            "Your digital sanctuary for life's most beautiful stories."
          </motion.blockquote>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-white/80 text-xl font-light tracking-wide"
          >
            Curate your experiences, visualize the extraordinary, and collect moments that matter.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-cream/50 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-serif tracking-tight flex items-center justify-center gap-2 mb-2"
            >
              <Sparkles className="w-6 h-6 text-primary-light" /> Novelle
            </motion.h1>
            <p className="text-textSecondary-light dark:text-textSecondary-dark italic font-serif text-sm">
              Begin your journey
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-3 tracking-tight">
              {isLogin ? 'Welcome back' : 'Start your journey'}
            </h2>
            <p className="text-textSecondary-light dark:text-textSecondary-dark mb-8 md:mb-10 text-base md:text-lg font-light leading-relaxed">
              {isLogin 
                ? 'Enter your details to access your vision board.' 
                : 'Create an account to curate your beautiful experiences.'}
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-5 bg-red-50/50 backdrop-blur-sm text-red-600 rounded-xl text-sm border border-red-100/50"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="block text-xs uppercase tracking-[0.2em] text-textSecondary-light/70 dark:text-textSecondary-dark/70 mb-2 font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm border border-borderLight dark:border-borderDark focus:border-primary-light focus:ring-4 focus:ring-primary-light/5 outline-none transition-all duration-300"
                    placeholder="Jane Doe"
                  />
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-[0.2em] text-textSecondary-light/70 dark:text-textSecondary-dark/70 mb-2 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm border border-borderLight dark:border-borderDark focus:border-primary-light focus:ring-4 focus:ring-primary-light/5 outline-none transition-all duration-300"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-[0.2em] text-textSecondary-light/70 dark:text-textSecondary-dark/70 mb-2 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm border border-borderLight dark:border-borderDark focus:border-primary-light focus:ring-4 focus:ring-primary-light/5 outline-none transition-all duration-300 pr-12"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-textSecondary-light/60 hover:text-textPrimary-light transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between mt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-borderLight text-primary-light focus:ring-primary-light bg-white/50" 
                    />
                    <span className="text-sm text-textSecondary-light/80 dark:text-textSecondary-dark/80 group-hover:text-textPrimary-light transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-primary-light hover:text-primary-dark font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 md:mt-10 py-3.5 md:py-4 px-8 rounded-pill bg-gradient-to-r from-primary-light to-[#E8D3C8] text-white font-semibold shadow-soft hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight size={20} />}
              </motion.button>
            </form>

            <div className="mt-10 text-center text-sm text-textSecondary-light/70 dark:text-textSecondary-dark/70">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="font-semibold text-primary-light hover:text-primary-dark transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
