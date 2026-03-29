import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, Edit3, Trash2, Heart,
  LogOut, Moon, Sun, Plus, X, Image as ImageIcon,
  Tag, Link2, Type, FileText
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const QUOTES = [
  "Collect moments, not things.",
  "Dream elegantly.",
  "A beautiful life is an intentional one.",
  "Experience the extraordinary.",
  "Your personal tapestry of dreams."
];

const CATEGORIES = [
  { name: "Travel", icon: "🌍", color: "#e1cdc1" },
  { name: "Skills", icon: "📚", color: "#d6e0d9" },
  { name: "Fitness", icon: "💪", color: "#f0dfcf" },
  { name: "Experiences", icon: "🎭", color: "#e6e0f0" },
  { name: "Personal Growth", icon: "🌱", color: "#dbe8d3" },
  { name: "Relationships", icon: "💖", color: "#f5e6e8" },
  { name: "Creativity", icon: "🎨", color: "#e9ede3" }
];

export default function Dashboard() {
  const { user, logout, theme, toggleTheme } = useAuth();
  
  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Travel', image_url: '', link_url: '', why_matters: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        setIsLoading(true);
        const [goalsRes, completedRes] = await Promise.all([
          api.get('/goals'),
          api.get('/completed')
        ]);
        setGoals(goalsRes.data);
        setCompletedGoals(completedRes.data);
    } catch (err) {
        console.error("Failed to fetch data", err);
    } finally {
        setIsLoading(false);
    }
  };

  const calculateProgress = (catName) => {
    const totalCatGoals = goals.filter(g => g.category === catName).length;
    const completedCatGoals = completedGoals.filter(cg => cg.category === catName).length;
    const total = totalCatGoals + completedCatGoals;
    if (total === 0) return 0;
    return (completedCatGoals / total) * 100;
  };

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setFormData({
        title: goal.title, description: goal.description || '', category: goal.category || 'Travel',
        image_url: goal.image_url || '', link_url: goal.link_url || '', why_matters: goal.why_matters || ''
      });
      setEditingId(goal.id);
    } else {
      setFormData({ title: '', description: '', category: 'Travel', image_url: '', link_url: '', why_matters: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/goals/${editingId}`, formData);
        setGoals(goals.map(g => g.id === editingId ? data : g));
      } else {
        const { data } = await api.post('/goals', formData);
        setGoals([data, ...goals]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save goal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this pursuit?")) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleComplete = async (goalId, event) => {
    try {
      const { data } = await api.post(`/goals/${goalId}/complete`);
      
      // Update state
      setGoals(goals.filter(g => g.id !== goalId));
      setCompletedGoals([data, ...completedGoals]);

      // Confetti burst
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#D4B8A7', '#C4A484', '#FFFFFF'],
        disableForReducedMotion: true
      });
    } catch (err) {
      console.error("Failed to complete goal", err);
    }
  };

  const filteredGoals = activeCategoryFilter === "All" 
    ? goals 
    : goals.filter(g => g.category === activeCategoryFilter);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen relative pb-32 bg-cream/30 dark:bg-charcoal/30"
    >
      
      {/* VISION MODE OVERLAY */}
      <AnimatePresence>
        {isVisionMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[2000] bg-cream dark:bg-charcoal overflow-y-auto"
            onDoubleClick={() => setIsVisionMode(false)}
          >
            <div className="absolute top-10 right-10 z-50">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVisionMode(false)}
                className="bg-white/10 backdrop-blur-xl text-textPrimary-light dark:text-textPrimary-dark px-8 py-3 rounded-pill font-medium flex items-center gap-2 border border-white/20 shadow-soft transition-all"
              >
                <X size={18} /> Exit Vision Mode
              </motion.button>
            </div>
            
            {/* Collage Grid */}
            <div className="min-h-screen p-8 md:p-16 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8 space-y-8">
              {goals.filter(g => g.image_url).map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  className="break-inside-avoid relative group rounded-[32px] overflow-hidden shadow-soft border border-transparent hover:border-gold-light/30 transition-all duration-700"
                >
                  <img src={goal.image_url} alt={goal.title} className="w-full h-auto block transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <h3 className="text-white font-serif text-2xl tracking-tight leading-tight">{goal.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-charcoal/70 backdrop-blur-xl border-b border-borderLight/50 dark:border-borderDark/20 transition-all duration-500">
        <div className="container mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <Sparkles className="w-7 h-7 text-primary-light dark:text-primary-dark" />
            <span className="font-serif text-2xl font-bold tracking-tighter text-textPrimary-light dark:text-textPrimary-dark">
              Novelle
            </span>
          </motion.div>

          <div className="flex items-center gap-4 md:gap-8">
            <motion.button 
              whileHover={{ y: -1 }}
              onClick={() => setIsVisionMode(true)}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-pill text-sm font-medium border border-borderLight dark:border-borderDark/40 hover:border-gold-light dark:hover:border-gold-dark transition-all duration-300 shadow-sm"
            >
              <Sparkles size={16} className="text-gold-light" /> Vision Board
            </motion.button>
            
            <button onClick={toggleTheme} className="text-textSecondary-light dark:text-textSecondary-dark hover:text-primary-light transition-colors p-2">
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-11 h-11 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-light font-serif font-bold cursor-pointer overflow-hidden border-2 border-primary-light/20 hover:border-primary-light transition-all shadow-sm"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()
                )}
              </motion.div>
              {/* Dropdown refined */}
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-surface-dark border border-borderLight dark:border-borderDark rounded-[24px] shadow-lift opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 py-3 z-[100]">
                <div className="px-5 py-3 border-b border-borderLight/50 dark:border-borderDark/30 mb-2">
                  <p className="text-sm font-bold truncate text-textPrimary-light dark:text-textPrimary-dark">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark truncate mt-0.5">{user?.email}</p>
                </div>
                <button onClick={logout} className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quote Bar container */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="border-t border-borderLight/30 dark:border-borderDark/10 bg-cream/30 dark:bg-charcoal/30"
        >
          <div className="container mx-auto px-6 py-2.5 text-center">
            <p className="font-serif italic text-sm text-textSecondary-light/80 dark:text-textSecondary-dark/80 tracking-wide">
              "{quote}"
            </p>
          </div>
        </motion.div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 mt-16">
        
        {/* CATEGORY PROGRESS RINGS refinement */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
            <button
              onClick={() => setActiveCategoryFilter("All")}
              className={`flex-shrink-0 px-8 py-3.5 rounded-pill text-sm font-bold tracking-wide transition-all duration-500 border ${
                activeCategoryFilter === "All" 
                ? 'bg-primary-light border-primary-light text-white shadow-lift' 
                : 'bg-white dark:bg-surface-dark border-borderLight/60 dark:border-borderDark/40 text-textSecondary-light dark:text-textSecondary-dark hover:border-gold-light shadow-soft'
              }`}
            >
              Everything
            </button>

            {CATEGORIES.map((cat, idx) => {
              const progress = calculateProgress(cat.name);
              const radius = 9;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (progress / 100) * circumference;
              const isActive = activeCategoryFilter === cat.name;

              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategoryFilter(cat.name)}
                  className={`flex-shrink-0 flex items-center gap-4 px-6 py-3.5 rounded-pill text-sm font-bold tracking-wide transition-all duration-500 border ${
                    isActive 
                    ? 'bg-primary-light border-primary-light text-white shadow-lift' 
                    : 'bg-white dark:bg-surface-dark border-borderLight/60 dark:border-borderDark/40 text-textSecondary-light dark:text-textSecondary-dark hover:border-gold-light shadow-soft focus:ring-4 focus:ring-primary-light/5'
                  }`}
                >
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <svg className="absolute -rotate-90 w-full h-full" viewBox="0 0 24 24">
                      <circle 
                        cx="12" cy="12" r={radius} 
                        className="fill-none stroke-borderLight/40 dark:stroke-borderDark/20" 
                        strokeWidth="2.5" 
                      />
                      <motion.circle 
                        cx="12" cy="12" r={radius} 
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`fill-none ${isActive ? 'stroke-white' : 'stroke-gold-light/60 dark:stroke-gold-dark/60'}`} 
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                      />
                    </svg>
                    <span className="text-[11px] leading-none mb-[1px] relative z-10">{cat.icon}</span>
                  </div>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ACTIVE GOALS SECTION refinement */}
        <div className="mb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="text-4xl font-serif text-textPrimary-light dark:text-textPrimary-dark tracking-tight">
              Current Pursuits
            </h2>
            <div className="h-[1px] bg-borderLight/70 dark:bg-borderDark/30 flex-grow ml-12 max-w-lg hidden md:block"></div>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-32 font-serif italic text-xl text-textSecondary-light/60 animate-pulse tracking-wide">
              Designing your path to beauty...
            </div>
          ) : filteredGoals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="py-32 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-surface-dark/40 rounded-[48px] border border-borderLight/50 dark:border-borderDark/20 shadow-soft"
            >
              <div className="w-28 h-28 mb-8 rounded-full bg-primary-light/5 flex items-center justify-center text-primary-light">
                <Sparkles size={48} className="opacity-60" />
              </div>
              <h3 className="text-3xl font-serif mb-4 tracking-tight">Begin your novel story.</h3>
              <p className="text-textSecondary-light dark:text-textSecondary-dark max-w-md mx-auto mb-10 text-lg font-light leading-relaxed">
                Add your first pursuit to start visualizing your path. 
                Your journey towards the extraordinary begins with a single intention.
              </p>
              <motion.button 
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()}
                className="px-10 py-4 rounded-pill bg-primary-light text-white font-bold tracking-wide hover:bg-primary-dark transition-all shadow-lift"
              >
                Create First Pursuit
              </motion.button>
            </motion.div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 pb-12">
              <AnimatePresence mode="popLayout">
                {filteredGoals.map((goal, index) => (
                  <motion.div 
                    layout
                    key={goal.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="break-inside-avoid relative group bg-white dark:bg-surface-dark rounded-[32px] border border-borderLight/30 dark:border-borderDark/10 shadow-soft hover:shadow-lift transition-all duration-700 overflow-hidden flex flex-col"
                  >
                    {/* Category Label */}
                    <div className="absolute top-5 left-5 z-20">
                      <span className="px-4 py-2 rounded-pill bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-[0.2em] uppercase border border-white/20 text-white shadow-sm">
                        {goal.category}
                      </span>
                    </div>

                    {/* Image / Gradient Header */}
                    {goal.image_url ? (
                      <div className="h-56 w-full overflow-hidden relative">
                        <img src={goal.image_url} alt={goal.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-700"></div>
                      </div>
                    ) : (
                      <div className="h-16 w-full bg-gradient-to-br from-primary-light/30 via-secondary-light/20 to-lavender-light/30"></div>
                    )}

                    <div className="p-8 flex flex-col flex-grow relative">
                      <h3 className="text-2xl font-serif font-bold text-textPrimary-light dark:text-textPrimary-dark mb-4 leading-tight tracking-tight group-hover:text-primary-light transition-colors duration-500">
                        {goal.title}
                      </h3>
                      
                      {goal.description && (
                        <p className="text-[15px] text-textSecondary-light/80 dark:text-textSecondary-dark/80 line-clamp-3 mb-6 font-light leading-relaxed">
                          {goal.description}
                        </p>
                      )}

                      {goal.why_matters && (
                        <div className="mt-auto pt-6 border-t border-borderLight/50 dark:border-borderDark/30 flex items-start gap-3">
                          <Heart size={16} className="mt-1 flex-shrink-0 text-primary-light/60" />
                          <p className="text-[15px] font-serif italic text-textSecondary-light dark:text-textSecondary-dark leading-relaxed line-clamp-2">
                            "{goal.why_matters}"
                          </p>
                        </div>
                      )}

                      {/* Subtly Animated Interaction Overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-surface-dark via-white/80 dark:via-surface-dark/80 to-transparent flex items-center justify-center gap-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]">
                        <motion.button whileHover={{ scale: 1.1, y: -2 }} onClick={(e) => { e.stopPropagation(); handleOpenModal(goal); }} className="w-11 h-11 rounded-full bg-white dark:bg-charcoal border border-borderLight dark:border-borderDark shadow-lift flex items-center justify-center text-textSecondary-light hover:text-primary-light transition-all">
                          <Edit3 size={18} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1, y: -2 }} onClick={(e) => { e.stopPropagation(); handleDelete(goal.id); }} className="w-11 h-11 rounded-full bg-white dark:bg-charcoal border border-borderLight dark:border-borderDark shadow-lift flex items-center justify-center text-textSecondary-light hover:text-red-400 transition-all">
                          <Trash2 size={18} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1, y: -2 }} onClick={(e) => { e.stopPropagation(); handleComplete(goal.id, e); }} className="w-12 h-12 rounded-full bg-primary-light shadow-lift flex items-center justify-center text-white hover:bg-gold-light transition-all">
                          <CheckCircle2 size={22} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* COMPLETED GOALS (TIMELINE) refinement */}
        {completedGoals.length > 0 && (
          <div className="mb-32">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 mb-16"
            >
              <h2 className="text-4xl font-serif text-textPrimary-light dark:text-textPrimary-dark tracking-tight">
                Cherished Memories
              </h2>
              <span className="px-5 py-1.5 rounded-pill bg-primary-light/10 text-xs font-bold uppercase tracking-widest text-primary-light border border-primary-light/20">
                {completedGoals.length} realized
              </span>
            </motion.div>

            <div className="relative pl-8 md:pl-0">
              {/* Timeline Center Line Refined */}
              <div className="absolute top-0 bottom-0 left-[15px] md:left-1/2 w-[1px] bg-gradient-to-b from-borderLight via-borderLight to-transparent dark:from-borderDark dark:via-borderDark dark:to-transparent -translate-x-1/2 opacity-50"></div>
              
              <div className="space-y-16 max-w-5xl mx-auto">
                {completedGoals.map((memory, index) => {
                  const isEven = index % 2 === 0;
                  const date = new Date(memory.completed_at || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  
                  return (
                    <motion.div 
                      key={memory.id}
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once:true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
                    >
                      {/* Timeline Dot refined */}
                      <div className="absolute left-[-29px] md:left-1/2 w-4 h-4 rounded-full bg-gold-light/60 dark:bg-gold-dark/60 border-4 border-white dark:border-charcoal transform -translate-x-1/2 shadow-soft z-10 transition-transform hover:scale-150 duration-500"></div>
                      
                      <div className="hidden md:block w-1/2"></div>
                      
                      {/* Memory Card refined */}
                      <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16' : 'md:pl-16'}`}>
                        <div className="bg-white/60 dark:bg-surface-dark/40 backdrop-blur-sm p-8 md:p-10 rounded-[40px] border border-borderLight/50 dark:border-borderDark/20 flex flex-col sm:flex-row gap-8 hover:shadow-lift transition-all duration-700 group">
                          
                          {memory.image_url && (
                            <div className="w-full sm:w-40 h-40 rounded-[32px] overflow-hidden flex-shrink-0 shadow-soft">
                              <img src={memory.image_url} className="w-full h-full object-cover transition-all duration-1000 grayscale-[70%] sepia-[15%] group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-110" alt={memory.title} />
                            </div>
                          )}
                          
                          <div className="flex flex-col flex-grow justify-center">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-light/80 dark:text-gold-dark/80 mb-4 flex items-center gap-2">
                              <Sparkles size={14} className="opacity-50" /> {date}
                            </span>
                            <h4 className="text-2xl font-serif text-textPrimary-light dark:text-textPrimary-dark mb-4 leading-tight tracking-tight">
                              {memory.title}
                            </h4>
                            {memory.why_matters && (
                              <p className="text-[15px] font-light italic text-textSecondary-light/70 dark:text-textSecondary-dark/70 leading-relaxed italic">
                                "{memory.why_matters}"
                              </p>
                            )}
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON Refined */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 1, type: 'spring', damping: 15 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleOpenModal()}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-primary-light text-white shadow-lift flex items-center justify-center hover:bg-gold-light transition-all duration-500 z-[1000] border-4 border-white dark:border-charcoal"
      >
        <Plus size={32} />
      </motion.button>

      {/* ADD / EDIT GOAL MODAL refinement */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-xl"
              onClick={() => setIsModalOpen(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="relative w-full max-w-2xl bg-white dark:bg-surface-dark rounded-[48px] p-10 md:p-14 shadow-2xl border border-borderLight dark:border-borderDark/40 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center bg-cream/50 dark:bg-charcoal/50 text-textSecondary-light hover:text-primary-light transition-all"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-12">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-primary-light/10 text-primary-light text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary-light/10"
                >
                  <Sparkles size={12} /> New Chapter
                </motion.div>
                <h2 className="text-4xl font-serif text-textPrimary-light dark:text-textPrimary-dark tracking-tighter">
                  {editingId ? 'Refine Your Dream' : 'Add to Your Journey'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary-light/60 dark:text-textSecondary-dark/60 mb-3 ml-1">
                    <Type size={14} className="opacity-40" /> Pursuit Title
                  </label>
                  <input required
                    value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}
                    className="w-full px-7 py-5 rounded-2xl bg-cream/50 dark:bg-charcoal/50 border border-borderLight/60 dark:border-borderDark/40 focus:border-primary-light focus:bg-white dark:focus:bg-surface-dark transition-all duration-300 outline-none text-[17px] font-serif tracking-tight" 
                    placeholder="e.g. Master the French Culinary Arts" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary-light/60 dark:text-textSecondary-dark/60 mb-3 ml-1">
                      <Tag size={14} className="opacity-40" /> Category
                    </label>
                    <div className="relative">
                      <select required
                        value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}
                        className="w-full px-7 py-5 rounded-2xl bg-cream/50 dark:bg-charcoal/50 border border-borderLight/60 dark:border-borderDark/40 focus:border-primary-light transition-all outline-none appearance-none cursor-pointer text-[15px] font-medium"
                      >
                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} &nbsp; {c.name}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary-light/40">
                        <Plus size={16} className="rotate-45" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary-light/60 dark:text-textSecondary-dark/60 mb-3 ml-1">
                      <ImageIcon size={14} className="opacity-40" /> Inspiration Image URL
                    </label>
                    <input type="url"
                      value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-7 py-5 rounded-2xl bg-cream/50 dark:bg-charcoal/50 border border-borderLight/60 dark:border-borderDark/40 focus:border-primary-light transition-all text-[15px] font-mono lowercase tracking-tight" 
                      placeholder="https://..." 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary-light/60 dark:text-textSecondary-dark/60 mb-3 ml-1">
                    <Heart size={14} className="opacity-40" /> The Soul of this Dream
                  </label>
                  <textarea 
                    value={formData.why_matters} onChange={e=>setFormData({...formData, why_matters: e.target.value})}
                    className="w-full px-7 py-5 rounded-2xl bg-cream/50 dark:bg-charcoal/50 border border-borderLight/60 dark:border-borderDark/40 focus:border-primary-light outline-none transition-all resize-none font-serif italic text-lg leading-relaxed" 
                    placeholder="Why does this matter to your heart?" rows="2"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary-light/60 dark:text-textSecondary-dark/60 mb-3 ml-1">
                    <FileText size={14} className="opacity-40" /> The Journey Plan
                  </label>
                  <textarea 
                    value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}
                    className="w-full px-7 py-5 rounded-2xl bg-cream/50 dark:bg-charcoal/50 border border-borderLight/60 dark:border-borderDark/40 focus:border-primary-light outline-none transition-all resize-none text-[15px] font-light leading-relaxed" 
                    placeholder="Describe the steps you'll take on this journey..." rows="3"
                  ></textarea>
                </div>

                <div className="pt-8 flex gap-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 rounded-pill font-bold tracking-widest text-[11px] uppercase border border-borderLight/80 dark:border-borderDark/60 text-textSecondary-light hover:bg-cream dark:hover:bg-charcoal transition-all flex-grow">
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={isSubmitting} 
                    className="px-10 py-5 rounded-pill font-bold tracking-widest text-[11px] uppercase bg-primary-light shadow-lift hover:shadow-2xl transition-all text-white flex-grow disabled:opacity-70 flex justify-center items-center gap-3"
                  >
                    {isSubmitting ? 'Curating...' : (editingId ? 'Refine' : 'Add to Collection')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

