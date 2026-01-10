import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Star, CreditCard, ShieldCheck, User, 
  MessageSquare, Motorbike, Phone, Zap, 
  ExternalLink, Ban, ShieldAlert, Calendar, Clock, 
  CarFront, MapPin, ArrowRight, Wallet, Timer
} from 'lucide-react';

const FullRideDetailModal = ({ ride, onClose }) => {
  const [kycTab, setKycTab] = useState('Identity');
  const BASE_URL = "http://192.168.1.66:5000";
  const isCancelled = ride.status === 'cancelled';
  const isPaid = ride.paymentStatus === 'paid';

  const getImgUrl = (path) => {
    if (!path) return "https://ui-avatars.com/api/?name=Doc&background=F9F5E9&color=8B4513";
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/${path.replace(/\\/g, "/")}`;
  };

  const riderKyc = ride.rider?.kycDetails || {};

  // Feedback Logic
  const renderFeedbackContent = (feedback) => {
    if (!isPaid) return <p className="text-[10px] font-bold text-orange-400 italic uppercase tracking-tighter">Waiting for ride to complete</p>;
    if (!feedback || !feedback.rating) return <p className="text-[10px] font-bold text-gray-300 italic uppercase">Not rated</p>;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < feedback.rating ? "currentColor" : "none"} />
          ))}
          <span className="ml-2 font-black text-[#2D1B08] text-xs">{feedback.rating.toFixed(1)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {feedback.tags?.map((tag, idx) => (
            <span key={idx} className="bg-[#F9F5E9] text-[#8B4513] text-[8px] px-1.5 py-0.5 rounded font-bold lowercase border border-[#8B4513]/5">#{tag}</span>
          ))}
        </div>
      </div>
    );
  };

  // Payment Status Component
  const renderPaymentSign = () => {
    if (!isPaid) {
      return (
        <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-2xl border border-orange-100 w-full shadow-sm">
          <div className="bg-orange-500 text-white p-2 rounded-xl"><Timer size={18}/></div>
          <div>
            <p className="text-[8px] font-black text-orange-400 uppercase">Payment Status</p>
            <p className="text-sm font-black text-orange-600 uppercase">Pending</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100 w-full shadow-sm">
        <div className="bg-green-600 text-white p-2 rounded-xl">
          {ride.paymentMethod === 'esewa' ? <Zap size={18}/> : <Wallet size={18}/>}
        </div>
        <div>
          <p className="text-[8px] font-black text-green-400 uppercase">Paid via {ride.paymentMethod}</p>
          <p className="text-sm font-black text-green-700 uppercase">{ride.paymentMethod === 'esewa' ? 'eSewa' : 'Cash'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1A0F05]/90 backdrop-blur-xl" />

      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-6xl bg-[#F9F5E9] rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* --- HEADER --- */}
        <div className="px-10 py-6 bg-white border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isCancelled ? 'bg-red-500' : 'bg-[#8B4513]'}`}>
               {isCancelled ? <Ban size={24}/> : <Motorbike size={24}/>}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#2D1B08] uppercase tracking-tight text-left">Ride Detail</h2>
              <p className="text-[10px] font-bold text-gray-400 text-left">{ride._id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isCancelled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {ride.status}
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={24}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {isCancelled ? (
            /* --- CANCELLED VIEW --- */
            <div className="flex-1 overflow-y-auto p-10 space-y-8 animate-in fade-in">
                <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[35px] flex items-start gap-6">
                  <div className="bg-red-500 text-white p-4 rounded-2xl shadow-lg shadow-red-200"><ShieldAlert size={32}/></div>
                  <div>
                     <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1 text-left">Cancellation Notice</p>
                     <h3 className="text-2xl font-black text-red-600 leading-tight text-left">
                        Ride was cancelled by the {ride.cancelledBy === ride.rider?._id ? "Rider" : "Passenger"}
                     </h3>
                     <div className="mt-4 p-4 bg-white/60 rounded-2xl border border-red-100">
                        <p className="text-[10px] font-black text-red-400 uppercase mb-1 text-left">Reason</p>
                        <p className="text-sm font-bold text-[#2D1B08] text-left">"{ride.cancellationReason || "No reason specified"}"</p>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <RoutePoint label="From" value={ride.fromLocation} color="bg-[#8B4513]" />
                     <RoutePoint label="To" value={ride.toLocation} color="bg-green-500" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <ScheduleItem icon={<Calendar size={20}/>} label="Date" value={ride.date} />
                     <ScheduleItem icon={<Clock size={20}/>} label="Time" value={ride.time} />
                  </div>
               </div>
            </div>
          ) : (
            /* --- FULL DOSSIER VIEW --- */
            <>
              {/* LEFT COLUMN */}
              <div className="w-full lg:w-[420px] bg-white/50 border-r border-gray-200 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                
                {/* 1. Route & Schedule (Moved Here) */}
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Trip Journey</p>
                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="flex gap-4">
                        <ScheduleItem icon={<Calendar size={16}/>} label="Date" value={ride.date} small />
                        <ScheduleItem icon={<Clock size={16}/>} label="Time" value={ride.time} small />
                      </div>
                      <div className="space-y-5 pt-4 border-t border-gray-50">
                        <RoutePoint label="From" value={ride.fromLocation} color="bg-[#8B4513]" />
                        <RoutePoint label="To" value={ride.toLocation} color="bg-green-500" />
                      </div>
                   </div>
                </div>

                {/* 2. Payment (Dynamic Status) */}
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1 text-left">Fare & Settlement</p>
                   <div className="space-y-3">
                      {renderPaymentSign()}
                      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Total Amount</p>
                        <p className="text-xl font-black text-[#8B4513]">Rs. {ride.price}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Rider</p>
                   <UserStrip user={ride.rider} role="Rider" rating={ride.rider?.riderRating} />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Passenger</p>
                   {ride.passengers.map((p, i) => <UserStrip key={i} user={p} role="Passenger" rating={p.passengerRating} />)}
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Feedback</p>
                   <div className="bg-white p-5 rounded-3xl border border-gray-100 space-y-5 shadow-sm">
                      <div className='text-left'><p className="text-[9px] font-black text-gray-400 uppercase mb-2">For Rider</p>{renderFeedbackContent(ride.feedbackForRider)}</div>
                      <div className='text-left pt-5 border-t border-gray-50'><p className="text-[9px] font-black text-gray-400 uppercase mb-2">For Passenger</p>{renderFeedbackContent(ride.feedbackForPassenger)}</div>
                   </div>
                </div>
              </div>

              {/* RIGHT COLUMN: KYC */}
              <div className="flex-1 bg-white overflow-y-auto p-10 custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-black text-[#2D1B08] uppercase tracking-tighter flex items-center gap-2">Rider Documents</h3>
                   <div className="flex bg-[#F9F5E9] p-1 rounded-xl gap-1 border border-gray-100">
                      {['Identity', 'License', 'Vehicle'].map(t => (
                         <button key={t} onClick={() => setKycTab(t)} className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${kycTab === t ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>{t}</button>
                      ))}
                   </div>
                </div>

                <div className="animate-in fade-in duration-300">
                   {kycTab === 'Identity' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <KycImg label="Citizenship Front" src={getImgUrl(riderKyc.citizenshipFront)} />
                        <KycImg label="Citizenship Back" src={getImgUrl(riderKyc.citizenshipBack)} />
                     </div>
                   )}
                   {kycTab === 'License' && (
                     <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                           <DataCell label="License No" value={riderKyc.licenseNumber} />
                           <DataCell label="Issued" value={riderKyc.licenseIssueDate} />
                           <DataCell label="Expiry" value={riderKyc.licenseExpiryDate} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <KycImg label="Driver's License" src={getImgUrl(riderKyc.licenseImage)} />
                           <KycImg label="Selfie Verification" src={getImgUrl(riderKyc.selfieWithLicense)} />
                        </div>
                     </div>
                   )}
                   {kycTab === 'Vehicle' && (
                     <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                           <DataCell label="Model" value={riderKyc.vehicleModel} />
                           <DataCell label="Year" value={riderKyc.vehicleProductionYear} />
                           <DataCell label="Plate No" value={riderKyc.vehiclePlateNumber} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <KycImg label="Vehicle Photo" src={getImgUrl(riderKyc.vehiclePhoto)} />
                           <KycImg label="Billbook vehicle detailed page" src={getImgUrl(riderKyc.billbookPage2)} />
                           <KycImg label="Billbook Vehicle Renew Page" src={getImgUrl(riderKyc.billbookPage3)} />
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end">
           <button onClick={onClose} className="px-10 py-3 bg-[#2D1B08] text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl hover:bg-[#8B4513] transition-all">Close</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const RoutePoint = ({ label, value, color }) => (
  <div className="flex gap-4 items-start text-left">
    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${color} shrink-0 ring-4 ring-white shadow-sm`} />
    <div><p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">{label}</p><p className="text-xs font-bold text-[#2D1B08] leading-tight">{value}</p></div>
  </div>
);

const ScheduleItem = ({ icon, label, value, small }) => (
  <div className={`flex items-center gap-3 bg-gray-50 rounded-2xl ${small ? 'p-3 flex-1' : 'p-4'}`}>
    <div className="text-[#8B4513]">{icon}</div>
    <div><p className="text-[9px] font-black text-gray-400 uppercase text-left">{label}</p><p className="text-sm font-black text-[#2D1B08] leading-none">{value}</p></div>
  </div>
);

const UserStrip = ({ user, role, rating }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
    <div className="flex items-center gap-3 overflow-hidden">
      <img src={user?.profilePic?.startsWith('http') ? user.profilePic : `http://192.168.1.66:5000/${user?.profilePic}`} className="w-10 h-10 rounded-xl object-cover border" alt="" onError={(e) => e.target.src="https://ui-avatars.com/api/?name=User&background=F9F5E9&color=8B4513"} />
      <div className="text-left"><p className="text-[11px] font-black text-[#2D1B08] truncate">{user?.fullName}</p><p className="text-[8px] font-bold text-gray-400 uppercase">{user?.phone || 'No phone'}</p></div>
    </div>
    <div className="flex items-center gap-1 text-[#8B4513] font-black text-[10px] bg-[#F9F5E9] px-2 py-1 rounded-lg"><Star size={10} fill="currentColor"/> {rating?.toFixed(1) || "5.0"}</div>
  </div>
);

const KycImg = ({ label, src }) => (
  <div className="space-y-2 text-left">
     <p className="text-[10px] font-black text-gray-400 uppercase ml-1">{label}</p>
     <div className="rounded-2xl overflow-hidden border-2 border-white shadow-sm aspect-video bg-gray-50 relative group">
        <img src={src} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={label} />
        <a href={src} target="_blank" rel="noreferrer" className="absolute top-3 right-3 bg-white/90 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-[#8B4513]"><ExternalLink size={16} /></a>
     </div>
  </div>
);

const DataCell = ({ label, value }) => (
  <div className="flex flex-col bg-[#F9F5E9]/50 p-3 rounded-xl border border-[#8B4513]/5 text-left">
    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{label}</span>
    <span className="text-xs font-black text-[#2D1B08] uppercase truncate">{value || 'N/A'}</span>
  </div>
);

export default FullRideDetailModal;