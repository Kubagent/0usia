import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — 0usia',
  description: 'Terms of Service for 0usia vision studio services.',
};

export default function TermsPage() {
  const lastUpdated = '9 June 2025';

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-black/10 px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-cormorant text-xl tracking-widest hover:opacity-60 transition-opacity">
          0usia
        </Link>
        <Link href="/" className="text-xs tracking-[0.2em] uppercase text-black/40 hover:text-black/70 transition-colors">
          ← Back
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <h1 className="font-cormorant text-5xl sm:text-6xl tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-black/40 mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-12 text-sm leading-relaxed text-black/75 font-light">

          {/* 1 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">1. Service Provider</h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern the use of services provided by <strong className="font-medium text-black">0usia</strong>, operated by Jakub Wójcik (&ldquo;Service Provider&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a business activity registered in Poland.
            </p>
            <p className="mt-3">
              Contact: <a href="mailto:hello@0usia.com" className="text-black underline underline-offset-2 hover:opacity-60">hello@0usia.com</a>
            </p>
            <p className="mt-3">
              These Terms are governed by Polish law, in particular: the Civil Code of 23 April 1964 (<em>Kodeks cywilny</em>), the Act of 18 July 2002 on Electronic Services (<em>Ustawa o świadczeniu usług drogą elektroniczną</em>), and where applicable, the Consumer Rights Act of 30 May 2014 (<em>Ustawa o prawach konsumenta</em>).
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">2. Scope of Services</h2>
            <p>
              0usia provides venture-building, strategy, communication, community design, operations, and product development services to founders, entrepreneurs, operators, and creative professionals. Services are provided on the basis of individual agreements, scoped proposals, or retainer arrangements concluded with each Client.
            </p>
            <p className="mt-3">
              The Website at <strong className="font-medium text-black">0usia.com</strong> constitutes an informational service within the meaning of the Act on Electronic Services. Use of the Website is free of charge and requires no registration.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">3. Formation of Contract</h2>
            <p>
              A binding contract for services is formed only upon written confirmation (including by electronic means) by both parties of a specific scope of work, timeline, and remuneration. Submission of an enquiry via the Website, booking a discovery call, or submitting a project brief does not constitute a contract or binding offer.
            </p>
            <p className="mt-3">
              Contracts concluded at a distance or off-premises with Consumers within the meaning of Article 22¹ of the Civil Code are subject to the Consumer Rights Act. Consumers have the right to withdraw from a distance contract within 14 days of its conclusion without stating a reason, unless the service has been fully performed with the Consumer&apos;s prior express consent and acknowledgement that the right of withdrawal will be lost upon full performance.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">4. Fees and Payment</h2>
            <p>
              Fees are agreed individually for each engagement and documented in writing. Unless otherwise agreed:
            </p>
            <ul className="mt-3 space-y-1.5 pl-4 list-disc list-outside">
              <li>Invoices are due within 14 days of issue.</li>
              <li>Fees are quoted net of VAT (podatek VAT), which will be added where required by Polish tax law.</li>
              <li>Overdue payments accrue statutory interest as provided by the Act of 8 March 2013 on payment terms in commercial transactions (<em>Ustawa o terminach zapłaty w transakcjach handlowych</em>).</li>
              <li>All prices are denominated in Polish zloty (PLN) unless expressly stated otherwise.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">5. Intellectual Property</h2>
            <p>
              All materials, deliverables, strategies, designs, and other works created by 0usia are protected by copyright and remain the intellectual property of the Service Provider unless expressly transferred or licensed in writing within the relevant engagement agreement.
            </p>
            <p className="mt-3">
              The scope of any licence (<em>licencja</em>) or assignment of economic rights (<em>przeniesienie autorskich praw majątkowych</em>) — including its fields of use (<em>pola eksploatacji</em>), territorial and temporal scope, and any exclusivity — is determined solely by the written agreement for each engagement. No rights are transferred by implication, by payment alone, or by delivery of materials.
            </p>
            <p className="mt-3">
              Moral rights (<em>autorskie prawa osobiste</em>) of authors are inalienable and are retained by their respective creators in accordance with the Act of 4 February 1994 on Copyright and Related Rights (<em>Ustawa o prawie autorskim i prawach pokrewnych</em>).
            </p>
            <p className="mt-3">
              All content on the Website — including texts, graphics, and the 0usia mark — is protected by copyright. It may not be reproduced or distributed without prior written consent.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">6. Confidentiality</h2>
            <p>
              Both parties agree to treat as confidential all non-public information disclosed in connection with a project. This obligation survives termination of the engagement for a period of 3 years, unless a separate non-disclosure agreement specifies otherwise.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">7. Liability</h2>
            <p>
              To the fullest extent permitted by Polish law, the Service Provider&apos;s liability for damages arising from the provision of services is limited to the total fees paid by the Client for the relevant engagement in the preceding 3 months.
            </p>
            <p className="mt-3">
              The Service Provider is not liable for indirect or consequential damages, lost profits (<em>utracone korzyści</em>), or damages arising from events beyond its reasonable control (<em>siła wyższa</em>).
            </p>
            <p className="mt-3">
              Nothing in these Terms limits liability for damages caused by wilful misconduct (<em>wina umyślna</em>), or excludes rights granted to Consumers under mandatory provisions of Polish law.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">8. Personal Data</h2>
            <p>
              Personal data submitted via the Website or in the course of enquiries is processed in accordance with our <Link href="/privacy" className="text-black underline underline-offset-2 hover:opacity-60">Privacy Policy</Link> and applicable provisions of Regulation (EU) 2016/679 (GDPR) as implemented in Polish law.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">9. Complaints</h2>
            <p>
              Complaints regarding services or the operation of the Website may be submitted to <a href="mailto:hello@0usia.com" className="text-black underline underline-offset-2 hover:opacity-60">hello@0usia.com</a>. We will respond within 14 days of receipt.
            </p>
            <p className="mt-3">
              Consumers may also use the online dispute resolution platform operated by the European Commission at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2 hover:opacity-60">ec.europa.eu/consumers/odr</a>, or seek assistance from the Polish Consumer Ombudsman (<em>Rzecznik Praw Konsumenta</em>).
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">10. Governing Law and Jurisdiction</h2>
            <p>
              These Terms and any disputes arising from or in connection with them are governed exclusively by Polish law.
            </p>
            <p className="mt-3">
              Any disputes between the Service Provider and business Clients shall be submitted to the court having jurisdiction over the Service Provider&apos;s registered place of business. Disputes with Consumers shall be resolved before the court having jurisdiction under the applicable provisions of the Code of Civil Procedure (<em>Kodeks postępowania cywilnego</em>).
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-cormorant text-2xl text-black mb-4">11. Amendments</h2>
            <p>
              We reserve the right to amend these Terms. Changes will be published on this page with an updated date. Continued use of the Website or services after publication of changes constitutes acceptance of the revised Terms, subject to mandatory notice periods required by law.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-black/10 text-xs text-black/30 leading-relaxed">
          <p>These Terms of Service should be reviewed by a qualified Polish attorney before reliance upon them in commercial or consumer contexts. They do not constitute legal advice.</p>
        </div>
      </main>
    </div>
  );
}
