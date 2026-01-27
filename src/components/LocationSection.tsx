import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LocationSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contacto" className="section-padding bg-card" ref={ref}>
      <div className="container-royal">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {t('location.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            <div className="flex gap-6">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-primary/30">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  {t('location.address')}
                </h3>
                <p className="text-muted-foreground">
                  Calle Gran Vía, 42<br />
                  28013 Madrid, España
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-primary/30">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  {t('location.hours')}
                </h3>
                <p className="text-muted-foreground">
                  Lunes - Viernes: 10:00 - 21:00<br />
                  Sábado: 10:00 - 20:00<br />
                  Domingo: Cerrado
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-primary/30">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  {t('location.phone')}
                </h3>
                <p className="text-muted-foreground">
                  +34 912 345 678
                </p>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-[400px] lg:h-full min-h-[400px] bg-muted"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.4234928696346!2d-3.7037974!3d40.4197806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287d8b0e8f69%3A0x8a8b8b8b8b8b8b8b!2sGran%20V%C3%ADa%2C%20Madrid!5e0!3m2!1ses!2ses!4v1629876543210!5m2!1ses!2ses"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(100%) contrast(1.1)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Royal Studio Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
