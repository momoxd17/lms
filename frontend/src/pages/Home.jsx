import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Award, Users, ArrowRight, Star } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-slate-50">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-300/20 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent-300/20 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-2xl">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Star size={14} className="fill-primary-500 text-primary-500" />
              <span>Over 10,000+ students worldwide</span>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Master new skills <br/>
              <span className="text-gradient">at your own pace.</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
              Unlock your potential with world-class courses from industry experts. Advance your career, learn a new hobby, or pick up a new skill today.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
              <Link to="/courses" className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20 flex items-center gap-2 group">
                Explore Courses
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/courses" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
                <Play size={18} className="text-primary-500 fill-primary-500" />
                Start for free
              </Link>
            </motion.div>
            
            <motion.div variants={fadeIn} className="mt-12 flex items-center gap-8 border-t border-slate-200 pt-8">
              <div>
                <p className="text-3xl font-bold text-slate-900">4.9/5</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Average rating</p>
              </div>
              <div className="w-px h-12 bg-slate-200"></div>
              <div>
                <p className="text-3xl font-bold text-slate-900">100+</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Premium courses</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-3xl transform rotate-3 scale-105 opacity-10 blur-xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white/50 backdrop-blur-sm p-2">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop" alt="Students learning" className="rounded-2xl w-full object-cover aspect-[4/3]" />
              
              {/* Floating badges */}
              <div className="absolute top-10 -left-6 glass px-4 py-3 rounded-2xl flex items-center gap-3 animate-[bounce_4s_infinite]">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">+45% Salary</p>
                  <p className="text-xs text-slate-500">After completion</p>
                </div>
              </div>
              <div className="absolute bottom-10 -right-6 glass px-4 py-3 rounded-2xl flex items-center gap-3 animate-[bounce_5s_infinite_0.5s]">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><Award size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Certified</p>
                  <p className="text-xs text-slate-500">Industry recognized</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 relative z-10 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why LearnHub is the best choice</h2>
            <p className="text-lg text-slate-500">Everything you need to accelerate your career, packed into one beautiful platform.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Play, title: 'High-quality video lessons', desc: 'Learn from cinematic quality videos that make complex topics easy to understand.', color: 'bg-primary-100 text-primary-600' },
              { icon: TrendingUp, title: 'Track your progress', desc: 'Watch your skills grow with visual progress bars and detailed analytics.', color: 'bg-accent-100 text-accent-600' },
              { icon: Users, title: 'Expert instructors', desc: 'Our teachers are vetted industry professionals with years of real-world experience.', color: 'bg-rose-100 text-rose-600' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.1 }}
                className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
