import React from 'react';
import { Box } from '@chakra-ui/react';
import Footer from './components/Footer';

export default function App() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Box flex="1" display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center">
          <Box fontSize="4xl" fontWeight="bold" color="gray.100" mb={4}>
            FoodMood
          </Box>
          <Box fontSize="lg" color="gray.400">
            Welcome to FoodMood
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
