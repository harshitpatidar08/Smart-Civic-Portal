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
    issueTitle: "",
    description: "",
    category: "road",
    priority: "medium",
    street: "",
    city: ""
  });

  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto detect current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {}
      );
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCoordsChange = (e) => setCoords({ ...coords, [e.target.name]: e.target.value });

  // 🔥 Map Autofill Using Text Input → Geocoding
  const geocodeAddress = async () => {
    if (!form.street || !form.city) {
      return toast.error("Please enter both street and city.");
    }

    // Build proper Indian formatted query
    const query = `${form.street}, ${form.city}, India`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`
      );

      const data = await res.json();

      if (!data || data.length === 0) {
        toast.error("No matching location found. Try adding full city name.");
        return;
      }

      setCoords({
        latitude: data[0].lat,
        longitude: data[0].lon
      });

      toast.success("📍 Location synced with map!");
    } catch (error) {
      toast.error("Failed to fetch location");
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Require location either way
    if ((!coords.latitude || !coords.longitude) && (!form.street || !form.city)) {
      return toast.error("Provide location correctly before submitting.");
    }

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => payload.append(k, v));
    payload.append("latitude", coords.latitude || "");
    payload.append("longitude", coords.longitude || "");
    if (image) payload.append("image", image);

    try {
      setLoading(true);
      await complaintAPI.create(payload);
      toast.success("Complaint submitted successfully!");

      // Reset fields
      setForm({
        issueTitle: "",
        description: "",
        category: "road",
        priority: "medium",
        street: "",
        city: ""
      });
      setCoords({ latitude: "", longitude: "" });
      setImage(null);

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  // If not logged in
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg p-10 bg-red-100/50 text-center rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold">Login Required</h2>
        <p>Please login to submit a complaint.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/login" className="px-5 py-2 bg-indigo-600 text-white rounded-lg">Login</Link>
          <Link to="/register" className="px-5 py-2 border text-indigo-600 border-indigo-500 rounded-lg">Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] p-6 md:p-12 text-slate-800">
      <div className="grid gap-10 lg:grid-cols-5">

        {/* FORM SECTION */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 p-8 bg-white rounded-3xl border shadow-md space-y-6"
        >
          <h2 className="text-3xl font-bold">Report a Civic Issue</h2>

          {/* Title */}
          <input
            name="issueTitle"
            value={form.issueTitle}
            onChange={handleChange}
            required
            className="w-full border px-4 py-3 rounded-xl"
            placeholder="Pothole blocking road"
          />

          {/* Description */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full border px-4 py-3 rounded-xl"
            placeholder="Explain the issue clearly"
          />

          {/* Location Inputs */}
          <input
            name="street"
            value={form.street}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-xl"
            placeholder="Colony Name"
          />

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-xl"
            placeholder="City Name"
          />

          {/* Button to Convert → Coordinates */}
          <button
            type="button"
            onClick={geocodeAddress}
            className="w-full py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
          >
            Auto-Fill Map From Location
          </button>

          {/* Latitude / Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.000001"
              name="latitude"
              value={coords.latitude}
              onChange={handleCoordsChange}
              className="w-full border px-4 py-3 rounded-xl"
              placeholder="Latitude"
            />
            <input
              type="number"
              step="0.000001"
              name="longitude"
              value={coords.longitude}
              onChange={handleCoordsChange}
              className="w-full border px-4 py-3 rounded-xl"
              placeholder="Longitude"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
            >
              {priorities.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* Image Upload */}
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0])}
            className="w-full"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white rounded-xl"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>

        {/* MAP SECTION */}
        <div className="lg:col-span-2 p-8 bg-white rounded-3xl z-10 shadow-md border">
          <h3 className="text-xl font-semibold">Verify Location on Map</h3>

          <div className="mt-6 rounded-xl overflow-hidden shadow-lg">
            <MapView
              markers={
                coords.latitude && coords.longitude
                  ? [{
                      lat: Number(coords.latitude),
                      lng: Number(coords.longitude),
                      title: form.issueTitle || "Issue Location"
                    }]
                  : []
              }
              height="360px"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportIssue;
