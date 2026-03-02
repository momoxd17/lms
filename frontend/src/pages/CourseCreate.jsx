import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import FileDropZone from '../components/FileDropZone';
import { Trash2, Plus } from 'lucide-react';

const emptyForm = {
  title: '',
  description: '',
  thumbnail: '',
  category: 'General',
  level: 'beginner',
  price: 0,
  hasCertificate: false,
  certificateText: '',
  certificateTemplateUrl: '',
  published: false,
  curriculum: [{ title: 'Section 1', lessons: [{ title: 'Lesson 1', type: 'text', content: '' }] }],
};

function normalizeLesson(les) {
  return {
    ...les,
    title: les.title ?? 'Lesson',
    type: les.type ?? 'text',
    content: les.content ?? '',
    videoUrl: les.videoUrl ?? '',
    attachmentUrl: les.attachmentUrl ?? '',
    quiz: les.quiz && typeof les.quiz === 'object' ? les.quiz : undefined,
  };
}

function normalizeCurriculum(curriculum) {
  if (!Array.isArray(curriculum) || curriculum.length === 0) return emptyForm.curriculum;
  return curriculum.map((sec) => ({
    title: sec.title ?? 'Section',
    lessons: Array.isArray(sec.lessons) ? sec.lessons.map(normalizeLesson) : [{ title: 'New lesson', type: 'text', content: '' }],
  }));
}

export default function CourseCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);

  const { data: courseData, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course', 'edit', id],
    queryFn: async () => {
      const { data } = await api.get(`/courses/instructor/course/${id}`);
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (!isEdit || !courseData?.course) return;
    const c = courseData.course;
    setForm({
      title: c.title ?? '',
      description: c.description ?? '',
      thumbnail: c.thumbnail ?? '',
      category: c.category ?? 'General',
      level: c.level ?? 'beginner',
      price: Number(c.price) ?? 0,
      hasCertificate: Boolean(c.hasCertificate),
      certificateText: c.certificateText ?? '',
      certificateTemplateUrl: c.certificateTemplateUrl ?? '',
      published: Boolean(c.published),
      curriculum: normalizeCurriculum(c.curriculum),
    });
  }, [isEdit, courseData, id]);

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/courses', body),
    onSuccess: () => {
      toast.success('Course created');
      navigate('/instructor/courses');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: (body) => api.patch(`/courses/${id}`, body),
    onSuccess: () => {
      toast.success('Course updated');
      navigate('/instructor/courses');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const addSection = () => {
    setForm((f) => ({ ...f, curriculum: [...f.curriculum, { title: `Section ${f.curriculum.length + 1}`, lessons: [{ title: 'New lesson', type: 'text', content: '' }] }] }));
  };

  const addLesson = (sectionIdx) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      cur[sectionIdx] = { ...cur[sectionIdx], lessons: [...(cur[sectionIdx].lessons || []), { title: 'New lesson', type: 'text', content: '' }] };
      return { ...f, curriculum: cur };
    });
  };

  const updateLesson = (sectionIdx, lessonIdx, field, value) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = [...(cur[sectionIdx].lessons || [])];
      lessons[lessonIdx] = { ...lessons[lessonIdx], [field]: value };
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  const getLessonAttachmentUrl = (sectionIdx, lessonIdx) =>
    form.curriculum[sectionIdx]?.lessons?.[lessonIdx]?.attachmentUrl;

  const updateSection = (sectionIdx, field, value) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      cur[sectionIdx] = { ...cur[sectionIdx], [field]: value };
      return { ...f, curriculum: cur };
    });
  };

  const removeSection = (sectionIdx) => {
    setForm((f) => ({
      ...f,
      curriculum: f.curriculum.filter((_, i) => i !== sectionIdx),
    }));
  };

  const removeLesson = (sectionIdx, lessonIdx) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = (cur[sectionIdx].lessons || []).filter((_, i) => i !== lessonIdx);
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  const getQuizQuestions = (sectionIdx, lessonIdx) =>
    form.curriculum[sectionIdx]?.lessons?.[lessonIdx]?.quiz?.questions ?? [];

  const addQuizQuestion = (sectionIdx, lessonIdx) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = [...(cur[sectionIdx].lessons || [])];
      const lesson = { ...lessons[lessonIdx], quiz: { questions: [...(lessons[lessonIdx].quiz?.questions || []), { type: 'mcq', text: '', options: ['', ''], correctIndex: 0 }] } };
      lessons[lessonIdx] = lesson;
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  const removeQuizQuestion = (sectionIdx, lessonIdx, questionIdx) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = [...(cur[sectionIdx].lessons || [])];
      const questions = (lessons[lessonIdx].quiz?.questions || []).filter((_, i) => i !== questionIdx);
      lessons[lessonIdx] = { ...lessons[lessonIdx], quiz: { questions } };
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  const updateQuizQuestion = (sectionIdx, lessonIdx, questionIdx, updates) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = [...(cur[sectionIdx].lessons || [])];
      const questions = [...(lessons[lessonIdx].quiz?.questions || [])];
      const q = questions[questionIdx] || {};
      const type = updates.type !== undefined ? updates.type : q.type;
      const base = type === 'short' ? { type: 'short', text: q.text, correctAnswer: q.correctAnswer ?? '' } : { type: q.type, text: q.text, options: q.options || ['', ''], correctIndex: q.correctIndex ?? 0, correctIndices: q.correctIndices ?? [] };
      const merged = { ...base, ...updates };
      if (updates.type === 'mcq') merged.options = merged.options || ['', ''], merged.correctIndex = merged.correctIndex ?? 0, delete merged.correctIndices, delete merged.correctAnswer;
      if (updates.type === 'msq') merged.options = merged.options || ['', ''], merged.correctIndices = merged.correctIndices ?? [], delete merged.correctIndex, delete merged.correctAnswer;
      if (updates.type === 'short') merged.correctAnswer = merged.correctAnswer ?? '', delete merged.options, delete merged.correctIndex, delete merged.correctIndices;
      questions[questionIdx] = merged;
      lessons[lessonIdx] = { ...lessons[lessonIdx], quiz: { questions } };
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  const setQuizOption = (sectionIdx, lessonIdx, questionIdx, optionIdx, value) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = [...(cur[sectionIdx].lessons || [])];
      const questions = [...(lessons[lessonIdx].quiz?.questions || [])];
      const opts = [...(questions[questionIdx]?.options || [])];
      while (opts.length <= optionIdx) opts.push('');
      opts[optionIdx] = value;
      questions[questionIdx] = { ...questions[questionIdx], options: opts };
      lessons[lessonIdx] = { ...lessons[lessonIdx], quiz: { questions } };
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  const addQuizOption = (sectionIdx, lessonIdx, questionIdx) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = [...(cur[sectionIdx].lessons || [])];
      const questions = [...(lessons[lessonIdx].quiz?.questions || [])];
      const opts = [...(questions[questionIdx]?.options || []), ''];
      questions[questionIdx] = { ...questions[questionIdx], options: opts };
      lessons[lessonIdx] = { ...lessons[lessonIdx], quiz: { questions } };
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  const removeQuizOption = (sectionIdx, lessonIdx, questionIdx, optionIdx) => {
    setForm((f) => {
      const cur = [...f.curriculum];
      const lessons = [...(cur[sectionIdx].lessons || [])];
      const questions = [...(lessons[lessonIdx].quiz?.questions || [])];
      const opts = (questions[questionIdx]?.options || []).filter((_, i) => i !== optionIdx);
      if (opts.length < 2) return f;
      const q = { ...questions[questionIdx], options: opts };
      if (q.correctIndex >= opts.length) q.correctIndex = opts.length - 1;
      if (Array.isArray(q.correctIndices)) q.correctIndices = q.correctIndices.filter(i => i < opts.length);
      questions[questionIdx] = q;
      lessons[lessonIdx] = { ...lessons[lessonIdx], quiz: { questions } };
      cur[sectionIdx] = { ...cur[sectionIdx], lessons };
      return { ...f, curriculum: cur };
    });
  };

  if (isEdit && courseLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" />
      </div>
    );
  }
  if (isEdit && courseError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-500">{courseError.response?.data?.message || 'Failed to load course'}</p>
        <button type="button" onClick={() => navigate('/instructor/courses')} className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">Back to My courses</button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) updateMutation.mutate(form);
    else createMutation.mutate(form);
  };
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{isEdit ? 'Edit course' : 'Create course'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <input type="text" placeholder="Course title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 h-24" />
          <div className="flex gap-4 flex-wrap">
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2">
              <option value="General">General</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
            </select>
            <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input type="number" min={0} max={10000} step={0.01} placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 w-24" />
          </div>
          <div className="grid md:grid-cols-[2fr,3fr] gap-4 items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Course image (optional)</p>
              <FileDropZone
                label="Drop image here or click to upload"
                accept="image/*"
                maxSizeMB={5}
                onUpload={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
              />
              <input
                type="url"
                placeholder="Or paste image URL"
                value={form.thumbnail || ''}
                onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm"
              />
              {form.thumbnail && (
                <div className="mt-2 w-full aspect-video max-w-xs rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-900/20">
                  <img src={form.thumbnail} alt="Course thumbnail preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Certificate (optional)</p>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.hasCertificate}
                  onChange={(e) => setForm((f) => ({ ...f, hasCertificate: e.target.checked }))}
                />
                This course includes a certificate of completion
              </label>
              {form.hasCertificate && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Certificate notes (optional, e.g. requirements or description shown to students)"
                    value={form.certificateText || ''}
                    onChange={(e) => setForm((f) => ({ ...f, certificateText: e.target.value }))}
                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 h-20 text-sm"
                  />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Certificate template (image without name)</p>
                    <FileDropZone
                      label="Drop certificate template image here or click to upload"
                      accept="image/*"
                      maxSizeMB={5}
                      onUpload={(url) => setForm((f) => ({ ...f, certificateTemplateUrl: url }))}
                    />
                    <input
                      type="url"
                      placeholder="Or paste template image URL"
                      value={form.certificateTemplateUrl || ''}
                      onChange={(e) => setForm((f) => ({ ...f, certificateTemplateUrl: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm"
                    />
                    {form.certificateTemplateUrl && (
                      <div className="mt-1 w-full aspect-video max-w-xs rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-900/20">
                        <img src={form.certificateTemplateUrl} alt="Certificate template preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Curriculum</h2>
            <button type="button" onClick={addSection} className="text-primary-600 text-sm font-medium">Add section</button>
          </div>
          {form.curriculum.map((sec, si) => (
            <div key={si} className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <input type="text" placeholder="Section title" value={sec.title} onChange={(e) => updateSection(si, 'title', e.target.value)} className="flex-1 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2" />
                <button type="button" onClick={() => removeSection(si)} className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors" title="Delete section" aria-label="Delete section">
                  <Trash2 size={18} />
                </button>
              </div>
              {(sec.lessons || []).map((les, li) => (
                <div key={li} className="ml-4 mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="Lesson title" value={les.title} onChange={(e) => updateLesson(si, li, 'title', e.target.value)} className="flex-1 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1.5 text-sm" />
                    <select value={les.type} onChange={(e) => updateLesson(si, li, 'type', e.target.value)} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1.5 text-sm w-28">
                      <option value="text">Text</option>
                      <option value="video">Video</option>
                      <option value="quiz">Quiz</option>
                      <option value="attachment">Attachment</option>
                    </select>
                    <button type="button" onClick={() => removeLesson(si, li)} className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors shrink-0" title="Delete lesson" aria-label="Delete lesson">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {les.type === 'video' && (
                    <div className="mt-2 space-y-2">
                      <FileDropZone
                        label="Drop video here or click to upload"
                        accept="video/*,.mp4,.webm,.mov,.mkv"
                        maxSizeMB={200}
                        onUpload={(url) => updateLesson(si, li, 'videoUrl', url)}
                      />
                      {(les.videoUrl || '').startsWith('http') && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Video: {les.videoUrl}</p>
                      )}
                      <input type="url" placeholder="Or paste video URL (YouTube, Vimeo, or direct link)" value={les.videoUrl || ''} onChange={(e) => updateLesson(si, li, 'videoUrl', e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1.5 text-sm" />
                    </div>
                  )}
                  {les.type === 'attachment' && (
                    <div className="mt-2 space-y-2">
                      <FileDropZone
                        label="Drop PDF or document here, or click to choose from your PC"
                        accept=".pdf,.doc,.docx,.txt,.zip,application/pdf"
                        onUpload={(url) => updateLesson(si, li, 'attachmentUrl', url)}
                      />
                      {getLessonAttachmentUrl(si, li) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Uploaded: {getLessonAttachmentUrl(si, li)}</p>
                      )}
                      <input type="url" placeholder="Or paste attachment URL" value={les.attachmentUrl || ''} onChange={(e) => updateLesson(si, li, 'attachmentUrl', e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1.5 text-sm" />
                    </div>
                  )}
                  {les.type === 'text' && (
                    <textarea placeholder="Text content" value={les.content || ''} onChange={(e) => updateLesson(si, li, 'content', e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1.5 text-sm mt-1 min-h-[80px]" />
                  )}
                  {les.type === 'quiz' && (
                    <div className="mt-3 space-y-4 pl-2 border-l-2 border-primary-200 dark:border-primary-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quiz questions</p>
                      {getQuizQuestions(si, li).map((q, qi) => (
                        <div key={qi} className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 space-y-2">
                          <div className="flex gap-2 items-start">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium pt-2">Q{qi + 1}</span>
                            <div className="flex-1 space-y-2">
                              <input type="text" placeholder="Question text" value={q.text || ''} onChange={(e) => updateQuizQuestion(si, li, qi, { text: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1.5 text-sm" />
                              <select value={q.type || 'mcq'} onChange={(e) => updateQuizQuestion(si, li, qi, { type: e.target.value })} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1 text-sm">
                                <option value="mcq">Multiple choice (single answer)</option>
                                <option value="msq">Multiple select (multiple answers)</option>
                                <option value="short">Short answer / Q&amp;A</option>
                              </select>
                            </div>
                            <button type="button" onClick={() => removeQuizQuestion(si, li, qi)} className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0" title="Remove question" aria-label="Remove question"><Trash2 size={14} /></button>
                          </div>
                          {(q.type === 'mcq' || q.type === 'msq') && (
                            <div className="ml-6 space-y-1.5">
                              <span className="text-xs text-slate-500 dark:text-slate-400">Options (select correct one(s) below)</span>
                              {(q.options || ['', '']).map((opt, oi) => (
                                <div key={oi} className="flex gap-2 items-center">
                                  <input type="text" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => setQuizOption(si, li, qi, oi, e.target.value)} className="flex-1 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1 text-sm" />
                                  {q.type === 'mcq' && (
                                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                                      <input type="radio" name={`quiz-${si}-${li}-${qi}`} checked={(q.correctIndex ?? 0) === oi} onChange={() => updateQuizQuestion(si, li, qi, { correctIndex: oi })} /> Correct
                                    </label>
                                  )}
                                  {q.type === 'msq' && (
                                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                                      <input type="checkbox" checked={(q.correctIndices ?? []).includes(oi)} onChange={(e) => { const idx = (q.correctIndices ?? []).filter(i => i !== oi); if (e.target.checked) idx.push(oi); idx.sort((a,b)=>a-b); updateQuizQuestion(si, li, qi, { correctIndices: idx }); }} /> Correct
                                    </label>
                                  )}
                                  {(q.options?.length || 0) > 2 && <button type="button" onClick={() => removeQuizOption(si, li, qi, oi)} className="p-1 text-slate-400 hover:text-red-500" aria-label="Remove option"><Trash2 size={12} /></button>}
                                </div>
                              ))}
                              <button type="button" onClick={() => addQuizOption(si, li, qi)} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium"><Plus size={12} /> Add option</button>
                            </div>
                          )}
                          {q.type === 'short' && (
                            <div className="ml-6">
                              <input type="text" placeholder="Correct answer (or accepted answer)" value={q.correctAnswer || ''} onChange={(e) => updateQuizQuestion(si, li, qi, { correctAnswer: e.target.value })} className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1.5 text-sm" />
                            </div>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addQuizQuestion(si, li)} className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-medium">
                        <Plus size={16} /> Add question
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addLesson(si)} className="ml-4 text-primary-600 text-sm">+ Lesson</button>
            </div>
          ))}
        </div>
        <button type="submit" disabled={isPending} className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50">{isEdit ? 'Save changes' : 'Create course'}</button>
      </form>
    </div>
  );
}
