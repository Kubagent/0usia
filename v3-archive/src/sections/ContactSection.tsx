import React from 'react';
import { motion } from 'framer-motion';

/**
 * ContactSection: Full-width, full-height section with white background and three columns for CTAs.
 * Requirements per PRD:
 * - Minimalist, essentialist layout
 * - Responsive 3-column grid (1 column on mobile)
 * - Each column: headline, description, placeholder for CTA button
 * - White background, full viewport height
 * - Ready for future Framer Motion animation hooks
 */

const ctas = [
  {
    headline: 'Partner With Us',
    description: 'You would like us to join you as partners & help you build a venture from scratch.',
    button: 'PARTNER WITH US',
  },
  {
    headline: 'Get Support',
    description: 'You would like us to support the growth of your existing venture.',
    button: 'GET SUPPORT',
  },
  {
    headline: 'Seek Investment',
    description: 'You would like us to invest in your venture.',
    button: 'SEEK INVESTMENT',
  },
];

const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      style={{
        background: '#fff',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', // always three columns except on mobile
          gap: '2rem',
          width: '90vw',
          maxWidth: '1400px',
        }}
        role="list"
      >
        <style>{`
          @media (max-width: 600px) {
            #contact > div { grid-template-columns: 1fr !important; }
          }
          #contact button, #contact a {
            outline: none;
            min-width: 180px;
            min-height: 48px;
          }
          #contact button:focus-visible, #contact a:focus-visible {
            outline: 2px solid #111;
            outline-offset: 2px;
            box-shadow: 0 0 0 4px #e6e6e6;
          }
        `}</style>
        <h2 id="contact-heading" style={{position:'absolute',left:'-9999px',height:1,width:1,overflow:'hidden'}}>Contact Ovsia</h2>
        {ctas.map((cta, idx) => (
          <div
            key={cta.headline}
            role="listitem"
            style={{
              background: '#fff',
              borderRadius: '1.5rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '320px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '2rem', marginBottom: '1.5rem', color: '#111' }}>{cta.headline}</h3>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', marginBottom: '2.5rem', color: '#2d2d2d' }}>{cta.description}</p>
            {/* CTA buttons with Framer Motion animation */}
            {idx === 0 && (
              <motion.button
                type="button"
                aria-label="Open Partner With Us form"
                tabIndex={0}
                style={{
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '0.85rem 2.5rem',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 500,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '180px',
                  minHeight: '48px',
                }}
                whileHover={{ scale: 1.08, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}
                whileTap={{ scale: 0.96, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                onClick={() => alert('Partner With Us modal coming soon!')}
              >
                {cta.button}
              </motion.button>
            )}
            {idx === 1 && (
              <motion.a
                href="mailto:consult@0vsia.com"
                aria-label="Email Ovsia support"
                tabIndex={0}
                style={{
                  display: 'inline-block',
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '0.85rem 2.5rem',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 500,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                  minWidth: '180px',
                  minHeight: '48px',
                }}
                whileHover={{ scale: 1.08, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}
                whileTap={{ scale: 0.96, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                {cta.button}
              </motion.a>
            )}
            {idx === 2 && (
              <motion.button
                type="button"
                aria-label="Open Seek Investment form"
                tabIndex={0}
                style={{
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '0.85rem 2.5rem',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 500,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '180px',
                  minHeight: '48px',
                }}
                whileHover={{ scale: 1.08, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}
                whileTap={{ scale: 0.96, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                onClick={() => alert('Seek Investment modal coming soon!')}
              >
                {cta.button}
              </motion.button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactSection;
