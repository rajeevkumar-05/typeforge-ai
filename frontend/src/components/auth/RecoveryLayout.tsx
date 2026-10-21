import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import '../../pages/Login.css';
import '../../pages/Recovery.css';

export function RecoveryLayout({ title, description, icon, children }: {
  title: string; description: string; icon: ReactNode; children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return <div className="login-screen">
    <Link className="login-back" to="/typing"><ArrowLeft aria-hidden="true" /> Back to practice</Link>
    <motion.div className="login-shell recovery-shell" initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
      <div className="login-brand-block">
        <Link className="login-brand" to="/" aria-label="TypeForge home"><span className="login-mark">T</span><span>typeforge<span className="login-brand-dot">.</span></span></Link>
        <p>A fresh start for your next personal best.</p>
      </div>
      <section className="login-card recovery-card" aria-labelledby="recovery-title">
        <header className="login-heading">
          <span className="recovery-icon" aria-hidden="true">{icon}</span>
          <h1 id="recovery-title">{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </section>
      <footer className="login-footer">Back on track, one keystroke at a time.</footer>
    </motion.div>
  </div>;
}
