import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

console.log("[chatbot][boot] Environment variables check", {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseServiceKey: !!supabaseServiceKey,
  hasOpenAiApiKey: !!openaiApiKey,
});

type LogLevel = "INFO" | "WARN" | "ERROR";

const BASE_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Max-Age": "86400",
};

function withCorsHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...BASE_CORS_HEADERS,
    ...headers,
  };
}

function createLogger(requestId: string, sessionId?: string) {
  return (level: LogLevel, step: string, message: string, meta?: Record<string, unknown>) => {
    const payload = {
      ts: new Date().toISOString(),
      level,
      requestId,
      sessionId: sessionId || "unknown",
      step,
      message,
      ...(meta ? { meta } : {}),
    };

    if (level === "ERROR") {
      console.error("[chatbot]", JSON.stringify(payload));
    } else if (level === "WARN") {
      console.warn("[chatbot]", JSON.stringify(payload));
    } else {
      console.log("[chatbot]", JSON.stringify(payload));
    }
  };
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    return {
      name: e.name,
      message: e.message,
      code: e.code,
      details: e.details,
      hint: e.hint,
      stack: e.stack,
    };
  }

  return { message: String(error) };
}

function getDateInTimeZone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

interface BookingData {
  client_name?: string;
  barber_name?: string;
  day?: string;
  time?: string;
  phone_number?: string;
  notes?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AvailabilityCandidate {
  barberName: string;
  day: string;
  time: string;
}

function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function extractAvailabilityCandidate(
  messages: Message[],
  today: string
): AvailabilityCandidate | null {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) return null;

  const latestUser = userMessages[userMessages.length - 1]?.content || "";
  const latestUserLower = latestUser.toLowerCase();

  const timeRegex = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
  const dateRegex = /\b(20\d{2}-\d{2}-\d{2})\b/;

  let resolvedTime: string | null = null;
  let resolvedDate: string | null = null;

  const latestTimeMatch = latestUser.match(timeRegex);
  if (latestTimeMatch) {
    const hh = latestTimeMatch[1].padStart(2, "0");
    const mm = latestTimeMatch[2];
    resolvedTime = `${hh}:${mm}`;
  }

  const latestDateMatch = latestUser.match(dateRegex);
  if (latestDateMatch) {
    resolvedDate = latestDateMatch[1];
  } else if (latestUserLower.includes("tomorrow") || latestUserLower.includes("mañana")) {
    resolvedDate = addDaysToDate(today, 1);
  }

  // Fallback: find most recent date/time in previous user messages
  if (!resolvedTime || !resolvedDate) {
    for (let i = userMessages.length - 1; i >= 0; i--) {
      const text = userMessages[i].content;
      const lower = text.toLowerCase();

      if (!resolvedTime) {
        const t = text.match(timeRegex);
        if (t) {
          const hh = t[1].padStart(2, "0");
          const mm = t[2];
          resolvedTime = `${hh}:${mm}`;
        }
      }

      if (!resolvedDate) {
        const d = text.match(dateRegex);
        if (d) {
          resolvedDate = d[1];
        } else if (lower.includes("tomorrow") || lower.includes("mañana")) {
          resolvedDate = addDaysToDate(today, 1);
        }
      }

      if (resolvedTime && resolvedDate) break;
    }
  }

  if (!resolvedTime || !resolvedDate) return null;

  return {
    barberName: "Marcelo",
    day: resolvedDate,
    time: resolvedTime,
  };
}

// Available hours in 30-minute intervals
const AVAILABLE_TIMES = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30"
];

// Helper function to find available time slots
async function findAvailableSlots(
  supabase: any,
  barberName: string,
  requestedDate: string,
  requestedTime: string,
  log?: ReturnType<typeof createLogger>
): Promise<{ slot: string; date: string } | null> {
  try {
    log?.("INFO", "availability.exact_check", "Checking exact requested slot", {
      barberName,
      requestedDate,
      requestedTime,
    });

    // Try the exact requested time first
    const { data: exactBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("barber_name", barberName)
      .eq("day", requestedDate)
      .eq("time", requestedTime);

    log?.("INFO", "availability.exact_result", "Exact slot query completed", {
      existingBookingCount: Array.isArray(exactBooking) ? exactBooking.length : 0,
      barberName,
      requestedDate,
      requestedTime,
    });

    if (!exactBooking || exactBooking.length === 0) {
      log?.("INFO", "availability.exact_check", "Exact slot is available", {
        slot: requestedTime,
        date: requestedDate,
      });
      return { slot: requestedTime, date: requestedDate };
    }

    // Try other times on the same day (30 min before and after, then expand)
    const timeIndex = AVAILABLE_TIMES.indexOf(requestedTime);
    const timesToTry: string[] = [];

    if (timeIndex !== -1) {
      // Check +/- 30 min, +/- 1 hour, +/- 1.5 hours, etc.
      for (let offset = 1; offset <= 4; offset++) {
        if (timeIndex + offset < AVAILABLE_TIMES.length) {
          timesToTry.push(AVAILABLE_TIMES[timeIndex + offset]);
        }
        if (timeIndex - offset >= 0) {
          timesToTry.push(AVAILABLE_TIMES[timeIndex - offset]);
        }
      }
    }

    for (const time of timesToTry) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("barber_name", barberName)
        .eq("day", requestedDate)
        .eq("time", time);

      if (!booking || booking.length === 0) {
        log?.("INFO", "availability.nearby_check", "Found closest available slot on same day", {
          slot: time,
          date: requestedDate,
        });
        return { slot: time, date: requestedDate };
      }
    }

    // Try next day at the same time
    const nextDate = new Date(requestedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Skip Sundays (day 0)
    if (nextDate.getDay() === 0) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    const nextDateStr = nextDate.toISOString().split('T')[0];
    const { data: nextDayBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("barber_name", barberName)
      .eq("day", nextDateStr)
      .eq("time", requestedTime);

    if (!nextDayBooking || nextDayBooking.length === 0) {
      log?.("INFO", "availability.next_day_check", "Found available slot on next day", {
        slot: requestedTime,
        date: nextDateStr,
      });
      return { slot: requestedTime, date: nextDateStr };
    }

    log?.("WARN", "availability.result", "No available slot found", {
      barberName,
      requestedDate,
      requestedTime,
    });
    return null;
  } catch (error) {
    log?.("ERROR", "availability.error", "Error while checking available slots", {
      error: serializeError(error),
    });
    return null;
  }
}

async function getNearbyAvailableTimes(
  supabase: any,
  barberName: string,
  requestedDate: string,
  requestedTime: string,
  limit = 3,
  log?: ReturnType<typeof createLogger>
): Promise<string[]> {
  try {
    const timeIndex = AVAILABLE_TIMES.indexOf(requestedTime);
    const timesToTry: string[] = [];

    if (timeIndex !== -1) {
      for (let offset = 1; offset < AVAILABLE_TIMES.length; offset++) {
        if (timeIndex - offset >= 0) {
          timesToTry.push(AVAILABLE_TIMES[timeIndex - offset]);
        }
        if (timeIndex + offset < AVAILABLE_TIMES.length) {
          timesToTry.push(AVAILABLE_TIMES[timeIndex + offset]);
        }
      }
    } else {
      timesToTry.push(...AVAILABLE_TIMES);
    }

    const available: string[] = [];

    for (const time of timesToTry) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("barber_name", barberName)
        .eq("day", requestedDate)
        .eq("time", time)
        .limit(1);

      if (!booking || booking.length === 0) {
        available.push(time);
      }

      if (available.length >= limit) {
        break;
      }
    }

    log?.("INFO", "availability.nearby_suggestions", "Computed nearby available times", {
      barberName,
      requestedDate,
      requestedTime,
      suggestions: available,
    });

    return available;
  } catch (error) {
    log?.("ERROR", "availability.nearby_suggestions_error", "Failed computing nearby available times", {
      error: serializeError(error),
    });
    return [];
  }
}

serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  const requestLogger = createLogger(requestId);

  requestLogger("INFO", "request.received", "Incoming request received", {
    method: req.method,
    url: req.url,
  });

  // CORS headers
  if (req.method === "OPTIONS") {
    requestLogger("INFO", "request.cors_preflight", "Handled CORS preflight request");

    const requestedHeaders = req.headers.get("access-control-request-headers");

    return new Response("ok", {
      headers: withCorsHeaders(
        requestedHeaders
          ? { "Access-Control-Allow-Headers": requestedHeaders }
          : {}
      ),
    });
  }

  try {
    requestLogger("INFO", "request.parse_body", "Parsing request body");
    const { messages, sessionId } = await req.json();
    const log = createLogger(requestId, sessionId);

    log("INFO", "request.validating", "Validating request payload", {
      hasMessages: Array.isArray(messages),
      messageCount: Array.isArray(messages) ? messages.length : 0,
    });

    if (!messages || !Array.isArray(messages)) {
      log("WARN", "request.invalid_payload", "Invalid messages format in request body");
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
          headers: withCorsHeaders({ "Content-Type": "application/json" }),
        }
      );
    }

    // Get today's date for context using shop timezone
    const shopTimeZone = "Europe/Madrid";
    const today = getDateInTimeZone(shopTimeZone);
    
    // System prompt for the chatbot - optimized for reservation process
    const systemPrompt = `You are the reservation assistant for Royal Studio, a premium barber shop.

Your job is to help customers book an appointment with Marcelo quickly and naturally, like a short phone call.

Keep responses short, friendly, and conversational.

Today's date: ${today}

Barber:
Marcelo

Services:
- Haircut & Styling
- Beard Trim
- Complete Grooming
- Specialty Cuts

Opening Hours:
Monday–Saturday: 10:00 – 19:30
Closed Sunday
Appointments every 30 minutes.

---

# Conversation Rules

1. Extract information from the user message whenever possible.

Users may provide multiple details in one message. Detect and store:
- name
- date
- time
- phone number
- service (optional)

2. Only ask for information that is missing.

Required booking information:
- name
- date
- time
- phone number

3. Natural conversation flow:

Example flow:
User: "Hi"
Assistant: Greeting + ask how you can help.

User: "I want a haircut with Marcelo tomorrow at 15:00"
Assistant: Ask only for the missing info (name).

User: "John"
Assistant: Ask for phone number and explain that exact availability is verified at final confirmation.

4. Availability communication behavior

- Do NOT claim a time is available or booked during chat collection.
- Say that exact availability is verified by the booking system at final confirmation.
- If asked directly, use wording like:
  "I will verify exact availability when I submit the reservation."

When the requested time is available:
Ask for the phone number before confirming.

Example:
"Great, that slot is available. Could I get your phone number to confirm the booking?"

When the requested time is NOT available:
Suggest 3 nearby times.

Example:
"Marcelo is booked at 15:00, but these times are available:
14:30
15:30
16:00
Would any of these work?"

If the user rejects suggestions:
Ask for another preferred time or day.

5. Phone number

Example:
600111222

6. Confirmation

Before finalizing, briefly confirm:

Example:
"Perfect. Here's your booking:
Name: John Doe
Barber: Marcelo
Date: 2026-03-12
Time: 15:30
Phone: 600111222

Does everything look correct?"

7. Final output

Only after the user clearly confirms the reservation, output this line at the very end:

RESERVATION_CONFIRMED: client_name|Marcelo|date|time|phone|notes

Example:
RESERVATION_CONFIRMED: John Doe|Marcelo|2026-03-12|15:30|600111222|No special requests

Rules:
- Do not output the confirmation marker until the user explicitly confirms.
- Keep responses concise.
- Always respond in the user's language (Spanish or English).

Date Rules:
- Accept both absolute (YYYY-MM-DD) and relative dates (e.g., "tomorrow", "this Friday", "next Monday").
- Always resolve relative dates to the **next calendar date that matches the day** and falls within operating days (Monday–Saturday).
- Never schedule on Sunday (closed).
- Example:
    - Today is Monday, 2026-03-09
    - "this Friday" → 2026-03-13
    - "next Monday" → 2026-03-16
- If the resolved date is invalid or on a Sunday, choose the **next valid weekday**.`;

    // Build the conversation for OpenAI
    const conversationMessages: Message[] = [
      ...messages,
    ];

    const hasSupabaseConnection = !!(supabaseUrl && supabaseServiceKey);
    const supabase = hasSupabaseConnection
      ? createClient(supabaseUrl as string, supabaseServiceKey as string)
      : null;

    // Call OpenAI API
    log("INFO", "openai.request.start", "Sending request to OpenAI", {
      model: "gpt-4o-mini",
      promptMessageCount: conversationMessages.length + 1,
    });

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages,
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      log("ERROR", "openai.request.failed", "OpenAI returned non-OK response", {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        openaiError: openaiData,
      });
      return new Response(
        JSON.stringify({ error: "Failed to get response from OpenAI" }),
        {
          status: 500,
          headers: withCorsHeaders({ "Content-Type": "application/json" }),
        }
      );
    }

    let assistantMessage = openaiData.choices[0].message.content;

    log("INFO", "openai.response.received", "Assistant message received", {
      messageLength: typeof assistantMessage === "string" ? assistantMessage.length : 0,
    });

    // Force DB verification on every request whenever a date/time candidate can be extracted
    const availabilityCandidate = extractAvailabilityCandidate(conversationMessages, today);

    if (availabilityCandidate && supabase) {
      log("INFO", "availability.force_check.start", "Forced availability check triggered", {
        barberName: availabilityCandidate.barberName,
        day: availabilityCandidate.day,
        time: availabilityCandidate.time,
      });

      const { data: existingBooking, error: availabilityError } = await supabase
        .from("bookings")
        .select("id")
        .eq("barber_name", availabilityCandidate.barberName)
        .eq("day", availabilityCandidate.day)
        .eq("time", availabilityCandidate.time)
        .limit(1);

      if (availabilityError) {
        log("ERROR", "availability.force_check.error", "Forced availability DB check failed", {
          error: serializeError(availabilityError),
        });
      } else {
        const isBooked = !!existingBooking?.length;
        log("INFO", "availability.force_check.result", "Forced availability DB check completed", {
          isBooked,
          matches: existingBooking?.length || 0,
          barberName: availabilityCandidate.barberName,
          day: availabilityCandidate.day,
          time: availabilityCandidate.time,
        });

        let dbVerificationNote = "";
        if (isBooked) {
          const closestSlot = await findAvailableSlots(
            supabase,
            availabilityCandidate.barberName,
            availabilityCandidate.day,
            availabilityCandidate.time,
            log
          );

          //dbVerificationNote = `⚠️ Verified in database: ${availabilityCandidate.barberName} is already booked on ${availabilityCandidate.day} at ${availabilityCandidate.time}.`;
          if (closestSlot) {
            dbVerificationNote += ` Closest available slot: ${closestSlot.date} at ${closestSlot.slot}.`;
          }
        } else {
         // dbVerificationNote = `✅ Verified in database: ${availabilityCandidate.barberName} is available on ${availabilityCandidate.day} at ${availabilityCandidate.time}.`;
        }

        assistantMessage = `${dbVerificationNote}\n\n${assistantMessage}`;
      }
    } else if (availabilityCandidate && !supabase) {
      log("WARN", "availability.force_check.skipped", "Forced DB check skipped due to missing Supabase configuration", {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseServiceKey: !!supabaseServiceKey,
      });
    }

    // Check if reservation should be confirmed
    if (assistantMessage.includes("RESERVATION_CONFIRMED:")) {
      log("INFO", "reservation.marker_detected", "Reservation confirmation marker detected");
      
      const reservationMatch = assistantMessage.match(
        /RESERVATION_CONFIRMED:\s*(.+?)\|(.+?)\|(.+?)\|(.+?)\|(.+?)\|(.*)$/m
      );

      log("INFO", "reservation.parsing", "Parsed reservation marker", {
        parseSucceeded: !!reservationMatch,
      });

      if (reservationMatch) {
        const [, clientName, barberName, day, time, phoneNumber, notes] = reservationMatch;

        log("INFO", "reservation.details_extracted", "Reservation details extracted successfully", {
          clientName: clientName.trim(),
          barberName: barberName.trim(),
          day: day.trim(),
          time: time.trim(),
          hasPhoneNumber: !!phoneNumber.trim(),
          hasNotes: !!notes.trim(),
        });

        if (!supabaseUrl || !supabaseServiceKey) {
          log("ERROR", "supabase.config_missing", "Missing required Supabase environment variables", {
            hasSupabaseUrl: !!supabaseUrl,
            hasSupabaseServiceKey: !!supabaseServiceKey,
          });
          // Remove the confirmation marker before returning
          assistantMessage = assistantMessage
            .split("RESERVATION_CONFIRMED:")[0]
            .trim();
          return new Response(
            JSON.stringify({
              message: (assistantMessage || "System error: Database configuration missing. Please contact support."),
            }),
            {
              status: 200,
              headers: withCorsHeaders({ "Content-Type": "application/json" }),
            }
          );
        }

        // Initialize Supabase client with service role key
        log("INFO", "supabase.client_init", "Initializing Supabase client");
        const bookingSupabase = createClient(supabaseUrl, supabaseServiceKey);

        try {
          // Check exact requested slot only (do not auto-book alternatives)
          log("INFO", "availability.start", "Checking exact requested slot before booking", {
            barber: barberName.trim(),
            date: day.trim(),
            time: time.trim(),
          });

          const { data: exactBooking, error: exactBookingError } = await bookingSupabase
            .from("bookings")
            .select("id")
            .eq("barber_name", barberName.trim())
            .eq("day", day.trim())
            .eq("time", time.trim())
            .limit(1);

          if (exactBookingError) {
            log("ERROR", "availability.exact_query_error", "Failed checking exact slot before booking", {
              error: serializeError(exactBookingError),
            });
            assistantMessage = assistantMessage
              .split("RESERVATION_CONFIRMED:")[0]
              .trim();
            return new Response(
              JSON.stringify({
                message: assistantMessage || "I couldn't verify availability right now. Please try again.",
              }),
              {
                status: 200,
                headers: withCorsHeaders({ "Content-Type": "application/json" }),
              }
            );
          }

          const isRequestedSlotBooked = Array.isArray(exactBooking) && exactBooking.length > 0;

          if (isRequestedSlotBooked) {
            const nearbyTimes = await getNearbyAvailableTimes(
              bookingSupabase,
              barberName.trim(),
              day.trim(),
              time.trim(),
              3,
              log
            );

            log("WARN", "availability.requested_slot_booked", "Requested slot is already booked", {
              barber: barberName.trim(),
              date: day.trim(),
              time: time.trim(),
              nearbyTimes,
            });

            assistantMessage = assistantMessage
              .split("RESERVATION_CONFIRMED:")[0]
              .trim();

            const suggestionBlock = nearbyTimes.length
              ? nearbyTimes.join("\n")
              : "(no nearby times available right now)";

            return new Response(
              JSON.stringify({
                message:
                  assistantMessage ||
                  `${barberName.trim()} is booked at ${time.trim()}, but these times are available:\n${suggestionBlock}\nWould any of these work?`,
              }),
              {
                status: 200,
                headers: withCorsHeaders({ "Content-Type": "application/json" }),
              }
            );
          }

          // Insert booking
          log("INFO", "booking.insert.start", "Inserting booking into database", {
            date: day.trim(),
            time: time.trim(),
          });

          const { data: insertData, error: insertError } = await bookingSupabase.from("bookings").insert([
            {
              client_name: clientName.trim(),
              barber_name: barberName.trim(),
              day: day.trim(),
              time: time.trim(),
              phone_number: phoneNumber.trim(),
              notes: notes.trim() || null,
            },
          ]);

          if (insertError) {
            log("ERROR", "booking.insert.failed", "Failed to insert booking", {
              error: serializeError(insertError),
            });

            assistantMessage = assistantMessage
              .split("RESERVATION_CONFIRMED:")[0]
              .trim();
            
            // Check if it's a unique constraint violation
            if (
              insertError.code === "23505" ||
              insertError.message?.includes("unique")
            ) {
              return new Response(
                JSON.stringify({
                  message: assistantMessage || `That time slot is no longer available. Would you like to choose a different time?`,
                }),
                {
                  status: 200,
                  headers: withCorsHeaders({ "Content-Type": "application/json" }),
                }
              );
            }
            return new Response(
              JSON.stringify({
                message: assistantMessage || "I encountered an error while saving your reservation. Please try again.",
              }),
              {
                status: 200,
                headers: withCorsHeaders({ "Content-Type": "application/json" }),
              }
            );
          }

          log("INFO", "booking.insert.success", "Reservation inserted successfully", {
            insertCount: Array.isArray(insertData) ? insertData.length : 0,
            usedAlternativeSlot: false,
          });

          // Remove the confirmation marker and return clean message
          let cleanMessage = assistantMessage
            .split("RESERVATION_CONFIRMED:")[0]
            .trim();

          return new Response(
            JSON.stringify({
              message: cleanMessage || "Your reservation has been confirmed! Thank you for choosing Royal Studio.",
              booking: {
                client_name: clientName.trim(),
                barber_name: barberName.trim(),
                day: day.trim(),
                time: time.trim(),
                phone_number: phoneNumber.trim(),
                notes: notes.trim() || null,
              },
            }),
            {
              headers: withCorsHeaders({ "Content-Type": "application/json" }),
            }
          );
        } catch (dbError) {
          log("ERROR", "booking.database_exception", "Unhandled database exception while processing reservation", {
            error: serializeError(dbError),
          });
          assistantMessage = assistantMessage
            .split("RESERVATION_CONFIRMED:")[0]
            .trim();
          return new Response(
            JSON.stringify({
              message: assistantMessage || "An error occurred while processing your reservation. Please try again.",
            }),
            {
              status: 200,
              headers: withCorsHeaders({ "Content-Type": "application/json" }),
            }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: withCorsHeaders({ "Content-Type": "application/json" }),
      }
    );
  } catch (error) {
    requestLogger("ERROR", "request.unhandled_exception", "Unhandled exception in chatbot function", {
      error: serializeError(error),
    });

    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: withCorsHeaders({ "Content-Type": "application/json" }),
      }
    );
  }
});
