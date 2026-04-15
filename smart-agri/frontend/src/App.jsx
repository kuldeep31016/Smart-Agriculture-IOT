import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout  from './layouts/MainLayout';
import Landing     from './pages/Landing';
import Dashboard   from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import Alerts      from './pages/Alerts';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#f0faf4',
            color:      '#1b4332',
            border:     '1px solid #52b788',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#2d6a4f', secondary: '#d8f3dc' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fee2e2' } },
        }}
      />

      <Routes>
        {/* Full-screen landing — no navbar */}
        <Route path="/" element={<Landing />} />

        {/* Pages with Navbar + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/alerts"       element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
