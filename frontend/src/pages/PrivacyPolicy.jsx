import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">1. Introduction</h2>
          <p>LearnHub Inc. (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our learning platform and related services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">2. Information We Collect</h2>
          <p>We may collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Account information (name, email address, password, profile details)</li>
            <li>Payment and billing information when you purchase courses</li>
            <li>Course progress, enrollments, and completion data</li>
            <li>Communications you send to us or to instructors</li>
            <li>Content you create (courses, reviews, forum posts) if applicable</li>
          </ul>
          <p className="mt-2">We also automatically collect certain technical data, such as IP address, device type, browser type, and usage data (e.g., pages visited, time spent) to improve our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Provide, maintain, and improve our platform and services</li>
            <li>Process enrollments and payments</li>
            <li>Send you important updates, security alerts, and support messages</li>
            <li>Personalize your experience and recommend relevant courses</li>
            <li>Analyze usage and trends to improve our product</li>
            <li>Comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">4. Sharing of Information</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Instructors whose courses you enroll in (e.g., progress and completion status)</li>
            <li>Service providers who assist us (hosting, analytics, payment processors) under strict confidentiality</li>
            <li>Legal authorities when required by law or to protect our rights and safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. No method of transmission over the Internet is 100% secure; we strive to use commercially acceptable means to protect your data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">6. Your Rights</h2>
          <p>Depending on your location, you may have the right to access, correct, delete, or port your personal data, or to object to or restrict certain processing. You can update your account details in your Profile and contact us for other requests.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">7. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our practices, please contact us at
            {' '}
            <strong>moaazsamehzeedan@gmail.com</strong>
            {' '}
            or by phone at
            {' '}
            <strong>+966547225409</strong>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
