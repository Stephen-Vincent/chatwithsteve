import { motion } from "framer-motion";
import { CheckCircle, Calendar } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import GoogleIcon from "@/components/icons/GoogleIcon";
import OutlookIcon from "@/components/icons/OutlookIcon";
import { useEffect, useRef, useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SessionInfo {
  date: string;
  time: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string): string {
  // Handle both "19:00" (24h) and already-formatted times
  const clean = time.replace(/\s*(am|pm|AM|PM)\s*$/i, "");
  const [h, m] = clean.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m || "00"} ${ampm}`;
}

function buildGoogleCalendarUrl(
  date: string,
  time: string,
  customerName: string
): string {
  const clean = time.replace(/\s*(am|pm|AM|PM)\s*$/i, "");
  const [h, m] = clean.split(":").map(Number);
  const startDT = `${date}T${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}:00`;
  const endDT = `${date}T${String(h + 1).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}:00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Chat with Steve`,
    dates: `${startDT.replace(/[-:]/g, "")}/${endDT.replace(/[-:]/g, "")}`,
    details: `Video call booking`,
    location: "Video Call",
    ctz: "Europe/London",
  });
  return `https://calendar.google.com/calendar/event?${params.toString()}`;
}

function buildOutlookCalendarUrl(
  date: string,
  time: string
): string {
  const clean = time.replace(/\s*(am|pm|AM|PM)\s*$/i, "");
  const [h, m] = clean.split(":").map(Number);
  const startdt = `${date}T${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}:00`;
  const enddt = `${date}T${String(h + 1).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}:00`;
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `Chat with Steve`,
    startdt,
    enddt,
    body: `Video call booking`,
    location: "Video Call",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

function downloadIcs(date: string, time: string) {
  const clean = time.replace(/\s*(am|pm|AM|PM)\s*$/i, "");
  const [h, m] = clean.split(":").map(Number);
  const start = date.replace(/-/g, "") + "T" + String(h).padStart(2, "0") + String(m || 0).padStart(2, "0") + "00";
  const end = date.replace(/-/g, "") + "T" + String(h + 1).padStart(2, "0") + String(m || 0).padStart(2, "0") + "00";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chat with Steve//Booking//EN",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/London",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `DTSTART;TZID=Europe/London:${start}`,
    `DTEND;TZID=Europe/London:${end}`,
    `SUMMARY:Chat with Steve`,
    `DESCRIPTION:Video call booking`,
    "LOCATION:Video Call",
    `UID:${crypto.randomUUID()}@chatwithsteve.co.uk`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-with-steve-${date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const confirmedRef = useRef(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  // Extract sessions from URL params (passed from Book page)
  const sessionsParam = searchParams.get("sessions");
  
  useEffect(() => {
    if (sessionsParam) {
      try {
        setSessions(JSON.parse(decodeURIComponent(sessionsParam)));
      } catch {
        // fallback
      }
    }
  }, [sessionsParam]);

  useEffect(() => {
    if (sessionId && !confirmedRef.current) {
      confirmedRef.current = true;
      supabase.functions
        .invoke("confirm-booking", {
          body: { session_id: sessionId },
        })
        .catch(console.error);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <section className="py-20">
          <div className="container max-w-lg text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-accent" />
              </div>
              <h1 className="text-3xl font-display font-bold">
                Booking Confirmed!
              </h1>
              <p className="text-muted-foreground">
                Thanks for booking a chat! You'll receive a confirmation email
                shortly with all the details.
              </p>

              {sessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4 text-left"
                >
                  <h2 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Add to Calendar
                  </h2>
                  {sessions.map((s, i) => (
                    <div
                      key={i}
                      className="bg-card rounded-xl p-4 space-y-3"
                    >
                      <p className="font-medium text-foreground">
                        {formatDate(s.date)} at {formatTime(s.time)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={buildGoogleCalendarUrl(s.date, s.time, "")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-1.5"
                          >
                            <GoogleIcon className="w-4 h-4" />
                            Google Calendar
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={buildOutlookCalendarUrl(s.date, s.time)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-1.5"
                          >
                            <OutlookIcon className="w-4 h-4" />
                            Outlook
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadIcs(s.date, s.time)}
                          className="gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Download .ics
                        </Button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
