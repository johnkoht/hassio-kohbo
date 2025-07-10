import React from 'react';
import OfficeDashboard from './pages/OfficeDashboard';
import GlobalStyle from './styles/globalStyles';
import { HassProvider } from './contexts/HassContext';

function App() {
  return (
    <HassProvider>
      <GlobalStyle />
      <OfficeDashboard />
    </HassProvider>
  );
}

export default App;
