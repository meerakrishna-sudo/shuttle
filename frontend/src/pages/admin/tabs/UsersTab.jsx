import React, { useState, useEffect } from 'react';
import { listUsers, deactivateUser } from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async (role = '') => {
    setLoading(true);
    const res = await listUsers({ role: role || undefined, limit: 50 });
    setUsers(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    await deactivateUser(id);
    load(filter);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex gap-3 mb-4">
        {['', 'Passenger', 'Driver'].map((r) => (
          <button key={r} onClick={() => { setFilter(r); load(r); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
            }`}>
            {r || 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Name</th><th className="pb-2">Email</th>
            <th className="pb-2">Role</th><th className="pb-2">Joined</th><th className="pb-2"></th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="py-3">{u.firstName} {u.lastName}</td>
                <td className="py-3 text-gray-500">{u.email}</td>
                <td className="py-3">
                  <span className={u.role === 'Driver' ? 'badge-ongoing' : 'badge-scheduled'}>{u.role}</span>
                </td>
                <td className="py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  <button onClick={() => handleDeactivate(u._id)} className="text-red-500 hover:underline text-xs">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-500 text-sm py-6">No users.</p>}
      </div>
    </div>
  );
};

export default UsersTab;
