import { db } from "./database";
import { DailyEntry } from "../types";
import { format } from "date-fns";

export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export async function getTodayEntry(): Promise<DailyEntry | undefined> {
  const today = getTodayDateString();
  return await db.entries.where("date").equals(today).first();
}

export async function getOrCreateTodayEntry(): Promise<DailyEntry> {
  const today = getTodayDateString();
  return await getOrCreateEntryForDate(today);
}

export async function getOrCreateEntryForDate(dateString: string): Promise<DailyEntry> {
  let entry = await db.entries.where("date").equals(dateString).first();

  if (!entry) {
    entry = {
      date: dateString,
      timestamp: Date.now(),
      foods: [],
      activities: [],
      moods: [],
    };
    await db.entries.add(entry);
    // Get the entry back with the ID
    entry = await db.entries.where("date").equals(dateString).first() as DailyEntry;
  }

  return entry;
}

export async function saveEntry(entry: DailyEntry): Promise<number> {
  entry.timestamp = Date.now();
  if (entry.id) {
    await db.entries.update(entry.id, entry);
    return entry.id;
  } else {
    return await db.entries.add(entry);
  }
}

export async function getAllEntries(): Promise<DailyEntry[]> {
  return await db.entries.orderBy("date").reverse().toArray();
}

export async function getEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  return await db.entries
    .where("date")
    .between(startDate, endDate, true, true)
    .sortBy("date");
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id);
}

export async function clearAllEntries(): Promise<void> {
  await db.entries.clear();
}

export async function importEntries(entries: DailyEntry[]): Promise<void> {
  await db.transaction("rw", db.entries, async () => {
    await db.entries.clear();
    await db.entries.bulkAdd(entries);
  });
}

