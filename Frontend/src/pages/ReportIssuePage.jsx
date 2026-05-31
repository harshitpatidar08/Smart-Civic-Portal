import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapSelector from '../components/MapSelector';
import ImageUploader from '../components/ImageUploader';
import { AlertCircle, Send, MapPin, Tag, FileText, CheckCircle, X, Download } from 'lucide-react';
import { submitComplaint } from '../services/api';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'road',
    description: '',
    district: '',
    pinCode: '',
    latitude: null,
    longitude: null,
    image_url: '' // Optional for scaffold instead of actual file passing right now
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImageStr, setPreviewImageStr] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Frontend simulation of aiService.js and deduplicationService.js
  React.useEffect(() => {
    if (formData.description.length > 20) {
       setIsAnalyzing(true);
       const timer = setTimeout(() => {
          // AI Triaging Simulation
          setAiAnalysis({
            score: Math.floor(Math.random() * 3) + 7, // 7-9 score
            category: formData.category.replace('_', ' & ').replace(/\b\w/g, c => c.toUpperCase()),
            priority: 'High'
          });
          
          // Jaccard similarity/Duplicate Simulation
          if (formData.description.toLowerCase().includes('pothole') || formData.description.toLowerCase().includes('garbage')) {
            setIsDuplicate(true);
          } else {
            setIsDuplicate(false);
          }
          setIsAnalyzing(false);
       }, 800);
       return () => clearTimeout(timer);
    } else {
       setAiAnalysis(null);
       setIsDuplicate(false);
    }
  }, [formData.description, formData.category]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = React.useCallback((position) => {
    setFormData(prev => ({ ...prev, latitude: position.lat, longitude: position.lng }));
  }, []);

  const handleSearchLocation = async () => {
    if (!formData.district && !formData.pinCode) {
      alert("Please enter a Ward/Place or PIN code first.");
      return;
    }
    setIsLocating(true);
    const query = `${formData.district} ${formData.pinCode} India`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newCenter = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setMapCenter(newCenter);
        handleLocationSelect(newCenter);
      } else {
        alert('Location not found. Try a more specific place or check the PIN code.');
      }
    } catch (err) {
      console.error('Error fetching location', err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newCenter = { lat, lng };
          setMapCenter(newCenter);
          handleLocationSelect(newCenter);
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data && data.address) {
                const pin = data.address.postcode || "";
                const district = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.county || data.address.city || "";
                setFormData(prev => ({
                    ...prev,
                    pinCode: pin,
                    district: district
                }));
            }
          } catch(e) {
             console.error("Reverse geocoding failed", e);
          }

          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert('Could not get your location. Please check browser permissions.');
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleImageSelected = (file) => {
    if(file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         setPreviewImageStr(reader.result);
       };
       reader.readAsDataURL(file);
    } else {
       setPreviewImageStr(null);
    }
    setFormData({ ...formData, image_url: "mock-url.png" });
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if(formData.description.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return;
    }
    setError(null);
    setShowPreviewModal(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await submitComplaint(formData);
      if(data && data.success) {
        setSubmitted(true);
      } else {
        setError(data?.message || "Failed to submit complaint.");
      }
    } catch(err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
      if (error) setShowPreviewModal(true); // Keep modal open if error
      else setShowPreviewModal(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const doc = new jsPDF();
      const complaintId = `CMP-${Math.floor(Math.random() * 900000) + 100000}`;
      const dateStr = new Date().toLocaleDateString();
      
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("Smart Civic Portal", 20, 25);
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(16);
      doc.text("Complaint Receipt", 20, 60);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Receipt ID: ${complaintId}`, 20, 75);
      doc.text(`Date Submitted: ${dateStr}`, 20, 85);
      doc.text(`Category: ${formData.category}`, 20, 95);
      doc.text(`Location: ${formData.district} ${formData.pinCode}`, 20, 105);
      
      doc.setFont('helvetica', 'bold');
      doc.text("Issue Title:", 20, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(formData.title, 20, 130);
      
      if(aiAnalysis) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text(`AI Priority Score: ${aiAnalysis.score}/10`, 20, 150);
      }
      
      const qrDataUrl = await QRCode.toDataURL(`https://smartcivicportal.local/dashboard/track?id=${complaintId}`);
      doc.addImage(qrDataUrl, 'PNG', 150, 50, 40, 40);
      
      doc.save(`Receipt_${complaintId}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("Failed to generate PDF receipt.");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 glass-panel rounded-3xl shadow-2xl text-center animate-fade-in border border-slate-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Thank You for Reporting!</h1>
        <p className="text-slate-600 text-lg leading-relaxed mb-8">
          Your active participation is crucial. By reporting this issue, you are helping local authorities maintain a safe, clean, and beautiful environment for everyone in the community. Our teams will review this shortly.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/dashboard/citizen')} className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold transition-colors">
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/dashboard/track')} className="px-6 py-2.5 bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/30 rounded-lg font-bold transition-colors">
            Track Complaint
          </button>
        </div>
        <div className="mt-6 flex justify-center border-t border-slate-100 pt-6">
          <button onClick={handleDownloadReceipt} className="flex items-center text-primary-700 hover:text-white font-extrabold transition-all bg-primary-50 hover:bg-primary-600 px-6 py-3 rounded-xl border border-primary-200 shadow-sm hover:shadow-primary-500/30">
            <Download className="w-5 h-5 mr-3" /> Download PDF Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
        <p className="text-slate-500 text-sm mt-1">Provide details of the civic issue to notify authorities instantly</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-start shadow-sm border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleInitialSubmit} className="space-y-8">
        {/* Core Details */}
        <div className="glass-panel rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 mr-2 text-primary-500" /> Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Title</label>
              <input
                type="text" required name="title" onChange={handleChange} value={formData.title}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-colors"
                placeholder="e.g. Large pothole causing traffic"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="w-4 h-4 text-slate-400" />
                  </div>
                  <select
                    name="category" onChange={handleChange} value={formData.category}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-colors cursor-pointer appearance-none"
                  >
                    <option value="road">Road & Transport</option>
                    <option value="water_supply">Water Supply</option>
                    <option value="electricity">Electricity</option>
                    <option value="sanitation">Sanitation & Garbage</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">District / Ward / Famous Place</label>
                <input
                  type="text" required name="district" onChange={handleChange} value={formData.district}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="e.g. Central Ward or Mg Road"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text" required name="pinCode" onChange={handleChange} value={formData.pinCode} maxLength={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="e.g. 110001"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-semibold text-slate-700">Detailed Description</label>
                <span className={`text-xs font-medium ${formData.description.length > 500 ? 'text-red-500' : 'text-slate-500'}`}>
                  {formData.description.length}/500
                </span>
              </div>
              <textarea
                required name="description" rows="4" onChange={handleChange} value={formData.description}
                maxLength={500}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-colors resize-none ${formData.description.length >= 500 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
                placeholder="Describe the issue, landmarks, and severity..."
              ></textarea>
            </div>
            
            {/* AI Triaging & Deduplication Services UI */}
            <div className="space-y-3 mt-4">
              {isAnalyzing && (
                <div className="flex items-center text-sm font-bold text-slate-500 animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mr-2"></div>
                  AI is analyzing description...
                </div>
              )}
              {aiAnalysis && !isAnalyzing && (
                <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 shadow-sm text-xs font-extrabold text-red-700 uppercase tracking-widest">
                     <span className="mr-1.5 text-base">🔴</span> Priority: {aiAnalysis.score}/10 — {aiAnalysis.category}
                  </div>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100 shadow-sm text-xs font-extrabold text-primary-700 uppercase tracking-widest">
                     <span className="mr-1.5 text-base">⚡</span> AI Triaged
                  </div>
                </div>
              )}
              {isDuplicate && !isAnalyzing && (
                <div className="flex items-start bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm text-yellow-800 text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-yellow-600 mt-0.5" />
                  <div>
                    <span className="font-extrabold block mb-1 uppercase tracking-wider text-xs">Duplicate Warning (Jaccard Similarity)</span>
                    <span className="font-semibold">A similar issue has already been reported in your area. Do you still want to submit?</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Selection */}
        <div className="glass-panel rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 mr-2 text-primary-500" /> Pin Exact Location
          </h2>
          <p className="text-sm text-slate-500">Provide a location for the issue. You can detect automatically, search from inputs above, or click on the map.</p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button
               type="button"
               onClick={handleCurrentLocation}
               disabled={isLocating}
               className="flex-1 sm:flex-none justify-center items-center flex px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors text-sm"
            >
               {isLocating ? 'Detecting...' : '📍 Detect My Location'}
            </button>
            <button
               type="button"
               onClick={handleSearchLocation}
               disabled={isLocating || (!formData.district && !formData.pinCode)}
               className="flex-1 sm:flex-none justify-center items-center flex px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 font-medium transition-colors text-sm"
            >
               🔍 Search PIN/Ward on Map
            </button>
          </div>

          <MapSelector onLocationSelect={handleLocationSelect} mapCenter={mapCenter} />
          {(!formData.latitude) && (
             <div className="flex items-start bg-red-50 text-red-700 p-3 rounded-md text-sm mt-3">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                <p>Location is required. Please find or pin a location on the map above.</p>
             </div>
          )}
        </div>

        {/* Media Upload */}
        <div className="glass-panel rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-3">
            <AlertCircle className="w-5 h-5 mr-2 text-primary-500" /> Upload Evidence
          </h2>
          <p className="text-sm text-slate-500">Provide an image of the issue to help authorities assess the situation faster.</p>
          <ImageUploader onImageSelected={handleImageSelected} />
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!formData.latitude || loading}
            className={`flex items-center px-8 py-3 rounded-lg font-bold shadow-lg transition-all ${
              (!formData.latitude || loading)
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'
            }`}
          >
            {loading ? 'Submitting...' : (
               <>Submit Complaint <Send className="w-5 h-5 ml-2" /></>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50">
            <div className="p-6 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Confirm Details</h2>
              <button 
                type="button" 
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Title</p>
                  <p className="font-medium text-slate-900">{formData.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Category</p>
                  <p className="font-medium text-slate-900 capitalize">{formData.category.replace('_', ' ')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Location</p>
                  <p className="font-medium text-slate-900">{formData.district} {formData.pinCode}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Description</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{formData.description}</p>
                </div>
              </div>
              {previewImageStr && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Attached Image Summary</p>
                  <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                    <img src={previewImageStr} alt="Preview" className="object-contain h-full w-full" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200/60 flex justify-end gap-3 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
                disabled={loading}
              >
                Edit Details
              </button>
              <button 
                type="button" 
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-lg font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/30 transition-all flex items-center hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Confirm & Submit'}
                {!loading && <Send className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssuePage;
