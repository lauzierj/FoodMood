import React, { useState } from "react";
import { Container, VStack, Text, Box, HStack, Button } from "@chakra-ui/react";
import ExportImport from "../components/ExportImport";
import CalendarView from "../components/CalendarView";
import Footer from "../components/Footer";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<"calendar" | "import">("calendar");

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" gap={6}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.100">
          Settings
        </Text>

        <HStack gap={2} mb={4}>
          <Button
            onClick={() => setActiveSection("calendar")}
            variant={activeSection === "calendar" ? "solid" : "ghost"}
            colorScheme={activeSection === "calendar" ? "blue" : undefined}
            color={activeSection === "calendar" ? "white" : "gray.300"}
            bg={activeSection === "calendar" ? "blue.600" : "transparent"}
            _hover={{
              bg: activeSection === "calendar" ? "blue.700" : "gray.700",
            }}
          >
            Calendar
          </Button>
          <Button
            onClick={() => setActiveSection("import")}
            variant={activeSection === "import" ? "solid" : "ghost"}
            colorScheme={activeSection === "import" ? "blue" : undefined}
            color={activeSection === "import" ? "white" : "gray.300"}
            bg={activeSection === "import" ? "blue.600" : "transparent"}
            _hover={{
              bg: activeSection === "import" ? "blue.700" : "gray.700",
            }}
          >
            Import/Export
          </Button>
        </HStack>

        {activeSection === "calendar" && <CalendarView />}
        {activeSection === "import" && (
          <VStack align="stretch" gap={4}>
            <Text fontSize="lg" color="gray.300">
              Export your data to back it up, or import data from another device.
            </Text>
            <ExportImport />
          </VStack>
        )}
      </VStack>
      <Footer />
    </Container>
  );
}

