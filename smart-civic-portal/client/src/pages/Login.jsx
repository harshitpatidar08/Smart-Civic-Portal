import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/report');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-500 p-8 text-white shadow-lg shadow-sky-200">
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">Smart Civic Portal</p>
        <h2 className="mt-4 text-3xl font-bold">Welcome back, guardian of the grid!</h2>
        <p className="mt-2 text-sm text-white/80">
          Monitor the civic pulse, receive escalation alerts, and acknowledge citizen feedback in real time.
        </p>
        <div className="mt-8 space-y-4">
          {[
            { label: 'Complaints resolved last week', value: '312', color: 'text-emerald-200' },
            { label: 'Average response time', value: '4h 20m', color: 'text-white' },
            { label: 'Citizen satisfaction', value: '92%', color: 'text-amber-200' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">{stat.label}</p>
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-100">
        <h2 className="text-2xl font-semibold text-slate-900">Login to your console</h2>
        <p className="mt-2 text-sm text-slate-500">Enter your credentials to keep the mission rolling.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              minLength={6}
              required
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          New user?{' '}
          <Link to="/register" className="font-semibold text-brand-600">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;

