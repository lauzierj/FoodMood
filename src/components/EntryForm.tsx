import React, { useEffect, useState, useCallback } from "react";
import {
  VStack,
  Text,
  Box,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { format, isAfter, startOfDay } from "date-fns";
import {
  saveEntry,
  deleteEntry,
} from "../db/entries";
import { db } from "../db/database";
import { DailyEntry } from "../types";
import {
  FOOD_EMOJIS,
  FOOD_LABELS,
  ACTIVITY_EMOJIS,
  ACTIVITY_LABELS,
  MOOD_EMOJIS,
  MOOD_LABELS,
  FoodCategory,
  ActivityType,
  Emotion,
} from "../types";
import EmojiSelector from "./EmojiSelector";
import Toast from "./Toast";

interface EntryFormProps {
  date: Date;
  onEntryUpdated?: () => void;
}

export default function EntryForm({ date, onEntryUpdated }: EntryFormProps) {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null);

  const dateString = format(date, "yyyy-MM-dd");
  const isFutureDate = isAfter(startOfDay(date), startOfDay(new Date()));

  const loadEntry = useCallback(async () => {
    try {
      // Only load existing entries, never create empty ones
      const existing = await db.entries.where("date").equals(dateString).first();
      if (existing) {
        setEntry(existing);
      } else {
        // No entry exists, show empty state (but don't create a record)
        setEntry({
          date: dateString,
          timestamp: Date.now(),
          foods: [],
          activities: [],
          moods: [],
        });
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      setToast({ message: "Error loading entry", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const saveEntryToDb = useCallback(
    async (updatedEntry: DailyEntry) => {
      if (isFutureDate) {
        setToast({ message: "Cannot edit future dates", type: "error" });
        return;
      }
      
      // Check if all arrays are empty
      const isEmpty = 
        updatedEntry.foods.length === 0 &&
        updatedEntry.activities.length === 0 &&
        updatedEntry.moods.length === 0;

      try {
        if (isEmpty) {
          // If entry exists and is now empty, delete it
          if (updatedEntry.id) {
            await deleteEntry(updatedEntry.id);
            // Reset to empty state without ID
            setEntry({
              date: dateString,
              timestamp: Date.now(),
              foods: [],
              activities: [],
              moods: [],
            });
          }
          // If no entry exists and it's empty, do nothing (don't create)
        } else {
          // Entry has data, save or create it
          await saveEntry(updatedEntry);
          setEntry(updatedEntry);
        }
        
        if (onEntryUpdated) {
          onEntryUpdated();
        }
      } catch (error) {
        console.error("Error saving entry:", error);
        setToast({ message: "Error saving entry", type: "error" });
      }
    },
    [onEntryUpdated, isFutureDate, dateString]
  );

  const handleAddFood = (category: FoodCategory) => {
    if (!entry) return;

    const updatedEntry = { ...entry };
    const existing = updatedEntry.foods.find((f) => f.category === category);

    if (existing) {
      existing.count += 1;
    } else {
      updatedEntry.foods.push({
        category,
        count: 1,
        emoji: FOOD_EMOJIS[category],
      });
    }

    saveEntryToDb(updatedEntry);
  };

  const handleRemoveFood = (category: FoodCategory) => {
    if (!entry) return;

    const updatedEntry = { ...entry };
    const existing = updatedEntry.foods.find((f) => f.category === category);

    if (existing) {
      if (existing.count > 1) {
        existing.count -= 1;
      } else {
        updatedEntry.foods = updatedEntry.foods.filter(
          (f) => f.category !== category
        );
      }
    }

    saveEntryToDb(updatedEntry);
  };

  const handleAddActivity = (type: ActivityType) => {
    if (!entry) return;

    const updatedEntry = { ...entry };
    const existing = updatedEntry.activities.find((a) => a.type === type);

    if (existing) {
      existing.count += 1;
    } else {
      updatedEntry.activities.push({
        type,
        count: 1,
        emoji: ACTIVITY_EMOJIS[type],
      });
    }

    saveEntryToDb(updatedEntry);
  };

  const handleRemoveActivity = (type: ActivityType) => {
    if (!entry) return;

    const updatedEntry = { ...entry };
    const existing = updatedEntry.activities.find((a) => a.type === type);

    if (existing) {
      if (existing.count > 1) {
        existing.count -= 1;
      } else {
        updatedEntry.activities = updatedEntry.activities.filter(
          (a) => a.type !== type
        );
      }
    }

    saveEntryToDb(updatedEntry);
  };

  const handleAddMood = (emotion: Emotion) => {
    if (!entry) return;

    const updatedEntry = { ...entry };
    const existing = updatedEntry.moods.find((m) => m.emotion === emotion);

    if (existing) {
      existing.count += 1;
    } else {
      updatedEntry.moods.push({
        emotion,
        count: 1,
        emoji: MOOD_EMOJIS[emotion],
      });
    }

    saveEntryToDb(updatedEntry);
  };

  const handleRemoveMood = (emotion: Emotion) => {
    if (!entry) return;

    const updatedEntry = { ...entry };
    const existing = updatedEntry.moods.find((m) => m.emotion === emotion);

    if (existing) {
      if (existing.count > 1) {
        existing.count -= 1;
      } else {
        updatedEntry.moods = updatedEntry.moods.filter(
          (m) => m.emotion !== emotion
        );
      }
    }

    saveEntryToDb(updatedEntry);
  };

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" color="blue.400" />
      </Center>
    );
  }

  if (!entry) {
    return (
      <Box>
        <Text color="gray.400">Error loading entry</Text>
      </Box>
    );
  }

  const foodOptions = Object.keys(FOOD_EMOJIS).map((key) => ({
    value: key,
    emoji: FOOD_EMOJIS[key as FoodCategory],
    label: FOOD_LABELS[key as FoodCategory],
  }));

  const activityOptions = Object.keys(ACTIVITY_EMOJIS).map((key) => ({
    value: key,
    emoji: ACTIVITY_EMOJIS[key as ActivityType],
    label: ACTIVITY_LABELS[key as ActivityType],
  }));

  const moodOptions = Object.keys(MOOD_EMOJIS).map((key) => ({
    value: key,
    emoji: MOOD_EMOJIS[key as Emotion],
    label: MOOD_LABELS[key as Emotion],
  }));

  return (
    <VStack align="stretch" gap={6}>
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {isFutureDate && (
        <Box bg="yellow.900" color="yellow.100" p={3} borderRadius="md" textAlign="center">
          <Text fontWeight="bold">Future dates cannot be edited</Text>
        </Box>
      )}

      {/* What You Ate */}
      <EmojiSelector
        title="What You Ate"
        options={foodOptions}
        selected={entry.foods.map((f) => ({
          value: f.category,
          count: f.count,
          emoji: f.emoji,
        }))}
        onAdd={(value) => !isFutureDate && handleAddFood(value as FoodCategory)}
        onRemove={(value) => !isFutureDate && handleRemoveFood(value as FoodCategory)}
        isDisabled={isFutureDate}
      />

      {/* What You Did */}
      <EmojiSelector
        title="What You Did"
        options={activityOptions}
        selected={entry.activities.map((a) => ({
          value: a.type,
          count: a.count,
          emoji: a.emoji,
        }))}
        onAdd={(value) => !isFutureDate && handleAddActivity(value as ActivityType)}
        onRemove={(value) => !isFutureDate && handleRemoveActivity(value as ActivityType)}
        isDisabled={isFutureDate}
      />

      {/* How You Felt */}
      <EmojiSelector
        title="How You Felt"
        options={moodOptions}
        selected={entry.moods.map((m) => ({
          value: m.emotion,
          count: m.count,
          emoji: m.emoji,
        }))}
        onAdd={(value) => !isFutureDate && handleAddMood(value as Emotion)}
        onRemove={(value) => !isFutureDate && handleRemoveMood(value as Emotion)}
        isDisabled={isFutureDate}
      />
    </VStack>
  );
}

