export type FoodCategory = "fruits" | "vegetables" | "meat" | "carbs" | "sweet" | "salty";
export type ActivityType = "screens" | "dance" | "school" | "outside" | "toys" | "arts";
export type Emotion =
  | "sleepy"
  | "happy"
  | "sad"
  | "angry"
  | "anxious"
  | "calm"
  | "excited"
  | "bored";

export interface FoodEntry {
  category: FoodCategory;
  count: number;
  emoji: string;
}

export interface ActivityEntry {
  type: ActivityType;
  count: number;
  emoji: string;
}

export interface MoodEntry {
  emotion: Emotion;
  count: number;
  emoji: string;
}

export interface DailyEntry {
  id?: number;
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number; // Last modified timestamp
  foods: FoodEntry[];
  activities: ActivityEntry[];
  moods: MoodEntry[];
}

export interface ExportData {
  version: string;
  exportDate: string;
  entries: DailyEntry[];
}

// Emoji mappings
export const FOOD_EMOJIS: Record<FoodCategory, string> = {
  fruits: "🍎",
  vegetables: "🥦",
  meat: "🥩",
  carbs: "🍞",
  sweet: "🍪",
  salty: "🥨",
};

export const ACTIVITY_EMOJIS: Record<ActivityType, string> = {
  screens: "📺",
  dance: "💃",
  school: "🏫",
  outside: "🌳",
  toys: "🧸",
  arts: "🎨",
};

export const MOOD_EMOJIS: Record<Emotion, string> = {
  sleepy: "😴",
  happy: "😊",
  sad: "😢",
  angry: "😠",
  anxious: "😰",
  calm: "😌",
  excited: "🤩",
  bored: "😑",
};

export const FOOD_LABELS: Record<FoodCategory, string> = {
  fruits: "Fruits",
  vegetables: "Vegetables",
  meat: "Meat/Protein",
  carbs: "Carbs",
  sweet: "Sweet Snacks",
  salty: "Salty Snacks",
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  screens: "Screens/TV/iPad",
  dance: "Dance",
  school: "School",
  outside: "Play Outside",
  toys: "Play with Toys",
  arts: "Arts and Crafts",
};

export const MOOD_LABELS: Record<Emotion, string> = {
  sleepy: "Sleepy",
  happy: "Happy",
  sad: "Sad",
  angry: "Angry/Frustrated",
  anxious: "Anxious/Worried",
  calm: "Calm/Peaceful",
  excited: "Excited",
  bored: "Bored",
};

