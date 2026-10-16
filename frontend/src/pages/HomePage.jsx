import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBus, FaShieldAlt, FaRoute, FaMobileAlt } from 'react-icons/fa';

const HomePage = () => {
  const { user } = useAuth();
  const dashboardLink = user ? { Admin: '/admin', Driver: '/driver', Passenger: '/passenger' }[user.role] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <FaBus /> Shuttle
          </div>
          <div className="flex gap-3">
            {user ? (
              <Link to={dashboardLink} className="btn-primary text-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Campus transit, <span className="text-blue-600">simplified</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Book your shuttle seat in seconds. Track journeys in real time. Built for campus life.
        </p>

        {!user && (
          <div className="flex justify-center gap-3 mb-16">
            <Link to="/register" className="btn-primary px-8 py-3">Book a ride</Link>
            <Link to="/login" className="btn-secondary px-8 py-3">Sign in</Link>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          {[
            { icon: FaShieldAlt, title: 'Concurrency-safe', text: 'Atomic seat booking — no overbooking, ever.' },
            { icon: FaRoute, title: 'Live tracking', text: 'Drivers update journey status in real time.' },
            { icon: FaMobileAlt, title: 'Role-based', text: 'Passenger, Driver, and Admin — one platform.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card text-left">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg inline-flex mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
