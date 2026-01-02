import Dexie, { Table } from "dexie";
import { DailyEntry } from "../types";

export class FoodMoodDatabase extends Dexie {
  entries!: Table<DailyEntry, number>;

  constructor() {
    super("FoodMoodDB");
    this.version(1).stores({
      entries: "++id, date, timestamp",
    });
  }
}

export const db = new FoodMoodDatabase();

