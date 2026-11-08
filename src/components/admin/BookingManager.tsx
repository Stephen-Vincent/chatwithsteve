import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isPast, isToday, isFuture, startOfWeek, endOfWeek, addWeeks, isWithinInterval } from "date-fns";
import { Calendar, Clock, PoundSterling, Users, Pencil, ExternalLink, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  session_date: string;
  session_time: string;
  status: string;
  amount_paid: number;
  message: string;
  created_at: string;
}

const BookingManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("session_date", { ascending: true });
    if (error) {
      toast.error("Failed to load bookings");
    } else {
      setBookings((data as Booking[]) || []);
    }
    setLoading(false);
  };

  const currentWeekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
  const currentWeekEnd = useMemo(() => endOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);

  const weekLabel = useMemo(() => {
    const start = format(currentWeekStart, "MMM d");
    const end = format(currentWeekEnd, "MMM d, yyyy");
    return `${start} – ${end}`;
  }, [currentWeekStart, currentWeekEnd]);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const weekSessions = useMemo(() => {
    return confirmedBookings.filter((b) => {
      const date = parseISO(b.session_date);
      return isWithinInterval(date, { start: currentWeekStart, end: currentWeekEnd }) &&
        (isFuture(date) || isToday(date));
    });
  }, [confirmedBookings, currentWeekStart, currentWeekEnd]);

  const upcoming = confirmedBookings.filter(
    (b) => isFuture(parseISO(b.session_date)) || isToday(parseISO(b.session_date))
  );
  const past = confirmedBookings.filter(
    (b) => isPast(parseISO(b.session_date)) && !isToday(parseISO(b.session_date))
  );
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.amount_paid, 0);

  const reschedule = async (id: string) => {
    if (!newDate || !newTime) {
      toast.error("Please enter new date and time");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("reschedule-booking", {
        body: { booking_id: id, new_date: newDate, new_time: newTime },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Booking rescheduled — notifications sent");
      setRescheduling(null);
      setNewDate("");
      setNewTime("");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "Failed to reschedule");
    }
  };

  const cancelBooking = async (id: string, customerName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("cancel-booking", {
        body: { booking_id: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Booking for ${customerName} cancelled and refunded`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const generateCalendarLink = (b: Booking) => {
    const dateStr = b.session_date.replace(/-/g, "");
    const [hours, minutes] = b.session_time.split(":");
    const startTime = `${dateStr}T${hours}${minutes}00`;
    const endHour = String(Number(hours) + 1).padStart(2, "0");
    const endTime = `${dateStr}T${endHour}${minutes}00`;
    const title = encodeURIComponent(`Chat with ${b.customer_name}`);
    const details = encodeURIComponent(b.message || "1-on-1 video call");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
  };

  const renderBookingCard = (b: Booking) => (
    <div key={b.id} className="rounded-lg border bg-background p-3 sm:p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{b.customer_name}</p>
          <p className="text-xs text-muted-foreground truncate">{b.customer_email}</p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <a
            href={generateCalendarLink(b)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors p-1.5"
            title="Add to Google Calendar"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => {
              setRescheduling(rescheduling === b.id ? null : b.id);
              setNewDate(b.session_date);
              setNewTime(b.session_time);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
            title="Reschedule"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="text-muted-foreground hover:text-destructive transition-colors p-1.5"
                title="Cancel & Refund"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Booking & Issue Refund?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will refund £{(b.amount_paid / 100).toFixed(0)} to {b.customer_name} and free the {format(parseISO(b.session_date), "MMM d")} at {b.session_time} slot. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => cancelBooking(b.id, b.customer_name)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Cancel & Refund
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {format(parseISO(b.session_date), "EEE, MMM d yyyy")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {b.session_time}
        </span>
        <span className="text-accent font-medium">£{(b.amount_paid / 100).toFixed(0)}</span>
      </div>
      {b.message && (
        <p className="text-xs text-muted-foreground italic">"{b.message}"</p>
      )}
      {rescheduling === b.id && (
        <div className="space-y-2 pt-2 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-sm h-10"
            />
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {Array.from({ length: 24 }, (_, h) => {
                const val = `${String(h).padStart(2, "0")}:00`;
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => reschedule(b.id)} className="h-10">Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setRescheduling(null)} className="h-10">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) return <p className="text-sm text-muted-foreground">Loading bookings...</p>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg border bg-background p-3 sm:p-4 text-center">
          <Users className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="text-xl sm:text-2xl font-display font-bold">{bookings.length}</div>
          <div className="text-xs text-muted-foreground">Total Booked</div>
        </div>
        <div className="rounded-lg border bg-background p-3 sm:p-4 text-center">
          <Calendar className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="text-xl sm:text-2xl font-display font-bold">{upcoming.length}</div>
          <div className="text-xs text-muted-foreground">Upcoming</div>
        </div>
        <div className="rounded-lg border bg-background p-3 sm:p-4 text-center">
          <PoundSterling className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="text-xl sm:text-2xl font-display font-bold">£{(totalRevenue / 100).toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Revenue</div>
        </div>
      </div>

      {/* Weekly Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Sessions</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                weekOffset === 0
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{weekLabel}</p>

        {weekSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions this week.</p>
        ) : (
          <div className="space-y-2">
            {weekSessions.map(renderBookingCard)}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Past Sessions</h3>
          <div className="space-y-2">
            {past.map((b) => (
              <div key={b.id} className="rounded-lg border bg-background p-3 flex items-center justify-between opacity-60">
                <div>
                  <span className="text-sm font-medium text-foreground">{b.customer_name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {format(parseISO(b.session_date), "MMM d yyyy")} · {b.session_time}
                  </span>
                </div>
                <span className="text-xs text-accent font-medium">£{(b.amount_paid / 100).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManager;
