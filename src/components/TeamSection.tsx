import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import barberMarcelo from '@/assets/barber-marcelo.png';
import barberSahil from '@/assets/team-member-2.jpg';

const TeamSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const team = [
    {
      name: 'Marcelo',
      role: 'Barber 1',
      image: barberMarcelo,
    },
    {
      name: 'Sahil',
      role: 'Barber 2',
      image: barberSahil,
    },
  ];

  return (
    <section id="equipo" className="section-padding bg-card" ref={ref}>
      <div className="container-royal">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary text-sm tracking-[0.3em] uppercase mb-6">
            {t('team.title')}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {t('team.subtitle')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative overflow-hidden mb-6">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              
              <div className="text-center">
                <h3 className="font-serif text-xl text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-primary tracking-wider uppercase">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
