import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  LogOut, 
  ShieldCheck,
  ChevronRight,
  Motorbike
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal'; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, admin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch pending count for the badge
  useEffect(() => {
    const getCounts = async () => {
      try {
        const res = await API.get('/admin/pending-riders');
        setPendingCount(res.data.length);
      } catch (err) {
        console.error("Badge fetch error", err);
      }
    };
    getCounts();
    const interval = setInterval(getCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleActualLogout = () => {
    toast.success("Logout successful", {
      style: { borderRadius: '15px', background: '#2D1B08', color: '#fff', fontWeight: 'bold' }
    });
    setTimeout(() => {
      logout();
    }, 600);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: 'Verify Riders', icon: <UserCheck size={22} />, path: '/verify-riders', badge: pendingCount },
    { name: 'Users List', icon: <Users size={22} />, path: '/users' },
    { name: 'All Rides', icon: <Motorbike size={22} />, path: '/rides' },
  ];

  return (
    <div className="w-80 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 shadow-sm z-50">
      <Toaster position="top-right" />
      
      {/* --- LOGO SECTION --- */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#8B4513] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#8B4513] leading-tight tracking-tighter uppercase">
              TripMate
            </h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              Admin Control
            </p>
          </div>
        </div>
      </div>

      {/* --- MENU NAVIGATION --- */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-[20px] transition-all duration-300 group ${
                isActive
                  ? 'bg-[#8B4513] text-white shadow-xl shadow-orange-100'
                  : 'text-gray-500 hover:bg-[#F9F5E9] hover:text-[#8B4513]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#8B4513]'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-[15px]">{item.name}</span>
              </div>
              
              {item.badge > 0 && !isActive && (
                <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full min-w-[20px] text-center shadow-md animate-pulse">
                  {item.badge}
                </div>
              )}
              
              {isActive && <ChevronRight size={18} className="opacity-50" />}
            </button>
          );
        })}
      </nav>

      {/* --- BOTTOM ADMIN PROFILE --- */}
      <div className="p-6 border-t border-gray-50 mt-auto">
        <div className="bg-[#F9F5E9]/50 rounded-3xl p-4 mb-4 flex items-center gap-3">
           <img 
              src={admin?.profilePic?.startsWith('http') ? admin.profilePic : `http://192.168.1.66:5000/${admin?.profilePic}`} 
              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
              alt="Admin"
              onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Admin&background=8B4513&color=fff'}
           />
           <div className="overflow-hidden text-left">
             <p className="font-black text-sm text-gray-800 truncate">{admin?.fullName || 'Super Admin'}</p>
             <p className="text-[10px] font-bold text-[#8B4513] uppercase">Management Access</p>
           </div>
        </div>

        <button 
          onClick={() => setShowLogoutModal(true)} // ✅ Trigger the Portal Modal
          className="w-full flex items-center justify-center gap-3 px-4 py-4 text-red-500 font-black text-sm hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 uppercase tracking-widest"
        >
          <LogOut size={18} /> Sign Out System
        </button>
      </div>

      {/* --- PORTAL MODAL (FIXES BLEEDING ISSUES) --- */}
      <ConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleActualLogout}
        title="Sign Out?"
        message="Are you sure you want to end your administrative session?"
        confirmText="Yes, Logout"
        cancelText="Stay"
        type="warning" // Matches Brown/Beige theme
      />
    </div>
  );
};

export default Sidebar;