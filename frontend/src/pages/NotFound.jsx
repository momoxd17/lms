import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500">404</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mt-2">Page not found</p>
        <Link to="/" className="inline-block mt-6 text-primary-600 font-medium hover:underline">Back to home</Link>
      </div>
    </div>
  );
}
