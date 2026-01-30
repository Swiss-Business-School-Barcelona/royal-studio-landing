import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const googleCalendarUrl = 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2ucreoodE6W-BfN6YCGv3KKc2sgVvReZ5H9JhpDxkQmSIlftI73ITZ4GU3rWzcprYWmeCoptEM';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-white">
        {/* <div className="flex items-center justify-between p-4 border-b bg-white">
          <div>
            <h2 className="font-serif text-2xl text-gray-900">Reservar Experiencia Royal</h2>
            <p className="text-sm text-gray-600 mt-1">Selecciona tu fecha y hora preferida</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div> */}
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
