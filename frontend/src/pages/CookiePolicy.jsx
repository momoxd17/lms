import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Cookie Policy</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">1. What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how you use the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">2. How We Use Cookies</h2>
          <p>LearnHub uses cookies for:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Strictly necessary:</strong> Required for the platform to function (e.g., authentication, security).</li>
            <li><strong>Preferences:</strong> Remembering your settings (e.g., theme, language).</li>
            <li><strong>Analytics:</strong> Understanding how visitors use our site to improve it (e.g., pages viewed, time spent).</li>
            <li><strong>Marketing (if applicable):</strong> Only with your consent, to measure campaign effectiveness.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">3. Your Choices</h2>
          <p>You can control or delete cookies through your browser settings. Disabling certain cookies may affect how the Platform works (for example, you may need to sign in again on each visit). Where we use optional cookies (e.g., analytics or marketing), we will seek your consent where required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">4. Updates</h2>
          <p>We may update this Cookie Policy from time to time. The &quot;Last updated&quot; date at the top indicates when it was last revised. Continued use of the Platform after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">5. Contact</h2>
          <p>
            For questions about our use of cookies, contact us at
            {' '}
            <strong>moaazsamehzeedan@gmail.com</strong>
            {' '}
            or by phone at
            {' '}
            <strong>+966547225409</strong>
            , or see our
            {' '}
            <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
