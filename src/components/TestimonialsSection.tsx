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
      text: "Muy buen peluquero , profesional, El corte siempre va bien. consistente. amistoso. buena experiencia cada vez. ¡Se lo recomiendo a todos los que quieran un buen corte!",
      author: "Touraj Vaziri",
      role: "Miembro Club Royal",
    },
    {
      text: "As I write this review I am not surprised to see how highly rated Marcelo's BarberShop is. Marcelo is a fantastic personality and an equally professional barber. He takes time to understand.",
      author: "Michael Di Franco",
      role: "Miembro Club Royal",
    },
    {
      text: "Marcelo by far was the best barber I had in Barcelona. He was doing an amazing job, very professional with great attitude. I would strongly recommend him. Until next visit. Adios.",
      author: "Hoss Frad",
      role: "Miembro Club Royal",
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
