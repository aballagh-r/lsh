import { useLanguage } from '../context/LanguageContext.jsx';

const ICONS = [
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7z"></path><path d="M9 12l2 2 4-4"></path></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8.5" cy="9" r="3"></circle><path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6"></path><circle cx="17" cy="8.5" r="2.4"></circle><path d="M15 14.2c2.7.3 4.5 2.4 4.5 5.8"></path></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.6 6.6 7 .5-5.4 4.5 1.8 6.9L12 16.9 5.9 20.5l1.8-6.9L2.4 9.1l7-.5z"></path></svg>,
];

export default function Stats() {
  const { t } = useLanguage();
  return (
    <section className="dotted-bg stats-section" style={{ backgroundColor: 'var(--mint-50)', overflow: 'hidden' }}>
      <div className="orb orb-green" style={{ width: 360, height: 360, top: -140, left: '50%', marginLeft: -180 }}></div>
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="metrics-panel reveal">
          <div className="metrics-head">
            <span className="pulse-dot"></span>
            <span className="mono-tag">SYSTEM STATUS · ALL GREEN</span>
          </div>
          <div className="metrics-grid">
            {t.stats.map((s, i) => (
              <div className="metric-card" key={s.lbl} style={{ '--d': `${i * 60}ms` }}>
                <div className="metric-icon">{ICONS[i]}</div>
                <div className="metric-num">{s.num}</div>
                <div className="metric-lbl">{s.lbl}</div>
                <div className="metric-bar"><span></span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
