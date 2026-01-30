import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const googleCalendarUrl = 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2ucreoodE6W-BfN6YCGv3KKc2sgVvReZ5H9JhpDxkQmSIlftI73ITZ4GU3rWzcprYWmeCoptEM';
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-white">
        <div className="px-4 py-1 bg-amber-50 border-b border-amber-200">
          <p className="text-xl text-amber-900 text-center">
            ℹ️ {t('booking.info')}
          </p>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          <iframe
            src={googleCalendarUrl}
            className="w-full h-full border-0"
            frameBorder="0"
            title="Reservar cita en Royal Studio"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
