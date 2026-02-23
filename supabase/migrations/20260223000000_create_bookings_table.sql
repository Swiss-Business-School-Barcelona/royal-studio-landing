-- Create bookings table
CREATE TABLE public.bookings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  client_name TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  day DATE NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create indexes for common queries
CREATE INDEX idx_bookings_day ON public.bookings(day);
CREATE INDEX idx_bookings_barber_name ON public.bookings(barber_name);
CREATE INDEX idx_bookings_client_name ON public.bookings(client_name);
