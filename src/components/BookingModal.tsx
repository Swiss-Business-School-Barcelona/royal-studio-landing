import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';
import { ArrowLeft, Scissors, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import barberMarcelo from '@/assets/barber-marcelo.png';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'service' | 'barber' | 'calendar';

const services = [
  { id: 'peluqueria', label: 'Peluquería', icon: Scissors },
];

const barbers = [
  { id: 'marcelo', label: 'Marcelo', subtitle: 'Barber 1', image: barberMarcelo },
];

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);

  const googleCalendarUrl = 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2ucreoodE6W-BfN6YCGv3KKc2sgVvReZ5H9JhpDxkQmSIlftI73ITZ4GU3rWzcprYWmeCoptEM';

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('service');
      setSelectedService(null);
      setSelectedBarber(null);
    }, 300);
  };

  const handleServiceSelect = (id: string) => {
    setSelectedService(id);
    setStep('barber');
  };

  const handleBarberSelect = (id: string) => {
    setSelectedBarber(id);
    setStep('calendar');
  };

  const handleBack = () => {
    if (step === 'barber') {
      setStep('service');
      setSelectedService(null);
    } else if (step === 'calendar') {
      setStep('barber');
      setSelectedBarber(null);
    }
  };

  const stepTitle = step === 'service' ? 'Selecciona un servicio' : step === 'barber' ? 'Selecciona un barbero' : 'Reservar cita';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[95vw] p-0 gap-0 overflow-hidden bg-background border-border data-[state=open]:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          {step !== 'service' && (
            <button onClick={handleBack} className="p-1 rounded-md hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <h2 className="text-lg font-serif text-foreground">{stepTitle}</h2>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1 px-5 pt-3">
          {['service', 'barber', 'calendar'].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= ['service', 'barber', 'calendar'].indexOf(step)
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        {step === 'service' && (
          <div className="p-5 space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-accent/50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-base font-medium text-foreground">{service.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 'barber' && (
          <div className="p-5 space-y-3">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => handleBarberSelect(barber.id)}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-accent/50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border">
                  {barber.image ? (
                    <img src={barber.image} alt={barber.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-base font-medium text-foreground block">{barber.label}</span>
                  <span className="text-sm text-muted-foreground">{barber.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'calendar' && (
          <div className="flex flex-col" style={{ height: '70vh' }}>
            <div className="px-5 py-2 bg-accent/30 border-b border-border">
              <p className="text-sm text-muted-foreground">
                {services.find(s => s.id === selectedService)?.label} · {barbers.find(b => b.id === selectedBarber)?.label}
              </p>
            </div>
            <div className="px-4 py-1 bg-primary/10 border-b border-border">
              <p className="text-sm text-primary text-center">
                ℹ️ {t('booking.info')}
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={googleCalendarUrl}
                className="w-full h-full border-0"
                frameBorder="0"
                title="Reservar cita en Royal Studio"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
