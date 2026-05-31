import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Mail, Lock, Building, AlertCircle } from 'lucide-react';
import { registerUser } from '../services/api';

const INDIA_STATES_DISTRICTS = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
  "Arunachal Pradesh": ["Itanagar", "Tawang"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur"],
  "Chhattisgarh": ["Raipur", "Bhilai"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Haryana": ["Gurugram", "Faridabad"],
  "Himachal Pradesh": ["Shimla", "Dharamshala"],
  "Jharkhand": ["Ranchi", "Dhanbad", "Jamshedpur"],
  "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "Telangana": ["Hyderabad", "Warangal"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Varanasi", "Agra"],
  "Uttarakhand": ["Dehradun", "Haridwar"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling"],
  "Delhi": ["Central Delhi", "New Delhi", "North Delhi", "South Delhi"]
};
const STATE_NAMES = Object.keys(INDIA_STATES_DISTRICTS);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    district: '',
    state: '',
    pincode: '',
    role: 'citizen'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData({ ...formData, state: value, district: '' });
    } else if (name === 'role') {
      setFormData({ ...formData, role: value, district: value === 'state_admin' ? '' : formData.district });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(formData);
      if (data.success) {
        // Automatic login or push to login page
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <MapPin className="text-primary-600 w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="name" type="text" required onChange={handleChange} value={formData.name}
                  className="pl-10 block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-slate-300 rounded-lg py-3 border bg-slate-50 focus:bg-white transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="email" type="email" required onChange={handleChange} value={formData.email}
                  className="pl-10 block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-slate-300 rounded-lg py-3 border bg-slate-50 focus:bg-white transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="password" type="password" required onChange={handleChange} value={formData.password}
                  className="pl-10 block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-slate-300 rounded-lg py-3 border bg-slate-50 focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className={`grid gap-4 ${formData.role === 'citizen' ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select name="role" onChange={handleChange} value={formData.role} className="block w-full pl-3 pr-10 py-3 text-sm focus:ring-primary-500 focus:border-primary-500 border-slate-300 rounded-lg border bg-slate-50 focus:bg-white transition-colors cursor-pointer appearance-none">
                    <option value="citizen">Citizen</option>
                    <option value="district_admin">District Admin</option>
                    <option value="state_admin">State Admin</option>
                  </select>
                </div>
              </div>

              {(formData.role === 'district_admin' || formData.role === 'state_admin') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">State</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <select name="state" required onChange={handleChange} value={formData.state} className="block w-full pl-3 pr-10 py-3 text-sm focus:ring-primary-500 focus:border-primary-500 border-slate-300 rounded-lg border bg-slate-50 focus:bg-white transition-colors cursor-pointer appearance-none">
                      <option value="">Select State</option>
                      {STATE_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {formData.role === 'district_admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">District</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <select name="district" required onChange={handleChange} value={formData.district} disabled={!formData.state} className="block w-full pl-3 pr-10 py-3 text-sm focus:ring-primary-500 focus:border-primary-500 border-slate-300 rounded-lg border bg-slate-50 focus:bg-white transition-colors cursor-pointer appearance-none disabled:opacity-50">
                        <option value="">Select District</option>
                        {formData.state && INDIA_STATES_DISTRICTS[formData.state]?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Pin Code</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        name="pincode" type="text" required onChange={handleChange} value={formData.pincode}
                        className="pl-3 block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-slate-300 rounded-lg py-3 border bg-slate-50 focus:bg-white transition-colors"
                        placeholder="e.g. 110001"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md shadow-primary-500/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
