import React, { useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "error",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "error"
      ? "red.600"
      : type === "success"
      ? "green.600"
      : "blue.600";

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      bg={bgColor}
      color="white"
      px={4}
      py={3}
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
      zIndex={2000}
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.4)"
      minW="200px"
      maxW="400px"
    >
      <Text>{message}</Text>
    </Box>
  );
}

