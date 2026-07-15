import { useLanguage } from '../context/LanguageContext.jsx';
import { trackEvent } from '../utils/analytics.js';

export default function CtaBand() {
  const { t } = useLanguage();
  return (
    <section>
      <div className="wrap">
        <div className="cta-band reveal">
          <div>
            <h2>{t.ctaBand.title}</h2>
            <p>{t.ctaBand.lead}</p>
          </div>
          <a
            href="#contact"
            className="btn btn-primary"
            style={{ background: '#fff', color: 'var(--green-800)' }}
            onClick={() => trackEvent('cta_click', { location: 'cta_band' })}
          >
            {t.ctaBand.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
