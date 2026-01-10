import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, MapPin, Activity, Zap, CreditCard, 
  ShieldCheck, Radio, ChevronRight, RotateCcw, User, Flag, Bike
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import io from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- OSRM ROAD ENGINE ---
const fetchRoad = async (start, end, profile = 'driving') => {
  if (!start || !end || !start.lat || !end.lat) return [];
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
    const data = await res.json();
    return data.routes?.[0]?.geometry?.coordinates.map(c => [c[1], c[0]]) || [];
  } catch (e) { return [[start.lat, start.lng], [end.lat, end.lng]]; }
};

// --- ELITE CUSTOM ICONS ---
const createIcon = (svgPath, color, fill = "none") => L.divIcon({
  html: `<div style="background:white; width:46px; height:46px; border-radius:15px; border:3px solid ${color}; color:${color}; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(0,0,0,0.15);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
        </div>`,
  className: 'custom-marker', iconSize: [46, 46], iconAnchor: [23, 46],
});

const bikeSvg = `<path d="M5.5 17.5c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5-4.5 2.015-4.5 4.5 2.015 4.5 4.5 4.5z"/><path d="M18.5 17.5c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5-4.5 2.015-4.5 4.5 2.015 4.5 4.5 4.5z"/><path d="M15 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="m8 13 4-5h3l4 5"/><path d="M12 8v5"/>`;
const userSvg = `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`;
const meetingSvg = `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/>`;
const flagSvg = `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>`;

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => { 
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, map.getZoom()); 
    }
  }, [coords, map]);
  return null;
};

const RideDetailModal = ({ ride: initialRide, onClose }) => {
  const [ride, setRide] = useState(initialRide);
  const [activeTab, setActiveTab] = useState('Summary'); 
  const [perspective, setPerspective] = useState('Rider');
  const [summaryStep, setSummaryStep] = useState(0);
  const [liveLocation, setLiveLocation] = useState(initialRide.fromLatLng);
  const [paxArrived, setPaxArrived] = useState(false);
  const [riderArrived, setRiderArrived] = useState(initialRide.status === 'arrived' || initialRide.status === 'ongoing');
  const [firstArrived, setFirstArrived] = useState(null); 
  const [paths, setPaths] = useState({ approach: [], walk: [], trip: [], goal: [], livePerspective: [] });

  const BASE_URL = "http://192.168.1.66:5000";

  const rStart = ride.fromLatLng || { lat: 0, lng: 0 };
  const pHome = ride.passengerActualPickup || rStart;
  const pickMP = ride.pickupMeetingPoint || pHome;
  const dropMP = ride.dropMeetingPoint || ride.toLatLng || rStart;
  const pFinal = ride.passengerActualDropoff || ride.toLatLng || rStart;

  const isDetour = ride.matchType === 'detour';
  const isSmart = ride.matchType === 'smart';

  useEffect(() => {
    const socket = io(BASE_URL);
    socket.emit('join_room', ride._id);
    socket.on('rider_location_updated', (data) => setLiveLocation({ lat: data.lat, lng: data.lng }));
    socket.on('status_updated', (data) => {
      setRide(p => ({ ...p, status: data.status }));
      if (data.status === 'arrived') {
        setRiderArrived(true);
        if (!firstArrived) setFirstArrived('rider');
      }
    });
    socket.on('passenger_ready_update', () => {
      setPaxArrived(true);
      if (!firstArrived) setFirstArrived('passenger');
    });

    const loadPaths = async () => {
      if (ride.status === 'active') return;
      const [a, w, t, g] = await Promise.all([
        fetchRoad(rStart, pickMP, 'driving'),
        fetchRoad(pHome, pickMP, 'driving'),
        fetchRoad(pickMP, dropMP, 'driving'),
        fetchRoad(dropMP, pFinal, 'driving')
      ]);
      setPaths({ approach: a, walk: w, trip: t, goal: g, livePerspective: [] });
    };
    loadPaths();
    return () => socket.disconnect();
  }, [ride._id, firstArrived]);

  useEffect(() => {
    const updateLiveLogic = async () => {
      if (ride.status === 'active') return;
      let segment = [];

      if (ride.status === 'ongoing') {
        segment = await fetchRoad(pickMP, dropMP, 'driving'); 
      } else if (ride.status === 'completed') {
        segment = []; 
      } else if (riderArrived && paxArrived) {
        segment = []; 
      } else if (isDetour) {
        // DETOUR LIVE PATH: Rider approach to passenger home
        if (!riderArrived) segment = await fetchRoad(liveLocation, pickMP, 'driving');
      } else if (riderArrived && !paxArrived) {
        segment = await fetchRoad(pHome, pickMP, 'driving');
      } else if (!riderArrived && paxArrived) {
        segment = await fetchRoad(liveLocation, pickMP, 'driving');
      } else {
        if (perspective === 'Rider') segment = await fetchRoad(liveLocation, pickMP, 'driving');
        else segment = await fetchRoad(pHome, pickMP, 'driving');
      }
      setPaths(prev => ({ ...prev, livePerspective: segment }));
    };
    if (activeTab === 'Live') updateLiveLogic();
  }, [liveLocation, perspective, ride.status, riderArrived, paxArrived, activeTab]);

  const isBooked = ride.status !== 'active';
  const summarySteps = [
    { title: "Rider Approach", desc: isDetour ? "Rider driving to passenger location." : "Rider driving to meeting point.", poly: paths.approach, m1: {pos: rStart, icon: bikeSvg, col: "#8B4513", fill: "currentColor"}, m2: {pos: pickMP, icon: isDetour ? userSvg : meetingSvg, col: isDetour ? "#3B82F6" : "#2D1B08"} },
    { title: "Passenger Walk", desc: "Passenger walking to meeting point.", poly: paths.walk, m1: {pos: pHome, icon: userSvg, col: "#3B82F6"}, m2: {pos: pickMP, icon: meetingSvg, col: "#2D1B08"}, hide: isDetour },
    { title: "Trip Ongoing", desc: "Shared ride on motorcycle.", poly: paths.trip, m1: {pos: pickMP, icon: bikeSvg, col: "#8B4513", fill: "currentColor"}, m2: {pos: dropMP, icon: flagSvg, col: "#10B981"} },
    { title: "Final Doorstep", desc: "Passenger walking to destination.", poly: paths.goal, m1: {pos: dropMP, icon: userSvg, col: "#3B82F6"}, m2: {pos: pFinal, icon: flagSvg, col: "#10B981"}, hide: !isSmart }
  ].filter(s => !s.hide);
  const current = summarySteps[summaryStep] || summarySteps[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1A0F05]/95 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-[1500px] h-[92vh] bg-[#F9F5E9] rounded-[60px] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        <div className="w-full lg:w-[68%] h-full relative bg-gray-200 border-r-4 border-white">
          <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={15} zoomControl={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {activeTab === 'Summary' && isBooked ? (
              <>
                {current.poly?.length > 0 && <Polyline positions={current.poly} color="#3B82F6" weight={8} />}
                {current.m1?.pos && <Marker position={[current.m1.pos.lat, current.m1.pos.lng]} icon={createIcon(current.m1.icon, current.m1.col, current.m1.fill)} />}
                {current.m2?.pos && <Marker position={[current.m2.pos.lat, current.m2.pos.lng]} icon={createIcon(current.m2.icon, current.m2.col)} />}
              </>
            ) : (
              <>
                {paths.livePerspective?.length > 0 && <Polyline positions={paths.livePerspective} color="#3B82F6" weight={8} />}
                
                {ride.status === 'active' ? (
                   <Marker position={[rStart.lat, rStart.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} />
                ) : ride.status === 'ongoing' ? (
                   <>
                     <Marker position={[pickMP.lat, pickMP.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} />
                     <Marker position={[dropMP.lat, dropMP.lng]} icon={createIcon(flagSvg, '#10B981')} />
                   </>
                ) : isDetour ? (
                   <>
                     {/* ✅ DETOUR LIVE MARKERS */}
                     {riderArrived ? (
                        <Marker position={[pickMP.lat, pickMP.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} />
                     ) : (
                        <>
                          <Marker position={[liveLocation.lat, liveLocation.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} />
                          <Marker position={[pickMP.lat, pickMP.lng]} icon={createIcon(userSvg, '#3B82F6')} />
                        </>
                     )}
                   </>
                ) : riderArrived && paxArrived ? (
                   <Marker position={[pickMP.lat, pickMP.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} />
                ) : (
                   <>
                     {firstArrived === 'rider' ? (
                        <>
                          <Marker position={[pickMP.lat, pickMP.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} />
                          <Marker position={[pHome.lat, pHome.lng]} icon={createIcon(userSvg, '#3B82F6')} />
                        </>
                     ) : firstArrived === 'passenger' ? (
                        <>
                          <Marker position={[pickMP.lat, pickMP.lng]} icon={createIcon(userSvg, '#3B82F6')} />
                          <Marker position={[liveLocation.lat, liveLocation.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} />
                        </>
                     ) : (
                        <>
                          {perspective === 'Rider' ? <Marker position={[liveLocation.lat, liveLocation.lng]} icon={createIcon(bikeSvg, '#8B4513', 'currentColor')} /> : <Marker position={[pHome.lat, pHome.lng]} icon={createIcon(userSvg, '#3B82F6')} />}
                          <Marker position={[pickMP.lat, pickMP.lng]} icon={createIcon(meetingSvg, '#2D1B08')} />
                        </>
                     )}
                   </>
                )}
                
                <RecenterMap coords={ride.status === 'ongoing' ? [pickMP.lat, pickMP.lng] : [liveLocation.lat, liveLocation.lng]} />
              </>
            )}
          </MapContainer>

          <div className="absolute top-10 left-10 z-[500] flex bg-[#2D1B08] p-1.5 rounded-[24px]">
            {isBooked && <button onClick={() => { setActiveTab('Summary'); setSummaryStep(0); }} className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest ${activeTab === 'Summary' ? 'bg-white text-[#2D1B08]' : 'text-gray-400'}`}>Summary</button>}
            <button onClick={() => setActiveTab('Live')} className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest ${activeTab === 'Live' || !isBooked ? 'bg-[#8B4513] text-white shadow-xl' : 'text-gray-400'}`}>Live Tracking</button>
          </div>
          
          {activeTab === 'Live' && isBooked && !riderArrived && !paxArrived && (
            <div className="absolute top-10 right-10 z-[500] flex bg-white/90 p-1 rounded-2xl shadow-xl">
               <button onClick={() => setPerspective('Rider')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase ${perspective === 'Rider' ? 'bg-[#2D1B08] text-white' : 'text-gray-400'}`}>Rider</button>
               {isSmart && <button onClick={() => setPerspective('Passenger')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase ${perspective === 'Passenger' ? 'bg-[#2D1B08] text-white' : 'text-gray-400'}`}>Passenger</button>}
            </div>
          )}
        </div>

        <div className="w-full lg:w-[32%] bg-white flex flex-col h-full">
          <div className="p-10 border-b flex justify-between items-center bg-white shadow-sm"><h2 className="text-3xl font-[950] text-[#2D1B08] uppercase tracking-tighter">Operational Log</h2><button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl hover:bg-red-50 text-red-500 transition-all"><X size={28}/></button></div>
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            {activeTab === 'Summary' ? (
              <div className="bg-[#F9F5E9] p-8 rounded-[45px] border border-[#8B4513]/10 shadow-inner">
                 <h3 className="text-2xl font-black text-[#2D1B08] uppercase tracking-tighter">{current.title}</h3>
                 <p className="text-sm font-medium text-gray-500 mt-4 leading-relaxed italic">"{current.desc}"</p>
                 <button onClick={() => setSummaryStep(s => Math.min(summarySteps.length-1, s+1))} className="w-full mt-10 py-5 bg-[#8B4513] text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">Next Stage <ChevronRight size={18}/></button>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="p-8 bg-[#2D1B08] rounded-[45px] text-white text-center uppercase relative overflow-hidden"><p className="text-[10px] font-black text-orange-400 tracking-widest mb-4 animate-pulse">Sync Active</p><h3 className="text-3xl font-[950] tracking-tighter">{ride.status.replace(/_/g, ' ')}</h3></div>
                <ParticipantCard user={ride.rider} role="Rider" sub="Rider & Passenger" rating={ride.rider?.riderRating} />
                {ride.passengers.map((p, i) => (<ParticipantCard key={i} user={p} role="Passenger" sub="Verified Member" rating={p.passengerRating} />))}
              </div>
            )}
          </div>
          <div className="p-10 bg-gray-50 border-t flex justify-end"><button onClick={onClose} className="px-12 py-5 bg-[#2D1B08] text-white font-[950] rounded-3xl text-[11px] uppercase tracking-widest shadow-2xl hover:bg-[#8B4513] transition-all">Close</button></div>
        </div>
      </motion.div>
    </div>
  );
};

const ParticipantCard = ({ user, role, sub, rating }) => (
  <div className="bg-white p-6 rounded-[40px] border border-gray-100 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-5">
      <img src={user?.profilePic?.startsWith('http') ? user.profilePic : `http://192.168.1.66:5000/${user?.profilePic}`} className="w-14 h-14 rounded-[20px] object-cover ring-4 ring-[#F9F5E9]" alt="" onError={(e) => e.target.src="https://ui-avatars.com/api/?name=User"} />
      <div><p className="text-[8px] font-black text-[#8B4513] uppercase mb-1">{role}</p><p className="text-lg font-black text-[#2D1B08] leading-none mb-1 truncate max-w-[120px]">{user?.fullName || "Member"}</p><p className="text-[10px] font-bold text-gray-400 uppercase">{sub}</p></div>
    </div>
    <div className="bg-[#F9F5E9] px-3 py-2 rounded-xl text-[#8B4513] font-black text-xs flex items-center gap-1 shadow-inner"><Star size={12} fill="currentColor"/> {rating?.toFixed(1) || "5.0"}</div>
  </div>
);

export default RideDetailModal;