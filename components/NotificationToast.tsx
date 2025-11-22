
import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types';

const NotificationToast: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [...prev, notification]);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 4000);
    });

    return unsubscribe;
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto transform transition-all duration-300 ease-in-out translate-y-0 opacity-100 flex items-center p-4 rounded-lg shadow-lg border text-sm font-medium max-w-sm
            ${n.type === 'success' ? 'bg-gray-900 border-[#1b8a0f] text-[#1b8a0f]' : ''}
            ${n.type === 'error' ? 'bg-gray-900 border-red-500 text-red-500' : ''}
            ${n.type === 'info' ? 'bg-gray-900 border-blue-500 text-blue-400' : ''}
          `}
        >
          {n.type === 'success' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
             </svg>
          )}
          {n.type === 'error' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          )}
          {n.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
