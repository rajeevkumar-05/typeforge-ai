import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
  {
    heading: 'Product',
    links: [
      { label: 'Typing Test', to: '/typing' },
      { label: 'Leaderboard', to: '/leaderboard' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
      { label: 'Settings', to: '/settings' },
    ],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="3" />
                  <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h.01M12 14h.01M16 14h.01M4 14h.01M6 18h12" />
                </svg>
              </div>
              <span
                className="text-base font-bold text-[var(--text-primary)]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                TypeForge <span className="text-accent">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              The next-generation typing practice platform. Track progress, beat records, code faster.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4
                className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} TypeForge AI. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Built with{' '}
            <span className="text-error">♥</span>
            {' '}and TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
};
