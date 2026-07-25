"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'error' | 'message';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  onClick?: () => void;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 border-green-700 text-white';
      case 'error':
        return 'bg-red-500 border-red-700 text-white';
      case 'message':
        return 'bg-spider-blue border-black text-white';
      default:
        return 'bg-white border-black text-spider-black';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      layout
      onClick={() => {
        if (toast.onClick) {
          toast.onClick();
          onRemove();
        }
      }}
      className={`relative p-4 rounded-xl border-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] w-80 cursor-pointer overflow-hidden ${getColors()}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 hover:opacity-70"
      >
        <X size={16} />
      </button>
      <h4 className="font-bebas text-xl mb-1 truncate pr-6">{toast.title}</h4>
      <p className="font-fredoka text-sm line-clamp-2">{toast.message}</p>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
