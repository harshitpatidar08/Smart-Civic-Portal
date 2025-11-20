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
    // Login Required Card: Pastel Red/Pink with medium opacity
    return (
      <div className="mx-auto max-w-lg p-10 rounded-[28px] shadow-xl transition duration-300 hover:shadow-2xl hover:scale-[1.02] bg-[rgba(255,150,150,0.22)] border border-[rgba(0,0,0,0.05)] text-center space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Login Required</h2>
        <p className="text-base text-slate-600">Please login to submit a complaint and access the reporting features.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/login"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:scale-[1.02]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-indigo-400/50 px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50/50"
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
    <div className="min-h-screen bg-gray-50/70 p-4 md:p-10">
      <section className="space-y-10 text-slate-800">
        
        {/* WORKFLOW GUIDE CARD: Pastel Blue/Cyan */}
        <div className="p-10 rounded-[28px] shadow-xl transition duration-300 hover:shadow-2xl hover:scale-[1.02] bg-[rgba(100,200,255,0.22)] border border-[rgba(0,0,0,0.05)]">
          <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
            SMART REPORTING WORKFLOW
          </p>
          
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Step cards with subtle elevation and transition */}
            {[
              { title: 'Describe Issue', desc: 'Tell us what went wrong and add a category.' },
              { title: 'Geo-tag Location', desc: 'Auto capture GPS coordinates or set them manually.' },
              { title: 'Upload Proof', desc: 'Attach photos for faster verification and resolution.' },
            ].map((step, index) => (
              <div 
                key={step.title} 
                className="rounded-2xl bg-white/70 p-5 border border-white/50 text-sm shadow-md 
                           transition duration-300 hover:shadow-lg hover:translate-y-[-2px]"
              >
                <p className="text-xs uppercase tracking-wider text-blue-600/80 font-bold">STEP {index + 1}</p>
                <p className="text-xl font-medium tracking-tight text-slate-900 mt-2">{step.title}</p>
                <p className="text-slate-600 text-sm mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FORM AND MAP SECTION */}
        <div className="grid gap-8 lg:grid-cols-5">
          
          {/* COMPLAINT FORM: Pastel Lavender/Purple (3/5 width on large screens) */}
          <form 
            onSubmit={handleSubmit} 
            className="lg:col-span-3 p-8 md:p-10 rounded-[28px] shadow-xl transition duration-300 
                       hover:shadow-2xl hover:scale-[1.02] 
                       bg-[rgba(230,180,255,0.22)] border border-[rgba(0,0,0,0.05)]"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Report a Civic Issue</h2>
            <p className="mt-2 text-base text-slate-600">Fill in the required details to begin tracking.</p>

            <div className="mt-8 space-y-6">
              {/* Form Fields: Inputs and Selects */}
              <div className="space-y-2"> 
                <label className="text-sm font-medium text-slate-700">Issue Title</label>
                <input
                  name="issueTitle"
                  value={form.issueTitle}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-purple-400/50 px-4 py-3 text-base focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition duration-200 shadow-sm bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-purple-400/50 px-4 py-3 text-base focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition duration-200 shadow-sm bg-white"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-purple-400/50 px-4 py-3 text-base focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition duration-200 bg-white shadow-sm appearance-none"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-purple-400/50 px-4 py-3 text-base focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition duration-200 bg-white shadow-sm appearance-none"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={coords.latitude}
                    onChange={handleCoordsChange}
                    required
                    className="w-full rounded-xl border border-purple-400/50 px-4 py-3 text-base focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition duration-200 shadow-sm bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={coords.longitude}
                    onChange={handleCoordsChange}
                    required
                    className="w-full rounded-xl border border-purple-400/50 px-4 py-3 text-base focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition duration-200 shadow-sm bg-white"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Upload Photo (Proof)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImage(event.target.files?.[0])}
                  className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-teal-100/70 file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100 transition duration-200"
                />
              </div>
            </div>

            {/* Submit Button: Teal */}
            <button
              type="submit"
              disabled={loading}
              className="mt-10 w-full rounded-xl bg-teal-600 py-3.5 text-base font-semibold text-white shadow-lg transition duration-300 hover:bg-teal-700 hover:shadow-xl disabled:opacity-60 disabled:hover:bg-teal-600"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>

          {/* MAP VIEW: Pastel Green/Mint (2/5 width on large screens) */}
          <div 
            className="lg:col-span-2 p-8 md:p-10 rounded-[28px] shadow-xl z-10 
                       bg-[rgba(180,255,200,0.22)] border border-[rgba(0,0,0,0.05)]" 
          >
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Verify Location</h3>
            <p className="mt-2 text-base text-slate-600">Confirm the issue pin-point on the map.</p>
            <div className="mt-6 rounded-2xl overflow-hidden shadow-2xl border border-white/50">
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
    </div>
  );
};

export default ReportIssue;