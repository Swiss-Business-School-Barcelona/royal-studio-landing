import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
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
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Carrer+de+la+Ind%C3%BAstria,+153,+08025+Barcelona"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Carrer de la Indústria, 153<br />
                  Eixample, 08025 Barcelona
                </a>
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
                  Lunes - Sábado: 10:00 - 20:00
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
                  <a href="tel:+34934464434" className="hover:text-primary transition-colors">
                    +34 934 464 434
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-primary/30">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  {t('location.email')}
                </h3>
                <p className="text-muted-foreground">
                  <a href="mailto:royalstudio153@gmail.com" className="hover:text-primary transition-colors">
                    royalstudio153@gmail.com
                  </a>
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.5899089584686!2d2.1651!3d41.4074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f5a5f5a5a5%3A0x5a5a5a5a5a5a5a5a!2sCarrer%20de%20la%20Ind%C3%BAstria%2C%20153%2C%20Eixample%2C%2008025%20Barcelona!5e0!3m2!1ses!2ses!4v1629876543210!5m2!1ses!2ses"
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
