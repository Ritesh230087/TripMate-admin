import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, Users, Motorbike, Wallet, Star, Zap, 
  ArrowUp, ArrowDown, Map, DollarSign, CheckCircle2, XCircle, Clock
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          API.get('/admin/analytics'),
          API.get('/admin/stats')
        ]);
        setData(aRes.data);
        setStats(sRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  if (!data || !stats) return (
    <div className="p-20 flex flex-col items-center justify-center min-h-screen bg-[#F9F5E9]/20">
      <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[#8B4513] uppercase text-xs tracking-widest">Gathering Platform Data...</p>
    </div>
  );

  const todayRev = data.dailyStats[0]?.revenue || 0;
  const yesterdayRev = data.dailyStats[1]?.revenue || 0;
  const isIncreasing = todayRev >= yesterdayRev;

  // Find payment specifics
  const esewaData = data.paymentTotals?.find(p => p._id === 'esewa') || { totalAmount: 0, userCount: 0 };
  const cashData = data.paymentTotals?.find(p => p._id === 'cash') || { totalAmount: 0, userCount: 0 };

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-10 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-[950] text-[#2D1B08] tracking-tighter uppercase">Command Center</h1>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border font-black text-[10px] text-[#8B4513] uppercase tracking-widest">
          Last Sync: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* --- TOP PERFORMANCE BAR (THE BIG 4) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`Rs. ${stats.totalEarned}`} icon={<Wallet size={24}/>} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Total Rides" value={stats.totalRides} icon={<Motorbike size={24}/>} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Total Booked" value={stats.bookedCount || 0} icon={<Clock size={24}/>} color="text-orange-600" bg="bg-orange-50" />
        {/* Total Users logic fixed below */}
        <StatCard label="Total Users" value={stats.totalUsers || 0} icon={<Users size={24}/>} color="text-[#8B4513]" bg="bg-[#F9F5E9]" />
      </div>

      {/* --- TREND TAPE --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrendCard label="Today Earning" value={`Rs. ${todayRev}`} sub={`Previous: Rs. ${yesterdayRev}`} status={isIncreasing ? 'up' : 'down'} />
        <TrendCard label="Smart Match" value={data.matchTypeStats?.find(m => m._id === 'smart')?.count || 0} sub="Efficient detours to both" status="neutral" />
        <TrendCard label="Detour Match" value={data.matchTypeStats?.find(m => m._id === 'detour')?.count || 0} sub="Rider detour" status="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- EARNING VELOCITY --- */}
        <div className="lg:col-span-8 bg-[#1A1A1A] p-8 rounded-[45px] shadow-2xl border border-white/5">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Earning Velocity</h3>
              <div className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black text-[#10B981] uppercase tracking-widest border border-white/10">7 Day Trajectory</div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...data.dailyStats].reverse()}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isIncreasing ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="_id" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: '#2D1B08', border: 'none', borderRadius: '15px', color: '#fff'}} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={isIncreasing ? "#10B981" : "#EF4444"} 
                    strokeWidth={4} 
                    fill="url(#velocityGrad)"
                    dot={{ r: 6, fill: isIncreasing ? "#10B981" : "#EF4444", strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* --- TRIP SUCCESS RATE --- */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[45px] shadow-sm border border-gray-100 flex flex-col justify-center">
           <h3 className="text-xs font-black text-[#2D1B08] uppercase tracking-widest mb-8 text-center">Trip Success Rate</h3>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Complete', val: stats.completedCount, col: '#268F76' },
                  { name: 'Cancel', val: stats.cancelledCount, col: '#EF4444' },
                  { name: 'Booked', val: stats.bookedCount, col: '#3B82F6' }
                ]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="val" radius={[12, 12, 12, 12]} barSize={40}>
                    <Cell fill="#268F76" />
                    <Cell fill="#EF4444" />
                    <Cell fill="#3B82F6" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* --- FINANCIAL SETTLEMENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <PaymentBox 
            label="Digital Transfer" 
            method="eSewa" 
            amount={esewaData.totalAmount} 
            count={esewaData.userCount} 
            icon={<Zap/>} color="text-green-600" bg="bg-green-50" 
         />
         <PaymentBox 
            label="Physical Settlement" 
            method="Cash" 
            amount={cashData.totalAmount} 
            count={cashData.userCount} 
            icon={<Wallet/>} color="text-[#8B4513]" bg="bg-[#F9F5E9]" 
         />
      </div>

      {/* --- LEADERBOARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Leaderboard title="Riders" items={data.topRiders} label="Rides Done" />
        <Leaderboard title="Passengers" items={data.topPassengers} label="Rides Taken" />
      </div>

    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white p-8 rounded-[40px] border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
    <div className={`w-16 h-16 ${bg} ${color} rounded-[24px] flex items-center justify-center shadow-inner`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-[900] text-[#2D1B08]">{value}</p>
    </div>
  </div>
);

const TrendCard = ({ label, value, sub, status }) => (
  <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex justify-between items-center">
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-[#2D1B08] leading-tight">{value}</p>
      <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase">{sub}</p>
    </div>
    {status !== 'neutral' && (
      <div className={`p-3 rounded-full ${status === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {status === 'up' ? <ArrowUp size={20}/> : <ArrowDown size={20}/>}
      </div>
    )}
  </div>
);

const PaymentBox = ({ label, method, amount, count, icon, color, bg }) => (
  <div className="bg-white p-8 rounded-[45px] border border-gray-100 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-6">
       <div className={`w-16 h-16 ${bg} ${color} rounded-[24px] flex items-center justify-center shadow-inner`}>{icon}</div>
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <h4 className="text-2xl font-[950] text-[#2D1B08]">{method}</h4>
       </div>
    </div>
    <div className="text-right">
       <p className="text-2xl font-black text-[#8B4513]">Rs. {amount}</p>
       {/* Explicit Sentence as requested */}
       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          Total number of user paid from {method}: {count}
       </p>
    </div>
  </div>
);

const Leaderboard = ({ title, items, label }) => (
  <div className="bg-white p-8 rounded-[45px] border border-gray-100 shadow-sm">
    <h3 className="text-sm font-black text-[#2D1B08] uppercase tracking-widest mb-8 flex items-center gap-2">
      <Star size={16} className="text-yellow-500" fill="currentColor"/> {title}
    </h3>
    <div className="space-y-4">
      {items && items.length > 0 ? items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-[#F9F5E9]/50 rounded-[30px] group hover:bg-[#8B4513]/10 transition-all">
          <div className="flex items-center gap-4">
            <img 
              src={item.user.profilePic?.startsWith('http') ? item.user.profilePic : `http://192.168.1.87:5000/${item.user.profilePic}`} 
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md" 
              alt=""
              onError={(e) => e.target.src="https://ui-avatars.com/api/?name="+item.user.fullName}
            />
            <div>
              <p className="text-sm font-black text-[#2D1B08] leading-none mb-1">{item.user.fullName}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                {item.user.email}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-black text-[#8B4513]">{item.count}</p>
            <p className="text-[8px] font-bold text-gray-400 uppercase">{label}</p>
          </div>
        </div>
      )) : (
        <div className="text-center py-10 text-gray-300 font-bold uppercase text-[10px]">Awaiting Records</div>
      )}
    </div>
  </div>
);

export default Dashboard;