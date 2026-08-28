import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { CommandDeck } from './pages/CommandDeck';
import { DeployWizard } from './pages/DeployWizard';
import { RealmsPage } from './pages/RealmsPage';
import { RealmDetailPage } from './pages/RealmDetailPage';
import { ClientsPage } from './pages/ClientsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/deck" element={<CommandDeck />} />
        <Route path="/deploy" element={<DeployWizard />} />
        <Route path="/realms" element={<RealmsPage />} />
        <Route path="/realms/:realm" element={<RealmDetailPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
