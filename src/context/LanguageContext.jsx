import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { translations, LANGS } from '../i18n/translations';

const LanguageContext = createContext(null);

function detectInitialLang() {
  try {
    const saved = localStorage.getItem('weblsh_lang');
    if (saved && translations[saved]) return saved;
  } catch (e) {}
  const nav = (navigator.language || '').slice(0, 2);
  if (nav === 'en' || nav === 'fr') return nav;
  return 'ar';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  const setLang = (code) => {
    if (!translations[code]) return;
    setLangState(code);
    try { localStorage.setItem('weblsh_lang', code); } catch (e) {}
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    dir: LANGS[lang].dir,
    t: translations[lang],
    langs: LANGS,
  }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
