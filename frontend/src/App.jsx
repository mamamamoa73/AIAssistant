import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import OptimizationPage from './pages/OptimizationPage';

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Amazon Listing Optimizer (KSA)
        </Typography>
        <OptimizationPage />
      </Box>
    </Container>
  );
}

export default App;
