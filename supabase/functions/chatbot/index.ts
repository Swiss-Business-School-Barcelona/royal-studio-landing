import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BARBERS = ["Marcelo"];
const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30",
];

// Working days: Mon=1 to Sat=6
function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getNextWorkingDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setDate(d.getDate() + 1);
  while (!isWorkingDay(d)) {
    d.setDate(d.getDate() + 1);
  }
  return formatDate(d);
}

function parseDateFromText(text: string): string | null {
  const today = new Date();

  const lowerText = text.toLowerCase();

  if (lowerText.includes("hoy") || lowerText.includes("today")) {
    return formatDate(today);
  }
  if (lowerText.includes("mañana") || lowerText.includes("tomorrow")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return formatDate(d);
  }

  const dayNames: Record<string, number> = {
    lunes: 1, monday: 1,
    martes: 2, tuesday: 2,
    miércoles: 3, miercoles: 3, wednesday: 3,
    jueves: 4, thursday: 4,
    viernes: 5, friday: 5,
    sábado: 6, sabado: 6, saturday: 6,
  };

  for (const [name, dayNum] of Object.entries(dayNames)) {
    if (lowerText.includes(name)) {
      const d = new Date(today);
      const currentDay = d.getDay();
      let diff = dayNum - currentDay;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return formatDate(d);
    }
  }

  // Try yyyy-mm-dd or dd/mm/yyyy or dd-mm-yyyy
  const isoMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;

  const euMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (euMatch) return `${euMatch[3]}-${euMatch[2].padStart(2, "0")}-${euMatch[1].padStart(2, "0")}`;

  return null;
}

function parseTimeFromText(text: string): string | null {
  // Match patterns like "10:00", "10:30", "10am", "2pm", "14:00", "a las 10"
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const h = parseInt(timeMatch[1]);
    const m = parseInt(timeMatch[2]);
    if (h >= 10 && h <= 19 && (m === 0 || m === 30)) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
    // Close match - round to nearest slot
    if (h >= 10 && h <= 19) {
      const rounded = m < 15 ? "00" : m < 45 ? "30" : "00";
      const finalH = m >= 45 ? h + 1 : h;
      if (finalH <= 19) {
        return `${finalH.toString().padStart(2, "0")}:${rounded}`;
      }
    }
  }

  // Match "3pm", "3 pm", "15"
  const pmMatch = text.match(/(\d{1,2})\s*(pm|am)/i);
  if (pmMatch) {
    let h = parseInt(pmMatch[1]);
    if (pmMatch[2].toLowerCase() === "pm" && h < 12) h += 12;
    if (pmMatch[2].toLowerCase() === "am" && h === 12) h = 0;
    if (h >= 10 && h <= 19) {
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  // Match standalone hour "a las 10", "at 3"
  const atMatch = text.match(/(?:a las|at)\s+(\d{1,2})/i);
  if (atMatch) {
    let h = parseInt(atMatch[1]);
    if (h >= 1 && h <= 7) h += 12; // Assume PM for small numbers
    if (h >= 10 && h <= 19) {
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  return null;
}

function parseBarberFromText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const barber of BARBERS) {
    if (lower.includes(barber.toLowerCase())) {
      return barber;
    }
  }
  return null;
}

interface SessionState {
  step: "greeting" | "collect_info" | "check_availability" | "confirm" | "collect_name" | "collect_phone" | "done";
  barber?: string;
  day?: string;
  time?: string;
  client_name?: string;
  phone_number?: string;
  notes?: string;
  alternatives?: { day: string; time: string }[];
}

async function getBookedSlots(supabase: any, day: string, barber: string): Promise<string[]> {
  const { data } = await supabase
    .from("bookings")
    .select("time")
    .eq("day", day)
    .eq("barber_name", barber);
  return (data || []).map((b: any) => b.time.substring(0, 5));
}

async function findAlternatives(
  supabase: any,
  day: string,
  time: string,
  barber: string
): Promise<{ day: string; time: string }[]> {
  const alternatives: { day: string; time: string }[] = [];
  const timeIdx = TIME_SLOTS.indexOf(time);

  // Check adjacent times same day
  const adjacentTimes: string[] = [];
  if (timeIdx > 0) adjacentTimes.push(TIME_SLOTS[timeIdx - 1]);
  if (timeIdx < TIME_SLOTS.length - 1) adjacentTimes.push(TIME_SLOTS[timeIdx + 1]);
  if (timeIdx > 1) adjacentTimes.push(TIME_SLOTS[timeIdx - 2]);
  if (timeIdx < TIME_SLOTS.length - 2) adjacentTimes.push(TIME_SLOTS[timeIdx + 2]);

  const bookedSameDay = await getBookedSlots(supabase, day, barber);

  for (const t of adjacentTimes) {
    if (!bookedSameDay.includes(t)) {
      alternatives.push({ day, time: t });
    }
    if (alternatives.length >= 2) break;
  }

  // Check next working day same time
  const nextDay = getNextWorkingDay(day);
  const bookedNextDay = await getBookedSlots(supabase, nextDay, barber);
  if (!bookedNextDay.includes(time)) {
    alternatives.push({ day: nextDay, time });
  }

  return alternatives.slice(0, 3);
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  return `${days[d.getDay()]} ${dateStr}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionState } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const state: SessionState = sessionState || { step: "greeting" };
    const text = (message || "").trim();

    let reply = "";
    let newState: SessionState = { ...state };

    // Try to extract info from any message
    const parsedBarber = parseBarberFromText(text);
    const parsedDay = parseDateFromText(text);
    const parsedTime = parseTimeFromText(text);

    if (parsedBarber && !newState.barber) newState.barber = parsedBarber;
    if (parsedDay) newState.day = parsedDay;
    if (parsedTime) newState.time = parsedTime;

    // If user is in greeting or collect_info step and we got enough info, move forward
    if (state.step === "greeting" || state.step === "collect_info") {
      // Default barber if only one
      if (!newState.barber && BARBERS.length === 1) {
        newState.barber = BARBERS[0];
      }

      if (newState.barber && newState.day && newState.time) {
        // Check if working day
        const dateObj = new Date(newState.day + "T12:00:00Z");
        if (!isWorkingDay(dateObj)) {
          reply = `Lo siento, no trabajamos ese día. Nuestro horario es de lunes a sábado.\n\nSorry, we don't work that day. Our hours are Monday to Saturday.\n\n¿Qué otro día te gustaría? / What other day would you like?`;
          newState.step = "collect_info";
          newState.day = undefined;
        } else {
          // Check availability
          const bookedSlots = await getBookedSlots(supabase, newState.day, newState.barber);

          if (!bookedSlots.includes(newState.time!)) {
            // Available!
            reply = `✅ ¡El horario está disponible!\n\n📅 ${dayLabel(newState.day)}\n⏰ ${newState.time}\n💈 ${newState.barber}\n\nPara confirmar tu reserva, necesito tu nombre completo.\n\nTo confirm your booking, I need your full name.`;
            newState.step = "collect_name";
          } else {
            // Not available - find alternatives
            const alts = await findAlternatives(supabase, newState.day, newState.time!, newState.barber);
            if (alts.length > 0) {
              newState.alternatives = alts;
              const altList = alts
                .map((a, i) => `${i + 1}) ${dayLabel(a.day)} a las ${a.time}`)
                .join("\n");
              reply = `❌ Lo siento, ${newState.time} el ${dayLabel(newState.day)} no está disponible.\n\nPero tengo estas alternativas:\n${altList}\n\n¿Cuál prefieres? (responde con el número)\n\nSorry, ${newState.time} on ${dayLabel(newState.day)} is not available.\n\nBut I have these alternatives:\n${altList}\n\nWhich do you prefer? (reply with the number)`;
              newState.step = "check_availability";
            } else {
              reply = `❌ Lo siento, no hay horarios disponibles cercanos. ¿Te gustaría probar otro día u hora?\n\nSorry, no nearby slots available. Would you like to try another day or time?`;
              newState.step = "collect_info";
              newState.day = undefined;
              newState.time = undefined;
            }
          }
        }
      } else {
        // Still missing info
        const missing: string[] = [];
        if (!newState.day) missing.push("día/day");
        if (!newState.time) missing.push("hora/time");

        if (state.step === "greeting") {
          reply = `¡Hola! 👋 Soy el asistente de Royal Studio. Puedo ayudarte a reservar tu cita.\n\nHi! I'm the Royal Studio assistant. I can help you book your appointment.\n\n¿Para qué día y hora te gustaría reservar?\nWhat day and time would you like to book?\n\n🕐 Horario: Lunes a Sábado, 10:00 - 19:30\n🕐 Hours: Monday to Saturday, 10:00 - 19:30`;
          newState.step = "collect_info";
        } else {
          reply = `Todavía necesito: ${missing.join(", ")}.\n\nI still need: ${missing.join(", ")}.\n\nEjemplo: \"mañana a las 10:00\" / Example: \"tomorrow at 10:00\"`;
        }
      }
    } else if (state.step === "check_availability") {
      // User selecting an alternative
      const numMatch = text.match(/(\d)/);
      if (numMatch && state.alternatives) {
        const idx = parseInt(numMatch[1]) - 1;
        if (idx >= 0 && idx < state.alternatives.length) {
          const alt = state.alternatives[idx];
          newState.day = alt.day;
          newState.time = alt.time;
          newState.alternatives = undefined;
          reply = `✅ ¡Perfecto! Has elegido:\n\n📅 ${dayLabel(alt.day)}\n⏰ ${alt.time}\n💈 ${newState.barber}\n\nPara confirmar, necesito tu nombre completo.\n\nTo confirm, I need your full name.`;
          newState.step = "collect_name";
        } else {
          reply = `Por favor elige un número válido de las opciones.\nPlease choose a valid number from the options.`;
        }
      } else {
        // Maybe they're providing a new date/time
        if (parsedDay || parsedTime) {
          newState.step = "collect_info";
          // Re-process will happen on next message, but let's give feedback
          reply = `Entendido, déjame verificar esa disponibilidad...\nGot it, let me check that availability...`;
          // Actually re-check immediately
          if (newState.day && newState.time && newState.barber) {
            const bookedSlots = await getBookedSlots(supabase, newState.day, newState.barber);
            if (!bookedSlots.includes(newState.time)) {
              reply = `✅ ¡Disponible!\n\n📅 ${dayLabel(newState.day)}\n⏰ ${newState.time}\n💈 ${newState.barber}\n\nNecesito tu nombre completo para confirmar.\nI need your full name to confirm.`;
              newState.step = "collect_name";
            } else {
              const alts = await findAlternatives(supabase, newState.day, newState.time, newState.barber);
              if (alts.length > 0) {
                newState.alternatives = alts;
                const altList = alts.map((a, i) => `${i + 1}) ${dayLabel(a.day)} a las ${a.time}`).join("\n");
                reply = `❌ Ese horario tampoco está disponible. Alternativas:\n${altList}\n\n¿Cuál prefieres?\nThat slot isn't available either. Alternatives:\n${altList}\n\nWhich do you prefer?`;
              } else {
                reply = `❌ No hay disponibilidad cercana. ¿Otro día/hora?\nNo nearby availability. Another day/time?`;
                newState.step = "collect_info";
                newState.day = undefined;
                newState.time = undefined;
              }
            }
          }
        } else {
          reply = `Por favor elige una de las opciones (1, 2, 3) o indica otro día/hora.\nPlease choose an option (1, 2, 3) or suggest another day/time.`;
        }
      }
    } else if (state.step === "collect_name") {
      if (text.length >= 2) {
        newState.client_name = text;
        reply = `Gracias, ${text}! 📱 Ahora necesito tu número de teléfono.\n\nThanks, ${text}! 📱 Now I need your phone number.`;
        newState.step = "collect_phone";
      } else {
        reply = `Por favor ingresa tu nombre completo.\nPlease enter your full name.`;
      }
    } else if (state.step === "collect_phone") {
      const phoneClean = text.replace(/[\s\-\(\)]/g, "");
      if (phoneClean.length >= 6) {
        newState.phone_number = phoneClean;

        // Confirm booking
        reply = `📋 Resumen de tu reserva / Booking summary:\n\n💈 Barbero: ${newState.barber}\n📅 Día: ${dayLabel(newState.day!)}\n⏰ Hora: ${newState.time}\n👤 Nombre: ${newState.client_name}\n📱 Teléfono: ${newState.phone_number}\n\n¿Confirmas la reserva? (sí/yes)\nDo you confirm the booking? (yes/sí)`;
        newState.step = "confirm";
      } else {
        reply = `Por favor ingresa un número de teléfono válido.\nPlease enter a valid phone number.`;
      }
    } else if (state.step === "confirm") {
      const lower = text.toLowerCase();
      if (lower.includes("sí") || lower.includes("si") || lower.includes("yes") || lower.includes("ok") || lower.includes("confirmo") || lower.includes("confirm")) {
        // Insert booking
        const { error } = await supabase.from("bookings").insert({
          client_name: newState.client_name,
          barber_name: newState.barber,
          day: newState.day,
          time: newState.time + ":00",
          phone_number: newState.phone_number,
          notes: "Reservado via chatbot",
        });

        if (error) {
          if (error.code === "23505") {
            reply = `❌ Lo siento, ese horario acaba de ser reservado por alguien más. ¿Te gustaría elegir otro?\n\nSorry, that slot was just booked by someone else. Would you like to choose another?`;
            newState.step = "collect_info";
            newState.day = undefined;
            newState.time = undefined;
          } else {
            reply = `❌ Error al guardar la reserva: ${error.message}. Por favor intenta de nuevo.\n\nError saving booking. Please try again.`;
          }
        } else {
          reply = `🎉 ¡Reserva confirmada!\n\n💈 ${newState.barber}\n📅 ${dayLabel(newState.day!)}\n⏰ ${newState.time}\n\n¡Te esperamos en Royal Studio! / We look forward to seeing you at Royal Studio!\n\n¿Necesitas algo más? / Need anything else?`;
          newState.step = "done";
        }
      } else if (lower.includes("no") || lower.includes("cancel")) {
        reply = `Reserva cancelada. ¿Te gustaría reservar otro horario?\n\nBooking cancelled. Would you like to book another time?`;
        newState = { step: "collect_info" };
      } else {
        reply = `¿Confirmas la reserva? Responde sí o no.\nDo you confirm? Reply yes or no.`;
      }
    } else if (state.step === "done") {
      // New conversation
      newState = { step: "greeting" };
      if (parsedDay || parsedTime) {
        newState.step = "collect_info";
        if (parsedDay) newState.day = parsedDay;
        if (parsedTime) newState.time = parsedTime;
        if (BARBERS.length === 1) newState.barber = BARBERS[0];

        if (newState.day && newState.time && newState.barber) {
          const bookedSlots = await getBookedSlots(supabase, newState.day, newState.barber);
          if (!bookedSlots.includes(newState.time)) {
            reply = `✅ ¡Disponible!\n\n📅 ${dayLabel(newState.day)}\n⏰ ${newState.time}\n💈 ${newState.barber}\n\nNecesito tu nombre completo.\nI need your full name.`;
            newState.step = "collect_name";
          } else {
            const alts = await findAlternatives(supabase, newState.day, newState.time, newState.barber);
            const altList = alts.map((a, i) => `${i + 1}) ${dayLabel(a.day)} a las ${a.time}`).join("\n");
            reply = `❌ No disponible. Alternativas:\n${altList}\n\n¿Cuál prefieres?`;
            newState.alternatives = alts;
            newState.step = "check_availability";
          }
        } else {
          const missing: string[] = [];
          if (!newState.day) missing.push("día/day");
          if (!newState.time) missing.push("hora/time");
          reply = `¡Claro! Necesito: ${missing.join(", ")}.\nSure! I need: ${missing.join(", ")}.`;
        }
      } else {
        reply = `¡Hola de nuevo! ¿En qué puedo ayudarte?\nHi again! How can I help you?`;
        newState.step = "greeting";
      }
    }

    return new Response(
      JSON.stringify({ message: reply, sessionState: newState }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: "Lo siento, hubo un error. Intenta de nuevo. / Sorry, there was an error. Try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
