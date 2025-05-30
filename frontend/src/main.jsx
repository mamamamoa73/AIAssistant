import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'; // Import the i18n configuration
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// A basic theme for MUI. You can customize this further.
// We will wrap the ThemeProvider with another component to handle theme direction
// based on i18n language.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Example primary color
    },
    secondary: {
      main: '#dc004e', // Example secondary color
    },
  },
});

import { useTranslation } from 'react-i18next'; // Import useTranslation

// Create a separate component to handle theme direction
const AppWithTheme = () => {
  const { i18n } = useTranslation();

  const theme = createTheme({
    direction: i18n.dir(), // Set theme direction based on i18n
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    // You might need to adjust typography for Arabic if default fonts don't render well
    // typography: {
    //   fontFamily: i18n.language === 'ar' ? '"Tajawal", "Roboto", "Helvetica", "Arial", sans-serif' : '"Roboto", "Helvetica", "Arial", sans-serif',
    // }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* MUI's reset/normalize CSS */}
      <App />
    </ThemeProvider>
  );
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* i18n instance is already initialized in i18n.js, which is imported.
        The I18nextProvider is implicitly set up by initReactI18next.
        No need to wrap with I18nextProvider here if using initReactI18next in i18n.js.
    */}
    <AppWithTheme />
  </React.StrictMode>,
)
