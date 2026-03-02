import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, Clock, Star, PlayCircle, Award } from 'lucide-react';
import api from '../api/axios';

export default function Courses() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['courses', page, category, level, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 12 });
      if (category) params.set('category', category);
      if (level) params.set('level', level);
      if (search) params.set('search', search);
      const { data } = await api.get(`/courses?${params}`);
      return data;
    },
  });

  const courses = data?.courses || [];
  const pages = data?.pages || 1;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header & Filters */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Explore Courses</h1>
          <div className="transparent-glass image.pngi have p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="What do you want to learn?" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700" 
              />
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 bg-white/50 hover:bg-white appearance-none cursor-pointer outline-none focus:border-primary-500 font-medium text-slate-700 transition-colors"
                >
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)} 
                className="flex-1 md:w-40 px-4 py-3 rounded-xl border border-slate-200 bg-white/50 hover:bg-white appearance-none cursor-pointer outline-none focus:border-primary-500 font-medium text-slate-700 transition-colors"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm animate-pulse">
                <div className="w-full aspect-[4/3] bg-slate-200 rounded-2xl mb-4"></div>
                <div className="px-2 space-y-3">
                  <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                  <div className="flex justify-between pt-4">
                    <div className="h-6 bg-slate-200 rounded-md w-16"></div>
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center transparent-glass rounded-3xl">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((c, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={c._id} 
                >
                  <Link to={`/course/${c.slug}`} className="group block bg-white rounded-3xl p-3 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={40} /></div>
                      )}
                      {/* Floating Play button overlay */}
                      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-900 shadow-lg scale-75 group-hover:scale-100 transition-transform">
                          <PlayCircle size={24} className="fill-slate-900" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm uppercase tracking-wide">
                        {c.category}
                      </div>
                      {c.hasCertificate && (
                        <div className="absolute bottom-3 left-3 bg-emerald-500/90 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                          <Award size={14} />
                          Certificate
                        </div>
                      )}
                    </div>
                    
                    <div className="px-2 flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                        <Star size={14} className="fill-amber-500" />
                        <span className="text-sm font-semibold text-slate-700">4.9 <span className="text-slate-400 font-normal">(120)</span></span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors leading-tight">{c.title}</h3>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-1 flex-1">{c.instructor?.name}</p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                        <span className="text-xl font-extrabold text-slate-900">{c.price === 0 ? 'Free' : `$${c.price}`}</span>
                        <div className="flex items-center gap-2">
                          {c.hasCertificate && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Certificate
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">{c.level}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm">Previous</button>
                <div className="px-4 font-semibold text-slate-600">Page {page} of {pages}</div>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
