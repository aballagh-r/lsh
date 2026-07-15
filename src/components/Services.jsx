import { useLanguage } from '../context/LanguageContext.jsx';
import { trackEvent } from '../utils/analytics.js';

const ICONS = [
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="14" rx="2"></rect><path d="M3 8h18M8 21h8M12 18v3"></path></svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3"></path></svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z"></path></svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="16" height="7" rx="1.5"></rect><rect x="4" y="14" width="16" height="7" rx="1.5"></rect><path d="M8 6.5h.01M8 17.5h.01"></path></svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7z"></path><path d="M9 12l2 2 4-4"></path></svg>,
];

export default function Services() {
  const { t } = useLanguage();
  const s = t.services;

  return (
    <section id="services" style={{ overflow: 'hidden' }}>
      <div className="orb orb-green" style={{ width: 320, height: 320, top: -60, left: -120 }}></div>
      <div className="orb orb-mint" style={{ width: 260, height: 260, bottom: -80, right: -100 }}></div>
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="section-head reveal">
          <span className="eyebrow">{s.eyebrow}</span>
          <h2>{s.title}</h2>
          <p>{s.lead}</p>
        </div>

        <div className="services-grid">
          {s.items.map((item, i) => (
            <div
              className="service-card reveal"
              key={item.title}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                e.currentTarget.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px) scale(1.015)`;
                e.currentTarget.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
                e.currentTarget.style.setProperty('--my', `${(y + 0.5) * 100}%`);
              }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0) scale(1)'; }}
            >
              <div className="icon">{ICONS[i]}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span
                className="go"
                role="link"
                tabIndex={0}
                onClick={() => { window.location.hash = 'contact'; trackEvent('service_interest', { service: item.title }); }}
                style={{ cursor: 'pointer' }}
              >
                {s.more}
              </span>
            </div>
          ))}

          <div className="service-card reveal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--mint-50)', border: '1px dashed var(--line)' }}>
            <h3>{s.notSure.title}</h3>
            <p>{s.notSure.desc}</p>
            <a href="#contact" className="go">{s.notSure.cta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
