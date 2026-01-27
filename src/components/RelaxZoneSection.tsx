import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import relaxImage from '@/assets/relax-zone.jpg';

const RelaxZoneSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-background overflow-hidden" ref={ref}>
      <div className="container-royal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={relaxImage}
                alt="Comfort Relax Zone"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative frame */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-primary text-sm tracking-[0.3em] uppercase mb-6">
              {t('relax.title')}
            </span>
            
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-8">
              {t('relax.subtitle')}
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('relax.description')}
            </p>

            <div className="w-16 h-px bg-primary mt-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RelaxZoneSection;
