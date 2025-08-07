import React, { useEffect, useState } from 'react';

/**
 * FooterSection: Minimalist, centered, black background footer inspired by footer.png.
 * - Large mail icon button (mailto)
 * - Twitter, Instagram, LinkedIn handles (minimal)
 * - Berlin time counter (live)
 * - Cormorant Garamond for mail, Space Grotesk for secondary
 * - No animation, all info centered
 * - Responsive for mobile/tablet/desktop
 */

const mail = 'contact@0vsia.com';
const socials = [
  {
    name: 'Twitter',
    url: 'https://twitter.com/ovsia',
    icon: (
      <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.53 0-4.5 2.17-4.5 4.84 0 .38.04.76.12 1.12C7.69 5.8 4.07 4.13 1.64 1.16c-.42.76-.66 1.64-.66 2.58 0 1.78.87 3.35 2.19 4.28A4.52 4.52 0 01.96 7.1v.06c0 2.49 1.72 4.56 4.01 5.03-.42.12-.86.18-1.31.18-.32 0-.63-.03-.93-.08.63 2.09 2.45 3.6 4.6 3.64A9.06 9.06 0 010 21.54a12.8 12.8 0 006.95 2.07c8.34 0 12.9-7.15 12.9-13.36 0-.2 0-.39-.01-.58A9.59 9.59 0 0023 3z"></path></svg>
    )
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/ovsia',
    icon: (
      <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg>
    )
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/ovsia',
    icon: (
      <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2" /><line x1="7" y1="10" x2="7" y2="16" /><line x1="7" y1="7" x2="7" y2="7" /><line x1="11" y1="10" x2="11" y2="16" /><path d="M11 13a2 2 0 014 0v3" /></svg>
    )
  }
];

function getBerlinTime() {
  const now = new Date();
  // Berlin timezone: Europe/Berlin
  return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Europe/Berlin' });
}

const FooterSection: React.FC = () => {
  const [berlinTime, setBerlinTime] = useState(getBerlinTime());
  useEffect(() => {
    const interval = setInterval(() => setBerlinTime(getBerlinTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      style={{
        background: '#000',
        color: '#fff',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        position: 'relative',
        zIndex: 10,
      }}
      aria-label="Site footer"
    >
      <style>{`
        @media (max-width: 600px) {
          footer {
            min-height: 100vh !important;
            height: 100vh !important;
            padding-top: 2.5rem !important;
          }
          .footer-mail-btn {
            width: 100vw !important;
            min-width: 0 !important;
            max-width: 100vw !important;
            height: 120px !important;
            font-size: 3.2rem !important;
            border-radius: 0 !important;
          }
          .footer-socials {
            gap: 1.5rem !important;
          }
        }
        .footer-mail-btn {
          transition: opacity 0.25s, color 0.25s;
        }
        .footer-mail-btn:hover {
          opacity: 0.5;
        }
        .footer-socials a {
          transition: opacity 0.25s, color 0.25s;
        }
        .footer-socials a:hover {
          opacity: 0.5;
        }
        .footer-main-label {
          font-size: 8vw;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: capitalize;
          margin-bottom: 2.5rem;
          text-align: center;
        }
        .footer-secondary {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem;
          color: #bdbdbd;
          margin-bottom: 1.5rem;
          text-align: center;
        }
      `}</style>
      {/* MAIL main label */}
      <div className="footer-main-label">Mail</div>
      {/* Socials row */}
      <div
        className="footer-socials"
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '2.5rem',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '1.7rem',
        }}
      >
        {socials.map(s => (
          <a
            key={s.name}
            href={s.url}
            aria-label={s.name}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', color: '#fff', opacity: 0.8, transition: 'opacity 0.2s', fontSize: '1.1rem', textDecoration: 'none' }}
            tabIndex={0}
          >
            {s.icon}
          </a>
        ))}
      </div>
      {/* Berlin time */}
      <div
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 500,
          fontSize: '1.2rem',
          color: '#bdbdbd',
          marginBottom: '1.5rem',
          letterSpacing: '0.03em',
        }}
        aria-label="Current time in Berlin"
      >
        Berlin: {berlinTime}
      </div>
      {/* Copyright */}
      <div
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 400,
          fontSize: '1.1rem',
          color: '#bdbdbd',
          marginTop: '0.5rem',
          textAlign: 'center',
        }}
      >
        &copy; {new Date().getFullYear()} Ovsia. All rights reserved.
      </div>
    </footer>
  );
};

export default FooterSection;
