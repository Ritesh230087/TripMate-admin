import { useEffect, useState } from 'react';
import API from '../api/axios';
import { 
  CheckCircle, XCircle, User, ShieldCheck, 
  ChevronRight, X, ImageIcon, 
  AlertTriangle, Send, FileBadge, CarFront, Info
} from 'lucide-react';

const VerifyRiders = () => {
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://192.168.1.66:5000/";

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await API.get('/admin/pending-riders');
      setRiders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getImgUrl = (path) => {
    if (!path) return "https://ui-avatars.com/api/?name=User&background=8B4513&color=fff";
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.replace(/\\/g, '/')}`;
  };

  const handleAction = async (status) => {
    if (status === 'rejected' && !rejectReason) return;
    setLoading(true);
    try {
      await API.put(`/admin/verify-rider/${selectedRider._id}`, { 
        status, 
        reason: status === 'rejected' ? rejectReason : "" 
      });
      setSelectedRider(null);
      setShowRejectForm(false);
      setRejectReason("");
      fetchPending();
    } catch (err) {
      alert("Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-bgBeige min-h-screen font-sans">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-gray-800">Rider Verification</h2>
        <p className="text-gray-500 font-medium">
          Review and manage upcoming TripMate riders.
        </p>
      </header>

      {/* Rider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riders.map(rider => (
          <div
            key={rider._id}
            onClick={() => { setSelectedRider(rider); setActiveTab('identity'); }}
            className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-gray-100 group"
          >
            <div className="flex items-center gap-4">
              <img 
                src={getImgUrl(rider.profilePic)} 
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-bgBeige shadow-sm" 
                alt="Profile"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{rider.fullName}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {rider.phone || "No Phone"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-bgBeige flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight size={18}/>
              </div>
            </div>
          </div>
        ))}

        {riders.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 font-medium bg-white/50 rounded-3xl border-2 border-dashed">
            No pending riders at the moment.
          </div>
        )}
      </div>

      {/* =================== MAIN MODAL =================== */}
      {selectedRider && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[999] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative border border-white/20 z-[1000]">

            {/* Header */}
            <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <img
                  src={getImgUrl(selectedRider.profilePic)}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-bgBeige"
                  alt=""
                />
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    {selectedRider.fullName}
                  </h3>
                  <div className="flex gap-3 mt-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                    <span>{selectedRider.kycDetails.vehicleModel}</span>
                    <span className="text-gray-300">|</span>
                    <span>{selectedRider.kycDetails.vehiclePlateNumber}</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex bg-bgBeige p-1 rounded-2xl gap-1">
                <TabItem active={activeTab === 'identity'} label="Identity" onClick={() => setActiveTab('identity')} />
                <TabItem active={activeTab === 'license'} label="License" onClick={() => setActiveTab('license')} />
                <TabItem active={activeTab === 'vehicle'} label="Vehicle" onClick={() => setActiveTab('vehicle')} />
              </div>

              <button
                onClick={() => setSelectedRider(null)}
                className="p-2 hover:bg-bgBeige rounded-full transition-colors text-gray-400"
              >
                <X size={24}/>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
              {activeTab === 'identity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DocumentCard title="Citizenship Front" src={getImgUrl(selectedRider.kycDetails.citizenshipFront)} />
                  <DocumentCard title="Citizenship Back" src={getImgUrl(selectedRider.kycDetails.citizenshipBack)} />
                </div>
              )}

              {activeTab === 'license' && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <InfoBox label="License Number" value={selectedRider.kycDetails.licenseNumber} />
                    <InfoBox label="Issue Date" value={selectedRider.kycDetails.licenseIssueDate} />
                    <InfoBox label="Expiry Date" value={selectedRider.kycDetails.licenseExpiryDate} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DocumentCard title="Driver's License" src={getImgUrl(selectedRider.kycDetails.licenseImage)} />
                    <DocumentCard title="Selfie with License" src={getImgUrl(selectedRider.kycDetails.selfieWithLicense)} />
                  </div>
                </>
              )}

              {activeTab === 'vehicle' && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <InfoBox label="Model" value={selectedRider.kycDetails.vehicleModel} />
                    <InfoBox label="Year" value={selectedRider.kycDetails.vehicleProductionYear} />
                    <InfoBox label="Plate" value={selectedRider.kycDetails.vehiclePlateNumber} color="text-primary" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DocumentCard title="Vehicle Photo" src={getImgUrl(selectedRider.kycDetails.vehiclePhoto)} />
                    <DocumentCard title="Bilbook Detail Page" src={getImgUrl(selectedRider.kycDetails.billbookPage2)} />
                    <DocumentCard title="Billbook Renew Page" src={getImgUrl(selectedRider.kycDetails.billbookPage3)} />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-white border-t flex justify-end gap-3">
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-6 py-2.5 rounded-xl border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50"
              >
                Reject Application
              </button>
              <button
                disabled={loading}
                onClick={() => handleAction('approved')}
                className="px-10 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Approve Rider'}
              </button>
            </div>

            {/* Reject Modal */}
            {showRejectForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-xl font-black mb-4 text-center">Rejection Reason</h3>
                  <textarea
                    className="w-full h-32 p-4 rounded-2xl border bg-bgBeige/50"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="flex-1 py-3 rounded-xl bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction('rejected')}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- SUB COMPONENTS ---------------- */

const TabItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-xl text-xs font-black ${
      active ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
    }`}
  >
    {label.toUpperCase()}
  </button>
);

const DocumentCard = ({ title, src }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{title}</p>
    <div className="rounded-3xl overflow-hidden shadow-md bg-gray-200 aspect-video">
      <img
        src={src}
        className="w-full h-full object-cover cursor-zoom-in"
        onClick={() => window.open(src, '_blank')}
        alt={title}
      />
    </div>
  </div>
);

const InfoBox = ({ label, value, color = "text-gray-800" }) => (
  <div className="bg-white p-4 rounded-2xl border shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
    <p className={`text-sm font-black truncate ${color}`}>{value || 'N/A'}</p>
  </div>
);

export default VerifyRiders;
