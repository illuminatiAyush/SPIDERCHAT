"use client";

import { motion } from "framer-motion";
import { Lock, Unlock, Trash2, ShieldAlert, X, Timer } from "lucide-react";
import { socket } from "@/lib/socket";

interface RoomAdminModalProps {
  roomCode: string;
  isLocked: boolean;
  slowMode: number;
  onClose: () => void;
}

export default function RoomAdminModal({ roomCode, isLocked, slowMode, onClose }: RoomAdminModalProps) {

  const toggleLock = () => {
    if (isLocked) {
      socket.emit('room_unlock', { roomCode });
    } else {
      socket.emit('room_lock', { roomCode });
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the entire chat? This cannot be undone.")) {
      socket.emit('room_clear', { roomCode });
      onClose();
    }
  };

  const deleteRoom = () => {
    if (confirm("WARNING: Are you sure you want to completely collapse this dimension? Everyone will be kicked instantly.")) {
      socket.emit('room_delete', { roomCode });
      onClose();
    }
  };

  const setSlowMode = (seconds: number) => {
    socket.emit('room_update', { roomCode, slowMode: seconds });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-spider-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 bg-yellow-500 border-b-4 border-black">
          <h2 className="font-bebas text-3xl text-spider-black flex items-center gap-2">
            <ShieldAlert size={28} /> ADMIN CONTROLS
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <X size={24} className="text-spider-black" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 font-fredoka font-bold text-spider-black">
          
          {/* Lock Controls */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg uppercase">Security</h3>
            <button 
              onClick={toggleLock}
              className={`flex items-center justify-center gap-2 p-3 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${isLocked ? 'bg-spider-red text-white' : 'bg-green-500 text-white'}`}
            >
              {isLocked ? <><Lock size={20} /> UNLOCK DIMENSION</> : <><Unlock size={20} /> LOCK DIMENSION</>}
            </button>
            <p className="text-xs text-gray-600 font-normal">
              {isLocked ? 'No new users can join while locked.' : 'Anyone with the room code can join.'}
            </p>
          </div>

          <div className="w-full h-0.5 bg-spider-black/20" />

          {/* Slow Mode */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg uppercase flex items-center gap-2"><Timer size={18} /> Slow Mode</h3>
            <div className="grid grid-cols-4 gap-2">
              {[0, 3, 5, 10].map(sec => (
                <button
                  key={sec}
                  onClick={() => setSlowMode(sec)}
                  className={`p-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${slowMode === sec ? 'bg-spider-blue text-white' : 'bg-white hover:bg-spider-blue/20'}`}
                >
                  {sec === 0 ? 'OFF' : `${sec}s`}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 font-normal">Limits how often participants can send messages.</p>
          </div>

          <div className="w-full h-0.5 bg-spider-black/20" />

          {/* Danger Zone */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg uppercase text-spider-red">Danger Zone</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={clearChat}
                className="flex items-center justify-center gap-2 p-3 bg-white text-spider-black border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Trash2 size={20} /> CLEAR CHAT
              </button>
              
              <button 
                onClick={deleteRoom}
                className="flex items-center justify-center gap-2 p-3 bg-spider-red text-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-spider-black hover:text-spider-red active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <ShieldAlert size={20} /> COLLAPSE DIMENSION (DELETE)
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
