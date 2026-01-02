import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Verifying credentials...");
    
    try {
      const res = await API.post('/auth/login', { email, password });
      
      if (res.data.role !== 'admin') {
        toast.error("Access Denied: Admins Only", { id: loadingToast });
        return;
      }

      login(res.data, res.data.token);
      
      toast.success("Login successful! Welcome back.", { 
        id: loadingToast,
        style: { borderRadius: '15px', background: '#2D1B08', color: '#fff', fontWeight: 'bold' }
      });

      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgBeige px-4">
      <Toaster position="top-right" />
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-xl border border-orange-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-primary mb-2 tracking-tighter uppercase">TripMate</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Control Center Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-6 py-4 rounded-2xl bg-bgBeige/50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-[#2D1B08]"
              placeholder="admin@tripmate.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Password</label>
            <input 
              type="password" 
              className="w-full px-6 py-4 rounded-2xl bg-bgBeige/50 border border-gray-100 focus:border-primary outline-none transition-all font-bold text-[#2D1B08]"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;