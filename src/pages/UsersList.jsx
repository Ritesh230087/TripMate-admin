import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Eye, Trash2, Star, User as UserIcon, Search, AlertCircle, Users, Motorbike, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import UserDetailModal from '../components/UserDetailModal';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const BASE_URL = "http://192.168.1.66:5000/";

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/admin/user/${userToDelete}`);
      setUsers(users.filter(u => u._id !== userToDelete));
      toast.success("Account deleted");
    } catch (err) { toast.error("Failed"); } finally {
      setShowDeletePopup(false);
      setUserToDelete(null);
    }
  };

  const getImgUrl = (user) => {
    if (!user.profilePic) return null;
    return user.profilePic.startsWith('http') ? user.profilePic : `${BASE_URL}${user.profilePic.replace(/\\/g, "/")}`;
  };

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto min-h-screen">
      <Toaster position="top-right" />

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard label="Total Users" value={users.length} icon={<Users size={22}/>} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Verified Riders" value={users.filter(u => u.role === 'rider').length} icon={<Motorbike size={22}/>} color="text-[#8B4513]" bg="bg-[#F9F5E9]" />
        <StatCard label="KYC Actions" value={users.filter(u => u.riderStatus === 'pending').length} icon={<AlertCircle size={22}/>} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-4xl font-[900] text-[#2D1B08] tracking-tight">Users</h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl shadow-sm border-none focus:ring-2 focus:ring-[#8B4513]/10 font-bold"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[40px] border border-white shadow-2xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-[#8B4513]/5">
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-gray-400">User Identity</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-gray-400">Contact</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-gray-400">Performance</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-gray-400">Role Status</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B4513]/5">
            {users
              .filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
              .map((user, idx) => (
              <tr key={user._id} className="hover:bg-white transition-all group">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                       {getImgUrl(user) ? (
                         <img src={getImgUrl(user)} className="w-14 h-14 rounded-[22px] object-cover ring-4 ring-white shadow-lg" alt=""/>
                       ) : (
                         <div className="w-14 h-14 rounded-[22px] bg-[#8B4513]/10 flex items-center justify-center text-[#8B4513] font-black">{user.fullName.charAt(0)}</div>
                       )}
                       {user.authMethod === 'google' && (
                         <img src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png" className="absolute -top-1 -right-1 w-4 h-4 bg-white p-0.5 rounded-full shadow-sm" alt="G"/>
                       )}
                    </div>
                    <p className="font-black text-[#2D1B08] text-lg">{user.fullName}</p>
                  </div>
                </td>
                <td className="px-10 py-7 text-sm font-bold text-[#2D1B08]">{user.email}</td>
                <td className="px-10 py-7">
                   {/* Performance: Only show for non-admins */}
                   {user.role !== 'admin' ? (
                     <div className="flex items-center gap-6">
                        <RatingCell label="Passenger" rating={user.passengerRating} />
                        {user.role === 'rider' && <RatingCell label="Rider" rating={user.riderRating} />}
                     </div>
                   ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-10 py-7">
                  {/* Small, Fit Role Box */}
                  <div className="flex flex-col gap-1.5 w-fit">
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                      user.role === 'admin' ? 'bg-[#2D1B08] text-white' : 'bg-[#8B4513]/10 text-[#8B4513]'
                    }`}>
                      {user.role === 'rider' ? 'Rider & Passenger' : user.role === 'admin' ? 'Admin' : 'Passenger'}
                    </div>
                    {user.riderStatus === 'pending' && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-orange-500 uppercase animate-pulse ml-1">
                        <AlertCircle size={10}/> Pending KYC
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-10 py-7 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setSelectedUser(user)} className="p-3 bg-[#8B4513]/5 text-[#8B4513] rounded-2xl hover:bg-[#8B4513] hover:text-white transition-all">
                      <Eye size={20} />
                    </button>
                    {user.role !== 'admin' && (
                      <button onClick={() => { setUserToDelete(user._id); setShowDeletePopup(true); }} className="p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showDeletePopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeletePopup(false)} className="absolute inset-0 bg-[#2D1B08]/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="relative bg-white p-8 rounded-[40px] max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32}/></div>
              <h3 className="text-xl font-black text-[#2D1B08]">Delete User?</h3>
              <p className="text-gray-400 font-bold text-sm mb-8 mt-2">This action is permanent.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeletePopup(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-black text-gray-500 text-[10px] uppercase">Cancel</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-200">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white p-8 rounded-[35px] border border-white flex items-center gap-6 shadow-sm">
    <div className={`w-14 h-14 ${bg} ${color} rounded-[22px] flex items-center justify-center`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-[#2D1B08]">{value}</p>
    </div>
  </div>
);

const RatingCell = ({ label, rating }) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
    <p className="font-black text-[#8B4513] flex items-center gap-1 text-sm"><Star size={12} fill="currentColor"/> {rating.toFixed(1)}</p>
  </div>
);

export default UsersList;