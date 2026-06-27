import type { DayHours } from "@/lib/content";

/**
 * Opening-hours formatting (8.6 footer ↔ 8.10 contact page reuse it). Groups
 * consecutive days with identical hours into ranges ("Mon – Fri · 8am – 6pm") and
 * renders "Closed" for days with no open/close.
 */
const SHORT: Record<DayHours["day"], string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

/** "08:00" → "8am", "13:30" → "1:30pm", "00:00" → "12am". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

function dayValue(d: DayHours): string {
  return d.open && d.close
    ? `${formatTime(d.open)} – ${formatTime(d.close)}`
    : "Closed";
}

export type HoursRow = { label: string; value: string; closed: boolean };

/** Collapse 7 per-day entries into display rows, merging consecutive equal days. */
export function groupHours(hours: DayHours[]): HoursRow[] {
  const rows: HoursRow[] = [];
  for (let i = 0; i < hours.length; ) {
    const value = dayValue(hours[i]);
    let j = i;
    while (j + 1 < hours.length && dayValue(hours[j + 1]) === value) j++;
    rows.push({
      label:
        i === j
          ? SHORT[hours[i].day]
          : `${SHORT[hours[i].day]} – ${SHORT[hours[j].day]}`,
      value,
      closed: !hours[i].open || !hours[i].close,
    });
    i = j + 1;
  }
  return rows;
}
