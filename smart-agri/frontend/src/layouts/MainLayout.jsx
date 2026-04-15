import { Outlet } from 'react-router-dom';
import Navbar       from '../components/Navbar';
import FloatingChat from '../components/FloatingChat';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-agri-dark text-agri-frost text-center py-4 text-sm">
        🌾 AgriSense v2.0 — Problem Statement 7: IoT + Cloud + Deep Learning
      </footer>

      {/* Global AI chatbot — visible on all pages */}
      <FloatingChat />
    </div>
  );
}
