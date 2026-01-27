import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, Users, Sparkles, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DifferenceSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Clock,
      title: t('diff.time.title'),
      description: t('diff.time.desc'),
    },
    {
      icon: Users,
      title: t('diff.attention.title'),
      description: t('diff.attention.desc'),
    },
    {
      icon: Sparkles,
      title: t('diff.detail.title'),
      description: t('diff.detail.desc'),
    },
    {
      icon: LayoutGrid,
      title: t('diff.space.title'),
      description: t('diff.space.desc'),
    },
  ];

  return (
    <section className="section-padding bg-card" ref={ref}>
      <div className="container-royal">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {t('diff.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-primary/30 transition-all duration-500 group-hover:border-primary group-hover:bg-primary/5">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferenceSection;
