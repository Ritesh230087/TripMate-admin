import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import ReactDOM from 'react-dom';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // danger or warning
}) => {
  if (!isOpen) return null;

  // Use a Portal to render at the end of <body>
  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* FROSTED BACKDROP */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-[#2D1B08]/70 backdrop-blur-md" 
        />

        {/* MODAL BOX */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          className="relative bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center border border-white/20"
        >
          {/* ICON SECTION */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
          }`}>
            <AlertTriangle size={40} />
          </div>

          {/* TEXT SECTION */}
          <h3 className="text-2xl font-[950] text-[#2D1B08] mb-2 uppercase tracking-tighter">
            {title}
          </h3>
          <p className="text-gray-400 font-bold text-sm mb-10 leading-relaxed px-4">
            {message}
          </p>

          {/* ACTIONS */}
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-all uppercase text-[10px] tracking-widest"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-4 text-white rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest shadow-lg ${
                type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-primary hover:opacity-90 shadow-orange-100'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;