import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing    from './pages/Landing';
import Dashboard  from './pages/Dashboard';
import Prediction from './pages/Prediction';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<Prediction />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
