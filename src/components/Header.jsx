import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { trackEvent } from '../utils/analytics.js';
import logo from '../assets/logo.png';

export default function Header() {
  const { t, lang, setLang, langs } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-locked', menuOpen);
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('menu-locked');
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`} id="header">
      <nav className="wrap">
        <a href="#main" className="logo" aria-label="WebLSH">
          <img src={logo} alt="WebLSH" />
          <span>WebLSH</span>
        </a>

        <div className={`nav-backdrop${menuOpen ? ' open' : ''}`} onClick={closeMenu} aria-hidden="true"></div>

        <div className={`navlinks${menuOpen ? ' open' : ''}`} id="navlinks">
          <div className="navlinks-head">
            <span className="navlinks-brand"><img src={logo} alt="" /> WebLSH</span>
            <button className="navlinks-close" aria-label="Close menu" onClick={closeMenu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
          </div>
          <a href="#services" onClick={closeMenu}><span className="nl-num">01</span>{t.nav.services}</a>
          <a href="#process" onClick={closeMenu}><span className="nl-num">02</span>{t.nav.process}</a>
          <a href="#contact" onClick={closeMenu}><span className="nl-num">03</span>{t.nav.contact}</a>
          <a href="#contact" className="btn btn-primary navlinks-cta" onClick={closeMenu}>{t.nav.cta}</a>
        </div>

        <div className="nav-cta">
          <div className="lang-switch" ref={langRef}>
            <button
              className="lang-btn"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              onClick={() => setLangOpen((v) => !v)}
            >
              <span className="lang-badge">{langs[lang].code}</span>
              <span className="lang-label">{langs[lang].label}</span>
              <svg className="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6"></path></svg>
            </button>
            {langOpen && (
              <div className="lang-menu" role="listbox">
                {Object.entries(langs).map(([code, meta]) => (
                  <button
                    key={code}
                    role="option"
                    aria-current={code === lang}
                    onClick={() => {
                      setLang(code);
                      setLangOpen(false);
                      trackEvent('language_change', { language: code });
                    }}
                  >
                    <span className="lang-badge">{meta.code}</span>
                    {meta.label}
                    {code === lang && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="#contact"
            className="btn btn-primary"
            onClick={() => trackEvent('cta_click', { location: 'header' })}
          >
            {t.nav.cta}
          </a>

          <button className={`burger${menuOpen ? ' open' : ''}`} aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </header>
  );
}
