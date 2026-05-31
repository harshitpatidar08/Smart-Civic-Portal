import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ArrowUpDown, ShieldCheck, AlertOctagon, CheckCircle2, Clock3 } from 'lucide-react';
// Pure SVG circular progress — no recharts dependency needed
import ComplaintTable from '../components/ComplaintTable';
import { getDistrictComplaints, getSlaStats, getUserProfile } from '../services/api';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapOverlay from '../components/HeatmapOverlay';

const DistrictZoomer = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
       map.setMaxBounds(bounds);
    }
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, bounds, map]);
  return null;
};

const STATE_COORDINATES = {
  'Madhya Pradesh': { center: [23.4733, 77.9470], zoom: 7 },
  'Maharashtra': { center: [19.7515, 75.7139], zoom: 7 },
  'Uttar Pradesh': { center: [26.8467, 80.9462], zoom: 7 },
  'Rajasthan': { center: [27.0238, 74.2179], zoom: 7 },
  'Gujarat': { center: [22.2587, 71.1924], zoom: 7 },
  'Karnataka': { center: [15.3173, 75.7139], zoom: 7 },
  'Tamil Nadu': { center: [11.1271, 78.6569], zoom: 7 },
  'West Bengal': { center: [22.9868, 87.8550], zoom: 7 },
  'Andhra Pradesh': { center: [15.9129, 79.7400], zoom: 7 },
  'Arunachal Pradesh': { center: [28.2180, 94.7278], zoom: 7 },
  'Assam': { center: [26.2006, 92.9376], zoom: 7 },
  'Bihar': { center: [25.0961, 85.3131], zoom: 7 },
  'Chhattisgarh': { center: [21.2787, 81.8661], zoom: 7 },
  'Goa': { center: [15.2993, 74.1240], zoom: 9 },
  'Haryana': { center: [29.0588, 76.0856], zoom: 7 },
  'Himachal Pradesh': { center: [31.1048, 77.1665], zoom: 7 },
  'Jharkhand': { center: [23.6102, 85.2799], zoom: 7 },
  'Kerala': { center: [10.8505, 76.2711], zoom: 7 },
  'Manipur': { center: [24.6637, 93.9063], zoom: 8 },
  'Meghalaya': { center: [25.4670, 91.3662], zoom: 8 },
  'Mizoram': { center: [23.1645, 92.9376], zoom: 8 },
  'Nagaland': { center: [26.1584, 94.5624], zoom: 8 },
  'Odisha': { center: [20.9517, 85.0985], zoom: 7 },
  'Punjab': { center: [31.1471, 75.3412], zoom: 7 },
  'Sikkim': { center: [27.5330, 88.5122], zoom: 8 },
  'Telangana': { center: [18.1124, 79.0193], zoom: 7 },
  'Tripura': { center: [23.9408, 91.9882], zoom: 8 },
  'Uttarakhand': { center: [30.0668, 79.0193], zoom: 7 },
  'Delhi': { center: [28.7041, 77.1025], zoom: 10 }
};

const DISTRICT_COORDINATES = {
  'Bhopal': { center: [23.2599, 77.4126], zoom: 11 },
  'Indore': { center: [22.7196, 75.8577], zoom: 11 },
  'Gwalior': { center: [26.2124, 78.1772], zoom: 11 },
  'Jabalpur': { center: [23.1815, 79.9864], zoom: 11 },
  'Ujjain': { center: [23.1765, 75.7885], zoom: 11 },
  'Mumbai': { center: [19.0760, 72.8777], zoom: 11 },
  'Pune': { center: [18.5204, 73.8567], zoom: 11 },
  'Nagpur': { center: [21.1458, 79.0882], zoom: 11 },
  'Thane': { center: [19.2183, 72.9781], zoom: 11 },
  'Nashik': { center: [19.9975, 73.7898], zoom: 11 },
  'Lucknow': { center: [26.8467, 80.9462], zoom: 11 },
  'Kanpur': { center: [26.4499, 80.3319], zoom: 11 },
  'Noida': { center: [28.5355, 77.3910], zoom: 11 },
  'Varanasi': { center: [25.3176, 82.9739], zoom: 11 },
  'Agra': { center: [27.1767, 78.0081], zoom: 11 },
  'Jaipur': { center: [26.9124, 75.7873], zoom: 11 },
  'Jodhpur': { center: [26.2389, 73.0243], zoom: 11 },
  'Udaipur': { center: [24.5854, 73.7125], zoom: 11 },
  'Kota': { center: [25.2138, 75.8648], zoom: 11 },
  'Ahmedabad': { center: [23.0225, 72.5714], zoom: 11 },
  'Surat': { center: [21.1702, 72.8311], zoom: 11 },
  'Vadodara': { center: [22.3072, 73.1812], zoom: 11 },
  'Rajkot': { center: [22.3039, 70.8022], zoom: 11 },
  'Bangalore': { center: [12.9716, 77.5946], zoom: 11 },
  'Mysore': { center: [12.2958, 76.6394], zoom: 11 },
  'Mangalore': { center: [12.9141, 74.8560], zoom: 11 },
  'Hubli': { center: [15.3647, 75.1240], zoom: 11 },
  'Chennai': { center: [13.0827, 80.2707], zoom: 11 },
  'Coimbatore': { center: [11.0168, 76.9558], zoom: 11 },
  'Madurai': { center: [9.9252, 78.1198], zoom: 11 },
  'Kolkata': { center: [22.5726, 88.3639], zoom: 11 },
  'Howrah': { center: [22.5958, 88.3231], zoom: 11 },
  'Darjeeling': { center: [27.0410, 88.2663], zoom: 11 },
  'Central Delhi': { center: [28.6448, 77.2167], zoom: 12 },
  'New Delhi': { center: [28.6139, 77.2090], zoom: 12 },
  'North Delhi': { center: [28.7041, 77.1025], zoom: 12 },
  'South Delhi': { center: [28.5355, 77.2090], zoom: 12 }
};

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slaData, setSlaData] = useState(null);
  const [district, setDistrict] = useState("");
  const [userState, setUserState] = useState("");
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [mapBounds, setMapBounds] = useState([[6.5, 68.1], [35.7, 97.4]]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const userRes = await getUserProfile();
        const userDistrict = userRes?.data?.district || "";
        const uState = userRes?.data?.state || "";
        setDistrict(userDistrict);
        setUserState(uState);
        
        if (userDistrict && DISTRICT_COORDINATES[userDistrict]) {
           const { center, zoom } = DISTRICT_COORDINATES[userDistrict];
           setMapCenter(center);
           setMapZoom(zoom);
           setMapBounds([
               [center[0] - 0.5, center[1] - 0.5],
               [center[0] + 0.5, center[1] + 0.5]
           ]);
        } else if (uState && STATE_COORDINATES[uState]) {
           const { center, zoom } = STATE_COORDINATES[uState];
           setMapCenter(center);
           setMapZoom(zoom);
           setMapBounds([
               [center[0] - 3, center[1] - 3],
               [center[0] + 3, center[1] + 3]
           ]);
        }

        const res = await getDistrictComplaints(userDistrict || "Unknown District");
        if (res.success) setComplaints(res.data);
      } catch (error) {
        console.error("Failed to load complaints or profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (district) {
      getSlaStats(district)
        .then(res => { if (res.success) setSlaData(res.data); })
        .catch(err => console.error('SLA stats failed', err));
    }
  }, [district]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [sortPriority, setSortPriority] = useState('desc');

  const heatmapPoints = useMemo(() => {
    return complaints
      .filter(c => c.latitude && c.longitude)
      .map(c => [
        parseFloat(c.latitude),
        parseFloat(c.longitude),
        c.priority_score ? c.priority_score / 100 : 0.5
      ]);
  }, [complaints]);



  const processedComplaints = useMemo(() => {
    let result = [...complaints];
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus);
    result.sort((a, b) => {
      const diff = (b.priority_score || 0) - (a.priority_score || 0);
      return sortPriority === 'desc' ? diff : -diff;
    });
    return result;
  }, [complaints, filterStatus, sortPriority]);

  // Derived SLA scaffold fallback from loaded complaints when API has no data yet
  const sla = useMemo(() => {
    if (slaData) return slaData;
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;
    const escalated = complaints.filter(c => c.status === 'escalated').length;
    const breached = complaints.filter(c => {
      const days = (new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24);
      return c.status !== 'resolved' && days > 7;
    }).length;
    const compliancePct = total === 0 ? 0 : Math.round(((total - breached) / total) * 100);
    return { total, resolved, pending, inProgress, escalated, breachedSla: breached, compliancePct, slaDays: 7 };
  }, [slaData, complaints]);

  const chartColor = sla.compliancePct >= 80 ? '#22c55e' : sla.compliancePct >= 50 ? '#f59e0b' : '#ef4444';

  const statCards = [
    { label: 'Total This Month', value: sla.total, icon: <ShieldCheck className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Resolved', value: sla.resolved, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { label: 'Pending', value: sla.pending, icon: <Clock3 className="w-5 h-5" />, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
    { label: 'SLA Breached', value: sla.breachedSla, icon: <AlertOctagon className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">District Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{district || 'Unknown District'} • Managing reported issues</p>
        </div>
        {!loading && !district && (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-3 rounded-lg flex items-center shadow-sm w-full md:w-auto mt-4 md:mt-0">
            <AlertOctagon className="w-5 h-5 mr-2 text-amber-500 shrink-0" />
            <span className="text-sm font-medium">Your district is not configured. Please contact the State Admin.</span>
          </div>
        )}
      </div>

      {/* SLA Compliance Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" /> SLA Compliance Tracker
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Month-to-date • {sla.slaDays}-day SLA target</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            sla.compliancePct >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
            sla.compliancePct >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>
            {sla.compliancePct >= 80 ? '🟢 On Track' : sla.compliancePct >= 50 ? '🟡 At Risk' : '🔴 Critical'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Circular Chart — pure SVG, zero dependencies */}
          <div className="relative w-44 h-44 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="38" fill="none"
                stroke={chartColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - sla.compliancePct / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: chartColor }}>{sla.compliancePct}%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Compliant</span>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {statCards.map(card => (
              <div key={card.label} className={`flex items-center gap-3 p-4 rounded-xl border ${card.bg} ${card.border}`}>
                <div className={`${card.color} p-2 rounded-lg bg-white shadow-sm`}>
                  {card.icon}
                </div>
                <div>
                  <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                  <div className="text-xs font-semibold text-slate-500">{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA progress bar row */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>Within SLA</span><span>{sla.compliancePct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${sla.compliancePct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>SLA Breached</span>
              <span>{sla.total === 0 ? 0 : Math.round((sla.breachedSla / sla.total) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${sla.total === 0 ? 0 : Math.round((sla.breachedSla / sla.total) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ward-wise Heatmap */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          📍 Ward-wise Complaint Heatmap
        </h2>
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative">
          <MapContainer 
            key={`${mapCenter[0]}-${mapCenter[1]}`}
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            minZoom={5}
            maxBounds={mapBounds}
            maxBoundsViscosity={1.0}
          >
            <DistrictZoomer center={mapCenter} zoom={mapZoom} bounds={mapBounds} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {heatmapPoints.length > 0 && <HeatmapOverlay points={heatmapPoints} />}
            {/* Clickable complaint pins */}
            {complaints.filter(c => c.latitude && c.longitude).map((c, i) => {
              const markerColor = c.status === 'resolved' ? '#22c55e' : c.status === 'in_progress' ? '#eab308' : '#ef4444';
              return (
              <CircleMarker
                key={c.id || i}
                center={[parseFloat(c.latitude), parseFloat(c.longitude)]}
                radius={8}
                pathOptions={{ color: '#ffffff', fillColor: markerColor, fillOpacity: 1, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-left font-sans min-w-[150px]">
                    <p className="font-bold text-slate-800 text-sm mb-1">{c.title || 'Civic Issue'}</p>
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          c.status === 'resolved' ? 'bg-green-100 text-green-700' : c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                       }`}>
                          {c.status?.replace('_', ' ') || 'pending'}
                       </span>
                       <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold capitalize">{c.category?.replace('_', ' ') || 'Other'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-0.5">Priority: <span className="font-semibold text-red-600">{c.priority_score || 'N/A'}/100</span></p>
                    <p className="text-[10px] text-slate-400 mt-1">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </Tooltip>
              </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Live Complaint Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Active Complaints</h2>
            {loading && <span className="text-sm text-slate-500 animate-pulse">Updating...</span>}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none capitalize text-slate-700 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <button
              onClick={() => setSortPriority(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors whitespace-nowrap"
            >
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              Priority {sortPriority === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
        <ComplaintTable complaints={processedComplaints} isAdmin={true} />
      </div>
    </div>
  );
};

export default AdminDashboard;
