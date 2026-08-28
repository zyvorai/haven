import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { CommandDeck } from './pages/CommandDeck';
import { DeployWizard } from './pages/DeployWizard';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/deck" element={<CommandDeck />} />
        <Route path="/deploy" element={<DeployWizard />} />
      </Routes>
    </BrowserRouter>
  );
}
