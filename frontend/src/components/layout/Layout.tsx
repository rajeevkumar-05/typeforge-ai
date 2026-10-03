import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {!isAuthPage && <Navbar />}
      <main className="w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && location.pathname !== '/typing' && <Footer />}
    </div>
  );
};
