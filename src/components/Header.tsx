import { useState, useEffect } from 'react';
import { Menu, X, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.home'), href: '#' },
    { label: t('nav.experience'), href: '#' },
    { label: t('nav.services'), href: '#servicios' },
    { label: t('nav.club'), href: '#club' },
    { label: t('nav.team'), href: '#equipo' },
    { label: t('nav.contact'), href: '#contacto' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container-royal">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <Crown className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="font-serif text-lg md:text-xl tracking-wider text-foreground">
                ROYAL STUDIO
              </span>
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Multi Space Experience
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors duration-300 uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            
            <a
              href="#"
              className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground font-sans text-sm tracking-wider uppercase transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              {t('nav.book')}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <nav className="container-royal py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors duration-300 uppercase py-2"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-sans text-sm tracking-wider uppercase mt-4"
              >
                {t('nav.book')}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
