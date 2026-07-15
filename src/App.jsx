import { useLanguage } from './context/LanguageContext.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Ticker from './components/Ticker.jsx';
import Services from './components/Services.jsx';
import Stats from './components/Stats.jsx';
import Process from './components/Process.jsx';
import CtaBand from './components/CtaBand.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import useReveal from './hooks/useReveal.js';

export default function App() {
  const { t } = useLanguage();
  useReveal();

  return (
    <>
      <a href="#main" className="skip-link">{t.meta.skipTo}</a>
      <Header />
      <main id="main">
        <Hero />
        <Ticker />
        <Services />
        <Stats />
        <Process />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
