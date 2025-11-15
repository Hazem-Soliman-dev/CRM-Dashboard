import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';

export const ClockInOutWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const toast = useToastContext();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check if user is already clocked in
    const storedClockIn = localStorage.getItem('clockInTime');
    if (storedClockIn) {
      setClockInTime(storedClockIn);
    }

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    const now = new Date().toISOString();
    setClockInTime(now);
    localStorage.setItem('clockInTime', now);
    toast.success('Clocked In', `Welcome! Clocked in at ${new Date().toLocaleTimeString()}`);
  };

  const handleClockOut = () => {
    if (window.confirm('Are you sure you want to clock out?')) {
      const clockInTimeStamp = clockInTime ? new Date(clockInTime) : new Date();
      const now = new Date();
      const hoursWorked = ((now.getTime() - clockInTimeStamp.getTime()) / (1000 * 60 * 60)).toFixed(1);
      
      setClockInTime(null);
      localStorage.removeItem('clockInTime');
      toast.success('Clocked Out', `Goodbye! You worked ${hoursWorked} hours today.`);
    }
  };

  const getWorkedHours = () => {
    if (!clockInTime) return '0h 0m';
    const now = new Date();
    const clockInDate = new Date(clockInTime);
    const diffMs = now.getTime() - clockInDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right hidden sm:block">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentTime.toLocaleTimeString()}
        </div>
        {clockInTime && (
          <div className="text-xs text-green-600 dark:text-green-400">
            Worked: {getWorkedHours()}
          </div>
        )}
      </div>
      
      {clockInTime ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClockOut}
          className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Clock Out</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClockIn}
          className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Clock In</span>
        </Button>
      )}
    </div>
  );
};