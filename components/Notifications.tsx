'use client';

import { useApp } from '@/context/AppContext';
import { XCircle, CheckCircle, Info } from 'lucide-react';

export function Notifications() {
  const { notifications } = useApp();

  return (
    <div className="fixed top-20 right-4 z-[200] space-y-2 pointer-events-none">
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`pointer-events-auto flex items-center p-4 rounded-lg shadow-lg border-l-4 animate-fadeInUp ${
            n.type === 'success' ? 'bg-white border-green-500 text-green-900' :
            n.type === 'error' ? 'bg-white border-red-500 text-red-900' :
            'bg-white border-blue-500 text-blue-900'
          }`}
        >
          {n.type === 'success' && <CheckCircle size={20} className="text-green-500 mr-3" />}
          {n.type === 'error' && <XCircle size={20} className="text-red-500 mr-3" />}
          {n.type === 'info' && <Info size={20} className="text-blue-500 mr-3" />}
          <span className="font-medium text-sm">{n.message}</span>
        </div>
      ))}
    </div>
  );
}
