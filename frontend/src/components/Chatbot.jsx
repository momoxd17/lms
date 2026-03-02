import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, X } from 'lucide-react';
import api from '../api/axios';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: historyData } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const { data } = await api.get('/chat/history');
      return data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (text) => {
      const { data } = await api.post('/chat/ask', { message: text });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatHistory']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || mutation.isPending) return;
    mutation.mutate(message.trim());
    setMessage('');
  };

  const messages = historyData?.messages || [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-primary-600 text-white p-4 shadow-lg hover:bg-primary-700 flex items-center justify-center"
      >
        <MessageCircle size={22} />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Ask our assistant</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Quick answers, or forwarded to admin</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-3 text-xs text-slate-600 dark:text-slate-300 min-h-[120px] max-h-64 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p>Ask anything about courses, enrollment, or contact info. If we can’t answer, your question goes to the admin inbox.</p>
            ) : (
              messages.map((m) => (
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
              ))
            )}
          </div>
          <form onSubmit={handleSubmit} className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs"
              placeholder="Type your question..."
            />
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

