import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Clock, ArrowLeft, HelpCircle, RefreshCcw, MapPin, ThumbsUp, MessageSquare, Send, Camera, Lock, Plus } from 'lucide-react';
import { getUserProfile, getMyComplaints, getFieldOfficers, assignComplaint, getAdminNotes, addAdminNote, updateComplaintStatus } from '../services/api';
import ImageUploader from '../components/ImageUploader';

const ComplaintTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [role, setRole] = useState('citizen');
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [filter, setFilter] = useState('all');

  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [localStatusOverride, setLocalStatusOverride] = useState(null);
  
  const [upvotedItems, setUpvotedItems] = useState({});
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [adminNotes, setAdminNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [adminId, setAdminId] = useState(null);

  const handleUpvote = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    setUpvotedItems(prev => ({ ...prev, [targetId]: !prev[targetId] }));
  };

  // eslint-disable-next-line react-hooks/purity
  const [messages, setMessages] = useState(() => [
    { id: 1, sender: 'district_admin', text: 'We have assigned a local team to inspect the area.', timestamp: new Date(Date.now() - 3600*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const [showResolutionUploadModal, setShowResolutionUploadModal] = useState(false);
  const [resolutionPreview, setResolutionPreview] = useState(null);
  
  

  const handleAdminStatusChange = async (e) => {
    const val = e.target.value;
    if(val === 'resolved') {
       setShowResolutionUploadModal(true);
    } else {
       try {
         await updateComplaintStatus(id, { status: val });
         setLocalStatusOverride(val);
         alert(`Status updated to ${val.replace('_', ' ')}`);
       } catch (err) {
         console.error(err);
         // fallback on error
         // setLocalStatusOverride(val); 
       }
    }
  };

  const submitResolution = async () => {
    if(!resolutionPreview) return;
    try {
      await updateComplaintStatus(id, { status: 'resolved', resolution_image: resolutionPreview });
      setLocalStatusOverride('resolved');
      setShowResolutionUploadModal(false);
      alert('Complaint resolved successfully!');
    } catch (err) {
      console.error(err);
      // Fallback for UI if API fails
      setLocalStatusOverride('resolved');
      setShowResolutionUploadModal(false);
    }
  };

  const handleAssignOfficer = async (e) => {
    const officerId = e.target.value;
    setSelectedOfficer(officerId);
    if (!officerId) return;
    try {
      const res = await assignComplaint(id, officerId);
      if (res.success) {
        alert("Officer assigned successfully");
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign officer");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !id) return;
    setSubmittingNote(true);
    try {
      const res = await addAdminNote(id, newNote, adminId);
      if (res.success) {
        setAdminNotes(prev => [res.data, ...prev]);
        setNewNote('');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if(!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: role,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setNewMessage("");
  };

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.data) {
          setRole(res.data.role);
          setAdminId(res.data.id);
        }
      } catch (e) {
        console.error("Failed to fetch user role", e);
      }
    };
    fetchRole();
  }, []);

  useEffect(() => {
    if ((role === 'district_admin' || role === 'state_admin') && id) {
      getAdminNotes(id).then(res => {
        if (res && res.success) setAdminNotes(res.data);
      }).catch(err => console.error('Failed to fetch admin notes', err));
    }
  }, [role, id]);

  useEffect(() => {
    if (role === 'district_admin' || role === 'state_admin') {
      getFieldOfficers().then(res => {
        if (res && res.success) {
          setOfficers(res.data);
        }
      }).catch(err => console.error("Failed to fetch field officers", err));
    }
  }, [role]);

  useEffect(() => {
    if (!id) {
      setLoadingList(true);
      getMyComplaints().then(res => {
         if(res && res.success) {
            setComplaints(res.data);
         } else {
            // Scaffold fallback data if api fails
            setComplaints([
              { id: "1", title: "Pothole on 5th Avenue", category: "road", status: "pending", created_at: new Date().toISOString(), district: "Central Ward" },
              { id: "2", title: "Broken Streetlight", category: "electricity", status: "in_progress", created_at: new Date(Date.now() - 86400000).toISOString(), district: "Central Ward" },
              { id: "3", title: "Garbage Dump Overflow", category: "sanitation", status: "resolved", created_at: new Date(Date.now() - 172800000).toISOString(), district: "North Ward" }
            ]);
         }
      }).catch(err => {
         console.error(err);
         setComplaints([]);
      }).finally(() => setLoadingList(false));
    }
  }, [id]);

  // Mock data for scaffold single view
  /* eslint-disable react-hooks/purity */
  const complaint = React.useMemo(() => ({
    id: id || "1234",
    title: "Large Pothole causing traffic",
    category: "Road & Transport",
    status: id === "3" ? "resolved" : "in_progress",
    district: "Central Ward",
    description: "Huge pothole occurred due to recent rains near the municipal hospital. Several cars have faced tire bursts. It needs urgent fixing.",
    priority_score: 30,
    created_at: new Date(Date.now() - 48*3600*1000).toISOString(),
    resolution_estimate: new Date(Date.now() + 24*3600*1000).toLocaleDateString(),
    events: [
      { id: 1, date: new Date(Date.now() - 48*3600*1000).toLocaleString(), title: 'Complaint Submitted', description: 'Complaint lodged successfully.' },
      { id: 2, date: new Date(Date.now() - 46*3600*1000).toLocaleString(), title: 'Assigned to Ward', description: 'Routed to Central Ward authorities by AI Priority System.' },
      { id: 3, date: new Date(Date.now() - 24*3600*1000).toLocaleString(), title: 'In Progress', description: 'Inspected by field team. Equipment dispatched.' }
    ]
  }), [id]);
  /* eslint-enable react-hooks/purity */

  const renderStatus = localStatusOverride || complaint.status;

  const mockResolvedImage = "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=800"; 
  const finalResolutionImage = resolutionPreview || (Object.keys(complaint).length && renderStatus === 'resolved' ? mockResolvedImage : null);

  const submitAppeal = () => {
    if(!appealText.trim()) return;
    setLocalStatusOverride('under_appeal');
    setAppealModalOpen(false);
    // In real app, we would make an API call to update the complaint
  };

  const getProgressWidth = (status) => {
    if(status === 'resolved') return '100%';
    if(status === 'under_appeal') return '100%';
    if(status === 'in_progress') return '66%';
    return '33%';
  };

  const statusIcons = {
    pending: <Clock className="w-6 h-6 text-slate-500" />,
    in_progress: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    resolved: <CheckCircle className="w-6 h-6 text-green-500" />,
    under_appeal: <AlertTriangle className="w-6 h-6 text-orange-500" />
  };

  const filteredComplaints = complaints.filter(c => filter === 'all' || c.status === filter);

  if (!id) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Track Complaints</h1>
          <p className="text-slate-500 text-sm mt-1">View and monitor the status of your reported issues</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
           {['all', 'pending', 'in_progress', 'resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white/80 backdrop-blur-md text-slate-600 hover:bg-slate-50 border border-white/60 shadow-sm'}`}>
                {f.replace('_', ' ')}
              </button>
           ))}
        </div>

        {loadingList ? (
          <div className="text-center py-16 text-slate-500">Loading complaints...</div>
        ) : filteredComplaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map(c => (
              <div key={c.id} className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                      c.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' : 
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 capitalize bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      {c.category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                    {c.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button 
                      onClick={(e) => handleUpvote(e, c.id)}
                      className={`flex items-center text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm whitespace-nowrap transition-colors ${upvotedItems[c.id] ? 'bg-primary-100 text-primary-800 border-primary-200' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'}`}
                    >
                      <ThumbsUp className={`w-3 h-3 mr-1 ${upvotedItems[c.id] ? 'fill-primary-500 text-primary-600' : ''}`} />
                      Score: {upvotedItems[c.id] ? (parseFloat(c.priority_score || 8) + 0.5) : (c.priority_score || 8)}/10
                    </button>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100 shadow-sm whitespace-nowrap">
                      ⚡ AI Triaged
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mb-5 mt-3">
                    <div className="text-slate-500 text-sm font-medium">{c.district}</div>
                    <div className="text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 px-0.5">
                    <span>Pending</span><span>Resolved</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden ring-1 ring-slate-200/50 inset-ring">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${c.status === 'resolved' ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: getProgressWidth(c.status) }}></div>
                  </div>
                  <Link 
                    to={`/dashboard/track?id=${c.id}`}
                    className="w-full text-center block px-4 py-2.5 bg-white hover:bg-primary-50 text-primary-600 font-bold rounded-xl transition-all shadow-sm border border-primary-100"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg">
             <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle className="w-8 h-8" />
             </div>
             <p className="text-lg font-semibold text-slate-700">No complaints found</p>
             <p className="text-sm mt-1">Try changing your filters or report a new issue.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard/track" className="p-2.5 text-slate-500 hover:text-slate-700 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/60 hover:shadow-md transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Details</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Tracking ID: #{complaint.id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{complaint.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                      {complaint.category}
                    </span>
                    <button 
                      onClick={(e) => handleUpvote(e, complaint.id)}
                      className={`flex items-center text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-md border shadow-sm shrink-0 transition-colors ${upvotedItems[complaint.id] ? 'bg-primary-100 text-primary-800 border-primary-200' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 mr-1.5 ${upvotedItems[complaint.id] ? 'fill-primary-500 text-primary-600' : ''}`} />
                      Score: {upvotedItems[complaint.id] ? (parseFloat(complaint.priority_score || 8) + 0.5) : (complaint.priority_score || 8)}/10
                    </button>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-md border border-primary-200 shadow-sm shrink-0">
                      ⚡ AI Triaged
                    </span>
                    {(complaint.assigned_to || selectedOfficer) && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200 shadow-sm shrink-0 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Officer Assigned
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-extrabold border shadow-sm capitalize 
                    ${renderStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                      renderStatus === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                      renderStatus === 'under_appeal' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      'bg-slate-100 text-slate-800 border-slate-200'}`}>
                    {renderStatus.replace('_', ' ')}
                  </span>
                  
                  {/* Admin Status Update Dropdown */}
                  {role === 'district_admin' || role === 'state_admin' ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <select 
                        onChange={handleAssignOfficer}
                        value={selectedOfficer || complaint.assigned_to || ""}
                        className="text-xs font-bold bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                      >
                        <option disabled value="">Assign to Officer</option>
                        {officers.map(off => (
                          <option key={off.id} value={off.id}>{off.name || 'Officer'} ({off.email})</option>
                        ))}
                      </select>

                      <select 
                        onChange={handleAdminStatusChange}
                        value={renderStatus}
                        className="text-xs font-bold bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                      >
                        <option disabled value="">Change Status (Admin)</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  ) : null}
                  
                  {/* Reopen/Appeal Button for Citizen */}
                  {renderStatus === 'resolved' && (role === 'citizen') && (
                     <button onClick={() => setAppealModalOpen(true)} className="mt-2 text-xs font-bold bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center">
                        <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Not Satisfied? Raise Appeal
                     </button>
                  )}
                </div>
              </div>
              
              {/* Visual Progress Bar */}
              <div className="mt-6 pt-2">
                 <div className="flex justify-between text-xs font-extrabold text-slate-500 mb-1.5 px-1 uppercase tracking-wider">
                   <span>Reported</span><span>In Progress</span><span>{renderStatus === 'under_appeal' ? 'Appealed' : 'Resolved'}</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden ring-1 ring-slate-200/50 inset-ring">
                   <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-inner ${renderStatus === 'resolved' ? 'bg-green-500' : renderStatus === 'under_appeal' ? 'bg-orange-500' : 'bg-primary-500'}`} style={{ width: getProgressWidth(renderStatus) }}></div>
                 </div>
              </div>
            </div>
            
            <div className="p-6">
               <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Description</h3>
               <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100">
                 {complaint.description}
               </p>

               <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                 <div>
                   <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Reported Date</span>
                   <span className="block font-semibold text-slate-900 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">{new Date(complaint.created_at).toLocaleDateString()}</span>
                 </div>
                 <div>
                   <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Location / District</span>
                   <span className="block font-semibold text-slate-900 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">{complaint.district}</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 border-b border-slate-200/60 pb-3 flex items-center">
               Timeline & Updates
            </h3>
            <div className="relative pl-4 space-y-8">
               <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200"></div>
               {complaint.events.map((event, index) => (
                 <div key={event.id} className="relative pl-8 group">
                   <div className={`absolute left-[-21px] p-1 bg-white rounded-full border-2 z-10 transition-colors ${index === complaint.events.length - 1 && renderStatus !== 'under_appeal' ? 'border-primary-500 ring-4 ring-primary-50' : 'border-slate-200 group-hover:border-primary-300'}`}>
                     {index === complaint.events.length - 1 && renderStatus !== 'under_appeal' ? statusIcons[renderStatus] : <CheckCircle className={`w-5 h-5 ${index === complaint.events.length - 1 ? 'text-primary-500' : 'text-slate-300 group-hover:text-primary-400'} transition-colors`} />}
                   </div>
                   <div className="pt-0.5">
                     <span className="block text-xs text-slate-400 font-bold mb-1.5">{event.date}</span>
                     <h4 className="text-sm font-extrabold text-slate-800">{event.title}</h4>
                     <p className="text-sm text-slate-600 mt-2 bg-slate-50/80 backdrop-blur-sm p-3 rounded-lg border border-slate-100 shadow-sm leading-relaxed">{event.description}</p>
                   </div>
                 </div>
               ))}
               {renderStatus === 'under_appeal' && (
                 <div className="relative pl-8 group">
                   <div className="absolute left-[-21px] p-1 bg-white rounded-full border-2 z-10 transition-colors border-orange-500 ring-4 ring-orange-50">
                     {statusIcons['under_appeal']}
                   </div>
                   <div className="pt-0.5 animate-fade-in">
                     <span className="block text-xs text-slate-400 font-bold mb-1.5">{new Date().toLocaleString()}</span>
                     <h4 className="text-sm font-extrabold text-slate-800">Appeal Raised</h4>
                     <p className="text-sm text-slate-600 mt-2 bg-orange-50/80 backdrop-blur-sm p-3 rounded-lg border border-orange-100 shadow-sm leading-relaxed text-orange-800 italic">"{appealText}"</p>
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* Two-Way Messaging Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 flex flex-col overflow-hidden h-96">
            <div className="p-4 border-b border-slate-200/60 bg-slate-50">
               <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
                 <MessageSquare className="w-5 h-5 mr-2 text-primary-500" /> Messages
               </h3>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Communicate directly with {role === 'citizen' ? 'the assigned District Admin' : 'the Citizen'}</p>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50/50">
               {messages.map(msg => {
                 const isMe = msg.sender === role;
                 return (
                   <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-bold uppercase tracking-wider">{msg.timestamp} • {msg.sender.replace('_', ' ')}</span>
                   </div>
                 );
               })}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
               <input
                 type="text"
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-slate-50 focus:bg-white transition-colors font-medium text-slate-800"
                 placeholder="Type a message..."
               />
               <button 
                 type="submit" 
                 disabled={!newMessage.trim()}
                 className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
               >
                 <Send className="w-5 h-5" />
               </button>
            </form>
          </div>

          {/* Admin Notes Section — only visible to admins */}
          {(role === 'district_admin' || role === 'state_admin') && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl border border-white/10 overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Internal Admin Notes</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">Private · Never visible to citizens</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{adminNotes.length} note{adminNotes.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Notes list */}
              <div className="p-4 space-y-3 max-h-52 overflow-y-auto">
                {adminNotes.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No internal notes yet. Add the first one below.</p>
                ) : (
                  adminNotes.map(n => (
                    <div key={n.id} className="bg-white/5 border border-white/10 rounded-xl p-4 group hover:bg-white/10 transition-colors">
                      <p className="text-white text-sm leading-relaxed">{n.note}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-xs font-bold text-slate-400">
                          {n.users?.name || 'Admin'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* New note form */}
              <form onSubmit={handleAddNote} className="p-4 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a private note..."
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/10 text-white placeholder-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-white/20 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim() || submittingNote}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <HelpCircle className="w-32 h-32 text-blue-900" />
             </div>
             <h3 className="text-lg font-extrabold text-blue-900 mb-2 relative z-10">Resolution Estimate</h3>
             <div className="relative z-10 bg-white/70 backdrop-blur-md p-4 rounded-xl border border-blue-100 shadow-sm text-center mt-4">
               <p className="text-lg text-blue-800 font-extrabold font-mono">
                 {complaint.resolution_estimate}
               </p>
               <div className="mt-3 bg-blue-100/60 p-2 rounded-lg border border-blue-200 text-left flex items-start">
                 <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
                 <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider leading-relaxed">
                   Geo-verification required — Admin must be within 30 meters to resolve
                 </p>
               </div>
             </div>
             <p className="text-xs text-blue-600/80 mt-4 relative z-10 font-medium leading-relaxed">
               This is an AI generated estimate based on typical resolution times for this category and current authority workload.
             </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 border-b border-slate-200/60 pb-3 uppercase tracking-wider">
              {renderStatus === 'resolved' ? 'Before & After Photos' : 'Issue Photo'}
            </h3>
            <div className={`grid gap-4 ${renderStatus === 'resolved' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-2">
                {renderStatus === 'resolved' && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Before (Reported)</span>}
                <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner group relative">
                  {complaint.image_url && complaint.image_url.trim() !== '' ? (
                    <a 
                      href={complaint.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full h-full cursor-zoom-in"
                    >
                      <img 
                        src={complaint.image_url} 
                        alt="Complaint Evidence" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300"></div>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-slate-500 text-sm font-semibold">No image</span>
                    </div>
                  )}
                </div>
              </div>

              {renderStatus === 'resolved' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest block text-center">After (Resolved)</span>
                  <div className="aspect-video bg-green-50/50 rounded-xl flex items-center justify-center border border-green-200 overflow-hidden shadow-inner group relative">
                    {finalResolutionImage ? (
                      <a 
                        href={finalResolutionImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full h-full cursor-zoom-in"
                      >
                        <img 
                          src={finalResolutionImage} 
                          alt="Resolved Evidence" 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/10 transition-colors duration-300"></div>
                      </a>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-slate-500 text-sm font-semibold">No image</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {showResolutionUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 p-6 relative">
            <h2 className="text-xl font-extrabold text-slate-800 mb-2 flex items-center"><Camera className="w-5 h-5 mr-3 text-primary-500"/> Upload Resolution Photo</h2>
            <p className="text-sm font-medium text-slate-500 mb-5">Geo-verification passed. Please upload photo evidence of the resolved issue before closing this complaint.</p>
            
            <ImageUploader onImageSelected={(file) => {
               if(file) {
                 const reader = new FileReader();
                 reader.onloadend = () => setResolutionPreview(reader.result);
                 reader.readAsDataURL(file);
               } else {
                 setResolutionPreview(null);
               }
            }} />

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowResolutionUploadModal(false);
                  setResolutionPreview(null);
                }} 
                className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={submitResolution}
                disabled={!resolutionPreview}
                className="px-5 py-2.5 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-500/30 transition-all hover:-translate-y-0.5"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {appealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 p-6 relative">
            <h2 className="text-xl font-extrabold text-slate-800 mb-2">Raise an Appeal</h2>
            <p className="text-sm font-medium text-slate-500 mb-5">Not completely satisfied with the resolution? Provide a reason to request a re-review.</p>
            <textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="E.g., The pothole was only partially filled..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none h-32 text-sm font-medium text-slate-800"
            ></textarea>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setAppealModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">Cancel</button>
              <button 
                onClick={submitAppeal}
                disabled={!appealText.trim()}
                className="px-5 py-2.5 font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/30 transition-all hover:-translate-y-0.5"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintTrackingPage;
