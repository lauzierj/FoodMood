import React, { useState } from "react";
import { Box, HStack, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaCog } from "react-icons/fa";
import { HiCalendar, HiChartBar } from "react-icons/hi";
import TodayPage from "./pages/TodayPage";
import ChartsPage from "./pages/ChartsPage";
import SettingsPage from "./pages/SettingsPage";
import { useBuildInfoPolling } from "./hooks/useBuildInfoPolling";
import { usePullToRefresh } from "./hooks/usePullToRefresh";

export default function App() {
  const [activeTab, setActiveTab] = useState<"today" | "charts" | "settings">("today");
  
  // Poll for build info updates every 30 seconds
  useBuildInfoPolling();

  // Check if running as PWA (standalone mode)
  const isPWA = window.matchMedia("(display-mode: standalone)").matches || 
                (window.navigator as any).standalone === true ||
                document.referrer.includes("android-app://");

  // Pull to refresh - only enable in PWA mode, just reload the page
  usePullToRefresh({
    onRefresh: () => {
      window.location.reload();
    },
    enabled: isPWA,
    threshold: 80,
  });

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
          px="5px"
          py="5px"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
          pointerEvents="auto"
          position="relative"
        >
          {/* Animated background for tabs - only animates between Today and Charts */}
          {(activeTab === "today" || activeTab === "charts") && (
            <motion.div
              layoutId="activeTab"
              style={{
                position: "absolute",
                backgroundColor: "white",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                zIndex: 0,
              }}
              initial={false}
              animate={{
                x: activeTab === "today" ? 0 : 52, // 44px button + 8px gap
                y: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
          <Button
            aria-label="Today"
            onClick={() => setActiveTab("today")}
            bg="transparent"
            borderRadius="full"
            w="44px"
            h="44px"
            p={0}
            minW="44px"
            position="relative"
            zIndex={1}
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
            bg="transparent"
            borderRadius="full"
            w="44px"
            h="44px"
            p={0}
            minW="44px"
            position="relative"
            zIndex={1}
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

        {/* Gear icon - bottom right in pill container */}
        <Box
          bg="rgba(0, 0, 0, 0.8)"
          backdropFilter="blur(20px)"
          borderRadius="full"
          px="5px"
          py="5px"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
          pointerEvents="auto"
        >
          <Button
            aria-label="Settings"
            onClick={() => setActiveTab("settings")}
            bg={activeTab === "settings" ? "white" : "transparent"}
            borderRadius="full"
            w="44px"
            h="44px"
            p={0}
            minW="44px"
            _hover={{
              bg: activeTab === "settings" ? "white" : "rgba(255, 255, 255, 0.15)",
            }}
            transition="all 0.2s"
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
    </Box>
  );
}
