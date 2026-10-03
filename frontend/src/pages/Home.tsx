import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const keyboardRows = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

const sample = 'the future belongs to those who make it';

function Keyboard() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((key) => (key + 1) % 26), 240);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hero-keyboard" aria-label="Animated keyboard illustration">
      <div className="keyboard-topline"><span className="keyboard-dot" /> TYPEFORGE / PRACTICE SESSION <span>00:30</span></div>
      <div className="key-shell">
        {keyboardRows.map((row, rowIndex) => (
          <div className={`key-row row-${rowIndex}`} key={row.join('')}>
            {row.map((key, keyIndex) => {
              const keyIndexGlobal = keyboardRows.slice(0, rowIndex).flat().length + keyIndex;
              return <span className={`hero-key ${keyIndexGlobal === active ? 'pressed' : ''}`} key={key}>{key}</span>;
            })}
          </div>
        ))}
        <div className="key-row last-row"><span className="hero-key modifier">⇧</span><span className="hero-key space" /><span className="hero-key modifier">↵</span></div>
      </div>
      <div className="keyboard-base" />
    </div>
  );
}

function LiveSentence() {
  const [position, setPosition] = useState(18);
  useEffect(() => {
    const timer = window.setInterval(() => setPosition((value) => value >= sample.length ? 0 : value + 1), 115);
    return () => window.clearInterval(timer);
  }, []);

  return <p className="live-sentence" aria-label="Typing preview">
    {sample.split('').map((character, index) => (
      <span className={index < position ? 'done' : index === position ? 'current' : ''} key={`${character}-${index}`}>
        {character === ' ' ? '\u00a0' : character}
      </span>
    ))}
  </p>;
}

const Arrow = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const Home: React.FC = () => (
  <div className="forge-home">
    <section className="forge-hero">
      <div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-grid" />
      <div className="hero-inner">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
          <div className="eyebrow"><span /> A more intentional way to practice</div>
          <h1>Type.<br /><em>Learn.</em><br />Master.</h1>
          <p className="hero-description">A focused typing studio that transforms deliberate practice into measurable, lasting progress.</p>
          <div className="hero-actions">
            <Link className="button-primary" to="/typing">Start typing <Arrow /></Link>
            <a className="button-quiet" href="#how-it-works"><span className="play-icon">▶</span> See how it works</a>
          </div>
          <div className="hero-proof"><div className="face-stack"><i>A</i><i>K</i><i>S</i><i>R</i></div><span>Trusted by <b>28,000+</b> focused learners</span></div>
        </motion.div>
        <motion.div className="hero-visual" initial={{ opacity: 0, scale: .96, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: .8, delay: .12 }}>
          <div className="live-card"><div className="live-card-label"><span className="status-light" /> LIVE PRACTICE <span>⌘ K</span></div><LiveSentence /><div className="live-card-footer"><span><b>82</b> WPM</span><span><b>98.4%</b> accuracy</span><span><b>04</b> errors</span></div></div>
          <div className="floating-stat stat-wpm"><small>AVERAGE PACE</small><strong>82 <sup>wpm</sup></strong><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /></div></div>
          <div className="floating-stat stat-streak"><span className="streak-icon">✦</span><div><small>THIS WEEK</small><strong>+18<sup>%</sup></strong></div></div>
          <Keyboard />
        </motion.div>
      </div>
      <div className="hero-metrics"><div><strong>12.4M</strong><span>focused sessions</span></div><div><strong>+31%</strong><span>average improvement</span></div><div><strong>170+</strong><span>countries practicing</span></div><p>Crafted for people who value<br />the quality of their work.</p></div>
    </section>

    <section id="how-it-works" className="home-focus-section">
      <div className="section-heading"><span className="eyebrow"><span /> BUILT FOR MOMENTUM</span><h2>Practice with<br />a point of view.</h2><p>Everything you need to build a calmer, faster, more confident typing practice—without the noise.</p></div>
      <div className="focus-grid">
        <article className="focus-card focus-main"><span className="card-number">01</span><div className="lesson-orbit"><div className="orbit-ring"><b>F</b></div><span>Today’s focus<br /><strong>Flow & rhythm</strong></span></div><h3>Practice that knows<br />where you’re going.</h3><p>Adaptive sessions find your next edge, then make each minute count.</p><a href="#typing">Explore guided practice <Arrow /></a></article>
        <article className="focus-card"><span className="card-number">02</span><div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div><h3>See the signal,<br />not the spreadsheet.</h3><p>Gentle, specific feedback reveals the habits shaping your speed.</p></article>
        <article className="focus-card"><span className="card-number">03</span><div className="code-window"><span /><span /><span /><pre><b>const</b> flow =<br />&nbsp; practice.<i>repeat</i>();</pre></div><h3>For every kind<br />of work.</h3><p>Natural language, code, interviews, and more—each with its own rhythm.</p></article>
      </div>
    </section>

    <section className="daily-cta"><div className="cta-glow" /><div><span className="eyebrow"><span /> YOUR NEXT SESSION</span><h2>Five quiet minutes<br />can change your pace.</h2></div><Link className="button-primary" to="/typing">Begin a session <Arrow /></Link></section>
  </div>
);

export default Home;
