import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using LearnHub (&quot;the Platform&quot;) operated by LearnHub Inc., you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">2. Description of Service</h2>
          <p>LearnHub provides an online learning platform where users can browse and enroll in courses, and where instructors can create and publish educational content. We may modify, suspend, or discontinue any part of the service with reasonable notice where feasible.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">3. Account and Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activity under your account. You must notify us immediately of any unauthorized use.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe intellectual property or other rights of others</li>
            <li>Upload malicious code, spam, or misleading content</li>
            <li>Harass, abuse, or harm other users or instructors</li>
            <li>Attempt to gain unauthorized access to the Platform or other accounts</li>
            <li>Use the service for any commercial purpose not permitted (e.g., reselling course access without authorization)</li>
          </ul>
          <p className="mt-2">We may suspend or terminate accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">5. Courses and Payments</h2>
          <p>Course fees, refunds, and payment terms are as stated at the point of purchase. Instructors may set their own prices subject to our policies. We may use third-party payment processors. By purchasing a course, you agree to the applicable payment and refund terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">6. Intellectual Property</h2>
          <p>Course content is owned by the respective instructors or licensors. LearnHub and its branding are owned by LearnHub Inc. You may not copy, distribute, or create derivative works from platform or course content without explicit permission.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">7. Disclaimers</h2>
          <p>The Platform and all content are provided &quot;as is&quot; without warranties of any kind. We do not guarantee accuracy, completeness, or fitness for a particular purpose of any course or content. Your use of the Platform is at your sole risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, LearnHub Inc. and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or data, arising from your use of the Platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">9. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of material changes by posting the new Terms on the Platform and updating the &quot;Last updated&quot; date. Continued use after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-2">10. Contact</h2>
          <p>
            For questions about these Terms of Service, contact us at
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
