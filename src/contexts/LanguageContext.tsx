import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { es: 'Inicio', en: 'Home' },
  'nav.experience': { es: 'Experiencia Royal', en: 'Royal Experience' },
  'nav.services': { es: 'Servicios', en: 'Services' },
  'nav.club': { es: 'Club Royal Studio', en: 'Club Royal Studio' },
  'nav.team': { es: 'Equipo', en: 'Team' },
  'nav.contact': { es: 'Contacto', en: 'Contact' },
  'nav.book': { es: 'Reservar', en: 'Book Now' },

  // Hero
  'hero.subtitle': { es: 'Multi Space Experience', en: 'Multi Space Experience' },
  'hero.tagline': { es: 'Atendemos personas. No despachamos clientes.', en: 'We attend to people. We don\'t dispatch clients.' },
  'hero.cta': { es: 'Reservar Experiencia', en: 'Book Experience' },
  'hero.discover': { es: 'Descubrir más', en: 'Discover more' },

  // About
  'about.title': { es: 'Qué es Royal Studio', en: 'What is Royal Studio' },
  'about.subtitle': { es: 'Más que una barbería. Un concepto.', en: 'More than a barbershop. A concept.' },
  'about.description1': { es: 'Royal Studio es un espacio premium donde el cuidado personal se convierte en una experiencia completa.', en: 'Royal Studio is a premium space where personal care becomes a complete experience.' },
  'about.description2': { es: 'Hemos diseñado cada rincón para que tu visita sea un momento de calma, atención y excelencia.', en: 'We have designed every corner so that your visit is a moment of calm, attention and excellence.' },
  'about.description3': { es: 'No venimos a despacharte. Venimos a atenderte.', en: 'We don\'t come to dispatch you. We come to attend to you.' },

  // Difference
  'diff.title': { es: 'La Diferencia Royal', en: 'The Royal Difference' },
  'diff.time.title': { es: 'Tu Tiempo', en: 'Your Time' },
  'diff.time.desc': { es: 'Sin prisas. Tu cita es solo tuya.', en: 'No rush. Your appointment is yours alone.' },
  'diff.attention.title': { es: 'Atención Total', en: 'Total Attention' },
  'diff.attention.desc': { es: 'Escuchamos, asesoramos, ejecutamos.', en: 'We listen, advise, execute.' },
  'diff.detail.title': { es: 'Cada Detalle', en: 'Every Detail' },
  'diff.detail.desc': { es: 'Del aroma al acabado. Todo importa.', en: 'From aroma to finish. Everything matters.' },
  'diff.space.title': { es: 'Multi Espacio', en: 'Multi Space' },
  'diff.space.desc': { es: 'Relax, café, servicio. Todo en uno.', en: 'Relax, coffee, service. All in one.' },

  // Relax Zone
  'relax.title': { es: 'Confort Relax Zone', en: 'Comfort Relax Zone' },
  'relax.subtitle': { es: 'Tu momento de calma antes y después', en: 'Your moment of calm before and after' },
  'relax.description': { es: 'Un espacio diseñado para desconectar. Sofás premium, ambiente cuidado, música selecta. Aquí no hay prisa. Solo calma.', en: 'A space designed to disconnect. Premium sofas, curated atmosphere, select music. There\'s no rush here. Just calm.' },

  // Coffee
  'coffee.title': { es: 'Coffee & Drink Experience', en: 'Coffee & Drink Experience' },
  'coffee.subtitle': { es: 'Porque cada visita merece un ritual', en: 'Because every visit deserves a ritual' },
  'coffee.description': { es: 'Café de especialidad, selección de tés, bebidas premium. Disfruta mientras esperamos o después de tu servicio.', en: 'Specialty coffee, tea selection, premium drinks. Enjoy while waiting or after your service.' },

  // Services
  'services.title': { es: 'Servicios', en: 'Services' },
  'services.subtitle': { es: 'Excelencia en cada detalle', en: 'Excellence in every detail' },
  'services.cut.title': { es: 'Corte Royal', en: 'Royal Cut' },
  'services.cut.desc': { es: 'Consulta personalizada + Corte de precisión + Styling', en: 'Personalized consultation + Precision cut + Styling' },
  'services.beard.title': { es: 'Barba Signature', en: 'Signature Beard' },
  'services.beard.desc': { es: 'Diseño + Perfilado + Tratamiento hidratante', en: 'Design + Shaping + Hydrating treatment' },
  'services.ritual.title': { es: 'Ritual Completo', en: 'Complete Ritual' },
  'services.ritual.desc': { es: 'Corte + Barba + Tratamiento facial + Masaje', en: 'Cut + Beard + Facial treatment + Massage' },
  'services.color.title': { es: 'Color & Canas', en: 'Color & Gray' },
  'services.color.desc': { es: 'Cobertura natural o efectos personalizados', en: 'Natural coverage or personalized effects' },

  // Club
  'club.title': { es: 'Club Royal Studio', en: 'Club Royal Studio' },
  'club.subtitle': { es: 'Pertenencia. Exclusividad. Privilegios.', en: 'Belonging. Exclusivity. Privileges.' },
  'club.description': { es: 'Acceso a beneficios únicos, precios preferenciales, reservas prioritarias y experiencias exclusivas solo para miembros.', en: 'Access to unique benefits, preferential prices, priority reservations and exclusive experiences for members only.' },
  'club.cta': { es: 'Solicitar Membresía', en: 'Request Membership' },
  'club.feature1': { es: 'Reservas prioritarias', en: 'Priority reservations' },
  'club.feature2': { es: 'Precios exclusivos', en: 'Exclusive prices' },
  'club.feature3': { es: 'Eventos privados', en: 'Private events' },
  'club.feature4': { es: 'Productos premium', en: 'Premium products' },

  // Team
  'team.title': { es: 'Nuestro Equipo', en: 'Our Team' },
  'team.subtitle': { es: 'Maestros del oficio. Maestros de la atención.', en: 'Masters of the craft. Masters of attention.' },

  // Testimonials
  'testimonials.title': { es: 'Lo que dicen de nosotros', en: 'What they say about us' },

  // Location
  'location.title': { es: 'Encuéntranos', en: 'Find Us' },
  'location.address': { es: 'Dirección', en: 'Address' },
  'location.hours': { es: 'Horario', en: 'Hours' },
  'location.phone': { es: 'Teléfono', en: 'Phone' },

  // Footer
  'footer.legal': { es: 'Aviso Legal', en: 'Legal Notice' },
  'footer.privacy': { es: 'Política de Privacidad', en: 'Privacy Policy' },
  'footer.cookies': { es: 'Política de Cookies', en: 'Cookie Policy' },
  'footer.rights': { es: 'Todos los derechos reservados', en: 'All rights reserved' },

  // Closing
  'closing.line1': { es: 'ROYAL STUDIO', en: 'ROYAL STUDIO' },
  'closing.line2': { es: 'Multi Space Experience', en: 'Multi Space Experience' },
  'closing.line3': { es: 'Masters of Hair.', en: 'Masters of Hair.' },
  'closing.line4': { es: 'Masters of Attention.', en: 'Masters of Attention.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
