import React, { useState, useRef, useEffect } from "react";
import { Box, HStack, VStack, Text, Badge, Button } from "@chakra-ui/react";
import { FaArrowDown } from "react-icons/fa";

interface EmojiOption {
  value: string;
  emoji: string;
  label: string;
}

interface EmojiSelectorProps {
  options: EmojiOption[];
  selected: Array<{ value: string; count: number; emoji: string }>;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  title: string;
  isDisabled?: boolean;
}

export default function EmojiSelector({
  options,
  selected,
  onAdd,
  onRemove,
  title,
  isDisabled = false,
}: EmojiSelectorProps) {
  const [holdingValue, setHoldingValue] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const wasHoldingRef = useRef<boolean>(false);
  const clickTimerRef = useRef<number | null>(null);
  const holdingValueRef = useRef<string | null>(null); // Ref to track current holding value
  const lastKnownCountRef = useRef<number>(0); // Track the last known count for the holding value

  const getSelectedCount = (value: string): number => {
    const item = selected.find((s) => s.value === value);
    return item?.count || 0;
  };

  const startHold = (value: string) => {
    const count = getSelectedCount(value);
    if (isDisabled || count === 0) {
      return;
    }

    setHoldingValue(value);
    holdingValueRef.current = value; // Update ref as well
    lastKnownCountRef.current = count; // Track the initial count
    setHoldProgress(0);
    setShowTimer(false);
    startTimeRef.current = Date.now();

    // After 1 second, start showing timer and progress
    holdTimerRef.current = setTimeout(() => {
      // Check again if count is still > 0 before showing timer
      const currentCount = getSelectedCount(value);
      if (currentCount === 0) {
        cancelHold();
        return;
      }
      lastKnownCountRef.current = currentCount; // Update tracked count
      wasHoldingRef.current = true;
      setShowTimer(true);
      startProgressTimer(value);
    }, 1000);
  };

  const startProgressTimer = (value: string) => {
    // Clear any existing progress timer
    if (progressTimerRef.current) {
      cancelAnimationFrame(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    // Reset start time for this cycle (2-second cycle)
    const cycleStartTime = Date.now();
    setHoldProgress(0);

    const animate = () => {
      // Check if we're still holding this value using ref (avoids stale closure)
      if (holdingValueRef.current !== value) {
        progressTimerRef.current = null;
        return; // Stop if holding a different value
      }

      // Check props count, but don't overwrite our tracked count if props are stale
      // Only update ref if props count is LOWER than our tracked count (props finally updated)
      const currentCount = getSelectedCount(value);
      if (currentCount < lastKnownCountRef.current) {
        // Props finally updated, sync with it
        lastKnownCountRef.current = currentCount;
      }

      // Check if count has reached 0 (item was removed elsewhere or this was the last one)
      // Use our tracked count as source of truth (props might be stale)
      if (lastKnownCountRef.current <= 0) {
        cancelHold();
        return;
      }

      const elapsed = Date.now() - cycleStartTime;
      const progress = Math.min(elapsed / 2000, 1); // Progress from 0s to 2s (0 to 1) for this cycle
      setHoldProgress(progress);

      if (elapsed >= 2000) {
        // 2 seconds in this cycle, remove one item
        // Stop animation immediately - don't continue the loop
        if (progressTimerRef.current) {
          cancelAnimationFrame(progressTimerRef.current);
          progressTimerRef.current = null;
        }

        // Use our tracked count instead of reading from props (props might be stale)
        const countBeforeRemove = lastKnownCountRef.current;
        if (countBeforeRemove > 0 && holdingValueRef.current === value) {
          const wasLastItem = countBeforeRemove === 1;
          // Update our tracked count
          lastKnownCountRef.current = countBeforeRemove - 1;
          onRemove(value);

          // If this was the last item, cancel immediately
          if (wasLastItem || lastKnownCountRef.current <= 0) {
            lastKnownCountRef.current = 0;
            cancelHold();
            return;
          }

          // Check if there are more items to remove after a brief delay
          setTimeout(() => {
            // Trust our calculated count instead of re-reading from props
            // because props might not have updated yet due to async state updates
            // We already set lastKnownCountRef.current = countBeforeRemove - 1 above
            const calculatedCount = lastKnownCountRef.current;
            // Also check props as a fallback, but trust our calculation first
            const propsCount = getSelectedCount(value);
            // Use the minimum to be safe (in case props updated but our calc is wrong)
            const actualCount = Math.min(calculatedCount, propsCount);
            lastKnownCountRef.current = actualCount;
            if (
              holdingValueRef.current === value &&
              actualCount > 0 &&
              lastKnownCountRef.current > 0
            ) {
              startProgressTimer(value);
            } else {
              // No more items or not holding anymore, cancel
              lastKnownCountRef.current = 0;
              cancelHold();
            }
          }, 50);
        } else {
          // No more items or not holding anymore, cancel
          lastKnownCountRef.current = 0;
          cancelHold();
        }
        return; // Exit the animation function immediately
      } else {
        // Continue animation only if we're still holding and count > 0
        // Use our tracked count as source of truth (props might be stale)
        if (
          holdingValueRef.current === value &&
          lastKnownCountRef.current > 0
        ) {
          progressTimerRef.current = requestAnimationFrame(animate);
        } else {
          // Stop animation if count is 0 or not holding anymore
          progressTimerRef.current = null;
          lastKnownCountRef.current = 0;
          cancelHold();
        }
      }
    };

    progressTimerRef.current = requestAnimationFrame(animate);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      cancelAnimationFrame(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setHoldingValue(null);
    holdingValueRef.current = null; // Update ref as well
    lastKnownCountRef.current = 0; // Reset tracked count
    setHoldProgress(0);
    setShowTimer(false);
    startTimeRef.current = null;
    // Reset the flag after a short delay to allow click handler to check it
    setTimeout(() => {
      wasHoldingRef.current = false;
    }, 100);
  };

  useEffect(() => {
    return () => {
      cancelHold();
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const handleMouseDown = (value: string, e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    e.stopPropagation();
    startHold(value);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    e.stopPropagation();
    cancelHold();
  };

  const handleMouseLeave = () => {
    cancelHold();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleClick = (value: string, e: React.MouseEvent) => {
    // Prevent click if we were holding (after 1 second)
    if (wasHoldingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // If we started a hold but released before 1 second, cancel it and add
    if (holdingValue === value) {
      cancelHold();
      // Small delay to ensure hold is cancelled before adding
      clickTimerRef.current = setTimeout(() => {
        onAdd(value);
      }, 50);
      return;
    }
    // Normal click - add item
    onAdd(value);
  };

  const handleTouchStart = (value: string, e: React.TouchEvent) => {
    // Don't preventDefault on touch events to avoid passive listener warning
    e.stopPropagation();
    startHold(value);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Don't preventDefault on touch events to avoid passive listener warning
    e.stopPropagation();
    cancelHold();
  };

  const handleTouchCancel = () => {
    cancelHold();
  };

  return (
    <VStack align="stretch" gap={4} mb={8}>
      <Text fontSize="xl" fontWeight="bold" color="gray.100">
        {title}
      </Text>

      {/* Emoji buttons with badges - horizontally scrollable */}
      <Box
        overflowX="auto"
        overflowY="hidden"
        mx="-16px"
        css={{
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(255, 255, 255, 0.3)",
          },
        }}
      >
        <HStack
          gap={3}
          flexWrap="nowrap"
          align="flex-start"
          minW="max-content"
          px="16px"
          py="10px"
        >
          {options.map((option) => {
            const count = getSelectedCount(option.value);
            const isHolding = holdingValue === option.value;
            const shouldShowTimer = isHolding && showTimer;

            return (
              <Box
                key={option.value}
                position="relative"
                display="inline-block"
              >
                <Button
                  onClick={(e) => handleClick(option.value, e)}
                  onMouseDown={(e) => handleMouseDown(option.value, e)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onContextMenu={handleContextMenu}
                  onTouchStart={(e) => handleTouchStart(option.value, e)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
                  size="lg"
                  fontSize="4xl"
                  p={4}
                  minW="80px"
                  h="80px"
                  bg={shouldShowTimer ? "red.800" : "gray.800"}
                  border="2px solid"
                  borderColor={
                    shouldShowTimer
                      ? "red.500"
                      : count > 0
                      ? "blue.500"
                      : "gray.700"
                  }
                  _hover={{
                    bg: shouldShowTimer ? "red.800" : "gray.700",
                    borderColor: "blue.500",
                  }}
                  _active={{ bg: "gray.600" }}
                  aria-label={option.label}
                  disabled={isDisabled}
                  userSelect="none"
                  style={{ touchAction: "manipulation" }}
                >
                  {option.emoji}
                </Button>
                {count > 0 && (
                  <Badge
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    bg="blue.600"
                    color="white"
                    borderRadius="full"
                    minW="24px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(option.value);
                    }}
                    _hover={{ bg: "blue.700" }}
                    zIndex={1}
                  >
                    {count}
                  </Badge>
                )}
                {/* Timer overlay with down arrow icon */}
                {shouldShowTimer && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    w="60px"
                    h="60px"
                    borderRadius="full"
                    bg="rgba(0, 0, 0, 0.9)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={10}
                    pointerEvents="none"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)"
                  >
                    {/* Circular progress indicator using SVG */}
                    <Box
                      position="absolute"
                      w="60px"
                      h="60px"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <svg
                        width="60"
                        height="60"
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        <circle
                          cx="30"
                          cy="30"
                          r="27"
                          fill="none"
                          stroke="rgba(239, 68, 68, 0.3)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r="27"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 27}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 27 * (1 - holdProgress)
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </Box>
                    {/* Down arrow icon */}
                    <Box
                      as={FaArrowDown}
                      color="red.400"
                      fontSize="20px"
                      position="relative"
                      zIndex={11}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </HStack>
      </Box>
    </VStack>
  );
}
