import { useState, useEffect } from "react";
import { Plus, Trash2, CalendarOff, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface WeeklySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface DateOverride {
  id: string;
  override_date: string;
  is_available: boolean;
  time_slots: { start_time: string; end_time: string }[] | null;
}

const AvailabilityManager = () => {
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [newOverrideDate, setNewOverrideDate] = useState("");
  const [newOverrideAvailable, setNewOverrideAvailable] = useState(false);
  const [newOverrideStart, setNewOverrideStart] = useState("09:00");
  const [newOverrideEnd, setNewOverrideEnd] = useState("10:00");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [weeklyRes, overridesRes] = await Promise.all([
      supabase.from("weekly_availability").select("*").order("day_of_week").order("start_time"),
      supabase.from("date_overrides").select("*").order("override_date"),
    ]);
    if (weeklyRes.data) setWeeklySlots(weeklyRes.data);
    if (overridesRes.data) {
      setOverrides(
        overridesRes.data.map((o) => ({
          ...o,
          time_slots: o.time_slots as DateOverride["time_slots"],
        }))
      );
    }
  };

  const addWeeklySlot = async () => {
    const { error } = await supabase.from("weekly_availability").insert({
      day_of_week: newDay,
      start_time: newStart,
      end_time: newEnd,
    });
    if (error) toast.error(error.message);
    else { toast.success("Slot added"); fetchData(); }
  };

  const toggleSlot = async (id: string, is_active: boolean) => {
    await supabase.from("weekly_availability").update({ is_active }).eq("id", id);
    fetchData();
  };

  const deleteSlot = async (id: string) => {
    await supabase.from("weekly_availability").delete().eq("id", id);
    fetchData();
  };

  const addOverride = async () => {
    if (!newOverrideDate) { toast.error("Please select a date"); return; }
    const timeSlots = newOverrideAvailable
      ? [{ start_time: newOverrideStart, end_time: newOverrideEnd }]
      : null;
    const { error } = await supabase.from("date_overrides").insert({
      override_date: newOverrideDate,
      is_available: newOverrideAvailable,
      time_slots: timeSlots,
    });
    if (error) toast.error(error.message);
    else { toast.success("Override added"); fetchData(); }
  };

  const deleteOverride = async (id: string) => {
    await supabase.from("date_overrides").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-8">
      {/* Weekly Schedule */}
      <div>
        <h3 className="text-lg font-display font-semibold mb-2">Weekly Schedule</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set your recurring weekly availability. These slots repeat every week.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 p-3 sm:p-4 rounded-lg bg-background border">
          <select
            value={newDay}
            onChange={(e) => setNewDay(Number(e.target.value))}
            className="rounded-md border bg-background text-foreground px-3 py-2 text-sm w-full sm:w-auto"
          >
            {DAYS.map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            <select
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {Array.from({ length: 24 }, (_, h) => {
                const val = `${String(h).padStart(2, "0")}:00`;
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <select
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {Array.from({ length: 24 }, (_, h) => {
                const val = `${String(h).padStart(2, "0")}:00`;
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>
          <Button onClick={addWeeklySlot} size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {weeklySlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No weekly slots configured yet.</p>
        ) : (
          <div className="space-y-2">
            {weeklySlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <Switch checked={slot.is_active} onCheckedChange={(checked) => toggleSlot(slot.id, checked)} />
                  <span className={`text-sm font-medium ${!slot.is_active ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {DAYS[slot.day_of_week]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </span>
                </div>
                <button onClick={() => deleteSlot(slot.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Overrides */}
      <div>
        <h3 className="text-lg font-display font-semibold mb-2">Date Overrides</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Block specific dates or add extra availability outside your regular schedule.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 p-3 sm:p-4 rounded-lg bg-background border">
          <Input type="date" value={newOverrideDate} onChange={(e) => setNewOverrideDate(e.target.value)} className="w-full sm:w-44" />
          <div className="flex items-center gap-2">
            <Switch checked={newOverrideAvailable} onCheckedChange={setNewOverrideAvailable} />
            <span className="text-sm text-foreground">
              {newOverrideAvailable ? "Add extra slots" : "Block this date"}
            </span>
          </div>
          {newOverrideAvailable && (
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
              <select
                value={newOverrideStart}
                onChange={(e) => setNewOverrideStart(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {Array.from({ length: 24 }, (_, h) => {
                  const val = `${String(h).padStart(2, "0")}:00`;
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <select
                value={newOverrideEnd}
                onChange={(e) => setNewOverrideEnd(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {Array.from({ length: 24 }, (_, h) => {
                  const val = `${String(h).padStart(2, "0")}:00`;
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>
          )}
          <Button onClick={addOverride} size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {overrides.length === 0 ? (
          <p className="text-sm text-muted-foreground">No date overrides set.</p>
        ) : (
          <div className="space-y-2">
            {overrides.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  {o.is_available ? (
                    <CalendarPlus className="w-4 h-4 text-accent" />
                  ) : (
                    <CalendarOff className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium text-foreground">{o.override_date}</span>
                  <span className="text-sm text-muted-foreground">
                    {o.is_available && o.time_slots
                      ? o.time_slots.map((t) => `${t.start_time} – ${t.end_time}`).join(", ")
                      : "Blocked"}
                  </span>
                </div>
                <button onClick={() => deleteOverride(o.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;
