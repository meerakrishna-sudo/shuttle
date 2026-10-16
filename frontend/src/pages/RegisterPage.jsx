import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBus } from 'react-icons/fa';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phoneNumber: '', role: 'Passenger', licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'Driver' ? '/driver' : '/passenger', { replace: true });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <FaBus size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
              <div className="flex gap-3">
                {['Passenger', 'Driver'].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.role === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Meera" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="K" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@campus.edu" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input" value={form.password} onChange={set('password')} placeholder="Min 8 characters" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number (optional)</label>
              <input type="tel" className="input" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+91 98765 43210" />
            </div>

            {form.role === 'Driver' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License number</label>
                <input className="input" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="KA-DL-12345" required />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
