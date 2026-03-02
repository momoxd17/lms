import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, PlusCircle, Award, GraduationCap } from 'lucide-react';

function StudentDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: async () => {
      const { data } = await api.get('/enrollments');
      return data;
    },
  });
  const enrollments = data?.enrollments || [];
  const withCertificates = enrollments.filter((e) => e.certificateUrl);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <GraduationCap size={32} />
        My learning
      </h1>
      {withCertificates.length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Award size={20} className="text-primary-500" />
            My certificates ({withCertificates.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {withCertificates.map((e) => (
              <a key={e._id} href={e.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Award size={16} />
                {e.course?.title}
              </a>
            ))}
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-600">Browse courses</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => {
            const course = e.course;
            const totalLessons = course?.curriculum?.reduce((s, sec) => s + (sec.lessons?.length || 0), 0) || 0;
            const done = e.progress?.length || 0;
            const percent = totalLessons ? Math.round((done / totalLessons) * 100) : 0;
            return (
              <div key={e._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                  {course?.thumbnail ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{course?.title}</h3>
                  <div className="mt-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{percent}% complete</p>
                </div>
                <div className="flex items-center gap-3">
                  {e.certificateUrl && (
                    <a href={e.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                      <Award size={16} />
                      Certificate
                    </a>
                  )}
                  <Link to={`/learn/${course?._id}`} className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600">Continue</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InstructorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const { data } = await api.get('/courses/instructor/mine');
      return data;
    },
  });
  const courses = data?.courses || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <BookOpen size={32} className="text-primary-500" />
        Teaching dashboard
      </h1>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your courses</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{courses.length}</p>
          <Link to="/instructor/courses" className="text-primary-600 dark:text-primary-400 text-sm font-medium mt-2 inline-block hover:underline">View all →</Link>
        </div>
        <Link to="/instructor/courses/new" className="rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10 p-6 flex items-center gap-4 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <PlusCircle size={24} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Create new course</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add a course and start teaching</p>
          </div>
        </Link>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent courses</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No courses yet. <Link to="/instructor/courses/new" className="text-primary-600 dark:text-primary-400 font-medium">Create your first course</Link>.</p>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 5).map((c) => (
              <Link key={c._id} to={`/course/${c.slug}`} className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{c.price === 0 ? 'Free' : `$${c.price}`} · {c.level}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  if (isInstructor) return <InstructorDashboard />;
  return <StudentDashboard />;
}
