import React, { useEffect, useState } from "react";
import {
  Container,
  VStack,
  Text,
  Box,
  HStack,
  Button,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllEntries, getEntriesByDateRange } from "../db/entries";
import { DailyEntry } from "../types";
import { format, subDays, subWeeks, subMonths, parseISO } from "date-fns";
import {
  FOOD_LABELS,
  ACTIVITY_LABELS,
  MOOD_LABELS,
  FoodCategory,
  ActivityType,
  Emotion,
} from "../types";

type DateRange = "week" | "month" | "all";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
  "#ffb347",
  "#87ceeb",
];

export default function ChartsPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [dateRange]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      let data: DailyEntry[];
      const today = format(new Date(), "yyyy-MM-dd");

      if (dateRange === "week") {
        const startDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
        data = await getEntriesByDateRange(startDate, today);
      } else if (dateRange === "month") {
        const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
        data = await getEntriesByDateRange(startDate, today);
      } else {
        data = await getAllEntries();
      }

      setEntries(data);
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate data for charts
  const foodData = React.useMemo(() => {
    const totals: Record<FoodCategory, number> = {
      fruits: 0,
      vegetables: 0,
      meat: 0,
      carbs: 0,
      sweet: 0,
      salty: 0,
    };

    entries.forEach((entry) => {
      entry.foods.forEach((food) => {
        totals[food.category] += food.count;
      });
    });

    return Object.entries(totals).map(([category, count]) => ({
      name: FOOD_LABELS[category as FoodCategory],
      value: count,
      emoji: category,
    }));
  }, [entries]);

  const activityData = React.useMemo(() => {
    const totals: Record<ActivityType, number> = {
      screens: 0,
      dance: 0,
      school: 0,
      outside: 0,
      toys: 0,
      arts: 0,
    };

    entries.forEach((entry) => {
      entry.activities.forEach((activity) => {
        totals[activity.type] += activity.count;
      });
    });

    return Object.entries(totals).map(([type, count]) => ({
      name: ACTIVITY_LABELS[type as ActivityType],
      value: count,
    }));
  }, [entries]);

  const moodData = React.useMemo(() => {
    const totals: Record<Emotion, number> = {
      sleepy: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      calm: 0,
      excited: 0,
      bored: 0,
    };

    entries.forEach((entry) => {
      entry.moods.forEach((mood) => {
        totals[mood.emotion] += mood.count;
      });
    });

    return Object.entries(totals)
      .filter(([_, count]) => count > 0)
      .map(([emotion, count]) => ({
        name: MOOD_LABELS[emotion as Emotion],
        value: count,
      }));
  }, [entries]);

  // Time series data
  const moodTimeSeries = React.useMemo(() => {
    const dailyTotals: Record<string, Record<Emotion, number>> = {};

    entries.forEach((entry) => {
      if (!dailyTotals[entry.date]) {
        dailyTotals[entry.date] = {
          sleepy: 0,
          happy: 0,
          sad: 0,
          angry: 0,
          anxious: 0,
          calm: 0,
          excited: 0,
          bored: 0,
        };
      }

      entry.moods.forEach((mood) => {
        dailyTotals[entry.date][mood.emotion] += mood.count;
      });
    });

    return Object.entries(dailyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, moods]) => ({
        date: format(parseISO(date), "MMM d"),
        ...moods,
      }));
  }, [entries]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.400" />
      </Center>
    );
  }

  if (entries.length === 0) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack gap={4}>
          <Text fontSize="xl" color="gray.400">
            No data yet. Start tracking in the Today tab!
          </Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" gap={8}>
        {/* Date range selector */}
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.100">
            Charts & Insights
          </Text>
          <Box
            as="select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            maxW="200px"
            bg="gray.800"
            borderColor="gray.700"
            borderWidth="1px"
            borderRadius="md"
            color="gray.100"
            p={2}
            cursor="pointer"
            _hover={{ borderColor: "gray.600" }}
            _focus={{ borderColor: "blue.500", outline: "none" }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="all">All Time</option>
          </Box>
        </HStack>

        {/* Summary stats */}
        <HStack gap={4} flexWrap="wrap">
          <Box bg="gray.800" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontSize="sm" color="gray.400">
              Days Tracked
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.400">
              {entries.length}
            </Text>
          </Box>
          <Box bg="gray.800" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontSize="sm" color="gray.400">
              Total Food Items
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.400">
              {foodData.reduce((sum, item) => sum + item.value, 0)}
            </Text>
          </Box>
          <Box bg="gray.800" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontSize="sm" color="gray.400">
              Total Activities
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.400">
              {activityData.reduce((sum, item) => sum + item.value, 0)}
            </Text>
          </Box>
        </HStack>

        {/* Mood time series */}
        {moodTimeSeries.length > 0 && (
          <Box bg="gray.800" p={6} borderRadius="lg">
            <Text fontSize="xl" fontWeight="bold" color="gray.100" mb={4}>
              Mood Over Time
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="gray.700" />
                <XAxis dataKey="date" stroke="gray.400" />
                <YAxis stroke="gray.400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "gray.800",
                    border: "1px solid gray.700",
                    color: "gray.100",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="happy"
                  stroke="#82ca9d"
                  name="Happy"
                />
                <Line
                  type="monotone"
                  dataKey="excited"
                  stroke="#ffc658"
                  name="Excited"
                />
                <Line
                  type="monotone"
                  dataKey="calm"
                  stroke="#8884d8"
                  name="Calm"
                />
                <Line
                  type="monotone"
                  dataKey="sleepy"
                  stroke="#8dd1e1"
                  name="Sleepy"
                />
                <Line
                  type="monotone"
                  dataKey="sad"
                  stroke="#8884d8"
                  name="Sad"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Food distribution */}
        {foodData.some((item) => item.value > 0) && (
          <Box bg="gray.800" p={6} borderRadius="lg">
            <Text fontSize="xl" fontWeight="bold" color="gray.100" mb={4}>
              Food Distribution
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={foodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="gray.700" />
                <XAxis dataKey="name" stroke="gray.400" />
                <YAxis stroke="gray.400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "gray.800",
                    border: "1px solid gray.700",
                    color: "gray.100",
                  }}
                />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Activity distribution */}
        {activityData.some((item) => item.value > 0) && (
          <Box bg="gray.800" p={6} borderRadius="lg">
            <Text fontSize="xl" fontWeight="bold" color="gray.100" mb={4}>
              Activity Distribution
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="gray.700" />
                <XAxis dataKey="name" stroke="gray.400" />
                <YAxis stroke="gray.400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "gray.800",
                    border: "1px solid gray.700",
                    color: "gray.100",
                  }}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Mood pie chart */}
        {moodData.length > 0 && (
          <Box bg="gray.800" p={6} borderRadius="lg">
            <Text fontSize="xl" fontWeight="bold" color="gray.100" mb={4}>
              Mood Distribution
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "gray.800",
                    border: "1px solid gray.700",
                    color: "gray.100",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

