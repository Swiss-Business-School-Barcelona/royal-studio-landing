import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-royal.jpg';
import logo from '@/assets/logo.jpeg';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80" />

      {/* Content */}
      <div className="relative z-10 container-royal text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <img 
            src={logo} 
            alt="Royal Studio" 
            className="w-48 md:w-64 lg:w-40 mx-auto opacity-60"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span className="inline-block text-primary text-sm md:text-base tracking-[0.3em] uppercase">
            Multi Space Experience
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-serif text-xl md:text-2xl text-primary italic mb-12 max-w-2xl mx-auto"
        >
          "{t('hero.tagline')}"
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-sans text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 min-w-[200px]"
          >
            {t('hero.cta')}
          </a>
          <a
            href="#about"
            className="inline-flex items-center justify-center px-8 py-4 border border-foreground/30 text-foreground font-sans text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:border-primary hover:text-primary min-w-[200px]"
          >
            {t('hero.discover')}
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
