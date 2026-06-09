import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for 0usia — how we collect, use, and protect your personal data under GDPR and Polish law.',
};

export default function PrivacyPage() {
  const lastUpdated = '9 June 2025';

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10 px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-cormorant text-xl tracking-widest hover:opacity-60 transition-opacity">
          0usia
        </Link>
        <Link href="/" className="text-xs tracking-[0.2em] uppercase text-black/40 hover:text-black/70 transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <h1 className="font-cormorant text-5xl sm:text-6xl tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-black/40 mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-12 text-sm leading-relaxed text-black/75 font-light">

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">1. Controller</h2>
            <p>
              The controller of your personal data is <strong className="font-medium text-black">0usia</strong>, operated by Jakub Wójcik, a business registered in Poland. Contact: <a href="mailto:hello@0usia.com" className="text-black underline underline-offset-2 hover:opacity-60">hello@0usia.com</a>.
            </p>
            <p className="mt-3">
              This Policy is governed by Regulation (EU) 2016/679 (GDPR) and applicable Polish data protection law.
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">2. Data We Collect</h2>
            <ul className="space-y-2 pl-4 list-disc list-outside">
              <li><strong className="font-medium text-black">Enquiry data</strong>: name, email, company, and message when you submit a project brief or contact form.</li>
              <li><strong className="font-medium text-black">Booking data</strong>: name, email, and calendar details when you schedule a call via Cal.com.</li>
              <li><strong className="font-medium text-black">Analytics data</strong>: anonymised page views and interaction events (no cookies required for this).</li>
              <li><strong className="font-medium text-black">Technical data</strong>: IP address and browser type, processed transiently by our hosting infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">3. Legal Basis and Purpose</h2>
            <ul className="space-y-2 pl-4 list-disc list-outside">
              <li><strong className="font-medium text-black">Enquiries</strong>: processed on the basis of your consent (Art. 6(1)(a) GDPR) and, where a pre-contractual relationship exists, on the basis of Art. 6(1)(b).</li>
              <li><strong className="font-medium text-black">Service delivery</strong>: processed on the basis of contractual necessity (Art. 6(1)(b) GDPR).</li>
              <li><strong className="font-medium text-black">Marketing</strong>: only where you have given separate, explicit consent.</li>
              <li><strong className="font-medium text-black">Legal obligations</strong>: where required by Polish law (Art. 6(1)(c) GDPR).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">4. Data Retention</h2>
            <p>
              Enquiry and contact data is retained for as long as necessary to respond and for up to 3 years thereafter for the purpose of potential follow-up engagement. Data related to concluded contracts is retained for the period required by Polish accounting and tax law (typically 5 years). You may request deletion at any time (see Section 6).
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">5. Third Parties and Transfers</h2>
            <p>We use a limited number of processors:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc list-outside">
              <li><strong className="font-medium text-black">Cal.com</strong> — calendar scheduling. Data processed under their privacy policy; servers in the EU.</li>
              <li><strong className="font-medium text-black">Vercel</strong> — website hosting. Infrastructure in the EU/EEA.</li>
              <li><strong className="font-medium text-black">Email provider</strong> — for responding to enquiries.</li>
            </ul>
            <p className="mt-3">
              We do not sell personal data. We do not transfer data outside the EEA without appropriate safeguards (Standard Contractual Clauses or adequacy decisions).
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">6. Your Rights</h2>
            <p>Under GDPR you have the right to:</p>
            <ul className="mt-3 space-y-1.5 pl-4 list-disc list-outside">
              <li>Access your personal data (Art. 15)</li>
              <li>Rectify inaccurate data (Art. 16)</li>
              <li>Erasure ("right to be forgotten") (Art. 17)</li>
              <li>Restrict processing (Art. 18)</li>
              <li>Data portability (Art. 20)</li>
              <li>Object to processing (Art. 21)</li>
              <li>Withdraw consent at any time, without affecting the lawfulness of prior processing</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email <a href="mailto:hello@0usia.com" className="text-black underline underline-offset-2 hover:opacity-60">hello@0usia.com</a>. We will respond within 30 days.
            </p>
            <p className="mt-3">
              You also have the right to lodge a complaint with the Polish supervisory authority: <strong className="font-medium text-black">Urząd Ochrony Danych Osobowych (UODO)</strong>, ul. Stawki 2, 00-193 Warsaw — <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2 hover:opacity-60">uodo.gov.pl</a>.
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">7. Cookies and Analytics</h2>
            <p>
              This website uses privacy-preserving analytics that do not require cookies or consent under ePrivacy rules. No advertising or tracking cookies are set. If this changes, we will update this policy and request consent where required.
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">8. Amendments</h2>
            <p>
              We may update this Policy. Changes are published on this page with a revised date. Continued use of the Website after publication constitutes acknowledgement of the updated Policy.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-black/10 flex flex-col sm:flex-row gap-4 text-xs text-black/30">
          <Link href="/terms" className="hover:text-black/60 transition-colors">Terms of Service</Link>
          <span className="hidden sm:inline">·</span>
          <a href="mailto:hello@0usia.com" className="hover:text-black/60 transition-colors">hello@0usia.com</a>
        </div>
      </main>
    </div>
  );
}
