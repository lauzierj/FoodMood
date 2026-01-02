import React, { useState } from "react";
import { Box, HStack, Button, IconButton } from "@chakra-ui/react";
import { FaCog } from "react-icons/fa";
import { HiCalendar, HiChartBar } from "react-icons/hi";
import TodayPage from "./pages/TodayPage";
import ChartsPage from "./pages/ChartsPage";
import SettingsPage from "./pages/SettingsPage";
import { useBuildInfoPolling } from "./hooks/useBuildInfoPolling";

export default function App() {
  const [activeTab, setActiveTab] = useState<"today" | "charts" | "settings">("today");
  
  // Poll for build info updates every 30 seconds
  useBuildInfoPolling();

  return (
    <Box minH="100vh" bg="gray.900" position="relative" pb="100px">
      {/* Content */}
      {activeTab === "today" && <TodayPage />}
      {activeTab === "charts" && <ChartsPage />}
      {activeTab === "settings" && <SettingsPage />}

      {/* Gradient fade overlay */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        h="120px"
        pointerEvents="none"
        zIndex={999}
        style={{
          background: 'linear-gradient(to top, #171923 0%, rgba(23, 25, 35, 0.8) 50%, transparent 100%)',
        }}
      />

      {/* iOS-style bottom navigation */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        p={4}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        pointerEvents="none"
        zIndex={1000}
      >
        {/* Floating pill tabs - left aligned */}
        <HStack
          gap={2}
          bg="rgba(0, 0, 0, 0.8)"
          backdropFilter="blur(20px)"
          borderRadius="full"
          px={3}
          py={2}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
          pointerEvents="auto"
        >
          <Button
            aria-label="Today"
            onClick={() => setActiveTab("today")}
            bg={activeTab === "today" ? "white" : "transparent"}
            borderRadius="full"
            w="44px"
            h="44px"
            p={0}
            minW="44px"
            _hover={{ bg: activeTab === "today" ? "white" : "rgba(255, 255, 255, 0.15)" }}
            transition="all 0.2s"
          >
            <Box
              as={HiCalendar}
              w="20px"
              h="20px"
              color={activeTab === "today" ? "black" : "white"}
            />
          </Button>
          <Button
            aria-label="Charts"
            onClick={() => setActiveTab("charts")}
            bg={activeTab === "charts" ? "white" : "transparent"}
            borderRadius="full"
            w="44px"
            h="44px"
            p={0}
            minW="44px"
            _hover={{ bg: activeTab === "charts" ? "white" : "rgba(255, 255, 255, 0.15)" }}
            transition="all 0.2s"
          >
            <Box
              as={HiChartBar}
              w="20px"
              h="20px"
              color={activeTab === "charts" ? "black" : "white"}
            />
          </Button>
        </HStack>

        {/* Gear icon - bottom right */}
        <Button
          aria-label="Settings"
          onClick={() => setActiveTab("settings")}
          bg={activeTab === "settings" ? "white" : "rgba(0, 0, 0, 0.8)"}
          backdropFilter="blur(20px)"
          borderRadius="full"
          w="48px"
          h="48px"
          p={0}
          minW="48px"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
          _hover={{
            bg: activeTab === "settings" ? "white" : "rgba(255, 255, 255, 0.15)",
          }}
          transition="all 0.2s"
          pointerEvents="auto"
        >
          <Box
            as={FaCog}
            w="20px"
            h="20px"
            color={activeTab === "settings" ? "black" : "white"}
          />
        </Button>
      </Box>
    </Box>
  );
}
