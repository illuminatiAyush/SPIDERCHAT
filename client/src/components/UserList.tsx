"use client";

import React, { useState } from "react";
import { Users as UsersIcon, MoreVertical, ShieldAlert, VolumeX, Volume2, Crown } from "lucide-react";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RoomUser {
  id?: string;
  socketId: string;
  username: string;
  isOwner: boolean;
  isMuted: boolean;
}

interface UserListProps {
  users: RoomUser[];
  roomCode: string;
  isDarkMode?: boolean;
}

const UserList = ({ users, roomCode, isDarkMode }: UserListProps) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const currentUser = users.find(u => u.socketId === socket.id);
  const isCurrentUserOwner = currentUser?.isOwner || false;

  const handleAction = (action: string, targetSocketId: string) => {
    switch (action) {
      case 'kick':
        if (confirm("Remove this variant from the dimension?")) {
          socket.emit('room_user_kick', { roomCode, targetSocketId });
        }
        break;
      case 'mute':
        socket.emit('room_user_mute', { roomCode, targetSocketId });
        break;
      case 'unmute':
        socket.emit('room_user_unmute', { roomCode, targetSocketId });
        break;
      case 'transfer':
        if (confirm("Are you sure you want to transfer ownership? You will lose admin controls.")) {
          socket.emit('room_owner_transfer', { roomCode, targetSocketId });
        }
        break;
    }
    setOpenMenu(null);
  };

  return (
    <div className="h-full flex flex-col p-4 halftone-bg-dark">
      <h3 className="font-bebas text-2xl text-spider-red flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
        <UsersIcon size={24} />
        MULTIVERSE ({users.length}/100)
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 pb-20">
        {users.map((user) => (
          <div 
            key={user.socketId}
            className={cn(
              "border-2 border-black p-2 font-fredoka font-bold text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors relative flex items-center justify-between group",
              user.socketId === socket.id 
                ? (isDarkMode ? "bg-spider-blue/20 border-spider-blue text-spider-white" : "bg-spider-blue/10 border-spider-blue text-black")
                : (isDarkMode ? "bg-[#222] text-spider-white hover:bg-spider-red hover:text-white" : "bg-white text-black hover:bg-spider-red hover:text-white")
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {user.isOwner && (
                <span title="Room Owner" className="text-yellow-500">👑</span>
              )}
              <span 
                className={`truncate ${user.isMuted ? 'line-through text-gray-500 group-hover:text-gray-300' : ''}`}
                style={{ color: '#000' }}
              >
                {user.username || "EMPTY_NAME"} {user.socketId === socket.id && "(You)"}
              </span>
            </div>

            {/* Admin Controls (Only visible to owner, and not on themselves) */}
            {isCurrentUserOwner && user.socketId !== socket.id && (
              <div className="relative">
                <button 
                  onClick={() => setOpenMenu(openMenu === user.socketId ? null : user.socketId)}
                  className="p-1 hover:bg-black/10 rounded-full transition-colors group-hover:text-white"
                >
                  <MoreVertical size={16} />
                </button>

                <AnimatePresence>
                  {openMenu === user.socketId && (
                    <motion.div 
                      key="menu"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-50 text-black font-fredoka text-sm py-1"
                    >
                      <button 
                        onClick={() => handleAction('kick', user.socketId)}
                        className="w-full text-left px-4 py-2 hover:bg-spider-red hover:text-white flex items-center gap-2"
                      >
                        <ShieldAlert size={14} /> Remove Variant
                      </button>
                      
                      {user.isMuted ? (
                        <button 
                          onClick={() => handleAction('unmute', user.socketId)}
                          className="w-full text-left px-4 py-2 hover:bg-spider-blue hover:text-white flex items-center gap-2"
                        >
                          <Volume2 size={14} /> Unmute
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAction('mute', user.socketId)}
                          className="w-full text-left px-4 py-2 hover:bg-spider-blue hover:text-white flex items-center gap-2"
                        >
                          <VolumeX size={14} /> Mute
                        </button>
                      )}
                      
                      <div className="border-t-2 border-black my-1" />
                      
                      <button 
                        onClick={() => handleAction('transfer', user.socketId)}
                        className="w-full text-left px-4 py-2 hover:bg-yellow-500 hover:text-black flex items-center gap-2"
                      >
                        <Crown size={14} /> Transfer Ownership
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* If not owner, just show mute icon if user is muted */}
            {!isCurrentUserOwner && user.isMuted && (
               <VolumeX size={16} className="text-gray-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(UserList);
