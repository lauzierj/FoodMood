import React, { useRef, useState } from "react";
import { HStack, VStack, Button, Input, Box, Text } from "@chakra-ui/react";
import { getAllEntries, importEntries, clearAllEntries } from "../db/entries";
import { ExportData, DailyEntry } from "../types";

export default function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleExport = async () => {
    try {
      const entries = await getAllEntries();
      const exportData: ExportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        entries,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `foodmood-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ text: `Exported ${entries.length} entries`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Export error:", error);
      setMessage({ text: "Export failed", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      if (!data.version || !data.entries || !Array.isArray(data.entries)) {
        throw new Error("Invalid export file format");
      }

      // Validate entries
      const validEntries: DailyEntry[] = data.entries.filter((entry) => {
        return (
          entry.date &&
          typeof entry.timestamp === "number" &&
          Array.isArray(entry.foods) &&
          Array.isArray(entry.activities) &&
          Array.isArray(entry.moods)
        );
      });

      if (validEntries.length === 0) {
        throw new Error("No valid entries found in file");
      }

      // Clear existing data and import
      await clearAllEntries();
      await importEntries(validEntries);

      setMessage({ text: `Imported ${validEntries.length} entries`, type: "success" });
      setTimeout(() => {
        setMessage(null);
        // Reload the page to refresh data
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Import error:", error);
      setMessage({
        text: error instanceof Error ? error.message : "Invalid file format",
        type: "error",
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <VStack align="stretch" gap={2}>
      {message && (
        <Box
          bg={message.type === "success" ? "green.600" : "red.600"}
          color="white"
          p={2}
          borderRadius="md"
          fontSize="sm"
          textAlign="center"
        >
          {message.text}
        </Box>
      )}
      <HStack gap={4}>
        <Button
          onClick={handleExport}
          bg="blue.600"
          color="white"
          border="1px solid"
          borderColor="blue.500"
          size="sm"
          _hover={{ bg: "blue.700" }}
        >
          Export Data
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          display="none"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          bg="green.600"
          color="white"
          border="1px solid"
          borderColor="green.500"
          size="sm"
          _hover={{ bg: "green.700" }}
        >
          Import Data
        </Button>
      </HStack>
    </VStack>
  );
}

