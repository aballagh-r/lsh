import { useLanguage } from '../context/LanguageContext.jsx';
import logo from '../assets/logo.png';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-logo"><img src={logo} alt="WebLSH" /><span>WebLSH</span></div>
          <div className="foot-links">
            <a href="#services">{t.nav.services}</a>
            <a href="#process">{t.nav.process}</a>
            <a href="#contact">{t.nav.contact}</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{t.footer.rights}</span>
          <span>{t.contact.email}</span>
        </div>
      </div>
    </footer>
  );
}
