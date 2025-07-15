import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OfficeDashboard from './pages/OfficeDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import PlayroomDashboard from './pages/PlayroomDashboard';
import FamilyRoomDashboard from './pages/FamilyRoomDashboard';
import JrSuiteDashboard from './pages/JrSuiteDashboard';
import FoyerDashboard from './pages/FoyerDashboard';
import MainBedroomDashboard from './pages/MainBedroomDashboard';
import GianlucasRoomDashboard from './pages/GianlucasRoomDashboard';
import NinosRoomDashboard from './pages/NinosRoomDashboard';
import GlobalStyle from './styles/globalStyles';
import { HassProvider } from './contexts/HassContext';
import { ModalProvider } from './contexts/ModalContext';
import { NavigationProvider } from './contexts/NavigationContext';
import ModalContainer from './components/Modal/ModalContainer';
import NavigationContainer from './components/Navigation/NavigationContainer';
import NavigationHandle from './components/Navigation/NavigationHandle';


function App() {
  return (
    <HassProvider>
      <ModalProvider>
        <NavigationProvider>
          <GlobalStyle />
          <Router>
            <Routes>
              <Route path="/office" element={<OfficeDashboard />} />
              <Route path="/kitchen" element={<KitchenDashboard />} />
              <Route path="/playroom" element={<PlayroomDashboard />} />
              <Route path="/family-room" element={<FamilyRoomDashboard />} />
              <Route path="/jr-suite" element={<JrSuiteDashboard />} />
              <Route path="/foyer" element={<FoyerDashboard />} />
              <Route path="/main-bedroom" element={<MainBedroomDashboard />} />
              <Route path="/gianlucas-bedroom" element={<GianlucasRoomDashboard />} />
              <Route path="/ninos-bedroom" element={<NinosRoomDashboard />} />
              <Route path="/" element={<Navigate to="/kitchen" replace />} />
            </Routes>
            <ModalContainer />
            <NavigationContainer />
            <NavigationHandle />
          </Router>
        </NavigationProvider>
      </ModalProvider>
    </HassProvider>
  );
}

export default App;
