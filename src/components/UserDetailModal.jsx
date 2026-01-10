import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, Calendar, User, ShieldCheck, Star, ExternalLink, AlertCircle, Image as ImageIcon, ShieldAlert } from 'lucide-react';

const UserDetailModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [kycTab, setKycTab] = useState('Citizenship');
  const BASE_URL = "http://192.168.1.66:5000/";

  const getImgUrl = (path) => {
    if (!path) return "https://ui-avatars.com/api/?name=" + user.fullName;
    return path.startsWith('http') ? path : `${BASE_URL}${path.replace(/\\/g, "/")}`;
  };

  const isRiderOrPending = user.role !== 'passenger' || user.riderStatus !== 'none';
  const isGoogle = user.authMethod === 'google';
  const isAdmin = user.role === 'admin';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#2D1B08]/80 backdrop-blur-xl" />

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-5xl bg-[#F9F5E9] rounded-[50px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Verification Status Banner */}
        {user.riderStatus === 'pending' && (
          <div className="bg-orange-500 text-white px-8 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <ShieldAlert size={14}/> Pending Rider Verification Action Required
          </div>
        )}

        {/* Header */}
        <div className="p-8 bg-white border-b flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src={getImgUrl(user.profilePic)} className="w-20 h-20 rounded-[30px] object-cover ring-4 ring-[#F9F5E9] shadow-xl" alt=""/>
            <div>
              <h2 className="text-3xl font-[900] text-[#2D1B08] tracking-tighter leading-tight">{user.fullName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-3 py-1 bg-[#8B4513] text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                   {user.role === 'rider' ? 'Rider & Passenger' : user.role === 'admin' ? 'Admin' : 'Passenger'}
                </span>
                <span className="text-xs font-bold text-gray-400">{user.email}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
        </div>

        {/* Tab Buttons (Proper Casing) */}
        <div className="flex px-8 py-3 bg-white/50 border-b gap-8 font-black uppercase text-[10px] tracking-widest">
          <button onClick={() => setActiveTab('Overview')} className={`pb-2 transition-all border-b-2 ${activeTab === 'Overview' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-300'}`}>Overview</button>
          {!isAdmin && (
            <>
              <button onClick={() => setActiveTab('Performance')} className={`pb-2 transition-all border-b-2 ${activeTab === 'Performance' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-300'}`}>Performance</button>
              {isRiderOrPending && <button onClick={() => setActiveTab('KYC Vault')} className={`pb-2 transition-all border-b-2 ${activeTab === 'KYC Vault' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-300'}`}>KYC Vault</button>}
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
               <SimpleCard icon={<Mail size={18}/>} label="Email Address" value={user.email} />
               {user.phone && <SimpleCard icon={<Phone size={18}/>} label="Phone Number" value={user.phone} />}
               
               {/* Privacy logic: Only show if data exists or not Google Auth */}
               {(!isGoogle || user.dob) && user.dob && <SimpleCard icon={<Calendar size={18}/>} label="Date of Birth" value={user.dob} />}
               {(!isGoogle || (user.gender && user.gender !== "Other")) && user.gender && <SimpleCard icon={<User size={18}/>} label="Gender" value={user.gender} />}
               
               <SimpleCard icon={<ShieldCheck size={18}/>} label="Authentication" value={user.authMethod} />
               <SimpleCard 
                  icon={<ImageIcon size={18}/>} 
                  label="Profile Status" 
                  value={user.role === 'rider' ? 'Rider & Passenger' : user.role === 'admin' ? 'Admin' : 'Passenger'} 
               />
            </div>
          )}

          {!isAdmin && activeTab === 'Performance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-200">
              <PerformanceBlock title="Passenger Stats" rating={user.passengerRating} count={user.passengerReviewCount} tags={user.passengerFeedbackTags} color="text-yellow-600" />
              {user.role === 'rider' && <PerformanceBlock title="Rider Stats" rating={user.riderRating} count={user.riderReviewCount} tags={user.riderFeedbackTags} color="text-[#8B4513]" />}
            </div>
          )}

          {!isAdmin && activeTab === 'KYC Vault' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl w-fit shadow-sm border font-black uppercase text-[9px] tracking-widest">
                <button onClick={() => setKycTab('Citizenship')} className={`px-5 py-2 rounded-xl transition-all ${kycTab === 'Citizenship' ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>Citizenship</button>
                <button onClick={() => setKycTab('License')} className={`px-5 py-2 rounded-xl transition-all ${kycTab === 'License' ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>License</button>
                <button onClick={() => setKycTab('Vehicle')} className={`px-5 py-2 rounded-xl transition-all ${kycTab === 'Vehicle' ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>Vehicle</button>
              </div>

              <div>
                {kycTab === 'Citizenship' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DocImg label="Citizenship Front" src={getImgUrl(user.kycDetails?.citizenshipFront)} />
                    <DocImg label="Citizenship Back" src={getImgUrl(user.kycDetails?.citizenshipBack)} />
                  </div>
                )}
                {kycTab === 'License' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      <DataBox label="License No" value={user.kycDetails?.licenseNumber} />
                      <DataBox label="Issue Date" value={user.kycDetails?.licenseIssueDate} />
                      <DataBox label="Expiry" value={user.kycDetails?.licenseExpiryDate} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <DocImg label="Driver's License" src={getImgUrl(user.kycDetails?.licenseImage)} />
                      <DocImg label="Selfie with License" src={getImgUrl(user.kycDetails?.selfieWithLicense)} />
                    </div>
                  </div>
                )}
                {kycTab === 'Vehicle' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      <DataBox label="Model" value={user.kycDetails?.vehicleModel} />
                      <DataBox label="Year" value={user.kycDetails?.vehicleProductionYear} />
                      <DataBox label="Plate Number" value={user.kycDetails?.vehiclePlateNumber} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DocImg label="Vehicle Photo" src={getImgUrl(user.kycDetails?.vehiclePhoto)} />
                      <DocImg label="Bilbook Vehicle Detailed Page" src={getImgUrl(user.kycDetails?.billbookPage2)} />
                      <DocImg label="Billbook Vehicle Renew Page " src={getImgUrl(user.kycDetails?.billbookPage3)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t flex justify-end">
          <button onClick={onClose} className="px-10 py-4 bg-[#2D1B08] text-white font-black rounded-2xl text-[10px] uppercase shadow-xl hover:bg-[#8B4513] transition-all">Close Profile</button>
        </div>
      </motion.div>
    </div>
  );
};

// Helper Components
const SimpleCard = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-[25px] flex items-center gap-4 border border-[#8B4513]/5 shadow-sm">
    <div className="text-[#8B4513] bg-[#F9F5E9] p-3 rounded-xl">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
      <p className="text-sm font-bold text-[#2D1B08]">{value}</p>
    </div>
  </div>
);

const PerformanceBlock = ({ title, rating, count, tags, color }) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-white">
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h4>
      <div className={`${color} font-black text-2xl flex items-center gap-1`}><Star size={20} fill="currentColor"/> {rating.toFixed(1)}</div>
    </div>
    <div className="flex flex-wrap gap-2">
      {tags?.length > 0 ? tags.map((t, i) => (
        <span key={i} className="px-3 py-1 bg-[#F9F5E9] text-[#8B4513] text-[9px] font-black rounded-lg border border-[#8B4513]/5 lowercase">#{t}</span>
      )) : <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">No Feedback Recorded</span>}
    </div>
  </div>
);

const DocImg = ({ label, src }) => (
  <div className="space-y-3">
    <p className="text-[9px] font-black text-[#8B4513] uppercase tracking-widest ml-4">{label}</p>
    <div className="rounded-[30px] overflow-hidden border-4 border-white shadow-lg aspect-video bg-gray-100 group relative">
      <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt=""/>
      <a href={src} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><ExternalLink className="text-white" size={24}/></a>
    </div>
  </div>
);

const DataBox = ({ label, value }) => (
  <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
    <p className="text-xs font-black text-[#2D1B08] uppercase truncate">{value || "N/A"}</p>
  </div>
);

export default UserDetailModal;