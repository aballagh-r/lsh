import { useLanguage } from '../context/LanguageContext.jsx';

export default function Ticker() {
  const { t } = useLanguage();
  const tags = t.hero.tags;
  return (
    <div className="ticker-wrap">
      <div className="ticker-tag">
        <span className="pulse-dot"></span>
        {t.ticker.label}
      </div>
      <div className="ticker-track">
        <div className="ticker">
          {[...tags, ...tags, ...tags].map((tag, i) => <span key={i}>{tag}</span>)}
        </div>
      </div>
    </div>
  );
}
