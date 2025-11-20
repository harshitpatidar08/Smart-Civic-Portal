import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      navigate('/report');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[0.8fr,1.2fr]">
      <div className="rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-8 text-white shadow-lg shadow-rose-200">
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">New to the portal?</p>
        <h2 className="mt-4 text-3xl font-bold">Join the civic heroes club.</h2>
        <p className="mt-2 text-sm text-white/80">
          Citizens submit service requests, admins orchestrate fixes, and every update is transparent.
        </p>
        <div className="mt-8 space-y-4 text-sm text-white/90">
          <p>• Report with photos, GPS, and categories.</p>
          <p>• Receive live notifications when statuses change.</p>
          <p>• Admins prioritize issues and coordinate departments.</p>
        </div>
        <div className="mt-10 rounded-2xl bg-white/10 p-4 text-sm text-white">
          <p className="font-semibold">Already collaborating with us?</p>
          <p className="text-white/80">Admins can request elevated access by selecting the Admin role.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-100">
        <h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
        <p className="mt-2 text-sm text-slate-500">A few quick details so we can personalize your dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
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
            <div>
              <label className="text-sm font-medium text-slate-700">Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="citizen">Citizen</option>
              <option value="admin">Admin</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Admins get access to dashboards, queues, and approval flows.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

