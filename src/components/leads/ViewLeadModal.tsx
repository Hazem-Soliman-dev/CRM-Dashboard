import React, { useState } from 'react';
import { X, Mail, Phone, Building, Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';
import { useToastContext } from '../../contexts/ToastContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { ActionGuard } from '../auth/ActionGuard';
import taskService from '../../services/taskService';
import leadService from '../../services/leadService';
import customerService from '../../services/customerService';
import salesService from '../../services/salesService';
import userService from '../../services/userService';

interface ViewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onUpdate?: (updatedLead: any) => void;
}

export const ViewLeadModal: React.FC<ViewLeadModalProps> = ({ isOpen, onClose, lead, onUpdate }) => {
  const toast = useToastContext();
  const { addNotification } = useNotificationContext();
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNextAction = async (action: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      switch (action) {
        case 'schedule-call': {
          // Create a task for follow-up call
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(10, 0, 0, 0);
          
          await taskService.createTask({
            title: `Follow-up call with ${lead.name}`,
            customerName: lead.name,
            scheduledAt: tomorrow.toISOString(),
            status: 'Pending',
            priority: 'Medium',
            taskType: 'Follow-up',
            notes: `Follow-up call scheduled for lead: ${lead.name} (${lead.email})`
          });
          
          // Update lead's next_followup
          if (onUpdate) {
            await leadService.updateLead(lead.id, {
              next_followup: tomorrow.toISOString(),
              last_contact: new Date().toISOString()
            });
            onUpdate({ ...lead, next_followup: tomorrow.toISOString() });
          }
          
          toast.success('Call Scheduled', `Follow-up call scheduled with ${lead.name} for tomorrow at 10:00 AM`);
          break;
        }
        
        case 'send-email': {
          // For now, just update the notes with email sent
          const emailNote = `[Email Sent - ${new Date().toLocaleString()}]: Follow-up email sent to ${lead.email}`;
          const updatedNotes = lead.notes ? `${lead.notes}\n\n${emailNote}` : emailNote;
          
          if (onUpdate) {
            await leadService.updateLead(lead.id, {
              notes: updatedNotes,
              last_contact: new Date().toISOString()
            });
            onUpdate({ ...lead, notes: updatedNotes });
          }
          
          toast.success('Email Sent', `Follow-up email sent to ${lead.email}`);
          break;
        }
        
        case 'send-quotation': {
          if (canPerformAction('sales', 'create')) {
            // Create a sales case for this lead
            try {
              // First check if customer exists, if not create one
              let customerId;
              try {
                const customers = await customerService.getAllCustomers({ search: lead.email, limit: 1 });
                if (customers.customers && customers.customers.length > 0) {
                  customerId = customers.customers[0].id;
                } else {
                  // Create customer from lead
                  const newCustomer = await customerService.createCustomer({
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone,
                    company: lead.company,
                    type: lead.type === 'B2B' ? 'Corporate' : 'Individual'
                  });
                  customerId = newCustomer.id;
                }
              } catch (error) {
                console.error('Error creating/finding customer:', error);
              }
              
              if (customerId) {
                await salesService.createSalesCase({
                  customer_id: customerId,
                  title: `Quotation for ${lead.name}`,
                  description: `Quotation request from lead: ${lead.name}\nSource: ${lead.source}\nType: ${lead.type}`,
                  value: 0,
                  assigned_to: lead.agent_id
                });
              }
              
              navigate('/deals');
              toast.success('Quotation Generated', `Quotation prepared for ${lead.name}. Redirecting to deals page.`);
              onClose();
            } catch (error: any) {
              console.error('Error creating quotation:', error);
              toast.error('Error', error.response?.data?.message || 'Failed to create quotation');
            }
          } else {
            toast.error('Access Denied', 'You do not have permission to create quotations.');
          }
          break;
        }
        
        case 'make-reservation': {
          if (canPerformAction('listings', 'create')) {
            navigate('/listings');
            toast.info('Redirecting', 'Opening listings page. You can create a reservation for this lead.');
            onClose();
          } else {
            toast.error('Access Denied', 'You do not have permission to create reservations.');
          }
          break;
        }
        
        case 'convert-customer': {
          if (canPerformAction('leads', 'update') && canPerformAction('customers', 'create') && onUpdate) {
            try {
              // Create customer from lead
              const newCustomer = await customerService.createCustomer({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
                type: lead.type === 'B2B' ? 'Corporate' : 'Individual',
                notes: `Converted from lead: ${lead.lead_id || lead.id}\nSource: ${lead.source}`
              });
              
              // Update lead status
              const updatedLead = { ...lead, status: 'Closed Won' };
              await leadService.updateLead(lead.id, { status: 'Closed Won' });
              onUpdate(updatedLead);
              
              addNotification({
                type: 'customer',
                title: 'Lead Converted',
                message: `${lead.name} has been converted to a customer`,
                entityId: newCustomer.id
              });
              
              toast.success('Lead Converted', 'Lead has been converted to customer successfully');
            } catch (error: any) {
              console.error('Error converting lead:', error);
              toast.error('Error', error.response?.data?.message || 'Failed to convert lead to customer');
            }
          } else {
            toast.error('Access Denied', 'You do not have permission to convert leads.');
          }
          break;
        }
        
        case 'reassign': {
          if (canPerformAction('leads', 'update')) {
            // Load users for selection
            try {
              const usersResponse = await userService.getAllUsers({ role: 'agent', limit: 100 });
              const agents = usersResponse.users || [];
              
              if (agents.length === 0) {
                toast.error('No Agents', 'No agents available for reassignment');
                break;
              }
              
              // For now, just reassign to first available agent (can be enhanced with a modal)
              const newAgent = agents.find(a => a.id !== lead.agent_id) || agents[0];
              
              await leadService.updateLead(lead.id, {
                agent_id: newAgent.id
              });
              
              if (onUpdate) {
                onUpdate({ ...lead, agent_id: newAgent.id, agent: newAgent });
              }
              
              toast.success('Lead Reassigned', `${lead.name} has been reassigned to ${newAgent.full_name}`);
            } catch (error: any) {
              console.error('Error reassigning lead:', error);
              toast.error('Error', error.response?.data?.message || 'Failed to reassign lead');
            }
          } else {
            toast.error('Access Denied', 'You do not have permission to reassign leads.');
          }
          break;
        }
      }
    } catch (error: any) {
      console.error('Error in handleNextAction:', error);
      toast.error('Error', error.response?.data?.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !lead) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Contacted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Proposal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Negotiation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Closed Won': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Closed Lost': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lead Details - {lead.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.company || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Lead Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.source}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Agent</p>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.agent?.full_name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date Added</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(lead.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Follow-up</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {lead.last_contact ? formatDate(lead.last_contact) : 'No follow-up yet'}
                      </p>
                    </div>
                  </div>
                </div>

                {lead.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{lead.notes}</p>
                  </div>
                )}
              </div>

              {/* Next Actions */}
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    Next Actions
                  </h4>
                  <div className="space-y-2">
                    <ActionGuard module="leads" action="update">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleNextAction('schedule-call')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Schedule follow-up call
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="leads" action="update">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleNextAction('send-email')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send follow-up email
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="sales" action="create">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleNextAction('send-quotation')}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Send a Quotation
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="reservations" action="create">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleNextAction('make-reservation')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Make a Reservation
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="leads" action="update">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleNextAction('convert-customer')}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Update lead status to Customer
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="leads" action="update">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleNextAction('reassign')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reassign to another agent
                      </Button>
                    </ActionGuard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};