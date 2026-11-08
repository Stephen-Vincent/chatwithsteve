import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

// Get the user's timezone offset label e.g. "GMT-4", "GMT+1"
export function getUserTimezoneLabel(): string {
  const offsetMin = new Date().getTimezoneOffset();
  if (offsetMin === 0) return "GMT";
  const sign = offsetMin > 0 ? "-" : "+";
  const absHours = Math.floor(Math.abs(offsetMin) / 60);
  const absMins = Math.abs(offsetMin) % 60;
  return absMins === 0 ? `GMT${sign}${absHours}` : `GMT${sign}${absHours}:${String(absMins).padStart(2, "0")}`;
}

/**
 * Convert a GMT time slot (HH:mm) on a given date to the user's local time.
 * Returns { localTime: "HH:mm", localDate: Date } since the day might shift.
 */
function gmtSlotToLocal(dateStr: string, gmtTime: string): { localTime: string; localDate: Date } {
  const [h, m] = gmtTime.split(":").map(Number);
  // Build a UTC date
  const utc = new Date(Date.UTC(
    parseInt(dateStr.slice(0, 4)),
    parseInt(dateStr.slice(5, 7)) - 1,
    parseInt(dateStr.slice(8, 10)),
    h, m || 0
  ));
  const localH = utc.getHours();
  const localM = utc.getMinutes();
  return {
    localTime: `${String(localH).padStart(2, "0")}:${String(localM).padStart(2, "0")}`,
    localDate: utc,
  };
}

/**
 * Convert a user's local time selection back to GMT for storage/sending.
 */
export function localSlotToGmt(date: Date, localTime: string): { gmtTime: string; gmtDate: string } {
  const [h, m] = localTime.split(":").map(Number);
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m || 0);
  const gmtH = local.getUTCHours();
  const gmtM = local.getUTCMinutes();
  const gmtDate = `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, "0")}-${String(local.getUTCDate()).padStart(2, "0")}`;
  return {
    gmtTime: `${String(gmtH).padStart(2, "0")}:${String(gmtM).padStart(2, "0")}`,
    gmtDate,
  };
}

export const useAvailability = () => {
  const weeklyQuery = useQuery({
    queryKey: ["weekly_availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_availability")
        .select("*")
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const overridesQuery = useQuery({
    queryKey: ["date_overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("date_overrides")
        .select("*")
        .order("override_date");
      if (error) throw error;
      return data;
    },
  });

  const bookingsQuery = useQuery({
    queryKey: ["confirmed_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_booked_slots");
      if (error) throw error;
      return data;
    },
  });

  /**
   * Get available time slots for a given local date, returned as local times.
   * Internally: compute GMT date, get GMT slots, remove booked ones, convert to local.
   */
  const getTimeSlotsForDate = (date: Date): string[] => {
    const weekly = weeklyQuery.data ?? [];
    const overrides = overridesQuery.data ?? [];
    const bookings = bookingsQuery.data ?? [];

    // We need to check GMT availability for potentially two GMT dates
    // (the local date could map to two GMT dates at timezone boundaries)
    // For simplicity, we check the GMT slots that correspond to this local date.

    // Build the local date string
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const localDateStr = `${year}-${month}-${day}`;

    // Get the set of booked slots (as "date|time" keys)
    const bookedSet = new Set(
      bookings.map((b) => {
        // session_time may be "7:00 PM" or "19:00:00" format — normalize to "HH:00"
        const raw = b.session_time.trim();
        let h: number;
        const pmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (pmMatch) {
          h = parseInt(pmMatch[1]);
          const ampm = pmMatch[3].toUpperCase();
          if (ampm === "PM" && h !== 12) h += 12;
          if (ampm === "AM" && h === 12) h = 0;
        } else {
          h = parseInt(raw.split(":")[0]);
        }
        return `${b.session_date}|${String(h).padStart(2, "0")}:00`;
      })
    );

    // Strategy: iterate through all 24 hours of the local date,
    // check if the corresponding GMT date+time has an available slot,
    // and it's not booked.
    const results: string[] = [];

    for (let h = 0; h < 24; h++) {
      const localTime = `${String(h).padStart(2, "0")}:00`;
      const { gmtTime, gmtDate } = localSlotToGmt(date, localTime);

      // Check if this GMT date+time is available
      const gmtDayOfWeek = new Date(
        parseInt(gmtDate.slice(0, 4)),
        parseInt(gmtDate.slice(5, 7)) - 1,
        parseInt(gmtDate.slice(8, 10))
      ).getDay();

      let isAvailable = false;

      // Check overrides first
      const override = overrides.find((o) => o.override_date === gmtDate);
      if (override) {
        if (override.is_available && override.time_slots) {
          const slots = override.time_slots as unknown as TimeSlot[];
          const gmtSlots = slots.flatMap((s) => generateHourSlots(s.start_time, s.end_time));
          isAvailable = gmtSlots.includes(gmtTime);
        }
        // If override exists but not available, isAvailable stays false
      } else {
        // Weekly schedule
        const daySlots = weekly.filter((s) => s.day_of_week === gmtDayOfWeek);
        const gmtSlots = daySlots.flatMap((s) => generateHourSlots(s.start_time, s.end_time));
        isAvailable = gmtSlots.includes(gmtTime);
      }

      // Check not booked
      if (isAvailable && !bookedSet.has(`${gmtDate}|${gmtTime}`)) {
        results.push(localTime);
      }
    }

    return results;
  };

  const isDateAvailable = (date: Date): boolean => {
    return getTimeSlotsForDate(date).length > 0;
  };

  return {
    getTimeSlotsForDate,
    isDateAvailable,
    isLoading: weeklyQuery.isLoading || overridesQuery.isLoading || bookingsQuery.isLoading,
  };
};

function generateHourSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startH] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);

  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

export function formatSlotDisplay(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
