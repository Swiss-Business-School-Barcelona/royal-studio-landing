import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

console.log("Environment variables check:");
console.log("- SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
console.log("- SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
console.log("- OPENAI_API_KEY:", openaiApiKey ? "✓" : "✗");

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
  requestedTime: string
): Promise<{ slot: string; date: string } | null> {
  try {
    // Try the exact requested time first
    const { data: exactBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("barber_name", barberName)
      .eq("day", requestedDate)
      .eq("time", requestedTime);

    if (!exactBooking || exactBooking.length === 0) {
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
        console.log(`Found available slot: ${time} on ${requestedDate}`);
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
      console.log(`Found available slot: ${requestedTime} on ${nextDateStr} (next day)`);
      return { slot: requestedTime, date: nextDateStr };
    }

    return null;
  } catch (error) {
    console.error("Error finding available slots:", error);
    return null;
  }
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400 }
      );
    }

    // Get today's date for context
    const today = new Date().toISOString().split('T')[0];
    
    // System prompt for the chatbot - optimized for reservation process
    const systemPrompt = `You are a professional booking assistant for Royal Studio, a high-end barber shop. Your goal is to guide customers through a smooth reservation process.

## Current Context
**Today's Date:** ${today}

## Booking Information

**Available Services:**
- Haircut & Styling
- Beard Trim
- Complete Grooming
- Specialty Cuts

**Available Barber:**
- Marcelo (experienced professional)

**Operating Hours:**
- Monday to Saturday: 10:00 AM - 7:30 PM
- Closed Sundays
- Time slots available every 30 minutes

## Reservation Process - Follow These Steps:

1. **Greet & Offer Help**: Welcome the customer and ask what service they'd like
2. **Collect Information** (in this exact order):
   - Client's full name
   - Preferred date (must be Monday-Saturday, format: YYYY-MM-DD)
   - Preferred time (format: HH:MM, e.g., 14:00)
   - Phone number (must include country code, e.g., +34600000000)
   - Special notes (optional - haircut style preferences, concerns, etc.)
3. **Confirm Details**: Summarize all booking details
4. **Request Confirmation**: Ask the customer to confirm if everything is correct

## Important Guidelines:

- Always be professional, friendly, and helpful
- Ask for one piece of information at a time in a conversational manner
- When asking for a date, suggest upcoming available weekdays
- Suggest time slots clearly: "Available times are: 10:00, 10:30, 11:00... up to 19:30"
- Validate phone numbers - they should include country code
- Respond in the same language the customer uses (Spanish or English)
- Never assume information - always ask and confirm
- Be transparent about the process

## Confirmation Format:

When the customer confirms ALL details are correct, respond with this EXACT format on a new line at the very end:

RESERVATION_CONFIRMED: John Doe|Marcelo|2026-02-25|14:00|+34600000000|No special requests

Format: RESERVATION_CONFIRMED: client_name|barber_name|date(YYYY-MM-DD)|time(HH:MM)|phone_number|notes

Requirements:
- client_name: Full name, no special characters
- barber_name: "Marcelo"
- date: YYYY-MM-DD format, Monday-Saturday only
- time: HH:MM format (24-hour clock)
- phone_number: Full international format with country code
- notes: Any special requests or "No special requests"

Do NOT include the RESERVATION_CONFIRMED marker unless the customer explicitly confirms they want to book.`;

    // Build the conversation for OpenAI
    const conversationMessages: Message[] = [
      ...messages,
    ];

    // Call OpenAI API
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
      console.error("OpenAI error:", openaiData);
      return new Response(
        JSON.stringify({ error: "Failed to get response from OpenAI" }),
        { status: 500 }
      );
    }

    let assistantMessage = openaiData.choices[0].message.content;

    console.log("Assistant message received:");
    console.log(assistantMessage);
    console.log("---");

    // Check if reservation should be confirmed
    if (assistantMessage.includes("RESERVATION_CONFIRMED:")) {
      console.log("Reservation confirmation found in message");
      
      const reservationMatch = assistantMessage.match(
        /RESERVATION_CONFIRMED:\s*(.+?)\|(.+?)\|(.+?)\|(.+?)\|(.+?)\|(.*)$/m
      );

      console.log("Regex match result:", reservationMatch);

      if (reservationMatch) {
        const [, clientName, barberName, day, time, phoneNumber, notes] = reservationMatch;
        
        console.log("Reservation details extracted:");
        console.log("- Client:", clientName.trim());
        console.log("- Barber:", barberName.trim());
        console.log("- Day:", day.trim());
        console.log("- Time:", time.trim());
        console.log("- Phone:", phoneNumber.trim());
        console.log("- Notes:", notes.trim());

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error("Missing Supabase environment variables");
          // Remove the confirmation marker before returning
          assistantMessage = assistantMessage
            .split("RESERVATION_CONFIRMED:")[0]
            .trim();
          return new Response(
            JSON.stringify({
              message: (assistantMessage || "System error: Database configuration missing. Please contact support."),
            }),
            { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
          );
        }

        // Initialize Supabase client with service role key
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        try {
          // Find available slot (exact time or alternatives)
          console.log("Checking availability for:", {
            barber: barberName.trim(),
            date: day.trim(),
            time: time.trim(),
          });

          const availableSlot = await findAvailableSlots(
            supabase,
            barberName.trim(),
            day.trim(),
            time.trim()
          );

          if (!availableSlot) {
            console.log("No available slots found");
            assistantMessage = assistantMessage
              .split("RESERVATION_CONFIRMED:")[0]
              .trim();
            return new Response(
              JSON.stringify({
                message: assistantMessage || `Unfortunately, there are no available slots with ${barberName.trim()} around that time. Would you like to try a different date or time?`,
              }),
              { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
            );
          }

          // If different from requested, inform user
          const slotsAreDifferent =
            availableSlot.slot !== time.trim() ||
            availableSlot.date !== day.trim();

          // Insert booking
          console.log("Inserting reservation for:", {
            date: availableSlot.date,
            time: availableSlot.slot,
          });

          const { data: insertData, error: insertError } = await supabase.from("bookings").insert([
            {
              client_name: clientName.trim(),
              barber_name: barberName.trim(),
              day: availableSlot.date,
              time: availableSlot.slot,
              phone_number: phoneNumber.trim(),
              notes: notes.trim() || null,
            },
          ]);

          if (insertError) {
            console.error("Error inserting booking:", insertError);
            console.error("Error code:", insertError.code);
            console.error("Error message:", insertError.message);

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
                { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
              );
            }
            return new Response(
              JSON.stringify({
                message: assistantMessage || "I encountered an error while saving your reservation. Please try again.",
              }),
              { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
            );
          }

          console.log("Reservation successfully inserted:", insertData);

          // Remove the confirmation marker and return clean message
          let cleanMessage = assistantMessage
            .split("RESERVATION_CONFIRMED:")[0]
            .trim();

          // Add information about alternative slot if needed
          if (slotsAreDifferent) {
            cleanMessage += `\n\nNote: We've booked you for ${availableSlot.slot} on ${availableSlot.date} as that was the closest available time.`;
          }

          return new Response(
            JSON.stringify({
              message: cleanMessage || "Your reservation has been confirmed! Thank you for choosing Royal Studio.",
              booking: {
                client_name: clientName.trim(),
                barber_name: barberName.trim(),
                day: availableSlot.date,
                time: availableSlot.slot,
                phone_number: phoneNumber.trim(),
                notes: notes.trim() || null,
              },
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        } catch (dbError) {
          console.error("Database error:", dbError);
          assistantMessage = assistantMessage
            .split("RESERVATION_CONFIRMED:")[0]
            .trim();
          return new Response(
            JSON.stringify({
              message: assistantMessage || "An error occurred while processing your reservation. Please try again.",
            }),
            { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 500 }
    );
  }
});
