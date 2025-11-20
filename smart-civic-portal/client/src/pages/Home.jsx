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

  // Utility arrays/styles for consistency (unchanged from previous step)
  const statCardStyles = [
    'bg-gradient-to-br from-indigo-50/70 to-blue-50/70', 
    'bg-gradient-to-br from-pink-50/70 to-purple-50/70', 
    'bg-gradient-to-br from-green-50/70 to-teal-50/70', 
  ];
  
  const carouselBtnPrimary =
    'rounded-xl bg-white/90 px-6 py-3 text-sm font-bold text-[#0A4D97] shadow-xl transition hover:bg-white hover:scale-[1.02] active:scale-[0.98]';
  const carouselBtnSecondary =
    'rounded-xl bg-[#ffffff20] px-6 py-3 text-sm font-bold text-white border border-white/30 backdrop-blur-sm transition hover:bg-[#ffffff30] hover:scale-[1.02] active:scale-[0.98]';

  // --- START OF UPDATED JSX WITH SMALLER FONTS ---
  return (
    <div className="min-h-screen bg-neutral-50/70 text-slate-800 p-4 md:p-8 space-y-10 pb-16">
      
      {/* HERO CAROUSEL */}
      <section className="relative h-96 w-full overflow-hidden rounded-3xl shadow-xl transition duration-500 hover:shadow-2xl">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ${
              activeSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
                src={slide.image} 
                alt={slide.title} 
                className="h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-slate-900/60" /> 

            {/* Text and Actions */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-14 text-white">
              {/* Label: text-xs uppercase tracking-widest (Small Label) */}
              <p className="text-xs uppercase tracking-wider text-white/80 font-medium">
                Smart Civic Portal
              </p>
              {/* Heading: text-3xl md:text-4xl font-semibold (Medium Heading) */}
              <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight max-w-2xl">
                {slide.title}
              </h1>
              {/* Subtitle: text-base (Body Text) */}
              <p className="mt-3 text-base text-white/90 max-w-xl">{slide.subtitle}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/report" className={carouselBtnPrimary}>
                  Report an Issue
                </Link>
                <Link to="/my-complaints" className={carouselBtnSecondary}>
                  Track Complaints
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                activeSlide === index ? 'bg-white w-8' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Complaints Filed', value: spotlight.total },
          { label: 'Avg Resolution Time', value: `${spotlight.avgResolution} days` },
          { label: 'City Coverage', value: spotlight.coverage },
        ].map((item, index) => (
          <div
            key={item.label}
            className={`
              p-8 rounded-3xl shadow-lg border border-transparent 
              transition duration-300 transform 
              hover:scale-[1.03] hover:shadow-2xl hover:border-white 
              ${statCardStyles[index % statCardStyles.length]}
            `}
          >
            {/* Label: text-xs uppercase tracking-wider (Small Label) */}
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{item.label}</p>
            {/* Number: text-3xl font-bold (Smaller Stat Number) */}
            <p className="mt-4 text-3xl font-bold text-slate-800">{item.value}</p>
          </div>
        ))}
      </section>

      {/* MAIN SECTION: RECENT + MAP */}
      <section className="grid gap-8 lg:grid-cols-3">
        
        {/* Recent Reports */}
        <div 
          className="lg:col-span-2 p-8 rounded-3xl shadow-lg transition duration-300 
          hover:shadow-2xl hover:scale-[1.01] hover:border-white 
          bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-transparent"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Heading: text-xl font-semibold (Medium Heading) */}
            <h2 className="text-xl font-semibold">Recent Reports</h2> 
            {/* Link: text-sm (Body Text) */}
            <Link 
                to="/my-complaints" 
                className="text-sm font-semibold text-sky-700/90 hover:text-sky-600 transition"
            >
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <p className="mt-8 text-sm text-slate-500">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p className="mt-8 text-sm text-slate-500">No complaints yet. Time to report the first one!</p>
          ) : (
            <div className="mt-8 space-y-6">
              {complaints.slice(0, 4).map((complaint) => (
                <ComplaintCard key={complaint._id} complaint={complaint} /> 
              ))}
            </div>
          )}
        </div>

        {/* Live City Map */}
        <div 
          className="p-6 rounded-3xl shadow-lg z-10 
          bg-gradient-to-br from-cyan-50/70 to-blue-50/70 border border-transparent
          transition duration-300 transform hover:shadow-2xl hover:scale-[1.03]"
        >
          {/* Heading: text-lg font-semibold (Medium Heading) */}
          <h2 className="text-lg font-semibold">Live City Map</h2>
          {/* Body Text: text-sm */}
          <p className="mt-1 text-sm text-slate-600">View civic activity across city clusters.</p>
          <div className="mt-5 rounded-2xl overflow-hidden shadow-xl">
            <MapView markers={complaints.slice(0, 10)} height="360px" />
          </div>
        </div>
      </section>

      {/* UPCOMING FEATURES */}
      <section 
        className="p-8 rounded-3xl shadow-lg 
        bg-gradient-to-br from-fuchsia-50/70 to-rose-50/70 border border-transparent
        transition duration-300 transform hover:shadow-2xl hover:scale-[1.01]"
      >
        {/* Heading: text-xl font-semibold (Medium Heading) */}
        <h2 className="text-xl font-semibold text-fuchsia-800">🚀 Upcoming Features</h2> 
        {/* Body Text: text-sm */}
        <p className="mt-2 text-sm text-slate-600">
          These features are planned for future development and will enhance your experience.
        </p>

        {/* Responsive Feature Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'AI-based Issue Detection',
            'Heatmap Analytics Dashboard',
            'WhatsApp Complaint Support',
            'Department Auto-Routing',
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl bg-white/70 p-6 border border-white 
              shadow-md transition duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              {/* Label: text-xs uppercase tracking-wide (Small Label) */}
              <p className="text-xs uppercase tracking-wider text-rose-500/80 font-semibold">Coming Soon</p>
              {/* Feature Title: text-base font-semibold (Body Text/Medium) */}
              <h3 className="mt-3 text-base font-semibold text-slate-800">{feature}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;