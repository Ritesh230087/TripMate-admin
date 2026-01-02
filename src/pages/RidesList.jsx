import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Motorbike, Wallet, Ban, Activity, 
  Radio, FileText, Clock, Star
} from 'lucide-react';
import RideTrackingModal from '../components/RideDetailModal';
import FullRideDetailModal from '../components/FullRideDetailModal';

const RidesList = () => {
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({ 
    totalRides: 0, totalEarned: 0, ongoingCount: 0, cancelledCount: 0 
  });
  const [trackingRide, setTrackingRide] = useState(null);
  const [detailRide, setDetailRide] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { 
    fetchRides();
    fetchStats();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await API.get('/admin/rides');
      setRides(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const categories = ["All", "Pending", "Ongoing", "Completed", "Cancelled"];

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.fromLocation?.toLowerCase().includes(search.toLowerCase()) || 
      ride.rider?.fullName?.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "All") {
      if (statusFilter === "Pending") matchesStatus = ['active', 'booked', 'heading_to_pickup', 'arrived'].includes(ride.status);
      else matchesStatus = ride.status.toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-screen bg-[#F9F5E9]/20 font-sans">
      
      {/* --- 1. PERFORMANCE STATS (AT THE TOP) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Revenue" value={`Rs. ${stats.totalEarned}`} icon={<Wallet size={24}/>} color="text-green-600" bg="bg-green-50" isPrice />
        <StatCard label="Total Rides" value={stats.totalRides} icon={<Motorbike size={24}/>} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Ongoing" value={stats.ongoingCount} icon={<Activity size={24}/>} color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Cancelled" value={stats.cancelledCount} icon={<Ban size={24}/>} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* --- 2. RIDE LIST HEADER --- */}
      <div className="mb-2">
        <h1 className="text-3xl font-black text-[#2D1B08]">Ride List</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Overview of all trip activity</p>
      </div>

      {/* --- 3. SEARCH BAR (FILTER ICON REMOVED) --- */}
      <div className="relative mb-8 mt-4">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
        <input 
          type="text" 
          placeholder="Search by location or rider name..." 
          className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl shadow-sm border-none font-bold text-sm outline-none focus:ring-2 focus:ring-[#8B4513]/10"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- 4. HORIZONTAL FILTER (SCREENSHOT STYLE) --- */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar border-b border-gray-100">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setStatusFilter(cat)}
            className={`px-6 py-2.5 rounded-full text-sm font-black transition-all whitespace-nowrap ${
              statusFilter === cat 
              ? 'bg-[#8B4513] text-white shadow-lg' 
              : 'text-gray-400 hover:text-[#8B4513]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- 5. RIDE LIST --- */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredRides.length > 0 ? filteredRides.map((ride) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={ride._id}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-md transition-all relative"
            >
              {/* Rider Info Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={ride.rider?.profilePic?.startsWith('http') ? ride.rider.profilePic : `http://192.168.1.66:5000/${ride.rider?.profilePic}`} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#F9F5E9]" 
                    alt="" 
                    onError={(e) => e.target.src="https://ui-avatars.com/api/?name="+ride.rider?.fullName}
                  />
                  <div>
                    <p className="font-black text-[#2D1B08]">{ride.rider?.fullName || "Member"}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Partner</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-black text-gray-400">
                  <Star size={14} className="text-yellow-500" fill="currentColor" /> {ride.rider?.riderRating?.toFixed(1) || "5.0"}
                </div>
              </div>

              {/* Path & Price Box (Screenshot Design) */}
              <div className="bg-[#F8F9FA] p-5 rounded-[24px] flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Clock size={16} className="text-gray-400"/></div>
                  <div>
                    <p className="text-sm font-black text-[#2D1B08] uppercase">{ride.time}</p>
                    <p className="text-[11px] font-bold text-gray-400 truncate max-w-[200px]">
                      {ride.fromLocation?.split(',')[0]} <span className="mx-1 text-gray-300">→</span> {ride.toLocation?.split(',')[0]}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-black text-[#8B4513]">Rs {ride.price}</p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between">
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    ride.status === 'completed' ? 'bg-green-50 text-green-600' : 
                    ride.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                 }`}>
                   {ride.status.replace(/_/g, ' ')}
                 </span>

                 <div className="flex gap-2">
                    <button onClick={() => setTrackingRide(ride)} className="px-5 py-2.5 bg-[#8B4513]/5 text-[#8B4513] rounded-xl font-black text-[10px] uppercase hover:bg-[#8B4513] hover:text-white transition-all flex items-center gap-2">
                       <Radio size={14}/> Track
                    </button>
                    <button onClick={() => setDetailRide(ride)} className="px-5 py-2.5 bg-[#2D1B08] text-white rounded-xl font-black text-[10px] uppercase hover:opacity-90 transition-all flex items-center gap-2">
                       <FileText size={14}/> Detail
                    </button>
                 </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center bg-white/40 rounded-[40px] border-2 border-dashed border-gray-200">
               <p className="text-gray-400 font-bold uppercase tracking-widest">No matching rides found</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {trackingRide && <RideTrackingModal ride={trackingRide} onClose={() => setTrackingRide(null)} />}
        {detailRide && <FullRideDetailModal ride={detailRide} onClose={() => setDetailRide(null)} />}
      </AnimatePresence>
    </div>
  );
};

// --- ELITE SUB-COMPONENTS ---

const StatCard = ({ label, value, icon, color, bg, isPrice }) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-white flex items-center gap-6 transition-transform hover:scale-[1.02]">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black tracking-tighter ${isPrice ? 'text-[#8B4513]' : 'text-[#2D1B08]'}`}>{value}</p>
    </div>
  </div>
);

export default RidesList;