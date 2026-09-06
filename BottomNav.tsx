import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', label: '探險基地', icon: '🏠' },
  { path: '/review', label: '複習', icon: '📝' },
  { path: '/learnsight', label: 'LearnSight', icon: '👁️' },
  { path: '/upload', label: 'Upload' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="w-full border border-white/30 bg-white/30 shadow-soft backdrop-blur-2xl flex items-center gap-4 px-4 py-3 rounded-3xl">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex-1 text-center text-sm font-medium rounded-2xl py-2 transition-all ${isActive
              ? 'bg-gradient-to-r from-white/80 to-secondary/40 text-text-dark shadow-glow'
              : 'text-gray-500 hover:text-text-dark'
              }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;

