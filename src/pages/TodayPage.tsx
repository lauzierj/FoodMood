import React, { useEffect, useState } from "react";
import { Container, Box, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { getTodayDateString } from "../db/entries";
import EntryForm from "../components/EntryForm";

export default function TodayPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Check for date change (midnight reset)
  useEffect(() => {
    const checkDateChange = () => {
      const today = getTodayDateString();
      const currentDateString = format(currentDate, "yyyy-MM-dd");
      if (currentDateString !== today) {
        setCurrentDate(new Date());
      }
    };

    const interval = setInterval(checkDateChange, 60000); // Check every minute
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkDateChange();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentDate]);

  return (
    <Container maxW="container.md" py={8}>
      <Box textAlign="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.100">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </Text>
      </Box>
      <EntryForm date={currentDate} />
    </Container>
  );
}
