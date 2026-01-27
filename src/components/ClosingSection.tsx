import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ClosingSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 md:py-40 bg-background relative overflow-hidden" ref={ref}>
      {/* Subtle background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <Crown className="w-[600px] h-[600px] text-primary" />
      </div>

      <div className="container-royal relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 tracking-wide">
            {t('closing.line1')}
          </h2>
          
          <p className="text-primary text-lg md:text-xl tracking-[0.2em] uppercase mb-12">
            {t('closing.line2')}
          </p>

          <div className="w-16 h-px bg-primary mx-auto mb-12" />

          <p className="font-serif text-2xl md:text-3xl text-muted-foreground italic leading-relaxed">
            <span className="block">{t('closing.line3')}</span>
            <span className="block text-primary">{t('closing.line4')}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosingSection;
