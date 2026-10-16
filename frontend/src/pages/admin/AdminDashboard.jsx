import React, { useState, useEffect } from 'react';
import { listJourneys } from '../../services/journeyService';
import { listRoutes, listBusStops, listVehicles, listUsers } from '../../services/adminService';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RoutesTab from './tabs/RoutesTab';
import BusStopsTab from './tabs/BusStopsTab';
import VehiclesTab from './tabs/VehiclesTab';
import JourneysTab from './tabs/JourneysTab';
import UsersTab from './tabs/UsersTab';
import { FaBus, FaRoute, FaUsers, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const tabs = [
  { id: 'journeys', label: 'Journeys', icon: FaCalendarAlt },
  { id: 'routes', label: 'Routes', icon: FaRoute },
  { id: 'stops', label: 'Bus Stops', icon: FaMapMarkerAlt },
  { id: 'vehicles', label: 'Vehicles', icon: FaBus },
  { id: 'users', label: 'Users', icon: FaUsers },
];

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="text-white" size={20} />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('journeys');
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listJourneys({ limit: 1 }),
      listRoutes({ limit: 1 }),
      listBusStops({ limit: 1 }),
      listVehicles({ limit: 1 }),
      listUsers({ limit: 1 }),
    ]).then(([j, r, s, v, u]) => {
      setStats({
        journeys: j.pagination?.total,
        routes: r.pagination?.total,
        stops: s.pagination?.total,
        vehicles: v.pagination?.total,
        users: u.pagination?.total,
      });
    }).catch(() => {}).finally(() => setStatsLoading(false));
  }, []);

  const tabComponents = {
    journeys: JourneysTab,
    routes: RoutesTab,
    stops: BusStopsTab,
    vehicles: VehiclesTab,
    users: UsersTab,
  };
  const ActiveTab = tabComponents[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <StatCard label="Journeys" value={stats.journeys} icon={FaCalendarAlt} color="bg-blue-500" />
          <StatCard label="Routes" value={stats.routes} icon={FaRoute} color="bg-green-500" />
          <StatCard label="Bus Stops" value={stats.stops} icon={FaMapMarkerAlt} color="bg-yellow-500" />
          <StatCard label="Vehicles" value={stats.vehicles} icon={FaBus} color="bg-purple-500" />
          <StatCard label="Users" value={stats.users} icon={FaUsers} color="bg-red-500" />
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <ActiveTab />
      </div>
    </div>
  );
};

export default AdminDashboard;
