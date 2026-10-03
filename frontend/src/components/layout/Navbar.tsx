import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/typing', label: 'Practice' },
  { to: '/leaderboard', label: 'Compete' },
  { to: '/dashboard', label: 'Progress' },
];

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const signOut = async () => { await logout(); navigate('/'); };

  return <header className="tf-nav">
    <div className="tf-nav-inner">
      <Link to="/" className="tf-brand" aria-label="TypeForge home"><span className="tf-mark">T</span><span>typeforge</span><b>AI</b></Link>
      <nav className="tf-nav-links" aria-label="Main navigation">
        {links.map((link) => <Link key={link.to} className={pathname === link.to ? 'active' : ''} to={link.to}>{link.label}</Link>)}
      </nav>
      <div className="tf-nav-actions">
        {isAuthenticated ? <><Link className="tf-profile" to="/profile"><span>{user?.username?.slice(0, 1).toUpperCase() ?? 'U'}</span>{user?.username ?? 'Profile'}</Link><button className="tf-signout" onClick={signOut}>Sign out</button></> : <><Link className="tf-login" to="/login">Sign in</Link><Link className="tf-nav-cta" to="/typing">Start practicing <span>↗</span></Link></>}
      </div>
      <button className="tf-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}><i /><i /></button>
    </div>
    <AnimatePresence>{open && <motion.nav className="tf-mobile-nav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link to={isAuthenticated ? '/profile' : '/login'}>{isAuthenticated ? 'Profile' : 'Sign in'}</Link></motion.nav>}</AnimatePresence>
  </header>;
};
