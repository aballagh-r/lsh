import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { trackEvent } from '../utils/analytics.js';
import NetworkScene from './NetworkScene.js';

export default function Hero() {
  const { t } = useLanguage();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    sceneRef.current = new NetworkScene(mountRef.current);
    sceneRef.current.start();
    return () => sceneRef.current?.dispose();
  }, []);

  return (
    <section className="hero">
      <div id="scene-wrap" ref={mountRef}></div>
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <div className="inner">
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1>
            {t.hero.titlePre}<em>{t.hero.titleEm}</em>{t.hero.titlePost}
          </h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="hero-ctas">
            <a
              href="#contact"
              className="btn btn-primary"
              onClick={() => trackEvent('cta_click', { location: 'hero_primary' })}
            >
              {t.hero.cta1}
            </a>
            <a
              href="#services"
              className="btn btn-ghost"
              onClick={() => trackEvent('cta_click', { location: 'hero_secondary' })}
            >
              {t.hero.cta2}
            </a>
          </div>
          <div className="hero-tags">
            {t.hero.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </div>

      <div className="drag-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 4l-4 4 4 4M15 4l4 4-4 4M4 9h16"></path>
        </svg>
        {t.hero.drag}
      </div>
      <div className="geo-badge">
        <b>{t.hero.geo}</b>
        {t.hero.geoLoc}
      </div>
    </section>
  );
}
