import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define base class for all navigation links
const navLinkBase =
  'text-sm font-medium transition-all duration-200 py-2 px-3 rounded-full relative';

// Define the class for inactive links
const navLinkInactive =
  'text-slate-600 hover:text-brand-700 hover:bg-brand-50';

// Define the function to apply classes based on the NavLink state
const getNavLinkClass = ({ isActive }) =>
  isActive
    ? // Active link style: bold, strong brand color, and an underline-like border
      `${navLinkBase} text-brand-700 font-semibold border-b-2 border-brand-700`
    : // Inactive link style
      `${navLinkBase} ${navLinkInactive}`;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand/Logo Section - Larger and bolder */}
        <Link to="/" className="text-xl font-bold text-brand-700 tracking-wider">
          Smart Civic Portal
        </Link>

        {/* Navigation - Centered and using the enhanced navLink styles */}
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={getNavLinkClass}>
            Home
          </NavLink>
          <NavLink to="/report" className={getNavLinkClass}>
            Report Issue
          </NavLink>
          <NavLink to="/my-complaints" className={getNavLinkClass}>
            My Complaints
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={getNavLinkClass}>
              Admin Panel
            </NavLink>
          )}
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* User Info - Nicer styling for text */}
              <div className="hidden text-right lg:block">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-brand-600 capitalize font-medium">{user.role}</p>
              </div>
              {/* Logout Button - Modern pill shape, stronger color, deeper shadow on hover */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition-all duration-200 hover:bg-brand-700 hover:shadow-xl"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              {/* Login Button - Outlined style with hover fill */}
              <Link
                to="/login"
                className="rounded-full border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-600 transition-all duration-200 hover:bg-brand-50"
              >
                Login
              </Link>
              {/* Register Button - Primary fill style with hover shadow */}
              <Link
                to="/register"
                className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition-all duration-200 hover:bg-brand-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;