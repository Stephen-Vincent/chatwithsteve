import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAvailability, formatSlotDisplay, localSlotToGmt, getUserTimezoneLabel } from "@/hooks/useAvailability";

const PRICE_PER_HOUR = 50;

interface ChatSession {
  id: number;
  date?: Date;
  time?: string;
}

let nextId = 1;

const Book = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([{ id: nextId++, date: undefined, time: undefined }]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { getTimeSlotsForDate, isDateAvailable, isLoading } = useAvailability();

  const total = sessions.length * PRICE_PER_HOUR;

  const addSession = () => {
    setSessions((prev) => [...prev, { id: nextId++, date: undefined, time: undefined }]);
  };

  const removeSession = (id: number) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSession = (id: number, field: "date" | "time", value: Date | string) => {
    setSessions((prev) =>
      prev.map((s): ChatSession => {
        if (s.id !== id) return s;
        if (field === "date") return { ...s, date: value as Date, time: undefined };
        return { ...s, time: value as string };
      })
    );
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const incomplete = sessions.some((s) => !s.date || !s.time);
    if (incomplete) {
      toast.error("Please select a date and time for each session.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }

    setSubmitting(true);
    try {
      // Convert local times to GMT for storage
      const sessionDetails = sessions.map((s) => {
        if (s.date && s.time) {
          const { gmtTime, gmtDate } = localSlotToGmt(s.date, s.time);
          return { date: gmtDate, time: gmtTime };
        }
        return { date: s.date ? format(s.date, "yyyy-MM-dd") : "", time: s.time };
      });

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          quantity: sessions.length,
          name: name.trim(),
          email: email.trim(),
          sessions: sessionDetails,
          message: message.trim(),
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <section className="py-20">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">1-on-1 Video Call</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Have a Chat with Steve</h1>
              <p className="text-muted-foreground">
                Book a private 1-hour video call. We can talk business, strategy, or whatever's on your mind.{" "}
                <span className="font-semibold text-foreground">£{PRICE_PER_HOUR}/hour.</span>{" "}
                Book multiple sessions at once if you'd like.
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-xl border p-6 md:p-8 space-y-6"
            >
              {/* Sessions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground">Sessions</label>
                    <span className="text-xs text-muted-foreground">({getUserTimezoneLabel()})</span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={addSession} className="text-accent hover:bg-accent hover:text-white">
                    <Plus className="w-4 h-4 mr-1" /> Add another session
                  </Button>
                </div>

                {sessions.map((session, idx) => {
                  const availableSlots = session.date ? getTimeSlotsForDate(session.date) : [];

                  return (
                    <div key={session.id} className="rounded-lg border bg-background p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Session {idx + 1}</span>
                        {sessions.length > 1 && (
                          <button type="button" onClick={() => removeSession(session.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !session.date && "text-muted-foreground")}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {session.date ? format(session.date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={session.date}
                                onSelect={(d) => d && updateSession(session.id, "date", d)}
                                disabled={(d) => d < new Date() || (!isLoading && !isDateAvailable(d))}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {isLoading ? (
                            <span className="text-xs text-muted-foreground">Loading slots...</span>
                          ) : !session.date ? (
                            <span className="text-xs text-muted-foreground">Select a date first</span>
                          ) : availableSlots.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No slots available</span>
                          ) : (
                            availableSlots.map((slot) => (
                              <button
                                type="button"
                                key={slot}
                                onClick={() => updateSession(session.id, "time", slot)}
                                className={cn(
                                  "px-2.5 py-1 rounded-md text-xs border transition-colors",
                                  session.time === slot
                                    ? "bg-accent text-white border-accent"
                                    : "bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent"
                                )}
                              >
                                {formatSlotDisplay(slot)}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" maxLength={255} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  What would you like to chat about? (optional)
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Give me a heads up so I can prepare..."
                  maxLength={1000}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  {sessions.length} session{sessions.length > 1 ? "s" : ""} × £{PRICE_PER_HOUR}
                </div>
                <div className="text-xl font-display font-bold text-foreground">£{total}</div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                ) : (
                  <>Book {sessions.length > 1 ? `${sessions.length} Chats` : "Chat"} — £{total}</>
                )}
              </Button>
            </motion.form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Book;
