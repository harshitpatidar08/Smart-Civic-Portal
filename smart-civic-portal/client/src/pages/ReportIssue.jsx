import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import MapView from '../components/MapView';

const categories = ['road', 'garbage', 'streetlight', 'water', 'other'];
const priorities = ['low', 'medium', 'high'];

const ReportIssue = () => {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    issueTitle: '',
    description: '',
    category: 'road',
    priority: 'medium',
  });
  const [coords, setCoords] = useState({ latitude: '', longitude: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // ignore error, user can set manually
        }
      );
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-[#DDE5F2] bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#0F172A]">Login required</h2>
        <p className="mt-2 text-sm text-slate-500">Please login to submit a complaint.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-[#2F6FED] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1f58c6]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-[#2F6FED] px-5 py-2 text-sm font-semibold text-[#2F6FED]"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordsChange = (event) => {
    const { name, value } = event.target;
    setCoords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!coords.latitude || !coords.longitude) {
      toast.error('Please provide a location');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    payload.append('latitude', coords.latitude);
    payload.append('longitude', coords.longitude);
    if (image) {
      payload.append('image', image);
    }

    setLoading(true);
    try {
      await complaintAPI.create(payload);
      toast.success('Complaint submitted!');
      setForm({ issueTitle: '', description: '', category: 'road', priority: 'medium' });
      setImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-8 text-[#0F172A]">
      <div className="rounded-2xl border border-[#DDE5F2] bg-[#E8F0FF] p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">3 step workflow</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { title: 'Describe', desc: 'Tell us what went wrong and add a category.' },
            { title: 'Geo-tag', desc: 'Auto capture lat/long or set manually.' },
            { title: 'Upload proof', desc: 'Attach photos for faster verification.' },
          ].map((step, index) => (
            <div key={step.title} className="rounded-lg border border-[#DDE5F2] bg-white/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Step {index + 1}</p>
              <p className="text-lg font-semibold text-[#0F172A]">{step.title}</p>
              <p className="text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#DDE5F2] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Report a civic issue</h2>
          <p className="mt-2 text-sm text-slate-500">Upload a photo, auto-detect location, and submit.</p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Issue title</label>
              <input
                name="issueTitle"
                value={form.issueTitle}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  value={coords.latitude}
                  onChange={handleCoordsChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  value={coords.longitude}
                  onChange={handleCoordsChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Upload photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0])}
                className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-600 hover:file:bg-brand-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#2F6FED] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1f58c6] disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>

        <div className="rounded-2xl border border-[#DDE5F2] bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Verify location on map</h3>
          <p className="mt-2 text-sm text-slate-500">Adjust coordinates manually if required.</p>
          <div className="mt-6">
            <MapView
              markers={
                coords.latitude && coords.longitude
                  ? [{ lat: Number(coords.latitude), lng: Number(coords.longitude), title: form.issueTitle || 'New issue' }]
                  : []
              }
              height="360px"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportIssue;

