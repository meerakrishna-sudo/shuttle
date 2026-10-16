import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBus } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user
    ? { Admin: '/admin', Driver: '/driver', Passenger: '/passenger' }[user.role]
    : null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <FaBus />
          Shuttle
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to={dashboardLink} className="text-sm text-gray-600 hover:text-gray-900">
                {user.firstName} {user.lastName}
                <span className="ml-1 text-xs text-blue-600">({user.role})</span>
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
