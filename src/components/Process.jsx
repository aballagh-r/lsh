import { useLanguage } from '../context/LanguageContext.jsx';

export default function Process() {
  const { t } = useLanguage();
  const p = t.process;
  return (
    <section id="process" style={{ overflow: 'hidden' }}>
      <div className="orb orb-mint" style={{ width: 300, height: 300, top: 40, right: -140 }}></div>
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="section-head reveal">
          <span className="eyebrow">{p.eyebrow}</span>
          <h2>{p.title}</h2>
        </div>
        <div className="process">
          {p.steps.map((step) => (
            <div className="step reveal" key={step.tag}>
              <span className="tag">{step.tag}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
