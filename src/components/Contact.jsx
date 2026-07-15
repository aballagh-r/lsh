import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getAttribution, trackEvent } from '../utils/analytics.js';

const API_URL = import.meta.env.VITE_CONTACT_API_URL || '/api/contact';

function makeReference() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `WLSH-${stamp}${rand}`;
}

const emptyValues = (defaultService) => ({
  firstName: '', lastName: '', email: '', phone: '',
  service: defaultService, message: '', company: '',
});

export default function Contact() {
  const { t, lang } = useLanguage();
  const c = t.contact;
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [values, setValues] = useState(() => emptyValues(c.form.serviceOptions[0]));
  const [reference, setReference] = useState('');

  const handleChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (values.company) return; // honeypot tripped, silently drop
    setStatus('sending');
    const ref = makeReference();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          name: `${values.firstName} ${values.lastName}`.trim(),
          reference: ref,
          language: lang,
          attribution: getAttribution(),
          page: window.location.href,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setReference(ref);
      setStatus('sent');
      trackEvent('lead_submitted', { service: values.service, language: lang });
    } catch (err) {
      setStatus('error');
    }
  }

  function resetForm() {
    setValues(emptyValues(c.form.serviceOptions[0]));
    setReference('');
    setStatus('idle');
  }

  if (status === 'sent') {
    const s = c.success;
    return (
      <section id="contact" style={{ background: 'var(--mint-50)' }}>
        <div className="wrap">
          <div className="success-card reveal in">
            <div className="success-check">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
            <h2>{s.title}</h2>
            <p className="success-thanks">{s.thanks.replace('{name}', values.firstName || '')}</p>
            <p className="success-body">{s.body}</p>
            <div className="success-ref">
              <span className="mono-tag">{s.refLabel}</span>
              <span className="ref-value">{reference}</span>
            </div>
            <div className="success-actions">
              <button type="button" className="btn btn-primary" onClick={resetForm}>{s.again}</button>
              <a href="#main" className="btn btn-ghost" onClick={resetForm}>{s.home}</a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" style={{ background: 'var(--mint-50)' }}>
      <div className="wrap contact-grid">
        <div className="contact-info reveal">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p>{c.lead}</p>
          <div className="contact-list">
            <a href={`mailto:${c.email}`}>
              <span className="ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path></svg></span>
              {c.email}
            </a>
            <a href="#">
              <span className="ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"></path></svg></span>
              {c.phone}
            </a>
            <a href="#">
              <span className="ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg></span>
              {c.location}
            </a>
          </div>
        </div>

        <form className="lead-form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label htmlFor="firstName">{c.form.firstName}</label>
              <input id="firstName" type="text" placeholder={c.form.firstNamePh} required
                value={values.firstName} onChange={handleChange('firstName')} />
            </div>
            <div className="field">
              <label htmlFor="lastName">{c.form.lastName}</label>
              <input id="lastName" type="text" placeholder={c.form.lastNamePh} required
                value={values.lastName} onChange={handleChange('lastName')} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="email">{c.form.email}</label>
              <input id="email" type="email" placeholder={c.form.emailPh} required
                value={values.email} onChange={handleChange('email')} />
            </div>
            <div className="field">
              <label htmlFor="phone">{c.form.phone}</label>
              <input id="phone" type="tel" placeholder={c.form.phonePh} required
                value={values.phone} onChange={handleChange('phone')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="service">{c.form.service}</label>
            <select id="service" value={values.service} onChange={handleChange('service')}>
              {c.form.serviceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="msg">{c.form.message}</label>
            <textarea id="msg" placeholder={c.form.messagePh}
              value={values.message} onChange={handleChange('message')} />
          </div>

          {/* honeypot — hidden from real users, bots tend to fill every field */}
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input id="company" type="text" tabIndex={-1} autoComplete="off"
              value={values.company} onChange={handleChange('company')} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? c.form.sending : c.form.submit}
          </button>

          {status === 'error' && <p className="form-note err">{c.form.error}</p>}
        </form>
      </div>
    </section>
  );
}
