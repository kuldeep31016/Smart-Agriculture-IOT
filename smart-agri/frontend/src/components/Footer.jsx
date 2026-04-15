import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/predict', label: 'Crop Prediction' },
];

const HIGHLIGHTS = [
  'Live IoT monitoring',
  'Deep learning insights',
  'Smart crop recommendations',
  'Cloud-ready architecture',
];

function Footer() {
  return (
    <footer className="mt-16 border-t border-agri-frost bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌾</span>
              <div>
                <p className="font-extrabold text-xl text-agri-primary">AgriSense</p>
                <p className="text-sm text-gray-500">Smart agriculture for modern farms</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-6 max-w-md">
              AgriSense unifies IoT sensor monitoring, cloud storage, and deep-learning-powered crop guidance to help farmers make faster, data-driven decisions.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-agri-primary mb-4">Quick Links</h3>
            <div className="space-y-2">
              {FOOTER_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block text-sm text-gray-600 hover:text-agri-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-agri-primary mb-4">What’s Inside</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-agri-medium">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-agri-frost flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AgriSense. Built for smarter farming.</p>
          <p>Deep learning + IoT + cloud monitoring in one seamless platform.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
