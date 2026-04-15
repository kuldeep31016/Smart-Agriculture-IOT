import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-agri-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#f0faf4',
            color: '#1b4332',
            border: '1px solid #52b788',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#2d6a4f', secondary: '#d8f3dc' } },
        }}
      />

      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
