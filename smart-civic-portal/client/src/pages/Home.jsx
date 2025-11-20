import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import MapView from '../components/MapView';
import { complaintAPI } from '../services/api';

const carouselSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1600&q=80',
    title: 'Report civic issues instantly',
    subtitle: 'Upload photos, add details & auto-tag your location.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
    title: 'Real-time progress tracking',
    subtitle: 'Follow issue updates as departments take action.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    title: 'Smarter civic governance',
    subtitle: 'Data-driven insights for better city management.',
  },
];

const Home = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setLoading(true);
    complaintAPI
      .list()
      .then(({ data }) => setComplaints(data.complaints || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveSlide((prev) => (prev + 1) % carouselSlides.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  const spotlight = useMemo(
    () => ({
      total: complaints.length,
      avgResolution: complaints.length ? Math.max(1, Math.round(complaints.length / 3)) : 0,
      coverage: `${Math.min(100, complaints.length * 4)}%`,
    }),
    [complaints]
  );

  return (
    <div className="space-y-14 text-[#0F172A] pb-16">

      {/* HERO CAROUSEL */}
      <section className="relative h-80 w-full overflow-hidden rounded-2xl bg-[#F7FAFF] shadow-md">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ${
              activeSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
            {/* Lighter Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A4D97]/70 to-[#2F6FED]/50" />

            {/* Text */}
            <div className="absolute top-1/2 -translate-y-1/2 px-10 text-white max-w-xl">
              <p className="text-xs uppercase tracking-widest text-white/80">
                Smart Civic Portal
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight">{slide.title}</h1>
              <p className="mt-2 text-sm text-white/80">{slide.subtitle}</p>

              <div className="mt-6 flex gap-4">
                <Link
                  to="/report"
                  className="rounded-lg bg-white px-6 py-2 text-sm font-semibold text-[#0A4D97] shadow-md transition hover:bg-[#E6EDFF]"
                >
                  Report an Issue
                </Link>
                <Link
                  to="/my-complaints"
                  className="rounded-lg bg-[#ffffff1a] px-6 py-2 text-sm font-semibold text-white border border-white/40 transition hover:bg-white/15"
                >
                  Track Complaints
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2 w-6 rounded-full transition ${
                activeSlide === index ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          { label: 'Complaints Filed', value: spotlight.total },
          { label: 'Avg Resolution Time', value: `${spotlight.avgResolution} days` },
          { label: 'City Coverage', value: spotlight.coverage },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#DDE5F2] bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs uppercase tracking-widest text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#0A4D97]">{item.value}</p>
          </div>
        ))}
      </section>

      {/* MAIN SECTION: RECENT + MAP */}
      <section className="grid gap-8 lg:grid-cols-[1.5fr,0.8fr]">
        <div className="rounded-xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Reports</h2>
            <Link to="/my-complaints" className="text-sm font-medium text-[#0A4D97]">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No complaints yet.</p>
          ) : (
            <div className="mt-6 space-y-5">
              {complaints.slice(0, 4).map((complaint) => (
                <ComplaintCard key={complaint._id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#DDE5F2] bg-white p-6 z-10 shadow-sm">
          <h2 className="text-xl font-semibold">Live City Map</h2>
          <p className="mt-1 text-sm text-slate-500">View civic activity across city clusters.</p>
          <div className="mt-4">
            <MapView markers={complaints.slice(0, 10)} height="330px" />
          </div>
        </div>
      </section>

      {/* UPCOMING FEATURES */}
      <section className="rounded-xl border border-[#DDE5F2] bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-[#0A4D97]">Upcoming Features</h2>
        <p className="mt-1 text-sm text-slate-500">
          These features are planned for future development.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'AI-based Issue Detection',
            'Heatmap Analytics Dashboard',
            'WhatsApp Complaint Support',
            'Department Auto-Routing',
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-lg bg-[#F7FAFF] p-5 border border-[#DDE5F2] shadow-sm hover:shadow-md transition"
            >
              <p className="text-xs uppercase tracking-wide text-[#2F6FED]/70">Coming Soon</p>
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">{feature}</h3>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
