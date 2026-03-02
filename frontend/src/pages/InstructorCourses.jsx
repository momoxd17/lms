import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Trash2 } from 'lucide-react';

export default function InstructorCourses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const { data } = await api.get('/courses/instructor/mine');
      return data;
    },
  });

  const courses = data?.courses || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries(['instructorCourses']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleDelete = (e, id, title) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) deleteMutation.mutate(id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My courses</h1>
        <Link to="/instructor/courses/new" className="bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors inline-flex items-center gap-2">
          <span>+ Add course</span>
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}</div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">You haven't created any courses yet.</p>
          <Link to="/instructor/courses/new" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">+ Add course</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => {
            const courseId = c._id ?? c.id;
            const slug = c.slug ?? '';
            return (
              <div key={courseId ?? c.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Level: {c.level} · {c.price === 0 ? 'Free' : `$${c.price}`}
                    {c.hasCertificate && <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">• Certificate</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => courseId && navigate(`/instructor/courses/${courseId}/edit`)} className="text-primary-600 dark:text-primary-400 font-medium hover:underline disabled:opacity-50" disabled={!courseId}>
                    Edit
                  </button>
                  <button type="button" onClick={() => slug && navigate(`/course/${slug}`)} className="text-slate-600 dark:text-slate-400 font-medium hover:underline disabled:opacity-50" disabled={!slug}>
                    View
                  </button>
                  <button type="button" onClick={(e) => handleDelete(e, courseId, c.title)} disabled={deleteMutation.isPending} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50" title="Delete course">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
