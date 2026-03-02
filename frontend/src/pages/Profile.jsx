import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Award, BookOpen } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: async () => {
      const { data } = await api.get('/enrollments');
      return data;
    },
    enabled: !!user,
  });
  const enrollments = data?.enrollments || [];
  const certificates = enrollments.filter((e) => e.certificateUrl);

  const instructorCoursesQuery = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const { data } = await api.get('/courses/instructor/mine');
      return data;
    },
    enabled: !!user && (user.role === 'instructor' || user.role === 'admin'),
  });
  const instructorCourses = instructorCoursesQuery.data?.courses || [];

  if (!user) return null;

  return (
    <div className="w-[800px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
        <User size={32} />
        Profile
      </h1>
      <div className="space-y-6">
        <div className="bg-white w-full dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Account</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">Name</dt>
              <dd className="text-slate-900 dark:text-white font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">Email</dt>
              <dd className="text-slate-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">Role</dt>
              <dd className="text-slate-900 dark:text-white capitalize">{user.role}</dd>
            </div>
          </dl>
        </div>

        {(user.role === 'instructor' || user.role === 'admin') && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-primary-500" />
              Teaching
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">You have {instructorCourses.length} course{instructorCourses.length !== 1 ? 's' : ''}.</p>
            <Link to="/instructor/courses" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Go to My courses →</Link>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-primary-500" />
            Certificates
          </h2>
          {isLoading ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
          ) : certificates.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Complete courses to earn certificates. <Link to="/courses" className="text-primary-600 dark:text-primary-400 hover:underline">Browse courses</Link>.</p>
          ) : (
            <div className="space-y-2">
              {certificates.map((e) => (
                <a key={e._id} href={e.certificateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Award size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="font-medium text-slate-900 dark:text-white">{e.course?.title}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-auto">View →</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
