import React from 'react';
import OfficeDashboard from './pages/OfficeDashboard';
import GlobalStyle from './styles/globalStyles';
import { HassProvider } from './contexts/HassContext';
import { ModalProvider } from './contexts/ModalContext';
import ModalContainer from './components/Modal/ModalContainer';

function App() {
  return (
    <HassProvider>
      <ModalProvider>
        <GlobalStyle />
        <OfficeDashboard />
        <ModalContainer />
      </ModalProvider>
    </HassProvider>
  );
}

export default App;
