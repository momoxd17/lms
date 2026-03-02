import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Users, BookOpen, GraduationCap, Star, LayoutDashboard, TicketPercent, Palette, Inbox } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'enrollments', label: 'Enrollments', icon: GraduationCap },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'coupons', label: 'Coupons', icon: TicketPercent },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'settings', label: 'Theme & settings', icon: Palette },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    },
  });
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: async () => {
      const { data } = await api.get('/courses/admin/all');
      return data;
    },
  });
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['adminEnrollments'],
    queryFn: async () => {
      const { data } = await api.get('/enrollments/admin/all');
      return data;
    },
  });
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['adminReviews'],
    queryFn: async () => {
      const { data } = await api.get('/reviews/admin/all');
      return data;
    },
  });
  const { data: couponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const { data } = await api.get('/admin/coupons');
      return data;
    },
  });
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings');
      return data;
    },
  });

  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ['adminInbox'],
    queryFn: async () => {
      const { data } = await api.get('/admin/inbox');
      return data;
    },
  });

  const users = usersData?.users || [];
  const courses = coursesData?.courses || [];
  const enrollments = enrollmentsData?.enrollments || [];
  const reviews = reviewsData?.reviews || [];
  const coupons = couponsData?.coupons || [];
  const settings = settingsData?.settings;
  const inboxMessages = inboxData?.messages || [];
  const [selectedInbox, setSelectedInbox] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data: threadData } = useQuery({
    queryKey: ['adminInboxThread', selectedInbox?._id],
    queryFn: async () => {
      if (!selectedInbox) return { messages: [] };
      const params = new URLSearchParams({
        userId: selectedInbox.user?._id || selectedInbox.user,
      });
      if (selectedInbox.course?._id || selectedInbox.course) {
        params.set('courseId', selectedInbox.course?._id || selectedInbox.course);
      }
      const { data } = await api.get(`/admin/inbox/thread?${params.toString()}`);
      return data;
    },
    enabled: !!selectedInbox,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ messageId, text }) => {
      const { data } = await api.post('/admin/inbox/reply', { messageId, text });
      return data;
    },
    onSuccess: () => {
      toast.success('Reply sent');
      setReplyText('');
      queryClient.invalidateQueries(['adminInbox']);
      if (selectedInbox) {
        queryClient.invalidateQueries(['adminInboxThread', selectedInbox._id]);
      }
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const banMutation = useMutation({
    mutationFn: async ({ id, banned }) => {
      const url = banned ? `/admin/users/${id}/unban` : `/admin/users/${id}/ban`;
      const { data } = await api.patch(url);
      return data;
    },
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const couponMutation = useMutation({
    mutationFn: async (payload) => {
      if (payload._id) {
        const { data } = await api.patch(`/admin/coupons/${payload._id}`, payload);
        return data;
      }
      const { data } = await api.post('/admin/coupons', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Coupon saved');
      queryClient.invalidateQueries(['adminCoupons']);
    },
    onError: () => toast.error('Failed to save coupon'),
  });

  const settingsMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put('/admin/settings', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries(['adminSettings']);
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const stats = [
    { label: 'Users', value: users.length, icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'Courses', value: courses.length, icon: BookOpen, color: 'bg-primary-500/10 text-primary-600 dark:text-primary-400' },
    { label: 'Enrollments', value: enrollments.length, icon: GraduationCap, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'Reviews', value: reviews.length, icon: Star, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  ];

  const getProgressPercent = (enrollment) => {
    const course = enrollment.course;
    if (!course?.curriculum) return 0;
    const total = (course.curriculum || []).reduce((s, sec) => s + (sec.lessons || []).length, 0);
    if (!total) return 0;
    return Math.round(((enrollment.progress || []).length / total) * 100);
  };

  const Card = ({ children, title, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {title && <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-6 py-4 border-b border-slate-200 dark:border-slate-700">{title}</h2>}
      {children}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === id
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-xl border border-slate-200 dark:border-slate-700 p-5 ${color}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
                  <Icon size={24} className="opacity-80" />
                </div>
                <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Recent users">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-72 overflow-auto">
                {(usersLoading ? [] : users.slice(0, 8)).map((u) => (
                  <li key={u._id} className="px-6 py-3 flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-900 dark:text-white truncate">{u.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 capitalize shrink-0 ml-2">{u.role}</span>
                  </li>
                ))}
              </ul>
              {!usersLoading && users.length === 0 && <p className="px-6 py-8 text-slate-500 dark:text-slate-400 text-center">No users yet</p>}
            </Card>
            <Card title="Recent courses">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-72 overflow-auto">
                {(coursesLoading ? [] : courses.slice(0, 8)).map((c) => (
                  <li key={c._id} className="px-6 py-3 flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-900 dark:text-white truncate">{c.title}</span>
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 ml-2">{c.published ? 'Published' : 'Draft'}</span>
                  </li>
                ))}
              </ul>
              {!coursesLoading && courses.length === 0 && <p className="px-6 py-8 text-slate-500 dark:text-slate-400 text-center">No courses yet</p>}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <Card title={`All users (${users.length})`}>
          {usersLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Email</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Role</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-3 text-slate-900 dark:text-white">{u.name}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="px-6 py-3">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {u.isBanned ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">
                            Banned
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => banMutation.mutate({ id: u._id, banned: u.isBanned })}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            u.isBanned
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!usersLoading && users.length === 0 && <p className="px-6 py-8 text-slate-500 dark:text-slate-400 text-center">No users</p>}
        </Card>
      )}

      {activeTab === 'courses' && (
        <Card title={`All courses (${courses.length})`}>
          {coursesLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Title</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Instructor</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Level</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Price</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Certificate</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{c.title}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{c.instructor?.name ?? '—'}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300 capitalize">{c.level ?? '—'}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                      <td className="px-6 py-3">
                        {c.hasCertificate ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.published ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>
                          {c.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        {c.slug && <Link to={`/course/${c.slug}`} className="text-primary-600 dark:text-primary-400 hover:underline">View</Link>}
                        <Link to={`/instructor/courses/${c._id}/edit`} className="text-slate-600 dark:text-slate-400 hover:underline">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!coursesLoading && courses.length === 0 && <p className="px-6 py-8 text-slate-500 dark:text-slate-400 text-center">No courses</p>}
        </Card>
      )}

      {activeTab === 'enrollments' && (
        <Card title={`All enrollments (${enrollments.length})`}>
          {enrollmentsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">User</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Course</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Progress</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-3">
                        <span className="font-medium text-slate-900 dark:text-white">{e.user?.name ?? '—'}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{e.user?.email}</span>
                      </td>
                      <td className="px-6 py-3">
                        {e.course?.slug ? (
                          <Link to={`/course/${e.course.slug}`} className="text-primary-600 dark:text-primary-400 hover:underline">{e.course?.title ?? '—'}</Link>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">{e.course?.title ?? '—'}</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-slate-600 dark:text-slate-300">{getProgressPercent(e)}%</span>
                      </td>
                      <td className="px-6 py-3">
                        {e.completedAt ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">Yes</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!enrollmentsLoading && enrollments.length === 0 && <p className="px-6 py-8 text-slate-500 dark:text-slate-400 text-center">No enrollments</p>}
        </Card>
      )}

      {activeTab === 'reviews' && (
        <Card title={`All reviews (${reviews.length})`}>
          {reviewsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">User</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Course</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Rating</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-900 dark:text-white">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-3">
                        <span className="font-medium text-slate-900 dark:text-white">{r.user?.name ?? '—'}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{r.user?.email}</span>
                      </td>
                      <td className="px-6 py-3">
                        {r.course?.slug ? (
                          <Link to={`/course/${r.course.slug}`} className="text-primary-600 dark:text-primary-400 hover:underline">{r.course?.title ?? '—'}</Link>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">{r.course?.title ?? '—'}</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                          {'★'.repeat(Math.round(r.rating || 0))}{'☆'.repeat(5 - Math.round(r.rating || 0))} {r.rating}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={r.comment}>{r.comment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!reviewsLoading && reviews.length === 0 && <p className="px-6 py-8 text-slate-500 dark:text-slate-400 text-center">No reviews</p>}
        </Card>
      )}

      {activeTab === 'coupons' && (
        <Card title={`Coupons (${coupons.length})`}>
          {couponsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <CouponForm onSave={couponMutation.mutate} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm mt-4">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Code</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Type</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Amount</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Course</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Usage</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c._id} className="border-b border-slate-100 dark:border-slate-700/50">
                        <td className="px-4 py-2 font-mono text-xs">{c.code}</td>
                        <td className="px-4 py-2 capitalize">{c.discountType}</td>
                        <td className="px-4 py-2">
                          {c.discountType === 'percentage'
                            ? `${c.amount}%`
                            : c.discountType === 'fixed'
                            ? `$${c.amount}`
                            : 'Free'}
                        </td>
                        <td className="px-4 py-2">{c.course?.title || 'Any'}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
                          {c.usedCount}/{c.maxUses || '∞'}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              c.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card title="Theme & branding">
          {settingsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <ThemeSettingsForm settings={settings} onSave={settingsMutation.mutate} />
          )}
        </Card>
      )}

      {activeTab === 'inbox' && (
        <Card title={`Inbox (${inboxMessages.length})`}>
          {inboxLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : inboxMessages.length === 0 ? (
            <p className="px-6 py-8 text-slate-500 dark:text-slate-400 text-center text-sm">
              No messages yet. When the chatbot cannot answer a question, it will appear here.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1 border-r border-slate-200 dark:border-slate-700">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                  {inboxMessages.map((m) => (
                    <li
                      key={m._id}
                      onClick={() => setSelectedInbox(m)}
                      className={`px-4 py-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        selectedInbox?._id === m._id ? 'bg-slate-100 dark:bg-slate-800' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-slate-900 dark:text-white truncate">
                          {m.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 truncate">
                        {m.message}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2 flex flex-col">
                {selectedInbox ? (
                  <>
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedInbox.user?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedInbox.email || selectedInbox.user?.email || 'No email'}
                      </p>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-2 max-h-72 overflow-y-auto text-xs">
                      {(threadData?.messages || []).map((m) => (
                        <div
                          key={m._id}
                          className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                              m.from === 'admin'
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.message}</p>
                            <span className="block mt-1 text-[9px] opacity-75">
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!replyText.trim() || !selectedInbox) return;
                        replyMutation.mutate({ messageId: selectedInbox._id, text: replyText.trim() });
                      }}
                      className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex gap-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                        placeholder="Type a reply..."
                      />
                      <button
                        type="submit"
                        disabled={replyMutation.isPending}
                        className="px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    Select a message on the left to view the conversation and reply.
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function CouponForm({ onSave }) {
  const [form, setForm] = useState({
    code: '',
    discountType: 'free',
    amount: 0,
    maxUses: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount) || 0,
      maxUses: Number(form.maxUses) || 0,
    };
    onSave(payload);
    setForm({ code: '', discountType: 'free', amount: 0, maxUses: 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Code</label>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          placeholder="e.g. FREE100"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Type</label>
        <select
          name="discountType"
          value={form.discountType}
          onChange={handleChange}
          className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="free">Free access</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed amount</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Amount</label>
        <input
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Max uses (0 = unlimited)
        </label>
        <input
          name="maxUses"
          type="number"
          value={form.maxUses}
          onChange={handleChange}
          className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          min="0"
        />
      </div>
      <button
        type="submit"
        className="h-10 md:h-9 mt-1 md:mt-0 px-4 rounded bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
      >
        Create coupon
      </button>
    </form>
  );
}

function ThemeSettingsForm({ settings, onSave }) {
  const [form, setForm] = useState({
    primaryColor: settings?.primaryColor || '#4f46e5',
    secondaryColor: settings?.secondaryColor || '#0f172a',
    backgroundColor: settings?.backgroundColor || '#ffffff',
    textColor: settings?.textColor || '#0f172a',
    logoUrl: settings?.logoUrl || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'].map((key) => (
          <div key={key} className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {key.replace('Color', ' color')}
              </label>
              <input
                type="text"
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="w-32 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
              />
            </div>
            <input
              type="color"
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="w-10 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Logo URL</label>
        <input
          type="url"
          name="logoUrl"
          value={form.logoUrl}
          onChange={handleChange}
          className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Preview</p>
        <div
          className="rounded-lg p-4 flex items-center justify-between"
          style={{
            backgroundColor: form.backgroundColor,
            color: form.textColor,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg" style={{ background: form.primaryColor }} />
            <div>
              <p className="font-semibold">Primary button</p>
              <p className="text-xs opacity-75">Example of how your primary color will look.</p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ background: form.primaryColor, color: form.textColor }}
          >
            Call to action
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="px-5 py-2.5 rounded bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
      >
        Save settings
      </button>
    </form>
  );
}
