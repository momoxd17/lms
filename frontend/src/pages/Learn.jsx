import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export default function Learn() {
  const { courseId } = useParams();
  const queryClient = useQueryClient();

  const { data: enrollmentData } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/enrollments/${courseId}`);
      return data;
    },
  });

  const { data: courseData } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}`);
      return data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: (lessonId) => api.post('/enrollments/complete-lesson', { courseId, lessonId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
    },
  });

  const enrollment = enrollmentData?.enrollment;
  const course = courseData?.course;

  if (!enrollment || !course) return <div className="max-w-6xl mx-auto px-4 py-8">Loading or not enrolled...</div>;

  const completedIds = (enrollment.progress || []).map((p) => String(p.lessonId));
  let currentLesson = null;
  let currentSection = null;
  for (const sec of course.curriculum || []) {
    for (const les of sec.lessons || []) {
      if (!currentLesson) {
        currentLesson = les;
        currentSection = sec;
      }
      if (!completedIds.includes(String(les._id))) {
        currentLesson = les;
        currentSection = sec;
        break;
      }
    }
    if (currentLesson) break;
  }

  const totalLessons = (course.curriculum || []).reduce((s, sec) => s + (sec.lessons?.length || 0), 0);
  const percent = totalLessons ? Math.round((enrollment.progress?.length || 0) / totalLessons * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
        <div className="h-2 bg-slate-200 rounded-full mb-6">
          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
        {currentLesson ? (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold">{currentSection?.title} &rarr; {currentLesson.title}</h2>
            <p className="text-slate-600 mt-2">Type: {currentLesson.type}</p>
            {currentLesson.type === 'video' && currentLesson.videoUrl && (
              <div className="aspect-video mt-4 bg-slate-900 rounded-lg overflow-hidden">
                <iframe src={currentLesson.videoUrl} title={currentLesson.title} className="w-full h-full" allowFullScreen />
              </div>
            )}
            {currentLesson.type === 'text' && <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: currentLesson.content || '' }} />}
            <button onClick={() => completeMutation.mutate(currentLesson._id)} disabled={completeMutation.isPending} className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50">Mark complete</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-6 text-center">
            <p className="text-lg text-green-600 font-medium">You've completed all lessons!</p>
            {enrollment.certificateUrl && <p className="mt-2">Your certificate is available in Dashboard.</p>}
          </div>
        )}
      </div>
      <aside className="w-72 flex-shrink-0">
        <div className="bg-white rounded-xl border p-4 sticky top-24">
          <h3 className="font-semibold mb-3">Curriculum</h3>
          <ul className="space-y-2 text-sm">
            {(course.curriculum || []).map((sec, i) => (
              <li key={i}>
                <span className="font-medium text-slate-700">{sec.title}</span>
                <ul className="ml-2 mt-1 space-y-0.5">
                  {(sec.lessons || []).map((les, j) => (
                    <li key={j} className="flex items-center gap-2">
                      {completedIds.includes(String(les._id)) ? <span className="text-green-500">✓</span> : <span className="w-4" />}
                      <span className={currentLesson?._id === les._id ? 'text-primary-600 font-medium' : ''}>{les.title}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
