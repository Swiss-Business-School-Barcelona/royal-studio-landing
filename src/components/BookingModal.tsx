import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Scissors, User, Clock, CalendarDays, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import barberMarcelo from '@/assets/barber-marcelo.png';
import { format, addDays, startOfWeek, isSameDay, isAfter, startOfDay, getDay, addWeeks } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: number;
  client_name: string;
  barber_name: string;
  day: string;
  time: string;
  created_at: string;
  updated_at: string;
  phone_number: string;
  notes: string | null;
}

interface Service {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface Barber {
  id: string;
  label: string;
  subtitle: string;
  image?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'service' | 'barber' | 'calendar' | 'details' | 'confirmation';

const services = [
  { id: 'peluqueria', label: 'Peluquería', icon: Scissors },
];

const barbers = [
  { id: 'marcelo', label: 'Marcelo', subtitle: 'Barber 1', image: barberMarcelo },
];

const timeSlots = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30',
];

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const locale = language === 'es' ? es : enUS;
  const today = startOfDay(new Date());

  // Fetch booked slots when date or barber changes
  useEffect(() => {
    if (!selectedDate || !selectedBarber) {
      setBookedSlots([]);
      return;
    }

    const barberName = barbers.find(b => b.id === selectedBarber)?.label;
    if (!barberName) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('time')
          .eq('day', formattedDate)
          .eq('barber_name', barberName);

        if (error) {
          console.error('Error fetching booked slots:', error);
          setBookedSlots([]);
        } else {
          // Convert time values like \"10:00:00\" to \"10:00\"
          const booked = data?.map(booking => {
            const t = booking.time as string;
            return t.substring(0, 5);
          }) || [];
          setBookedSlots(booked);
        }
      } catch (err) {
        console.error('Error:', err);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, selectedBarber]);

  const weekDays = useMemo(() => {
    const base = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
    const days: Date[] = [];
    for (let i = 0; i < 6; i++) {
      days.push(addDays(base, i));
    }
    return days;
  }, [weekOffset]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('service');
      setSelectedService(null);
      setSelectedBarber(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setWeekOffset(0);
      setName('');
      setPhone('');
      setNote('');
      setBookedSlots([]);
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
    if (step === 'barber') { setStep('service'); setSelectedService(null); }
    else if (step === 'calendar') { setStep('barber'); setSelectedBarber(null); setSelectedDate(null); setSelectedTime(null); }
    else if (step === 'details') { setStep('calendar'); }
    else if (step === 'confirmation') { setStep('details'); }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    if (!bookedSlots.includes(time)) {
      setSelectedTime(time);
    }
  };

  const handleContinueToDetails = () => {
    if (selectedDate && selectedTime) setStep('details');
  };

  const handleSubmit = () => {
    if (name.trim() && phone.trim()) setStep('confirmation');
  };

  const isPastDay = (date: Date) => {
    return !isAfter(date, today) && !isSameDay(date, today);
  };

  const isSunday = (date: Date) => getDay(date) === 0;

  const steps: Step[] = ['service', 'barber', 'calendar', 'details', 'confirmation'];
  const stepIndex = steps.indexOf(step);

  const stepTitle = step === 'service'
    ? (language === 'es' ? 'Selecciona un servicio' : 'Select a service')
    : step === 'barber'
    ? (language === 'es' ? 'Selecciona un barbero' : 'Select a barber')
    : step === 'calendar'
    ? (language === 'es' ? 'Elige día y hora' : 'Pick day & time')
    : step === 'details'
    ? (language === 'es' ? 'Tus datos' : 'Your details')
    : (language === 'es' ? '¡Reserva confirmada!' : 'Booking confirmed!');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[95vw] p-0 gap-0 overflow-hidden bg-background border-border data-[state=open]:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          {step !== 'service' && step !== 'confirmation' && (
            <button onClick={handleBack} className="p-1 rounded-md hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <h2 className="text-lg font-serif text-foreground">{stepTitle}</h2>
        </div>

        {/* Step indicators */}
        {step !== 'confirmation' && (
          <div className="flex gap-1 px-5 pt-3">
            {['service', 'barber', 'calendar', 'details'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= Math.min(stepIndex, 3) ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}

        {/* Service Step */}
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

        {/* Barber Step */}
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

        {/* Calendar Step */}
        {step === 'calendar' && (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
            {/* Info bar */}
            <div className="px-3 py-2 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary text-center">
                ℹ️ {t('booking.info')}
              </p>
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                disabled={weekOffset === 0}
                className="p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-sm font-medium text-foreground">
                {format(weekDays[0], 'd MMM', { locale })} – {format(weekDays[5], 'd MMM yyyy', { locale })}
              </span>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-2 rounded-md hover:bg-accent transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Day cards */}
            <div className="grid grid-cols-6 gap-1.5">
              {weekDays.map((day) => {
                const past = isPastDay(day);
                const sunday = isSunday(day);
                const disabled = past || sunday;
                const selected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    disabled={disabled}
                    onClick={() => handleDateSelect(day)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all text-center ${
                      disabled
                        ? 'opacity-30 cursor-not-allowed'
                        : selected
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                        : 'hover:bg-accent border border-border'
                    }`}
                  >
                    <span className="text-xs uppercase font-medium">
                      {format(day, 'EEE', { locale })}
                    </span>
                    <span className="text-lg font-bold">{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{language === 'es' ? 'Horarios disponibles' : 'Available times'}</span>
                  {loadingSlots && <span className="text-xs text-primary">{language === 'es' ? '(cargando...)' : '(loading...)'}</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const isBooked = bookedSlots.includes(time);
                    const selected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={isBooked || loadingSlots}
                        onClick={() => handleTimeSelect(time)}
                        className={`py-2 px-1 rounded-md text-sm font-medium transition-all ${
                          isBooked
                            ? 'opacity-40 bg-red-500/10 border border-red-500/30 cursor-not-allowed text-muted-foreground line-through'
                            : loadingSlots
                            ? 'opacity-50 cursor-not-allowed border border-border'
                            : selected
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:border-primary hover:bg-accent/50'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue button */}
            {selectedDate && selectedTime && (
              <Button onClick={handleContinueToDetails} className="w-full">
                {language === 'es' ? 'Continuar' : 'Continue'}
              </Button>
            )}
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
            {/* Summary */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border">
              <CalendarDays className="w-5 h-5 text-primary shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {selectedDate && format(selectedDate, 'EEEE d MMMM', { locale })}
                </span>
                <span className="text-muted-foreground"> · {selectedTime}</span>
                <span className="text-muted-foreground"> · {barbers.find(b => b.id === selectedBarber)?.label}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="booking-name">{language === 'es' ? 'Nombre' : 'Name'} *</Label>
                <Input
                  id="booking-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'es' ? 'Tu nombre completo' : 'Your full name'}
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-phone">{language === 'es' ? 'Teléfono' : 'Phone'} *</Label>
                <Input
                  id="booking-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  maxLength={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-note">{language === 'es' ? 'Nota (opcional)' : 'Note (optional)'}</Label>
                <Textarea
                  id="booking-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={language === 'es' ? 'Algo especial para tu cita...' : 'Anything special for your appointment...'}
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !phone.trim()}
              className="w-full"
            >
              {language === 'es' ? 'Confirmar reserva' : 'Confirm booking'}
            </Button>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-medium text-lg">
                {language === 'es' ? '¡Gracias, ' : 'Thank you, '}{name}!
              </p>
              <p className="text-muted-foreground text-sm">
                {language === 'es'
                  ? 'Tu reserva ha sido registrada. Te contactaremos para confirmar.'
                  : 'Your booking has been registered. We\'ll contact you to confirm.'}
              </p>
            </div>
            <div className="w-full p-4 rounded-lg bg-accent/30 border border-border text-left space-y-1 text-sm">
              <p><span className="text-muted-foreground">{language === 'es' ? 'Servicio:' : 'Service:'}</span> <span className="text-foreground font-medium">{services.find(s => s.id === selectedService)?.label}</span></p>
              <p><span className="text-muted-foreground">{language === 'es' ? 'Barbero:' : 'Barber:'}</span> <span className="text-foreground font-medium">{barbers.find(b => b.id === selectedBarber)?.label}</span></p>
              <p><span className="text-muted-foreground">{language === 'es' ? 'Fecha:' : 'Date:'}</span> <span className="text-foreground font-medium">{selectedDate && format(selectedDate, 'EEEE d MMMM yyyy', { locale })}</span></p>
              <p><span className="text-muted-foreground">{language === 'es' ? 'Hora:' : 'Time:'}</span> <span className="text-foreground font-medium">{selectedTime}</span></p>
              {note && <p><span className="text-muted-foreground">{language === 'es' ? 'Nota:' : 'Note:'}</span> <span className="text-foreground">{note}</span></p>}
            </div>
            <Button onClick={handleClose} variant="outline" className="w-full">
              {language === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
