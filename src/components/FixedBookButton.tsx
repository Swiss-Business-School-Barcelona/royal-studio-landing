import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import BookingModal from './BookingModal';

const FixedBookButton = () => {
  const { t } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsBookingOpen(true)}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="fixed bottom-6 left-6 z-50 md:hidden inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-sans text-sm tracking-wider uppercase shadow-lg"
      >
        {t('nav.book')}
      </motion.button>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  );
};

export default FixedBookButton;
