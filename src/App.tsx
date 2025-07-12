import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OfficeDashboard from './pages/OfficeDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import GlobalStyle from './styles/globalStyles';
import { HassProvider } from './contexts/HassContext';
import { ModalProvider } from './contexts/ModalContext';
import ModalContainer from './components/Modal/ModalContainer';

function App() {
  return (
    <HassProvider>
      <ModalProvider>
        <GlobalStyle />
        <Router>
          <Routes>
            <Route path="/office" element={<OfficeDashboard />} />
            <Route path="/kitchen" element={<KitchenDashboard />} />
            <Route path="/" element={<Navigate to="/kitchen" replace />} />
          </Routes>
        </Router>
        <ModalContainer />
      </ModalProvider>
    </HassProvider>
  );
}

export default App;
