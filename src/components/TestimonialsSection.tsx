import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TestimonialsSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      text: "La mejor experiencia de barbería que he tenido. No es solo un corte, es un ritual completo de relax y atención.",
      author: "Miguel Ángel P.",
      role: "Cliente desde 2022",
    },
    {
      text: "Desde que descubrí Royal Studio, no vuelvo a ningún otro sitio. El ambiente, el café, la atención... Todo es perfecto.",
      author: "Roberto S.",
      role: "Miembro Club Royal",
    },
    {
      text: "Por fin un lugar donde no te tratan como un número más. Se nota que aquí realmente les importa cada cliente.",
      author: "Alejandro M.",
      role: "Cliente desde 2023",
    },
  ];

  return (
    <section className="section-padding bg-background" ref={ref}>
      <div className="container-royal">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {t('testimonials.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="p-8 border border-border bg-card relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              <div>
                <p className="font-serif text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
