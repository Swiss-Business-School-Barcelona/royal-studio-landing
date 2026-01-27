import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Scissors, Crown, Sparkles, Palette } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Scissors,
      title: t('services.cut.title'),
      description: t('services.cut.desc'),
    },
    {
      icon: Crown,
      title: t('services.beard.title'),
      description: t('services.beard.desc'),
    },
    {
      icon: Sparkles,
      title: t('services.ritual.title'),
      description: t('services.ritual.desc'),
    },
    {
      icon: Palette,
      title: t('services.color.title'),
      description: t('services.color.desc'),
    },
  ];

  return (
    <section id="servicios" className="section-padding bg-background" ref={ref}>
      <div className="container-royal">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary text-sm tracking-[0.3em] uppercase mb-6">
            {t('services.title')}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {t('services.subtitle')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group p-8 md:p-10 border border-border bg-card transition-all duration-500 hover:border-primary/50"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border border-primary/30 transition-all duration-500 group-hover:bg-primary group-hover:border-primary">
                  <service.icon className="w-6 h-6 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <a
            href="#"
            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground font-sans text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            {t('nav.book')}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
