import React, { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, startOfDay, isSameMonth } from "date-fns";
import { getAllEntries, deleteEntry } from "../db/entries";
import { DailyEntry } from "../types";
import EntryForm from "../components/EntryForm";

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const allEntries = await getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntryForDate = (date: Date): DailyEntry | undefined => {
    const dateString = format(date, "yyyy-MM-dd");
    return entries.find((e) => e.date === dateString);
  };

  const hasEntry = (date: Date): boolean => {
    return getEntryForDate(date) !== undefined;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteEntry = async (date: Date) => {
    const entry = getEntryForDate(date);
    if (entry && entry.id) {
      if (confirm(`Delete entry for ${format(date, "MMMM d, yyyy")}?`)) {
        try {
          await deleteEntry(entry.id);
          await loadEntries();
          if (isSameDay(date, selectedDate || new Date())) {
            setSelectedDate(null);
          }
        } catch (error) {
          console.error("Error deleting entry:", error);
          alert("Failed to delete entry");
        }
      }
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    const currentDate = new Date();
    // Only allow advancing if the next month is not in the future
    if (!isAfter(startOfMonth(nextMonth), startOfMonth(currentDate))) {
      setCurrentMonth(nextMonth);
    }
  };

  const isCurrentOrFutureMonth = isSameMonth(currentMonth, new Date()) || isAfter(startOfMonth(currentMonth), startOfMonth(new Date()));

  return (
    <VStack align="stretch" gap={6}>
      {/* Calendar Header */}
      <HStack justify="space-between" align="center">
        <Button 
          onClick={handlePreviousMonth} 
          size="sm" 
          bg="gray.700"
          color="white"
          border="1px solid"
          borderColor="gray.600"
          _hover={{ bg: "gray.600" }}
        >
          ←
        </Button>
        <Text fontSize="xl" fontWeight="bold" color="gray.100">
          {format(currentMonth, "MMMM yyyy")}
        </Text>
        <Button 
          onClick={handleNextMonth} 
          size="sm"
          bg="gray.700"
          color="white"
          border="1px solid"
          borderColor="gray.600"
          opacity={isCurrentOrFutureMonth ? 0.3 : 1}
          cursor={isCurrentOrFutureMonth ? "not-allowed" : "pointer"}
          disabled={isCurrentOrFutureMonth}
          _hover={isCurrentOrFutureMonth ? {} : { bg: "gray.600" }}
        >
          →
        </Button>
      </HStack>

      {/* Calendar Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gap={2}
        bg="gray.800"
        p={4}
        borderRadius="md"
      >
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Text key={day} textAlign="center" fontSize="sm" fontWeight="bold" color="gray.400" py={2}>
            {day}
          </Text>
        ))}

        {/* Calendar days */}
        {daysInMonth.map((day) => {
          const hasData = hasEntry(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isFuture = isAfter(startOfDay(day), startOfDay(new Date()));

          return (
            <Button
              key={day.toISOString()}
              onClick={() => !isFuture && handleDateClick(day)}
              h="60px"
              bg={isSelected ? "blue.600" : hasData ? "blue.800" : "gray.700"}
              color={isSelected ? "white" : "gray.200"}
              border={isToday ? "2px solid" : "1px solid"}
              borderColor={isToday ? "yellow.400" : "transparent"}
              opacity={isFuture ? 0.3 : 1}
              cursor={isFuture ? "not-allowed" : "pointer"}
              _hover={isFuture ? {} : { bg: isSelected ? "blue.700" : hasData ? "blue.700" : "gray.600" }}
              position="relative"
              disabled={isFuture}
            >
              <VStack gap={0}>
                <Text fontSize="sm">{format(day, "d")}</Text>
                {hasData && (
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={isSelected ? "white" : "blue.400"}
                  />
                )}
              </VStack>
            </Button>
          );
        })}
      </Box>

      {/* Selected Date Form */}
      {selectedDate && (
        <Box bg="gray.800" p={6} borderRadius="md">
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold" color="gray.100">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </Text>
            {hasEntry(selectedDate) && (
              <Button
                onClick={() => handleDeleteEntry(selectedDate)}
                size="sm"
                bg="red.600"
                color="white"
                border="1px solid"
                borderColor="red.500"
                _hover={{ bg: "red.700" }}
              >
                Delete Entry
              </Button>
            )}
          </HStack>
          <EntryForm date={selectedDate} onEntryUpdated={loadEntries} />
        </Box>
      )}
    </VStack>
  );
}

