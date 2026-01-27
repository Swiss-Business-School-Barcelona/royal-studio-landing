import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Crown, Star, Calendar, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ClubSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Calendar, text: t('club.feature1') },
    { icon: Star, text: t('club.feature2') },
    { icon: Crown, text: t('club.feature3') },
    { icon: Gift, text: t('club.feature4') },
  ];

  return (
    <section id="club" className="section-padding bg-secondary relative overflow-hidden" ref={ref}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 border border-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-primary rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-royal relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-8" />
            
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              {t('club.title')}
            </h2>
            
            <p className="text-xl md:text-2xl text-primary font-serif italic mb-8">
              {t('club.subtitle')}
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
              {t('club.description')}
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <feature.icon className="w-6 h-6 text-primary" />
                <span className="text-sm text-muted-foreground">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <a
              href="#"
              className="inline-flex items-center justify-center px-10 py-4 border-2 border-primary text-primary font-sans text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
            >
              {t('club.cta')}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClubSection;
