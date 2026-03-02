import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data } = await api.get(`/courses/slug/${slug}`);
      return data;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post('/enrollments', { courseId: data?.course?._id }),
    onSuccess: (res) => {
      if (res.data.success) {
        toast.success('Enrolled!');
        queryClient.invalidateQueries(['enrollment', data.course._id]);
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Enrollment failed'),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => api.post('/payments/create-checkout-session', {
      courseId: data?.course?._id,
      successUrl: `${window.location.origin}/course/${slug}?enrolled=1`,
      cancelUrl: window.location.href,
    }, { skipAuthRedirect: true }),
    onSuccess: (res) => {
      if (res.data?.url) window.location.href = res.data.url;
      else toast.error('Payment not configured');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Checkout failed'),
  });

  const course = data?.course;
  const courseId = course?._id;

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/course/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const addReviewMutation = useMutation({
    mutationFn: () => api.post('/reviews', { courseId, rating: reviewRating, comment: reviewComment }),
    onSuccess: () => {
      toast.success('Review added');
      queryClient.invalidateQueries(['reviews', courseId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  if (isLoading || !course) return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;

  const isPaid = course.price > 0;
  const reviews = reviewsData?.reviews || [];
  const rating = reviewsData?.rating ?? 0;
  const totalReviews = reviewsData?.totalReviews ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="aspect-video bg-slate-200">
          {course.thumbnail ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-slate-600 mt-2">By {course.instructor?.name}</p>
          <p className="mt-4 text-slate-700">{course.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm">{course.category}</span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm capitalize">{course.level}</span>
            {course.hasCertificate && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                Includes certificate of completion
              </span>
            )}
            <span className="text-primary-600 font-bold text-xl ml-auto">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
          </div>
          {course.hasCertificate && course.certificateText && (
            <p className="mt-2 text-sm text-slate-600 bg-emerald-50/60 border border-emerald-100 rounded-lg px-3 py-2">
              {course.certificateText}
            </p>
          )}
          {user ? (
            <div className="mt-6 flex gap-3">
              {isPaid ? (
                <button onClick={() => checkoutMutation.mutate()} disabled={checkoutMutation.isPending} className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50">Enroll now (pay)</button>
              ) : (
                <button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending} className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50">Enroll for free</button>
              )}
              <Link to={`/learn/${course._id}`} className="border border-primary-500 text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-primary-50">Go to course</Link>
            </div>
          ) : (
            <p className="mt-6"><Link to="/login" className="text-primary-600 font-medium">Log in</Link> to enroll.</p>
          )}
        </div>
      </div>
      {course.curriculum?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-4">Curriculum</h2>
          <ul className="space-y-2">
            {course.curriculum.map((sec, i) => (
              <li key={i}>
                <span className="font-medium">{sec.title}</span>
                <ul className="ml-4 mt-1 text-slate-600">
                  {sec.lessons?.map((les, j) => (
                    <li key={j}>
                      {les.title} ({les.type})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-8 bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Requirements & contact</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>Internet connection and a device capable of playing course videos.</li>
          <li>Willingness to learn and complete the lessons.</li>
          <li>
            For any questions about this course, you can contact the teacher at phone
            {' '}
            <strong>+966547225409</strong>
            {' '}
            or email
            {' '}
            <strong>moaazsamehzeedan@gmail.com</strong>
            .
          </li>
        </ul>
      </div>
      <div className="mt-8 bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Reviews {totalReviews > 0 && `(${rating} · ${totalReviews})`}</h2>
        {user && (
          <div className="mb-6">
            <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="border rounded px-2 py-1 mr-2">
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
            <input type="text" placeholder="Your review (optional)" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="border rounded px-3 py-2 flex-1 min-w-[200px] mr-2" />
            <button onClick={() => addReviewMutation.mutate()} disabled={addReviewMutation.isPending} className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50">Submit</button>
          </div>
        )}
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r._id} className="border-b border-slate-100 pb-3">
              <span className="font-medium">{r.user?.name}</span>
              <span className="text-amber-500 ml-2">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              {r.comment && <p className="text-slate-600 text-sm mt-1">{r.comment}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
