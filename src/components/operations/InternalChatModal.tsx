import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';
import { OperationsTrip } from '../../services/operationsService';

interface InternalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: OperationsTrip | null;
}

const departments = ['Sales', 'Reservation', 'Finance', 'Support'];

const mockChatHistory = [
  {
    id: 1,
    message: 'Customer has requested vegetarian meals for all days. Can we arrange with hotel?',
    sender: 'Sarah Johnson',
    department: 'Sales',
    timestamp: '2025-01-15T10:30:00Z',
    type: 'message'
  },
  {
    id: 2,
    message: 'Confirmed with hotel kitchen. Vegetarian meals arranged for all 3 days.',
    sender: 'Ahmed Hassan',
    department: 'Operations',
    timestamp: '2025-01-15T11:15:00Z',
    type: 'update'
  },
  {
    id: 3,
    message: 'Customer also requested early checkout. Please coordinate with Finance for any adjustments.',
    sender: 'Sarah Johnson',
    department: 'Sales',
    timestamp: '2025-01-15T14:20:00Z',
    type: 'message'
  },
  {
    id: 4,
    message: 'Early checkout confirmed. No additional charges. Trip proceeding as planned.',
    sender: 'Operations Team',
    department: 'Operations',
    timestamp: '2025-01-15T15:45:00Z',
    type: 'update'
  }
];

export const InternalChatModal: React.FC<InternalChatModalProps> = ({ 
  isOpen, 
  onClose, 
  trip 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('Sales');
  const [messageType, setMessageType] = useState<'message' | 'update' | 'alert'>('message');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (!trip) return;

    const message = {
      message: newMessage,
      sender: 'Operations Team',
      department: 'Operations',
      targetDepartment: targetDepartment,
      type: messageType,
      timestamp: new Date().toISOString(),
      tripId: trip.id
    };

    console.log('Sending internal message:', message);
    // In real app, save to Supabase and trigger real-time updates
    
    setNewMessage('');
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'update': return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
      case 'alert': return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      default: return 'bg-gray-50 dark:bg-gray-700';
    }
  };

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'Sales': return 'text-blue-600 dark:text-blue-400';
      case 'Reservation': return 'text-green-600 dark:text-green-400';
      case 'Operations': return 'text-purple-600 dark:text-purple-400';
      case 'Finance': return 'text-orange-600 dark:text-orange-400';
      case 'Support': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Internal Communication - {trip.tripCode}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Trip Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                Trip Information
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-400">
                <p><strong>Customer:</strong> {trip.customerName} ({trip.customerCount} pax)</p>
                <p><strong>Itinerary:</strong> {trip.itinerary}</p>
                <p><strong>Status:</strong> {trip.status}</p>
                <p><strong>Dates:</strong> {trip.startDate ? formatDate(trip.startDate) : 'TBD'} - {trip.endDate ? formatDate(trip.endDate) : 'TBD'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chat History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Communication History
                </h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {mockChatHistory.map((chat) => (
                    <div key={chat.id} className={`p-4 rounded-lg ${getMessageTypeColor(chat.type)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getDepartmentColor(chat.department)}`}>
                            {chat.sender}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({chat.department})
                          </span>
                          {chat.type === 'alert' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(chat.timestamp)}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{chat.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send New Message */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Send Message
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="To Department"
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Select>

                    <Select
                      label="Message Type"
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value as 'message' | 'update' | 'alert')}
                    >
                      <option value="message">General Message</option>
                      <option value="update">Status Update</option>
                      <option value="alert">Alert/Urgent</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Send message to ${targetDepartment}...`}
                    />
                  </div>

                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to {targetDepartment}
                  </Button>
                </div>

                {/* Quick Templates */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Quick Templates
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setNewMessage('Trip is proceeding as planned. All services confirmed and staff assigned.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Trip proceeding as planned
                    </button>
                    <button
                      onClick={() => setNewMessage('Customer has requested additional services. Please coordinate pricing and availability.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Additional services requested
                    </button>
                    <button
                      onClick={() => setNewMessage('Minor delay due to weather conditions. Estimated 2-hour delay. Customer informed.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Weather delay notification
                    </button>
                    <button
                      onClick={() => setNewMessage('Trip completed successfully. Customer feedback was excellent. All services delivered as planned.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Trip completion update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};